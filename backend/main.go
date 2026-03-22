package main

import (
	"log"
	"os"
	"ishuset-backend/config"
	"ishuset-backend/handlers"
	"ishuset-backend/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// Initialize databases
	config.InitDB()
	config.InitMongo()

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins:  "*",
		AllowHeaders:  "Origin, Content-Type, Accept, Authorization",
		AllowMethods:  "GET,POST,PUT,PATCH,DELETE,OPTIONS",
	}))

	// Public routes
	app.Post("/api/login", handlers.Login)
	app.Post("/api/contact", handlers.SubmitContact)
	app.Get("/api/text", handlers.GetTextContent)
	app.Get("/api/opening-hours", handlers.GetOpeningHours)
	app.Get("/api/media", handlers.GetMediaPosts)

	// Admin/staff protected routes
	admin := app.Group("/api/admin", middleware.AuthMiddleware())

	// Contact center (admin only)
	admin.Get("/contact", middleware.RequireRole("admin"), handlers.GetContactMessages)
	admin.Patch("/contact/:id/status", middleware.RequireRole("admin"), handlers.UpdateContactStatus)
	admin.Delete("/contact/:id", middleware.RequireRole("admin"), handlers.DeleteContactMessage)

	// Media manager (admin only)
	admin.Post("/media", middleware.RequireRole("admin"), handlers.CreateMediaPost)
	admin.Put("/media/:id", middleware.RequireRole("admin"), handlers.UpdateMediaPost)
	admin.Delete("/media/:id", middleware.RequireRole("admin"), handlers.DeleteMediaPost)

	// Opening hours manager (admin or staff)
	admin.Put("/opening-hours/:id", middleware.RequireRole("staff"), handlers.UpdateOpeningHours)

	// Text content manager (admin only)
	admin.Post("/text", middleware.RequireRole("admin"), handlers.CreateTextContent)
	admin.Put("/text/:id", middleware.RequireRole("admin"), handlers.UpdateTextContent)
	admin.Delete("/text/:id", middleware.RequireRole("admin"), handlers.DeleteTextContent)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on port %s", port)
	log.Fatal(app.Listen(":" + port))
} 