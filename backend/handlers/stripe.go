package handlers

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

func stripeSecretKey() string {
	return os.Getenv("STRIPE_SECRET_KEY")
}

func stripeWebhookSecret() string {
	return os.Getenv("STRIPE_WEBHOOK_SECRET")
}

func stripePublicBaseURL() string {
	if value := strings.TrimSpace(os.Getenv("PUBLIC_APP_URL")); value != "" {
		return strings.TrimRight(value, "/")
	}
	return "http://localhost:3000"
}

func parseAmountToOre(value string) (int64, error) {
	normalized := strings.ToLower(strings.TrimSpace(value))
	normalized = strings.ReplaceAll(normalized, "dkk", "")
	normalized = strings.ReplaceAll(normalized, "kr.", "")
	normalized = strings.ReplaceAll(normalized, "kr", "")
	normalized = strings.ReplaceAll(normalized, " ", "")
	normalized = strings.ReplaceAll(normalized, ",", ".")

	if normalized == "" {
		return 0, fmt.Errorf("amount is required")
	}

	amount, err := strconv.ParseFloat(normalized, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid amount format")
	}
	if amount <= 0 {
		return 0, fmt.Errorf("amount must be greater than zero")
	}

	return int64(amount * 100), nil
}
