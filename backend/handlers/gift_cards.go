package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"strconv"
	"strings"

	"ishuset-backend/config"
	"ishuset-backend/models"

	"github.com/gofiber/fiber/v2"
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
		Code:           code,
		BuyerName:      req.Name,
		BuyerEmail:     req.Email,
		BuyerPhone:     req.Phone,
		RecipientName:  req.RecipientName,
		RecipientEmail: req.RecipientEmail,
		OriginalAmount: req.GiftAmount,
		BalanceAmount:  req.GiftAmount,
		Message:        req.Message,
		AllowEmail:     req.AllowEmail,
		AllowPhone:     req.AllowPhone,
		Status:         "active",
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
