package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"

	"ishuset-backend/config"
	"ishuset-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/stripe/stripe-go/v84"
	checkoutsession "github.com/stripe/stripe-go/v84/checkout/session"
	webhook "github.com/stripe/stripe-go/v84/webhook"
)

func generateGiftCardCode() (string, error) {
	bytes := make([]byte, 4)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return strings.ToUpper("GC-" + hex.EncodeToString(bytes)), nil
}

func generateUniqueGiftCardCode() (string, error) {
	const maxAttempts = 10

	for i := 0; i < maxAttempts; i++ {
		code, err := generateGiftCardCode()
		if err != nil {
			return "", err
		}

		var count int64
		if err := config.DB.Model(&models.GiftCard{}).Where("code = ?", code).Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			return code, nil
		}
	}

	return "", errors.New("failed to generate a unique gift card code")
}

func isZeroAmount(value string) bool {
	normalized := strings.ToLower(strings.TrimSpace(value))
	normalized = strings.ReplaceAll(normalized, "kr", "")
	normalized = strings.ReplaceAll(normalized, "dkk", "")
	normalized = strings.ReplaceAll(normalized, ",", ".")
	normalized = strings.ReplaceAll(normalized, " ", "")
	if normalized == "" {
		return false
	}
	number, err := strconv.ParseFloat(normalized, 64)
	if err != nil {
		return false
	}
	return number == 0
}

func createGiftCardRecord(req models.GiftCardRequest) (models.GiftCard, bool, error) {
	code, err := generateUniqueGiftCardCode()
	if err != nil {
		return models.GiftCard{}, false, err
	}

	card := models.GiftCard{
		Code:                  code,
		BuyerName:             req.Name,
		BuyerEmail:            req.Email,
		BuyerPhone:            req.Phone,
		RecipientName:         req.RecipientName,
		RecipientEmail:        req.RecipientEmail,
		OriginalAmount:        req.GiftAmount,
		BalanceAmount:         req.GiftAmount,
		Message:               req.Message,
		AllowEmail:            req.AllowEmail,
		AllowPhone:            req.AllowPhone,
		Status:                "active",
		PaymentStatus:         "manual",
		StripeSessionID:       "",
		StripePaymentIntentID: "",
	}
	if err := config.DB.Create(&card).Error; err != nil {
		return models.GiftCard{}, false, err
	}

	emailSent, emailErr := sendGiftCardEmail(card)
	if emailErr != nil {
		return card, emailSent, emailErr
	}

	return card, emailSent, nil
}

func buildPendingGiftCard(req models.GiftCardCheckoutRequest) (models.GiftCard, error) {
	code, err := generateUniqueGiftCardCode()
	if err != nil {
		return models.GiftCard{}, err
	}

	card := models.GiftCard{
		Code:                  code,
		BuyerName:             req.Name,
		BuyerEmail:            req.Email,
		BuyerPhone:            req.Phone,
		RecipientName:         req.RecipientName,
		RecipientEmail:        req.RecipientEmail,
		OriginalAmount:        req.GiftAmount,
		BalanceAmount:         req.GiftAmount,
		Message:               req.Message,
		AllowEmail:            req.AllowEmail,
		AllowPhone:            req.AllowPhone,
		Status:                "pending_payment",
		PaymentStatus:         "pending",
		StripeSessionID:       "",
		StripePaymentIntentID: "",
		EmailSent:             false,
	}
	if err := config.DB.Create(&card).Error; err != nil {
		return models.GiftCard{}, err
	}
	return card, nil
}

func finalizeGiftCardPayment(card *models.GiftCard, session *stripe.CheckoutSession) error {
	updates := map[string]interface{}{
		"payment_status": "paid",
		"status":         "active",
	}
	if session != nil {
		updates["stripe_session_id"] = session.ID
		if session.PaymentIntent != nil {
			updates["stripe_payment_intent_id"] = session.PaymentIntent.ID
			card.StripePaymentIntentID = session.PaymentIntent.ID
		}
	}
	if err := config.DB.Model(card).Updates(updates).Error; err != nil {
		return err
	}
	card.PaymentStatus = "paid"
	card.Status = "active"

	_, err := sendGiftCardEmail(*card)
	return err
}

// CreateGiftCard creates a gift card record from the public form.
func CreateGiftCard(c *fiber.Ctx) error {
	var req models.GiftCardRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	card, emailSent, emailErr := createGiftCardRecord(req)
	if emailErr != nil && card.ID == 0 {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create gift card"})
	}
	if emailErr != nil {
		return c.JSON(fiber.Map{
			"card":       card,
			"email_sent": emailSent,
			"warning":    "Gift card was created, but the email could not be sent.",
		})
	}

	return c.JSON(fiber.Map{
		"card":       card,
		"email_sent": emailSent,
	})
}

