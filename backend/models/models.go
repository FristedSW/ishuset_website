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
	ID            uint       `json:"id" gorm:"primaryKey"`
	Name          string     `json:"name" gorm:"not null"`
	Email         string     `json:"email" gorm:"not null"`
	Phone         string     `json:"phone"`
	Service       string     `json:"service"`
	EventType     string     `json:"event_type"`
	RecipientName string     `json:"recipient_name"`
	GiftAmount    string     `json:"gift_amount"`
	PreferredFrom *time.Time `json:"preferred_from"`
	PreferredTo   *time.Time `json:"preferred_to"`
	PreferredDate *time.Time `json:"preferred_date"`
	GuestCount    int        `json:"guest_count"`
	AllowEmail    bool       `json:"allow_email" gorm:"default:true"`
	AllowPhone    bool       `json:"allow_phone" gorm:"default:false"`
	Message       string     `json:"message" gorm:"not null"`
	Status        string     `json:"status" gorm:"default:'new'"`
	AcceptedAt    *time.Time `json:"accepted_at"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
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
	IsFeatured  bool      `json:"is_featured" gorm:"default:false"`
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
	IsUnknown     bool      `json:"is_unknown" gorm:"default:false"`
	IsEstimated   bool      `json:"is_estimated" gorm:"default:true"`
	SpecialMessage string   `json:"special_message"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// TextContent represents dynamic text content for the frontend
type TextContent struct {
	ID      uint   `json:"id" gorm:"primaryKey"`
	Key     string `json:"key" gorm:"unique;not null"`
	Value   string `json:"value" gorm:"not null"`
	Group   string `json:"group" gorm:"not null"`
	Locale  string `json:"locale" gorm:"-"`
	BaseKey string `json:"base_key" gorm:"-"`
}

// Flavour represents a single flavour entry with translations.
type Flavour struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Slug          string    `json:"slug" gorm:"unique;not null"`
	NameDA        string    `json:"name_da" gorm:"not null"`
	NameEN        string    `json:"name_en"`
	NameDE        string    `json:"name_de"`
	DescriptionDA string    `json:"description_da"`
	DescriptionEN string    `json:"description_en"`
	DescriptionDE string    `json:"description_de"`
	Category      string    `json:"category" gorm:"not null;default:'milk-based'"`
	ImageURL      string    `json:"image_url"`
	SortOrder     int       `json:"sort_order" gorm:"default:0"`
	IsActive      bool      `json:"is_active" gorm:"default:true"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// PriceItem represents editable scoop prices for the menu overlay.
type PriceItem struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Key         string    `json:"key" gorm:"unique;not null"`
	LabelDA     string    `json:"label_da" gorm:"not null"`
	LabelEN     string    `json:"label_en"`
	LabelDE     string    `json:"label_de"`
	Description string    `json:"description"`
	Price       string    `json:"price" gorm:"not null"`
	SortOrder   int       `json:"sort_order" gorm:"default:0"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// GiftCard represents an internal gift card record.
type GiftCard struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	Code           string    `json:"code" gorm:"unique;not null"`
	BuyerName      string    `json:"buyer_name" gorm:"not null"`
	BuyerEmail     string    `json:"buyer_email" gorm:"not null"`
	BuyerPhone     string    `json:"buyer_phone"`
	RecipientName  string    `json:"recipient_name" gorm:"not null"`
	RecipientEmail string    `json:"recipient_email" gorm:"not null"`
	OriginalAmount string    `json:"original_amount" gorm:"not null"`
	BalanceAmount  string    `json:"balance_amount" gorm:"not null"`
	Message        string    `json:"message"`
	AllowEmail     bool      `json:"allow_email" gorm:"default:true"`
	AllowPhone     bool      `json:"allow_phone" gorm:"default:false"`
	Status         string    `json:"status" gorm:"default:'active'"`
	PaymentStatus  string    `json:"payment_status" gorm:"default:'manual'"`
	StripeSessionID string   `json:"stripe_session_id"`
	StripePaymentIntentID string `json:"stripe_payment_intent_id"`
	EmailSent      bool      `json:"email_sent" gorm:"default:false"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// MediaAsset represents an uploaded reusable media item.
type MediaAsset struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	AltText     string    `json:"alt_text"`
	FileURL     string    `json:"file_url" gorm:"not null"`
	AssetType   string    `json:"asset_type" gorm:"default:'image'"`
	Source      string    `json:"source" gorm:"default:'local'"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// GalleryItem represents an item shown in the public gallery.
type GalleryItem struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	AltText     string    `json:"alt_text"`
	ImageURL    string    `json:"image_url" gorm:"not null"`
	SortOrder   int       `json:"sort_order" gorm:"default:0"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// FreezerBooking represents an accepted freezer rental in the admin calendar.
type FreezerBooking struct {
	ID               uint       `json:"id" gorm:"primaryKey"`
	ContactMessageID *uint      `json:"contact_message_id"`
	CustomerName     string     `json:"customer_name" gorm:"not null"`
	CustomerEmail    string     `json:"customer_email" gorm:"not null"`
	CustomerPhone    string     `json:"customer_phone"`
	Occasion         string     `json:"occasion"`
	FreezerSize      string     `json:"freezer_size" gorm:"not null;default:'small'"`
	StartDate        time.Time  `json:"start_date" gorm:"not null"`
	EndDate          time.Time  `json:"end_date" gorm:"not null"`
	Notes            string     `json:"notes"`
	Price            string     `json:"price"`
	Status           string     `json:"status" gorm:"default:'accepted'"`
	PaymentStatus    string     `json:"payment_status" gorm:"default:'unpaid'"`
	AcceptedAt       time.Time  `json:"accepted_at"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
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

