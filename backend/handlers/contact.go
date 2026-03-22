package handlers

import (
	"time"

	"ishuset-backend/config"
	"ishuset-backend/models"

	"github.com/gofiber/fiber/v2"
)

// SubmitContact handles contact form submissions.
func SubmitContact(c *fiber.Ctx) error {
	var contactReq models.ContactRequest

	if err := c.BodyParser(&contactReq); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	var preferredDate *time.Time
	var preferredFrom *time.Time
	var preferredTo *time.Time
	if contactReq.PreferredDate != "" {
		parsedDate, err := time.Parse(time.RFC3339, contactReq.PreferredDate)
		if err != nil {
			parsedDate, err = time.Parse("2006-01-02", contactReq.PreferredDate)
			if err != nil {
				return c.Status(400).JSON(fiber.Map{
					"error": "Preferred date must be ISO format",
				})
			}
		}
		preferredDate = &parsedDate
	}
	if contactReq.PreferredFrom != "" {
		parsedDate, err := time.Parse(time.RFC3339, contactReq.PreferredFrom)
		if err != nil {
			parsedDate, err = time.Parse("2006-01-02", contactReq.PreferredFrom)
			if err != nil {
				return c.Status(400).JSON(fiber.Map{
					"error": "Preferred from date must be ISO format",
				})
			}
		}
		preferredFrom = &parsedDate
	}
	if contactReq.PreferredTo != "" {
		parsedDate, err := time.Parse(time.RFC3339, contactReq.PreferredTo)
		if err != nil {
			parsedDate, err = time.Parse("2006-01-02", contactReq.PreferredTo)
			if err != nil {
				return c.Status(400).JSON(fiber.Map{
					"error": "Preferred to date must be ISO format",
				})
			}
		}
		preferredTo = &parsedDate
	}

	contactMessage := models.ContactMessage{
		Name:          contactReq.Name,
		Email:         contactReq.Email,
		Phone:         contactReq.Phone,
		Service:       contactReq.Service,
		EventType:     contactReq.EventType,
		RecipientName: contactReq.RecipientName,
		GiftAmount:    contactReq.GiftAmount,
		PreferredFrom: preferredFrom,
		PreferredTo:   preferredTo,
		PreferredDate: preferredDate,
		GuestCount:    contactReq.GuestCount,
		AllowEmail:    contactReq.AllowEmail,
		AllowPhone:    contactReq.AllowPhone,
		Message:       contactReq.Message,
		Status:        "new",
	}

	if err := config.DB.Create(&contactMessage).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to save contact message",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Contact message submitted successfully",
		"id":      contactMessage.ID,
	})
}

// GetContactMessages returns all contact messages.
func GetContactMessages(c *fiber.Ctx) error {
	var messages []models.ContactMessage

	if err := config.DB.Order("created_at desc").Find(&messages).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch contact messages",
		})
	}

	return c.JSON(messages)
}

// UpdateContactStatus updates the status of a contact message.
func UpdateContactStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	status := c.Query("status")

	if status == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Status parameter required",
		})
	}

	var message models.ContactMessage
	if err := config.DB.First(&message, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Contact message not found",
		})
	}

	message.Status = status
	if err := config.DB.Save(&message).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update contact message",
		})
	}

	return c.JSON(message)
}

// DeleteContactMessage deletes a contact message.
func DeleteContactMessage(c *fiber.Ctx) error {
	id := c.Params("id")

	var message models.ContactMessage
	if err := config.DB.First(&message, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Contact message not found",
		})
	}

	if err := config.DB.Delete(&message).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to delete contact message",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Contact message deleted successfully",
	})
}
