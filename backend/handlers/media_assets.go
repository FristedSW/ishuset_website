package handlers

import (
	"os"
	"path/filepath"
	"strings"
	"ishuset-backend/config"
	"ishuset-backend/models"

	"github.com/gofiber/fiber/v2"
)

// GetMediaAssets returns all reusable media assets for the admin library.
func GetMediaAssets(c *fiber.Ctx) error {
	var assets []models.MediaAsset
	if err := config.DB.Order("created_at desc").Find(&assets).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch media assets"})
	}
	return c.JSON(assets)
}

// CreateMediaAsset creates a new reusable media asset.
func CreateMediaAsset(c *fiber.Ctx) error {
	var req models.MediaAssetRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	assetType := req.AssetType
	if assetType == "" {
		assetType = "image"
	}

	source := req.Source
	if source == "" {
		source = "local"
	}

	asset := models.MediaAsset{
		Title:       req.Title,
		Description: req.Description,
		AltText:     req.AltText,
		FileURL:     req.FileURL,
		AssetType:   assetType,
		Source:      source,
	}
	if err := config.DB.Create(&asset).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create media asset"})
	}
	return c.JSON(asset)
}

// UpdateMediaAsset updates a reusable media asset.
func UpdateMediaAsset(c *fiber.Ctx) error {
	id := c.Params("id")

	var req models.MediaAssetRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var asset models.MediaAsset
	if err := config.DB.First(&asset, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Media asset not found"})
	}

	asset.Title = req.Title
	asset.Description = req.Description
	asset.AltText = req.AltText
	asset.FileURL = req.FileURL
	if req.AssetType != "" {
		asset.AssetType = req.AssetType
	}
	if req.Source != "" {
		asset.Source = req.Source
	}

	if err := config.DB.Save(&asset).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update media asset"})
	}
	return c.JSON(asset)
}

// DeleteMediaAsset deletes a reusable media asset.
func DeleteMediaAsset(c *fiber.Ctx) error {
	id := c.Params("id")

	var asset models.MediaAsset
	if err := config.DB.First(&asset, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Media asset not found"})
	}

	if err := config.DB.Delete(&asset).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete media asset"})
	}
	if asset.Source == "local" && strings.Contains(asset.FileURL, "/uploads/") {
		filename := filepath.Base(asset.FileURL)
		_ = os.Remove(filepath.Join(uploadsDir(), filename))
	}
	return c.JSON(fiber.Map{"message": "Media asset deleted successfully"})
}
