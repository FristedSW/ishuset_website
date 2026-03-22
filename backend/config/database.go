package config

import (
	"log"
	"ishuset-backend/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"golang.org/x/crypto/bcrypt"
)

var DB *gorm.DB

// InitDB initializes the database connection
func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("ishuset.db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	err = DB.AutoMigrate(
		&models.User{},
		&models.ContactMessage{},
		&models.MediaPost{},
		&models.OpeningHours{},
		&models.TextContent{},
	)
	
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Seed initial data
	seedInitialData()
}

// seedInitialData seeds the database with initial data
func seedInitialData() {
	// Check if admin user exists
	var userCount int64
	DB.Model(&models.User{}).Count(&userCount)
	
	if userCount == 0 {
		// Create default admin user
		hashedPassword, _ := HashPassword("admin123")
		defaultUser := models.User{
			Email:        "admin@ishuset.dk",
			PasswordHash: hashedPassword,
		}
		DB.Create(&defaultUser)
		log.Println("Created default admin user: admin@ishuset.dk / admin123")
	}

	// Check if opening hours exist
	var hoursCount int64
	DB.Model(&models.OpeningHours{}).Count(&hoursCount)
	
	if hoursCount == 0 {
		// Create default opening hours
		days := []string{"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}
		for _, day := range days {
			openingHour := models.OpeningHours{
				Day:       day,
				OpenTime:  "12:00",
				CloseTime: "20:00",
				IsOpen:    true,
			}
			DB.Create(&openingHour)
		}
		log.Println("Created default opening hours")
	}

	// Check if text content exists
	var textCount int64
	DB.Model(&models.TextContent{}).Count(&textCount)
	
	if textCount == 0 {
		// Create default text content
		defaultTexts := []models.TextContent{
			{Key: "hero_title", Value: "Ishuset Marselisborg Havn", Group: "Home"},
			{Key: "hero_subtitle", Value: "Vi har åbent når solen skinner og vinden blæser", Group: "Home"},
			{Key: "about_title", Value: "Vores Historie", Group: "About"},
			{Key: "about_subtitle", Value: "Fra en lille drøm om at skabe den perfekte is til en virkelighed der bringer glæde til Marselisborg Havn", Group: "About"},
			{Key: "about_description", Value: "Hos Ishuset Marselisborg Havn starter hver dag med en ny chance for at skabe noget helt særligt. Vi bruger kun de fineste økologiske ingredienser og følger traditionelle italienske metoder for at sikre den perfekte smag og konsistens.", Group: "About"},
			{Key: "flavors_title", Value: "Vores Smage", Group: "Flavors"},
			{Key: "flavors_subtitle", Value: "Frisklavet is med økologiske ingredienser og italiensk inspiration", Group: "Flavors"},
			{Key: "contact_title", Value: "Find os", Group: "Contact"},
			{Key: "contact_subtitle", Value: "Kom forbi og besøg os i det smukke Marselisborg Havn", Group: "Contact"},
			{Key: "services_title", Value: "Særlige Services", Group: "Services"},
			{Key: "services_subtitle", Value: "Vi tilbyder mere end bare is - vi skaber oplevelser", Group: "Services"},
		}
		
		for _, text := range defaultTexts {
			DB.Create(&text)
		}
		log.Println("Created default text content")
	}
} 

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPassword checks if a password matches its hash
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
} 