// CreateGiftCardCheckoutSession creates a pending gift card and redirects the customer to Stripe Checkout.
func CreateGiftCardCheckoutSession(c *fiber.Ctx) error {
	var req models.GiftCardCheckoutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if !req.AllowEmail && !req.AllowPhone {
		return c.Status(400).JSON(fiber.Map{"error": "At least one contact method must be selected"})
	}

	secretKey := stripeSecretKey()
	if secretKey == "" {
		return c.Status(500).JSON(fiber.Map{"error": "Stripe is not configured yet"})
	}

	amount, err := parseAmountToOre(req.GiftAmount)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	card, err := buildPendingGiftCard(req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to prepare gift card"})
	}

	stripe.Key = secretKey
	baseURL := stripePublicBaseURL()
	successURL := fmt.Sprintf("%s/gift-cards/success?session_id={CHECKOUT_SESSION_ID}", baseURL)
	cancelURL := fmt.Sprintf("%s/gift-cards/cancel?gift_card_id=%d", baseURL, card.ID)

	params := &stripe.CheckoutSessionParams{
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(successURL),
		CancelURL:  stripe.String(cancelURL),
		CustomerEmail: stripe.String(req.Email),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Quantity: stripe.Int64(1),
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String(string(stripe.CurrencyDKK)),
					UnitAmount: stripe.Int64(amount),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String("Ishuset gift card"),
						Description: stripe.String(fmt.Sprintf("Gift card for %s", req.RecipientName)),
					},
				},
			},
		},
		Metadata: map[string]string{
			"gift_card_id": fmt.Sprintf("%d", card.ID),
			"gift_card_code": card.Code,
			"recipient_email": req.RecipientEmail,
			"locale": req.Locale,
		},
	}

	session, err := checkoutsession.New(params)
	if err != nil {
		_ = config.DB.Model(&card).Updates(map[string]interface{}{
			"payment_status": "failed",
			"status":         "cancelled",
		}).Error
		log.Printf("Stripe checkout session creation failed: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error":  "Failed to create Stripe checkout session",
			"detail": err.Error(),
		})
	}

	if err := config.DB.Model(&card).Updates(map[string]interface{}{
		"stripe_session_id": session.ID,
	}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save checkout session"})
	}

	return c.JSON(fiber.Map{
		"checkout_url": session.URL,
		"session_id": session.ID,
		"gift_card_id": card.ID,
	})
}

// GetGiftCardCheckoutSessionStatus lets the frontend confirm whether a Stripe checkout session has completed.
func GetGiftCardCheckoutSessionStatus(c *fiber.Ctx) error {
	sessionID := c.Query("session_id")
	if sessionID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "session_id is required"})
	}
	if stripeSecretKey() == "" {
		return c.Status(500).JSON(fiber.Map{"error": "Stripe is not configured yet"})
	}

	stripe.Key = stripeSecretKey()
	session, err := checkoutsession.Get(sessionID, nil)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch checkout session"})
	}

	var card models.GiftCard
	if giftCardID := session.Metadata["gift_card_id"]; giftCardID != "" {
		if err := config.DB.First(&card, giftCardID).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Gift card not found"})
		}
	}

	return c.JSON(fiber.Map{
		"payment_status": session.PaymentStatus,
		"status":         session.Status,
		"card":           card,
	})
}

// StripeWebhook handles Stripe event notifications.
func StripeWebhook(c *fiber.Ctx) error {
	secret := stripeWebhookSecret()
	if secret == "" {
		return c.Status(500).JSON(fiber.Map{"error": "Stripe webhook secret is not configured"})
	}

	event, err := webhook.ConstructEvent(c.Body(), c.Get("Stripe-Signature"), secret)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid webhook signature"})
	}

	switch event.Type {
	case "checkout.session.completed":
		var session stripe.CheckoutSession
		if err := session.UnmarshalJSON(event.Data.Raw); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid checkout session payload"})
		}

		giftCardID := session.Metadata["gift_card_id"]
		if giftCardID == "" {
			return c.JSON(fiber.Map{"received": true})
		}

		var card models.GiftCard
		if err := config.DB.First(&card, giftCardID).Error; err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Gift card not found"})
		}
		if card.PaymentStatus == "paid" {
			return c.JSON(fiber.Map{"received": true})
		}

		if err := finalizeGiftCardPayment(&card, &session); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to finalize paid gift card"})
		}

	case "checkout.session.expired":
		var session stripe.CheckoutSession
		if err := session.UnmarshalJSON(event.Data.Raw); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid checkout session payload"})
		}
		if giftCardID := session.Metadata["gift_card_id"]; giftCardID != "" {
			_ = config.DB.Model(&models.GiftCard{}).Where("id = ?", giftCardID).Updates(map[string]interface{}{
				"payment_status": "expired",
				"status":         "cancelled",
			}).Error
		}
	}

	return c.JSON(fiber.Map{"received": true})
}

// CreateGiftCardFromAdmin creates a gift card record from the admin panel without payment.
func CreateGiftCardFromAdmin(c *fiber.Ctx) error {
	var req models.GiftCardRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	card, emailSent, emailErr := createGiftCardRecord(req)
	if emailErr != nil && card.ID == 0 {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create gift card"})
	}
	if emailErr != nil {
		return c.JSON(fiber.Map{
			"card":       card,
			"email_sent": emailSent,
			"warning":    "Gift card was created, but the email could not be sent.",
		})
	}

	return c.JSON(fiber.Map{
		"card":       card,
		"email_sent": emailSent,
	})
}

// GetGiftCards returns all gift cards or filters by code query.
func GetGiftCards(c *fiber.Ctx) error {
	var cards []models.GiftCard
	query := config.DB.Order("created_at desc")
	if code := c.Query("code"); code != "" {
		query = query.Where("code = ?", strings.ToUpper(code))
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if err := query.Find(&cards).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch gift cards"})
	}
	return c.JSON(cards)
}

// UpdateGiftCard updates remaining balance/status.
func UpdateGiftCard(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.GiftCardUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var card models.GiftCard
	if err := config.DB.First(&card, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Gift card not found"})
	}

	card.BalanceAmount = req.BalanceAmount
	if isZeroAmount(req.BalanceAmount) {
		card.Status = "used"
	} else if req.Status != "" {
		card.Status = req.Status
	}
	if err := config.DB.Save(&card).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update gift card"})
	}
	return c.JSON(card)
}
