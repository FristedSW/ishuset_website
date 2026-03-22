package handlers

import (
	"time"

	"ishuset-backend/config"
	"ishuset-backend/models"

	"github.com/gofiber/fiber/v2"
)

func parseBookingDate(value string) (time.Time, error) {
	if parsed, err := time.Parse(time.RFC3339, value); err == nil {
		return parsed, nil
	}
	return time.Parse("2006-01-02", value)
}

func normalizeBookingRange(start time.Time, end time.Time) (time.Time, time.Time) {
	start = time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, start.Location())
	end = time.Date(end.Year(), end.Month(), end.Day(), 23, 59, 59, 0, end.Location())
	return start, end
}

func bookingHasConflict(start time.Time, end time.Time, freezerSize string, excludeID uint) (bool, error) {
	var count int64
	query := config.DB.Model(&models.FreezerBooking{}).
		Where("status = ?", "accepted").
		Where("freezer_size = ?", freezerSize).
		Where("start_date <= ? AND end_date >= ?", end, start)

	if excludeID != 0 {
		query = query.Where("id <> ?", excludeID)
	}

	if err := query.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// GetFreezerBookings returns all accepted freezer bookings for the admin calendar.
func GetFreezerBookings(c *fiber.Ctx) error {
	var bookings []models.FreezerBooking
	query := config.DB.Order("start_date asc, created_at asc")
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if freezerSize := c.Query("freezer_size"); freezerSize != "" {
		query = query.Where("freezer_size = ?", freezerSize)
	}
	if err := query.Find(&bookings).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch freezer bookings"})
	}
	return c.JSON(bookings)
}

// AcceptContactMessage turns a freezer request into a calendar booking if there is no conflict.
func AcceptContactMessage(c *fiber.Ctx) error {
	id := c.Params("id")

	var message models.ContactMessage
	if err := config.DB.First(&message, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Contact message not found"})
	}

	var req models.AcceptContactRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.StartDate == "" && message.PreferredFrom != nil {
		req.StartDate = message.PreferredFrom.Format("2006-01-02")
	}
	if req.StartDate == "" && message.PreferredDate != nil {
		req.StartDate = message.PreferredDate.Format("2006-01-02")
	}
	if req.EndDate == "" && message.PreferredTo != nil {
		req.EndDate = message.PreferredTo.Format("2006-01-02")
	}
	if req.EndDate == "" && message.PreferredDate != nil {
		req.EndDate = message.PreferredDate.Format("2006-01-02")
	}
	if req.EndDate == "" {
		req.EndDate = req.StartDate
	}
	if req.FreezerSize == "" {
		req.FreezerSize = "small"
	}

	if req.StartDate == "" || req.EndDate == "" {
		return c.Status(400).JSON(fiber.Map{"error": "A start and end date are required before accepting the request"})
	}
	if req.FreezerSize != "small" && req.FreezerSize != "large" {
		return c.Status(400).JSON(fiber.Map{"error": "Freezer size must be small or large"})
	}

	startDate, err := parseBookingDate(req.StartDate)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid start date"})
	}
	endDate, err := parseBookingDate(req.EndDate)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid end date"})
	}
	startDate, endDate = normalizeBookingRange(startDate, endDate)
	if endDate.Before(startDate) {
		return c.Status(400).JSON(fiber.Map{"error": "End date cannot be earlier than start date"})
	}

	hasConflict, err := bookingHasConflict(startDate, endDate, req.FreezerSize, 0)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to check freezer availability"})
	}
	if hasConflict {
		return c.Status(409).JSON(fiber.Map{"error": "This period is already taken in the freezer calendar"})
	}

	if message.Status == "accepted" {
		return c.Status(409).JSON(fiber.Map{"error": "This request has already been accepted"})
	}

	acceptedAt := time.Now()
	booking := models.FreezerBooking{
		ContactMessageID: &message.ID,
		CustomerName:     message.Name,
		CustomerEmail:    message.Email,
		CustomerPhone:    message.Phone,
		Occasion:         message.Service,
		FreezerSize:      req.FreezerSize,
		StartDate:        startDate,
		EndDate:          endDate,
		Notes:            message.Message,
		Status:           "accepted",
		AcceptedAt:       acceptedAt,
	}

	if err := config.DB.Create(&booking).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create freezer booking"})
	}

	message.Status = "accepted"
	message.AcceptedAt = &acceptedAt
	if err := config.DB.Save(&message).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update request status"})
	}

	return c.JSON(booking)
}
