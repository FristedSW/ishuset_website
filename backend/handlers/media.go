package handlers

import (
	"ishuset-backend/config"
	"ishuset-backend/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetMediaPosts returns media posts from the primary application database.
func GetMediaPosts(c *fiber.Ctx) error {
	var posts []models.MediaPost

	query := config.DB.Order("publish_date desc, created_at desc")
	if platform := c.Query("platform"); platform != "" {
		query = query.Where("platform = ?", platform)
	}
	if published := c.Query("published"); published != "" {
		if published == "true" {
			query = query.Where("is_published = ?", true)
		} else if published == "false" {
			query = query.Where("is_published = ?", false)
		}
	}

	if err := query.Find(&posts).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch media posts"})
	}

	return c.JSON(posts)
}

// CreateMediaPost creates a new media post.
func CreateMediaPost(c *fiber.Ctx) error {
	var req models.MediaPostRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	post := models.MediaPost{
		Title:       req.Title,
		Content:     req.Content,
		ImageURL:    req.ImageURL,
		Platform:    req.Platform,
		PublishDate: req.PublishDate,
		Tags:        req.Tags,
		IsPublished: req.IsPublished,
		IsFeatured:  req.IsFeatured,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := config.DB.Create(&post).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create media post"})
	}

	return c.JSON(post)
}

// UpdateMediaPost updates an existing media post.
func UpdateMediaPost(c *fiber.Ctx) error {
	id := c.Params("id")
	var req models.MediaPostRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var post models.MediaPost
	if err := config.DB.First(&post, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Media post not found"})
	}

	post.Title = req.Title
	post.Content = req.Content
	post.ImageURL = req.ImageURL
	post.Platform = req.Platform
	post.PublishDate = req.PublishDate
	post.Tags = req.Tags
	post.IsPublished = req.IsPublished
	post.IsFeatured = req.IsFeatured
	post.UpdatedAt = time.Now()

	if err := config.DB.Save(&post).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update media post"})
	}

	return c.JSON(post)
}

// DeleteMediaPost deletes a media post.
func DeleteMediaPost(c *fiber.Ctx) error {
	id := c.Params("id")

	var post models.MediaPost
	if err := config.DB.First(&post, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Media post not found"})
	}

	if err := config.DB.Delete(&post).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete media post"})
	}

	return c.JSON(fiber.Map{"message": "Media post deleted successfully"})
}
