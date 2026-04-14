package config

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"ishuset-backend/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDB initializes the database connection.
func InitDB() {
	var err error
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "ishuset.db"
	}

	if dir := filepath.Dir(dbPath); dir != "." && dir != "" {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			log.Fatal("Failed to create database directory:", err)
		}
	}

	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(
		&models.User{},
		&models.ContactMessage{},
		&models.MediaPost{},
		&models.OpeningHours{},
		&models.TextContent{},
		&models.Flavour{},
		&models.PriceItem{},
		&models.GiftCard{},
		&models.MediaAsset{},
		&models.GalleryItem{},
		&models.FreezerBooking{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	migrateLegacyTextKeys()
	migrateLegacyFlavours()
	seedInitialData()
}

func migrateLegacyTextKeys() {
	var texts []models.TextContent
	if err := DB.Find(&texts).Error; err != nil {
		return
	}

	for _, text := range texts {
		if strings.Contains(text.Key, ":") {
			continue
		}
		text.Key = fmt.Sprintf("da:%s", text.Key)
		if err := DB.Save(&text).Error; err != nil {
			log.Printf("Failed to migrate text key %d: %v", text.ID, err)
		}
	}
}

func migrateLegacyFlavours() {
	var flavours []models.Flavour
	if err := DB.Find(&flavours).Error; err != nil {
		return
	}

	for _, flavour := range flavours {
		updated := false
		switch flavour.Category {
		case "classic":
			flavour.Category = "milk-based"
			updated = true
		case "vegan":
			flavour.Category = "sorbet"
			updated = true
		}
		if updated {
			if err := DB.Save(&flavour).Error; err != nil {
				log.Printf("Failed to migrate flavour %d: %v", flavour.ID, err)
			}
		}
	}
}

// seedInitialData seeds the database with initial data.
func seedInitialData() {
	seedDefaultAdmin()
	seedOpeningHours()
	seedTextContent()
	seedFlavours()
	seedPrices()
	seedGiftCards()
}

func seedDefaultAdmin() {
	var userCount int64
	DB.Model(&models.User{}).Count(&userCount)
	if userCount > 0 {
		return
	}

	hashedPassword, _ := HashPassword("admin123")
	defaultUser := models.User{
		Email:        "admin@ishuset.dk",
		PasswordHash: hashedPassword,
		Role:         "admin",
	}
	DB.Create(&defaultUser)
	log.Println("Created default admin user: admin@ishuset.dk / admin123")
}

func seedOpeningHours() {
	var hoursCount int64
	DB.Model(&models.OpeningHours{}).Count(&hoursCount)
	if hoursCount > 0 {
		return
	}

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

func seedTextContent() {
	defaultTexts := []struct {
		Locale string
		Group  string
		Key    string
		Value  string
	}{
		{"da", "Home", "hero_title", "Ishuset Marselisborg Havn"},
		{"da", "Home", "hero_subtitle", "Frisklavet is ved havnen med et enkelt overblik over smage og priser."},
		{"da", "Home", "hero_status_open", "Åbent nu"},
		{"da", "Home", "hero_status_closed", "Lukket lige nu"},
		{"da", "Home", "hero_cta_menu", "Se smage"},
		{"da", "Home", "hero_cta_contact", "Lej fryser"},
		{"da", "Navigation", "nav_opening_hours", "Åbningstider"},
		{"da", "Navigation", "nav_about", "Om os"},
		{"da", "Navigation", "nav_flavours", "Smage"},
		{"da", "Navigation", "nav_services", "Lej fryser"},
		{"da", "Navigation", "nav_contact", "Kontakt"},
		{"da", "About", "about_title", "Vores historie"},
		{"da", "About", "about_subtitle", "Hjemmelavet is, gode råvarer og et sted folk kommer tilbage til."},
		{"da", "About", "about_heading", "Hjemmelavet med kærlighed"},
		{"da", "About", "about_body_1", "Hos Ishuset arbejder vi med klassiske smage, sæsonfavoritter og gode råvarer."},
		{"da", "About", "about_body_2", "Vi vil gerne gøre det let at finde menuen, priserne og de vigtigste oplysninger om butikken."},
		{"da", "Flavours", "flavours_title", "Vores smage"},
		{"da", "Flavours", "flavours_subtitle", "Smagslisten kan opdateres fra adminpanelet med navn, beskrivelser og billeder."},
		{"da", "Flavours", "flavours_filter_all", "Alle smage"},
		{"da", "Flavours", "flavours_filter_milk", "Mælkebaseret"},
		{"da", "Flavours", "flavours_filter_vegan", "Sorbet"},
		{"da", "Flavours", "flavours_cta", "Kom forbi og smag dagens udvalg"},
		{"da", "Gallery", "gallery_title", "Galleri"},
		{"da", "Gallery", "gallery_subtitle", "Et kig på stemningen, iskiosken og billederne fra Ishuset."},
		{"da", "Prices", "prices_title", "Priser"},
		{"da", "Prices", "prices_subtitle", "Alle kugler har samme grundpris uanset smag."},
		{"da", "Services", "services_title", "Lej fryser"},
		{"da", "Services", "services_subtitle", "Send en forespørgsel om leje af fryser til arrangementer og events."},
		{"da", "Services", "services_form_title", "Forespørgsel om fryser"},
		{"da", "Services", "services_form_intro", "Vælg frysertype, ønsket dato og fortæl lidt om arrangementet."},
		{"da", "Services", "services_giftcard_title", "Gavekort"},
		{"da", "Services", "services_giftcard_body", "Gavekort kommer i en senere version med beløb, modtagernavn og betaling."},
		{"da", "Contact", "contact_title", "Find os"},
		{"da", "Contact", "contact_subtitle", "Besøg os ved Marselisborg Havn eller kontakt os direkte."},
		{"da", "OpeningHours", "opening_title", "Åbningstider"},
		{"da", "OpeningHours", "opening_subtitle", "Her finder du butikkens normale åbningstider."},
		{"da", "OpeningHours", "opening_open", "Åbent"},
		{"da", "OpeningHours", "opening_closed", "Lukket"},

		{"en", "Home", "hero_title", "Ishuset Marselisborg Harbour"},
		{"en", "Home", "hero_subtitle", "Fresh ice cream by the harbour with a simple overview of flavours and prices."},
		{"en", "Home", "hero_status_open", "Open now"},
		{"en", "Home", "hero_status_closed", "Closed right now"},
		{"en", "Home", "hero_cta_menu", "See flavours"},
		{"en", "Home", "hero_cta_contact", "Rent a freezer"},
		{"en", "Navigation", "nav_opening_hours", "Opening hours"},
		{"en", "Navigation", "nav_about", "About"},
		{"en", "Navigation", "nav_flavours", "Flavours"},
		{"en", "Navigation", "nav_services", "Freezer rental"},
		{"en", "Navigation", "nav_contact", "Contact"},
		{"en", "About", "about_title", "Our story"},
		{"en", "About", "about_subtitle", "Homemade ice cream, quality ingredients, and a place people return to."},
		{"en", "About", "about_heading", "Homemade with care"},
		{"en", "About", "about_body_1", "At Ishuset we work with classic flavours, seasonal favourites, and ingredients we are proud of."},
		{"en", "About", "about_body_2", "We want the menu, prices and key information to be easy to find."},
		{"en", "Flavours", "flavours_title", "Our flavours"},
		{"en", "Flavours", "flavours_subtitle", "The flavour list can be updated in the admin panel with names, descriptions, and images."},
		{"en", "Flavours", "flavours_filter_all", "All flavours"},
		{"en", "Flavours", "flavours_filter_milk", "Milk-based"},
		{"en", "Flavours", "flavours_filter_vegan", "Sorbet"},
		{"en", "Flavours", "flavours_cta", "Visit us and taste today's selection"},
		{"en", "Gallery", "gallery_title", "Gallery"},
		{"en", "Gallery", "gallery_subtitle", "A look at the atmosphere, the shop and the moments around Ishuset."},
		{"en", "Prices", "prices_title", "Prices"},
		{"en", "Prices", "prices_subtitle", "Each scoop has the same base price regardless of flavour."},
		{"en", "Services", "services_title", "Rent a freezer"},
		{"en", "Services", "services_subtitle", "Send a request for freezer rental for parties and events."},
		{"en", "Services", "services_form_title", "Freezer request"},
		{"en", "Services", "services_form_intro", "Choose a freezer type, preferred date and tell us a bit about your event."},
		{"en", "Services", "services_giftcard_title", "Gift cards"},
		{"en", "Services", "services_giftcard_body", "Gift cards will come in a later version with amount, recipient name and payment."},
		{"en", "Contact", "contact_title", "Find us"},
		{"en", "Contact", "contact_subtitle", "Visit us at Marselisborg Harbour or reach out directly."},
		{"en", "OpeningHours", "opening_title", "Opening hours"},
		{"en", "OpeningHours", "opening_subtitle", "Here you can find the shop's regular opening hours."},
		{"en", "OpeningHours", "opening_open", "Open"},
		{"en", "OpeningHours", "opening_closed", "Closed"},

		{"de", "Home", "hero_title", "Ishuset Marselisborg Hafen"},
		{"de", "Home", "hero_subtitle", "Frisches Eis am Hafen mit einer einfachen Uebersicht ueber Sorten und Preise."},
		{"de", "Home", "hero_status_open", "Jetzt geoeffnet"},
		{"de", "Home", "hero_status_closed", "Im Moment geschlossen"},
		{"de", "Home", "hero_cta_menu", "Sorten ansehen"},
		{"de", "Home", "hero_cta_contact", "Kuehltruhe mieten"},
		{"de", "Navigation", "nav_opening_hours", "Oeffnungszeiten"},
		{"de", "Navigation", "nav_about", "Ueber uns"},
		{"de", "Navigation", "nav_flavours", "Sorten"},
		{"de", "Navigation", "nav_services", "Kuehltruhe mieten"},
		{"de", "Navigation", "nav_contact", "Kontakt"},
		{"de", "About", "about_title", "Unsere Geschichte"},
		{"de", "About", "about_subtitle", "Hausgemachtes Eis, gute Zutaten und ein Ort, an den Menschen gerne zurueckkehren."},
		{"de", "About", "about_heading", "Hausgemacht mit Sorgfalt"},
		{"de", "About", "about_body_1", "Bei Ishuset arbeiten wir mit klassischen Sorten, saisonalen Favoriten und Zutaten, auf die wir stolz sind."},
		{"de", "About", "about_body_2", "Wir moechten, dass Sorten, Preise und die wichtigsten Informationen leicht zu finden sind."},
		{"de", "Flavours", "flavours_title", "Unsere Sorten"},
		{"de", "Flavours", "flavours_subtitle", "Die Sortenliste kann im Adminbereich mit Namen, Beschreibungen und Bildern gepflegt werden."},
		{"de", "Flavours", "flavours_filter_all", "Alle Sorten"},
		{"de", "Flavours", "flavours_filter_milk", "Milchbasiert"},
		{"de", "Flavours", "flavours_filter_vegan", "Sorbet"},
		{"de", "Flavours", "flavours_cta", "Besuchen Sie uns und probieren Sie die Auswahl des Tages"},
		{"de", "Gallery", "gallery_title", "Galerie"},
		{"de", "Gallery", "gallery_subtitle", "Ein Einblick in die Stimmung, die Eisbude und die Bilder rund um Ishuset."},
		{"de", "Prices", "prices_title", "Preise"},
		{"de", "Prices", "prices_subtitle", "Jede Kugel hat denselben Grundpreis unabhaengig von der Sorte."},
		{"de", "Services", "services_title", "Kuehltruhe mieten"},
		{"de", "Services", "services_subtitle", "Senden Sie eine Anfrage fuer die Miete einer Kuehltruhe fuer Feiern und Events."},
		{"de", "Services", "services_form_title", "Anfrage fuer Kuehltruhe"},
		{"de", "Services", "services_form_intro", "Waehlen Sie den Kuehltruhentyp, das Wunschdatum und beschreiben Sie kurz das Event."},
		{"de", "Services", "services_giftcard_title", "Gutscheine"},
		{"de", "Services", "services_giftcard_body", "Gutscheine kommen in einer spaeteren Version mit Betrag, Empfaengername und Zahlung."},
		{"de", "Contact", "contact_title", "So finden Sie uns"},
		{"de", "Contact", "contact_subtitle", "Besuchen Sie uns am Marselisborg Hafen oder kontaktieren Sie uns direkt."},
		{"de", "OpeningHours", "opening_title", "Oeffnungszeiten"},
		{"de", "OpeningHours", "opening_subtitle", "Hier finden Sie die regulaeren Oeffnungszeiten des Ladens."},
		{"de", "OpeningHours", "opening_open", "Geoeffnet"},
		{"de", "OpeningHours", "opening_closed", "Geschlossen"},
	}

	for _, item := range defaultTexts {
		upsertTextContent(item.Locale, item.Group, item.Key, item.Value)
	}
}

func upsertTextContent(locale string, group string, key string, value string) {
	storageKey := TextStorageKey(locale, key)
	var text models.TextContent
	err := DB.Where("key = ?", storageKey).First(&text).Error
	if err == nil {
		return
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Printf("Failed to query text content %s: %v", storageKey, err)
		return
	}

	text = models.TextContent{
		Key:   storageKey,
		Value: value,
		Group: group,
	}
	if err := DB.Create(&text).Error; err != nil {
		log.Printf("Failed to seed text content %s: %v", storageKey, err)
	}
}

func seedFlavours() {
	var count int64
	DB.Model(&models.Flavour{}).Count(&count)
	if count > 0 {
		return
	}

	flavours := []models.Flavour{
		{
			Slug:          "vanilje",
			NameDA:        "Vanilje",
			NameEN:        "Vanilla",
			NameDE:        "Vanille",
			DescriptionDA: "Klassisk og cremet vanilje med blid sødme.",
			DescriptionEN: "Classic creamy vanilla with a gentle sweetness.",
			DescriptionDE: "Klassische cremige Vanille mit milder Suesse.",
			Category:      "milk-based",
			SortOrder:     1,
			IsActive:      true,
		},
		{
			Slug:          "chokolade",
			NameDA:        "Chokolade",
			NameEN:        "Chocolate",
			NameDE:        "Schokolade",
			DescriptionDA: "Mørk chokolade med fyldig smag.",
			DescriptionEN: "Dark chocolate with a rich flavour.",
			DescriptionDE: "Dunkle Schokolade mit vollem Geschmack.",
			Category:      "milk-based",
			SortOrder:     2,
			IsActive:      true,
		},
		{
			Slug:          "jordbær-sorbet",
			NameDA:        "Jordbær sorbet",
			NameEN:        "Strawberry sorbet",
			NameDE:        "Erdbeer-Sorbet",
			DescriptionDA: "Frisk og frugtig sorbet lavet til varme dage.",
			DescriptionEN: "Fresh fruity sorbet made for sunny days.",
			DescriptionDE: "Frisches fruchtiges Sorbet fuer warme Tage.",
			Category:      "sorbet",
			SortOrder:     3,
			IsActive:      true,
		},
	}

	for _, flavour := range flavours {
		if err := DB.Create(&flavour).Error; err != nil {
			log.Printf("Failed to seed flavour %s: %v", flavour.Slug, err)
		}
	}
}

func seedPrices() {
	var count int64
	DB.Model(&models.PriceItem{}).Count(&count)
	if count > 0 {
		return
	}

	items := []models.PriceItem{
		{
			Key:         "one_scoop",
			LabelDA:     "1 kugle",
			LabelEN:     "1 scoop",
			LabelDE:     "1 Kugel",
			Description: "Standard pris pr. kugle",
			Price:       "35 kr",
			SortOrder:   1,
			IsActive:    true,
		},
		{
			Key:         "two_scoops",
			LabelDA:     "2 kugler",
			LabelEN:     "2 scoops",
			LabelDE:     "2 Kugeln",
			Description: "Samme udvalg af smage",
			Price:       "50 kr",
			SortOrder:   2,
			IsActive:    true,
		},
		{
			Key:         "three_scoops",
			LabelDA:     "3 kugler",
			LabelEN:     "3 scoops",
			LabelDE:     "3 Kugeln",
			Description: "Perfekt til at smage flere favoritter",
			Price:       "65 kr",
			SortOrder:   3,
			IsActive:    true,
		},
	}

	for _, item := range items {
		if err := DB.Create(&item).Error; err != nil {
			log.Printf("Failed to seed price item %s: %v", item.Key, err)
		}
	}
}

func seedGiftCards() {
	var count int64
	DB.Model(&models.GiftCard{}).Count(&count)
	if count > 0 {
		return
	}
}

// TextStorageKey turns locale + base key into the persisted database key.
func TextStorageKey(locale string, key string) string {
	return fmt.Sprintf("%s:%s", locale, key)
}

// ParseTextStorageKey returns locale and base key from a stored text key.
func ParseTextStorageKey(storageKey string) (string, string) {
	parts := strings.SplitN(storageKey, ":", 2)
	if len(parts) != 2 {
		return "da", storageKey
	}
	return parts[0], parts[1]
}

// HashPassword hashes a password using bcrypt.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPassword checks if a password matches its hash.
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
