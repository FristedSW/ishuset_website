package handlers

import (
	"ishuset-backend/config"
	"ishuset-backend/models"
	"github.com/gofiber/fiber/v2"
)

// SubmitContact handles contact form submissions
func SubmitContact(c *fiber.Ctx) error {
	var contactReq models.ContactRequest
	
	if err := c.BodyParser(&contactReq); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	contactMessage := models.ContactMessage{
		Name:    contactReq.Name,
		Email:   contactReq.Email,
		Phone:   contactReq.Phone,
		Service: contactReq.Service,
		Message: contactReq.Message,
		Status:  "new",
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

// GetContactMessages returns all contact messages (admin only)
func GetContactMessages(c *fiber.Ctx) error {
	var messages []models.ContactMessage
	
	if err := config.DB.Order("created_at desc").Find(&messages).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch contact messages",
		})
	}

	return c.JSON(messages)
}

// UpdateContactStatus updates the status of a contact message
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

// DeleteContactMessage deletes a contact message
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