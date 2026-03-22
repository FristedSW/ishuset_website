package handlers

import (
	"ishuset-backend/config"
	"ishuset-backend/models"

	"github.com/gofiber/fiber/v2"
)

// GetPriceItems returns active price items or all for admin usage.
func GetPriceItems(c *fiber.Ctx) error {
	includeInactive := c.Query("include_inactive") == "true"
	var items []models.PriceItem

	query := config.DB.Order("sort_order asc, created_at asc")
	if !includeInactive {
		query = query.Where("is_active = ?", true)
	}

	if err := query.Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch prices"})
	}
	return c.JSON(items)
}

// CreatePriceItem creates a new price item.
func CreatePriceItem(c *fiber.Ctx) error {
	var req models.PriceItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	item := models.PriceItem{
		Key:         req.Key,
		LabelDA:     req.LabelDA,
		LabelEN:     req.LabelEN,
		LabelDE:     req.LabelDE,
		Description: req.Description,
		Price:       req.Price,
		SortOrder:   req.SortOrder,
		IsActive:    req.IsActive,
	}
	if err := config.DB.Create(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create price item"})
	}
	return c.JSON(item)
}

// UpdatePriceItem updates an existing price item.
func UpdatePriceItem(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.PriceItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var item models.PriceItem
	if err := config.DB.First(&item, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Price item not found"})
	}

	item.Key = req.Key
	item.LabelDA = req.LabelDA
	item.LabelEN = req.LabelEN
	item.LabelDE = req.LabelDE
	item.Description = req.Description
	item.Price = req.Price
	item.SortOrder = req.SortOrder
	item.IsActive = req.IsActive

	if err := config.DB.Save(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update price item"})
	}
	return c.JSON(item)
}

// DeletePriceItem deletes a price item.
func DeletePriceItem(c *fiber.Ctx) error {
	id := c.Params("id")
	var item models.PriceItem
	if err := config.DB.First(&item, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Price item not found"})
	}

	if err := config.DB.Delete(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete price item"})
	}
	return c.JSON(fiber.Map{"message": "Price item deleted successfully"})
}
