package handlers

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
	"strings"

	"ishuset-backend/config"
	"ishuset-backend/models"
)

func smtpConfig() (host string, port string, username string, password string, from string) {
	host = os.Getenv("SMTP_HOST")
	port = os.Getenv("SMTP_PORT")
	username = os.Getenv("SMTP_USERNAME")
	password = os.Getenv("SMTP_PASSWORD")
	from = os.Getenv("SMTP_FROM")
	return
}

func buildGiftCardEmail(card models.GiftCard) string {
	return fmt.Sprintf(`
		<html>
			<body style="font-family: Arial, sans-serif; background: #fffaf0; color: #1c1917; padding: 24px;">
				<div style="max-width: 620px; margin: 0 auto; background: white; border-radius: 24px; padding: 32px; border: 1px solid #e7e5e4;">
					<div style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #78716c;">Ishuset</div>
					<h1 style="margin-top: 12px; font-size: 32px;">Du har modtaget et gavekort</h1>
					<p style="line-height: 1.7;">Hej %s,</p>
					<p style="line-height: 1.7;">%s har sendt dig et gavekort til Ishuset.</p>
					<div style="margin: 24px 0; padding: 20px; border-radius: 20px; background: linear-gradient(135deg, #dbeafe, #fef3c7);">
						<div style="font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #57534e;">Gavekortskode</div>
						<div style="margin-top: 8px; font-size: 32px; font-weight: bold;">%s</div>
						<div style="margin-top: 12px; font-size: 18px;">Beløb: %s</div>
					</div>
					<p style="line-height: 1.7;">Personlig besked:</p>
					<div style="padding: 16px; border-radius: 16px; background: #fafaf9; line-height: 1.7;">%s</div>
					<p style="margin-top: 24px; line-height: 1.7;">Vi glæder os til at se dig hos Ishuset.</p>
				</div>
			</body>
		</html>
	`, card.RecipientName, card.BuyerName, card.Code, card.OriginalAmount, strings.ReplaceAll(card.Message, "\n", "<br />"))
}

func sendGiftCardEmail(card models.GiftCard) (bool, error) {
	if card.EmailSent {
		return true, nil
	}

	host, port, username, password, from := smtpConfig()
	if host == "" || port == "" || username == "" || password == "" || from == "" {
		return false, nil
	}

	auth := smtp.PlainAuth("", username, password, host)
	subject := "Ishuset gavekort"
	body := buildGiftCardEmail(card)

	message := strings.Join([]string{
		fmt.Sprintf("From: %s", from),
		fmt.Sprintf("To: %s", card.RecipientEmail),
		fmt.Sprintf("Subject: %s", subject),
		"MIME-Version: 1.0",
		`Content-Type: text/html; charset="UTF-8"`,
		"",
		body,
	}, "\r\n")

	err := smtp.SendMail(host+":"+port, auth, from, []string{card.RecipientEmail}, []byte(message))
	if err != nil {
		log.Printf("Failed to send gift card email for %s: %v", card.Code, err)
		return false, err
	}
	card.EmailSent = true
	if err := config.DB.Model(&models.GiftCard{}).Where("id = ?", card.ID).Update("email_sent", true).Error; err != nil {
		log.Printf("Failed to mark gift card email as sent for %s: %v", card.Code, err)
	}
	return true, nil
}
