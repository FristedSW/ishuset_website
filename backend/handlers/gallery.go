package handlers

import (
	"ishuset-backend/config"
	"ishuset-backend/models"

	"github.com/gofiber/fiber/v2"
)

// GetGalleryItems returns public gallery items or all items for admin usage.
func GetGalleryItems(c *fiber.Ctx) error {
	includeInactive := c.Query("include_inactive") == "true"
	var items []models.GalleryItem

	query := config.DB.Order("sort_order asc, created_at asc")
	if !includeInactive {
		query = query.Where("is_active = ?", true)
	}

	if err := query.Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch gallery items"})
	}
	return c.JSON(items)
}

// CreateGalleryItem creates a new gallery item.
func CreateGalleryItem(c *fiber.Ctx) error {
	var req models.GalleryItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	item := models.GalleryItem{
		Title:       req.Title,
		Description: req.Description,
		AltText:     req.AltText,
		ImageURL:    req.ImageURL,
		SortOrder:   req.SortOrder,
		IsActive:    req.IsActive,
	}
	if err := config.DB.Create(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create gallery item"})
	}
	return c.JSON(item)
}

// UpdateGalleryItem updates an existing gallery item.
func UpdateGalleryItem(c *fiber.Ctx) error {
	id := c.Params("id")

	var req models.GalleryItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var item models.GalleryItem
	if err := config.DB.First(&item, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Gallery item not found"})
	}

	item.Title = req.Title
	item.Description = req.Description
	item.AltText = req.AltText
	item.ImageURL = req.ImageURL
	item.SortOrder = req.SortOrder
	item.IsActive = req.IsActive

	if err := config.DB.Save(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update gallery item"})
	}
	return c.JSON(item)
}

// DeleteGalleryItem deletes a gallery item.
func DeleteGalleryItem(c *fiber.Ctx) error {
	id := c.Params("id")

	var item models.GalleryItem
	if err := config.DB.First(&item, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Gallery item not found"})
	}

	if err := config.DB.Delete(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete gallery item"})
	}
	return c.JSON(fiber.Map{"message": "Gallery item deleted successfully"})
}
