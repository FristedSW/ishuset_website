package middleware

import (
	"ishuset-backend/config"
	"ishuset-backend/models"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("ishuset-secret-key-change-in-production")

// AuthMiddleware protects routes that require authentication
func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Authorization header required",
			})
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid token",
			})
		}

		claims := token.Claims.(jwt.MapClaims)
		userID := uint(claims["user_id"].(float64))

		// Fetch user role from DB
		var user models.User
		if err := config.DB.First(&user, userID).Error; err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "User not found"})
		}
		c.Locals("user_id", userID)
		c.Locals("user_role", user.Role)
		return c.Next()
	}
}

// RequireRole restricts access to users with the given role (e.g. "admin" or "staff")
func RequireRole(role string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole := c.Locals("user_role")
		if userRole != role {
			return c.Status(403).JSON(fiber.Map{"error": "Insufficient permissions"})
		}
		return c.Next()
	}
}

// GenerateToken generates a JWT token for a user
func GenerateToken(userID uint) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
	})
	return token.SignedString(jwtSecret)
}
