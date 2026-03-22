package models

import (
	"time"
)

// User represents admin users
type User struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Email        string    `json:"email" gorm:"unique;not null"`
	PasswordHash string    `json:"-" gorm:"not null"`
	Role         string    `json:"role" gorm:"not null;default:'admin'"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// ContactMessage represents incoming contact form submissions
type ContactMessage struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Email     string    `json:"email" gorm:"not null"`
	Phone     string    `json:"phone"`
	Service   string    `json:"service"`
	Message   string    `json:"message" gorm:"not null"`
	Status    string    `json:"status" gorm:"default:'new'"` // new, read, replied
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// MediaPost represents social media posts
type MediaPost struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Content     string    `json:"content" gorm:"not null"`
	ImageURL    string    `json:"image_url"`
	Platform    string    `json:"platform" gorm:"not null"` // facebook, instagram
	PublishDate time.Time `json:"publish_date"`
	Tags        string    `json:"tags"`
	Likes       int       `json:"likes" gorm:"default:0"`
	Comments    int       `json:"comments" gorm:"default:0"`
	Shares      int       `json:"shares" gorm:"default:0"`
	IsPublished bool      `json:"is_published" gorm:"default:false"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// OpeningHours represents store opening hours
type OpeningHours struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Day           string    `json:"day" gorm:"not null"` // monday, tuesday, etc.
	OpenTime      string    `json:"open_time" gorm:"not null"`
	CloseTime     string    `json:"close_time" gorm:"not null"`
	IsOpen        bool      `json:"is_open" gorm:"default:true"`
	SpecialMessage string   `json:"special_message"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// TextContent represents dynamic text content for the frontend
type TextContent struct {
	ID    uint   `json:"id" gorm:"primaryKey"`
	Key   string `json:"key" gorm:"unique;not null"`   // e.g., hero_title, about_description
	Value string `json:"value" gorm:"not null"`        // actual text content
	Group string `json:"group" gorm:"not null"`        // e.g., Home, About, Contact
}

// LoginRequest represents login form data
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// LoginResponse represents login response
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// ContactRequest represents contact form data
type ContactRequest struct {
	Name    string `json:"name" validate:"required"`
	Email   string `json:"email" validate:"required,email"`
	Phone   string `json:"phone"`
	Service string `json:"service"`
	Message string `json:"message" validate:"required"`
}

// MediaPostRequest represents media post creation/update
type MediaPostRequest struct {
	Title       string    `json:"title" validate:"required"`
	Content     string    `json:"content" validate:"required"`
	ImageURL    string    `json:"image_url"`
	Platform    string    `json:"platform" validate:"required"`
	PublishDate time.Time `json:"publish_date"`
	Tags        string    `json:"tags"`
	IsPublished bool      `json:"is_published"`
}

// OpeningHoursRequest represents opening hours creation/update
type OpeningHoursRequest struct {
	Day            string `json:"day" validate:"required"`
	OpenTime       string `json:"open_time" validate:"required"`
	CloseTime      string `json:"close_time" validate:"required"`
	IsOpen         bool   `json:"is_open"`
	SpecialMessage string `json:"special_message"`
}

// TextContentRequest represents text content creation/update
type TextContentRequest struct {
	Key   string `json:"key" validate:"required"`
	Value string `json:"value" validate:"required"`
	Group string `json:"group" validate:"required"`
} 