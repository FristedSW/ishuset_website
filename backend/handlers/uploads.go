package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

func uploadsDir() string {
	if value := strings.TrimSpace(os.Getenv("UPLOADS_DIR")); value != "" {
		return value
	}
	return "uploads"
}

func sanitizeFilename(name string) string {
	name = strings.TrimSpace(name)
	name = strings.ReplaceAll(name, " ", "-")
	name = strings.ReplaceAll(name, "..", "")
	return name
}

// UploadMediaFile stores a media file locally and returns a public URL.
func UploadMediaFile(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "File upload is required"})
	}

	if err := os.MkdirAll(uploadsDir(), 0o755); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to prepare uploads directory"})
	}

	filename := fmt.Sprintf("%d-%s", time.Now().UnixNano(), sanitizeFilename(file.Filename))
	targetPath := filepath.Join(uploadsDir(), filename)

	if err := c.SaveFile(file, targetPath); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save uploaded file"})
	}

	scheme := c.Protocol()
	host := c.Hostname()
	port := c.Port()
	if port != "" && port != "80" && port != "443" && !strings.Contains(host, ":") {
		host = host + ":" + port
	}

	return c.JSON(fiber.Map{
		"file_url": fmt.Sprintf("%s://%s/uploads/%s", scheme, host, filename),
		"filename": filename,
	})
}
