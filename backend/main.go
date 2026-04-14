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

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins:  "*",
		AllowHeaders:  "Origin, Content-Type, Accept, Authorization",
		AllowMethods:  "GET,POST,PUT,PATCH,DELETE,OPTIONS",
	}))
	uploadsDir := os.Getenv("UPLOADS_DIR")
	if uploadsDir == "" {
		uploadsDir = "./uploads"
	}
	app.Static("/uploads", uploadsDir)

	// Public routes
	app.Post("/api/login", handlers.Login)
	app.Post("/api/contact", handlers.SubmitContact)
	app.Post("/api/gift-cards", handlers.CreateGiftCard)
	app.Post("/api/gift-cards/checkout", handlers.CreateGiftCardCheckoutSession)
	app.Get("/api/gift-cards/checkout-status", handlers.GetGiftCardCheckoutSessionStatus)
	app.Post("/api/stripe/webhook", handlers.StripeWebhook)
	app.Get("/api/text", handlers.GetTextContent)
	app.Get("/api/opening-hours", handlers.GetOpeningHours)
	app.Get("/api/media", handlers.GetMediaPosts)
	app.Get("/api/flavours", handlers.GetFlavours)
	app.Get("/api/prices", handlers.GetPriceItems)
	app.Get("/api/gallery", handlers.GetGalleryItems)

	// Admin/staff protected routes
	admin := app.Group("/api/admin", middleware.AuthMiddleware())

	// Contact center (admin only)
	admin.Get("/contact", middleware.RequireRole("admin"), handlers.GetContactMessages)
	admin.Patch("/contact/:id/status", middleware.RequireRole("admin"), handlers.UpdateContactStatus)
	admin.Post("/contact/:id/accept", middleware.RequireRole("admin"), handlers.AcceptContactMessage)
	admin.Delete("/contact/:id", middleware.RequireRole("admin"), handlers.DeleteContactMessage)
	admin.Get("/freezer-bookings", middleware.RequireRole("admin"), handlers.GetFreezerBookings)
	admin.Post("/freezer-bookings", middleware.RequireRole("admin"), handlers.CreateFreezerBooking)
	admin.Put("/freezer-bookings/:id", middleware.RequireRole("admin"), handlers.UpdateFreezerBooking)
	admin.Get("/gift-cards", handlers.GetGiftCards)
	admin.Post("/gift-cards", handlers.CreateGiftCardFromAdmin)
	admin.Put("/gift-cards/:id", handlers.UpdateGiftCard)

	// Media manager (admin only)
	admin.Post("/media", middleware.RequireRole("admin"), handlers.CreateMediaPost)
	admin.Put("/media/:id", middleware.RequireRole("admin"), handlers.UpdateMediaPost)
	admin.Delete("/media/:id", middleware.RequireRole("admin"), handlers.DeleteMediaPost)
	admin.Get("/media-assets", middleware.RequireRole("admin"), handlers.GetMediaAssets)
	admin.Post("/media-assets/upload", middleware.RequireRole("admin"), handlers.UploadMediaFile)
	admin.Post("/media-assets", middleware.RequireRole("admin"), handlers.CreateMediaAsset)
	admin.Put("/media-assets/:id", middleware.RequireRole("admin"), handlers.UpdateMediaAsset)
	admin.Delete("/media-assets/:id", middleware.RequireRole("admin"), handlers.DeleteMediaAsset)
	admin.Get("/gallery", middleware.RequireRole("admin"), handlers.GetGalleryItems)
	admin.Post("/gallery", middleware.RequireRole("admin"), handlers.CreateGalleryItem)
	admin.Put("/gallery/:id", middleware.RequireRole("admin"), handlers.UpdateGalleryItem)
	admin.Delete("/gallery/:id", middleware.RequireRole("admin"), handlers.DeleteGalleryItem)

	// Opening hours manager
	admin.Put("/opening-hours/:id", handlers.UpdateOpeningHours)

	// Text content manager (admin only)
	admin.Post("/text", middleware.RequireRole("admin"), handlers.CreateTextContent)
	admin.Put("/text/:id", middleware.RequireRole("admin"), handlers.UpdateTextContent)
	admin.Delete("/text/:id", middleware.RequireRole("admin"), handlers.DeleteTextContent)

	// Flavour manager (admin only)
	admin.Get("/flavours", middleware.RequireRole("admin"), handlers.GetFlavours)
	admin.Post("/flavours", middleware.RequireRole("admin"), handlers.CreateFlavour)
	admin.Put("/flavours/:id", middleware.RequireRole("admin"), handlers.UpdateFlavour)
	admin.Delete("/flavours/:id", middleware.RequireRole("admin"), handlers.DeleteFlavour)

	// Price manager (admin only)
	admin.Get("/prices", middleware.RequireRole("admin"), handlers.GetPriceItems)
	admin.Post("/prices", middleware.RequireRole("admin"), handlers.CreatePriceItem)
	admin.Put("/prices/:id", middleware.RequireRole("admin"), handlers.UpdatePriceItem)
	admin.Delete("/prices/:id", middleware.RequireRole("admin"), handlers.DeletePriceItem)

	// User manager (admin only)
	admin.Get("/users", middleware.RequireRole("admin"), handlers.GetUsers)
	admin.Post("/users", middleware.RequireRole("admin"), handlers.CreateUser)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on port %s", port)
	log.Fatal(app.Listen(":" + port))
} 
