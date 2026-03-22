package handlers

import (
	"ishuset-backend/config"
	"ishuset-backend/models"

	"github.com/gofiber/fiber/v2"
)

// GetFlavours returns active flavours for the public website or all flavours for admin usage.
func GetFlavours(c *fiber.Ctx) error {
	includeInactive := c.Query("include_inactive") == "true"
	var flavours []models.Flavour

	query := config.DB.Order("sort_order asc, created_at asc")
	if !includeInactive {
		query = query.Where("is_active = ?", true)
	}

	if err := query.Find(&flavours).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch flavours"})
	}
	return c.JSON(flavours)
}

// CreateFlavour creates a flavour.
func CreateFlavour(c *fiber.Ctx) error {
	var req models.FlavourRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	flavour := models.Flavour{
		Slug:          req.Slug,
		NameDA:        req.NameDA,
		NameEN:        req.NameEN,
		NameDE:        req.NameDE,
		DescriptionDA: req.DescriptionDA,
		DescriptionEN: req.DescriptionEN,
		DescriptionDE: req.DescriptionDE,
		Category:      req.Category,
		ImageURL:      req.ImageURL,
		SortOrder:     req.SortOrder,
		IsActive:      req.IsActive,
	}
	if err := config.DB.Create(&flavour).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create flavour"})
	}
	return c.JSON(flavour)
}

// UpdateFlavour updates an existing flavour.
func UpdateFlavour(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.FlavourRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var flavour models.Flavour
	if err := config.DB.First(&flavour, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Flavour not found"})
	}

	flavour.Slug = req.Slug
	flavour.NameDA = req.NameDA
	flavour.NameEN = req.NameEN
	flavour.NameDE = req.NameDE
	flavour.DescriptionDA = req.DescriptionDA
	flavour.DescriptionEN = req.DescriptionEN
	flavour.DescriptionDE = req.DescriptionDE
	flavour.Category = req.Category
	flavour.ImageURL = req.ImageURL
	flavour.SortOrder = req.SortOrder
	flavour.IsActive = req.IsActive

	if err := config.DB.Save(&flavour).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update flavour"})
	}
	return c.JSON(flavour)
}

// DeleteFlavour deletes a flavour.
func DeleteFlavour(c *fiber.Ctx) error {
	id := c.Params("id")
	var flavour models.Flavour
	if err := config.DB.First(&flavour, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Flavour not found"})
	}

	if err := config.DB.Delete(&flavour).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete flavour"})
	}
	return c.JSON(fiber.Map{"message": "Flavour deleted successfully"})
}