// UserCreateRequest represents admin creation of a new user.
type UserCreateRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
	Role     string `json:"role" validate:"required"`
}

// ContactRequest represents contact form data
type ContactRequest struct {
	Name          string `json:"name" validate:"required"`
	Email         string `json:"email" validate:"required,email"`
	Phone         string `json:"phone"`
	Service       string `json:"service"`
	EventType     string `json:"event_type"`
	RecipientName string `json:"recipient_name"`
	GiftAmount    string `json:"gift_amount"`
	PreferredFrom string `json:"preferred_from"`
	PreferredTo   string `json:"preferred_to"`
	PreferredDate string `json:"preferred_date"`
	GuestCount    int    `json:"guest_count"`
	AllowEmail    bool   `json:"allow_email"`
	AllowPhone    bool   `json:"allow_phone"`
	Message       string `json:"message" validate:"required"`
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
	IsFeatured  bool      `json:"is_featured"`
}

// OpeningHoursRequest represents opening hours creation/update
type OpeningHoursRequest struct {
	Day            string `json:"day" validate:"required"`
	OpenTime       string `json:"open_time" validate:"required"`
	CloseTime      string `json:"close_time" validate:"required"`
	IsOpen         bool   `json:"is_open"`
	IsUnknown      bool   `json:"is_unknown"`
	IsEstimated    bool   `json:"is_estimated"`
	SpecialMessage string `json:"special_message"`
}

// TextContentRequest represents text content creation/update
type TextContentRequest struct {
	Key    string `json:"key" validate:"required"`
	Value  string `json:"value" validate:"required"`
	Group  string `json:"group" validate:"required"`
	Locale string `json:"locale" validate:"required"`
}

// FlavourRequest represents flavour creation/update.
type FlavourRequest struct {
	Slug          string `json:"slug" validate:"required"`
	NameDA        string `json:"name_da" validate:"required"`
	NameEN        string `json:"name_en"`
	NameDE        string `json:"name_de"`
	DescriptionDA string `json:"description_da"`
	DescriptionEN string `json:"description_en"`
	DescriptionDE string `json:"description_de"`
	Category      string `json:"category" validate:"required"`
	ImageURL      string `json:"image_url"`
	SortOrder     int    `json:"sort_order"`
	IsActive      bool   `json:"is_active"`
}

// PriceItemRequest represents price item creation/update.
type PriceItemRequest struct {
	Key         string `json:"key" validate:"required"`
	LabelDA     string `json:"label_da" validate:"required"`
	LabelEN     string `json:"label_en"`
	LabelDE     string `json:"label_de"`
	Description string `json:"description"`
	Price       string `json:"price" validate:"required"`
	SortOrder   int    `json:"sort_order"`
	IsActive    bool   `json:"is_active"`
}

// GiftCardRequest represents gift card creation from the public form.
type GiftCardRequest struct {
	Name          string `json:"name" validate:"required"`
	Email         string `json:"email" validate:"required,email"`
	Phone         string `json:"phone"`
	RecipientName string `json:"recipient_name" validate:"required"`
	RecipientEmail string `json:"recipient_email" validate:"required,email"`
	GiftAmount    string `json:"gift_amount" validate:"required"`
	AllowEmail    bool   `json:"allow_email"`
	AllowPhone    bool   `json:"allow_phone"`
	Message       string `json:"message"`
}

// GiftCardCheckoutRequest represents the public gift card checkout request before payment.
type GiftCardCheckoutRequest struct {
	Name           string `json:"name" validate:"required"`
	Email          string `json:"email" validate:"required,email"`
	Phone          string `json:"phone"`
	RecipientName  string `json:"recipient_name" validate:"required"`
	RecipientEmail string `json:"recipient_email" validate:"required,email"`
	GiftAmount     string `json:"gift_amount" validate:"required"`
	AllowEmail     bool   `json:"allow_email"`
	AllowPhone     bool   `json:"allow_phone"`
	Message        string `json:"message"`
	Locale         string `json:"locale"`
}

// GiftCardUpdateRequest represents admin updates to a gift card.
type GiftCardUpdateRequest struct {
	BalanceAmount string `json:"balance_amount" validate:"required"`
	Status        string `json:"status"`
}

// MediaAssetRequest represents media library item creation/update.
type MediaAssetRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
	AltText     string `json:"alt_text"`
	FileURL     string `json:"file_url" validate:"required"`
	AssetType   string `json:"asset_type"`
	Source      string `json:"source"`
}

// GalleryItemRequest represents gallery item creation/update.
type GalleryItemRequest struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
	AltText     string `json:"alt_text"`
	ImageURL    string `json:"image_url" validate:"required"`
	SortOrder   int    `json:"sort_order"`
	IsActive    bool   `json:"is_active"`
}

// AcceptContactRequest represents the admin accepting a freezer request.
type AcceptContactRequest struct {
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
	FreezerSize string `json:"freezer_size"`
}

// FreezerBookingCreateRequest represents a manual admin-created freezer booking.
type FreezerBookingCreateRequest struct {
	CustomerName  string `json:"customer_name" validate:"required"`
	CustomerEmail string `json:"customer_email" validate:"required,email"`
	CustomerPhone string `json:"customer_phone"`
	Occasion      string `json:"occasion"`
	FreezerSize   string `json:"freezer_size" validate:"required"`
	StartDate     string `json:"start_date" validate:"required"`
	EndDate       string `json:"end_date" validate:"required"`
	Notes         string `json:"notes"`
	Price         string `json:"price"`
	PaymentStatus string `json:"payment_status"`
}

// FreezerBookingUpdateRequest represents admin updates to a freezer booking.
type FreezerBookingUpdateRequest struct {
	Notes         string `json:"notes"`
	Price         string `json:"price"`
	PaymentStatus string `json:"payment_status"`
}
