package handlers

import (
	"ishuset-backend/config"
	"ishuset-backend/models"
	"github.com/gofiber/fiber/v2"
)

// GetOpeningHours returns all opening hours
func GetOpeningHours(c *fiber.Ctx) error {
	var hours []models.OpeningHours
	if err := config.DB.Order("id asc").Find(&hours).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch opening hours",
		})
	}
	return c.JSON(hours)
}

// UpdateOpeningHours updates a day's opening hours
func UpdateOpeningHours(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.OpeningHoursRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}
	var hours models.OpeningHours
	if err := config.DB.First(&hours, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Opening hours not found",
		})
	}
	hours.Day = req.Day
	hours.OpenTime = req.OpenTime
	hours.CloseTime = req.CloseTime
	hours.IsOpen = req.IsOpen
	hours.IsUnknown = req.IsUnknown
	hours.IsEstimated = req.IsEstimated
	hours.SpecialMessage = req.SpecialMessage
	if err := config.DB.Save(&hours).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to update opening hours",
		})
	}
	return c.JSON(hours)
} 
