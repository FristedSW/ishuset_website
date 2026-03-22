package handlers

import (
	"ishuset-backend/config"
	"ishuset-backend/middleware"
	"ishuset-backend/models"
	"github.com/gofiber/fiber/v2"
)

// Login handles user authentication
func Login(c *fiber.Ctx) error {
	var loginReq models.LoginRequest
	
	if err := c.BodyParser(&loginReq); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Find user by email
	var user models.User
	if err := config.DB.Where("email = ?", loginReq.Email).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Check password
	if !config.CheckPassword(loginReq.Password, user.PasswordHash) {
		return c.Status(401).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(user.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(models.LoginResponse{
		Token: token,
		User:  user,
	})
} 