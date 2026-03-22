package handlers

import (
	"strings"

	"ishuset-backend/config"
	"ishuset-backend/models"

	"github.com/gofiber/fiber/v2"
)

func GetUsers(c *fiber.Ctx) error {
	var users []models.User
	if err := config.DB.Order("created_at desc").Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch users"})
	}
	return c.JSON(users)
}

func CreateUser(c *fiber.Ctx) error {
	var req models.UserCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	role := strings.ToLower(strings.TrimSpace(req.Role))
	if role != "admin" && role != "staff" {
		return c.Status(400).JSON(fiber.Map{"error": "Role must be admin or staff"})
	}

	var existing models.User
	if err := config.DB.Where("email = ?", strings.TrimSpace(req.Email)).First(&existing).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"error": "A user with this email already exists"})
	}

	hash, err := config.HashPassword(req.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	user := models.User{
		Email:        strings.TrimSpace(req.Email),
		PasswordHash: hash,
		Role:         role,
	}
	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.JSON(user)
}
