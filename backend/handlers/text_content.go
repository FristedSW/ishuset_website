package handlers

import (
	"ishuset-backend/config"
	"ishuset-backend/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func decorateTextContent(text *models.TextContent) {
	text.Locale, text.BaseKey = config.ParseTextStorageKey(text.Key)
}

// GetTextContent returns all text content.
func GetTextContent(c *fiber.Ctx) error {
	var texts []models.TextContent
	if err := config.DB.Order("\"group\" asc, key asc").Find(&texts).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch text content"})
	}

	for i := range texts {
		decorateTextContent(&texts[i])
	}
	return c.JSON(texts)
}

// CreateTextContent creates a new text content entry.
func CreateTextContent(c *fiber.Ctx) error {
	var req models.TextContentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	storageKey := config.TextStorageKey(req.Locale, req.Key)
	var existing models.TextContent
	if err := config.DB.Where("key = ?", storageKey).First(&existing).Error; err == nil {
		return c.Status(409).JSON(fiber.Map{"error": "Text content already exists for this locale and key"})
	} else if err != nil && err != gorm.ErrRecordNotFound {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to validate text content"})
	}

	text := models.TextContent{
		Key:   storageKey,
		Value: req.Value,
		Group: req.Group,
	}
	if err := config.DB.Create(&text).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create text content"})
	}

	decorateTextContent(&text)
	return c.JSON(text)
}

// UpdateTextContent updates an existing text content entry.
func UpdateTextContent(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.TextContentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var text models.TextContent
	if err := config.DB.First(&text, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Text content not found"})
	}

	text.Key = config.TextStorageKey(req.Locale, req.Key)
	text.Value = req.Value
	text.Group = req.Group
	if err := config.DB.Save(&text).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update text content"})
	}

	decorateTextContent(&text)
	return c.JSON(text)
}

// DeleteTextContent deletes a text content entry.
func DeleteTextContent(c *fiber.Ctx) error {
	id := c.Params("id")
	var text models.TextContent
	if err := config.DB.First(&text, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Text content not found"})
	}
	if err := config.DB.Delete(&text).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete text content"})
	}
	return c.JSON(fiber.Map{"message": "Text content deleted successfully"})
}
