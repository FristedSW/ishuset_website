package handlers

import (
	"context"
	"time"
	"ishuset-backend/config"
	"ishuset-backend/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MediaPostMongo struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Content     string             `bson:"content" json:"content"`
	ImageURL    string             `bson:"image_url" json:"image_url"`
	Platform    string             `bson:"platform" json:"platform"`
	PublishDate time.Time          `bson:"publish_date" json:"publish_date"`
	Tags        string             `bson:"tags" json:"tags"`
	Likes       int                `bson:"likes" json:"likes"`
	Comments    int                `bson:"comments" json:"comments"`
	Shares      int                `bson:"shares" json:"shares"`
	IsPublished bool               `bson:"is_published" json:"is_published"`
	IsFeatured  bool               `bson:"is_featured" json:"is_featured"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}

// GetMediaPosts returns all media posts from MongoDB
func GetMediaPosts(c *fiber.Ctx) error {
	ctx := context.Background()
	filter := bson.M{}
	if platform := c.Query("platform"); platform != "" {
		filter["platform"] = platform
	}
	if published := c.Query("published"); published != "" {
		if published == "true" {
			filter["is_published"] = true
		} else if published == "false" {
			filter["is_published"] = false
		}
	}
	cur, err := config.MediaCollection.Find(ctx, filter)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch media posts"})
	}
	defer cur.Close(ctx)
	var posts []MediaPostMongo
	if err := cur.All(ctx, &posts); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to decode media posts"})
	}
	return c.JSON(posts)
}

// CreateMediaPost creates a new media post in MongoDB
func CreateMediaPost(c *fiber.Ctx) error {
	ctx := context.Background()
	var req models.MediaPostRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	post := MediaPostMongo{
		Title:       req.Title,
		Content:     req.Content,
		ImageURL:    req.ImageURL,
		Platform:    req.Platform,
		PublishDate: req.PublishDate,
		Tags:        req.Tags,
		IsPublished: req.IsPublished,
		IsFeatured:  req.IsFeatured,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	res, err := config.MediaCollection.InsertOne(ctx, post)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create media post"})
	}
	post.ID = res.InsertedID.(primitive.ObjectID)
	return c.JSON(post)
}

// UpdateMediaPost updates an existing media post in MongoDB
func UpdateMediaPost(c *fiber.Ctx) error {
	ctx := context.Background()
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}
	var req models.MediaPostRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	update := bson.M{
		"$set": bson.M{
			"title":        req.Title,
			"content":      req.Content,
			"image_url":    req.ImageURL,
			"platform":     req.Platform,
			"publish_date": req.PublishDate,
			"tags":         req.Tags,
			"is_published": req.IsPublished,
			"is_featured":  req.IsFeatured,
			"updated_at":   time.Now(),
		},
	}
	res := config.MediaCollection.FindOneAndUpdate(ctx, bson.M{"_id": objID}, update, nil)
	if res.Err() != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Media post not found"})
	}
	var updated MediaPostMongo
	if err := res.Decode(&updated); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to decode updated post"})
	}
	return c.JSON(updated)
}

// DeleteMediaPost deletes a media post from MongoDB
func DeleteMediaPost(c *fiber.Ctx) error {
	ctx := context.Background()
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}
	res, err := config.MediaCollection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete media post"})
	}
	if res.DeletedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Media post not found"})
	}
	return c.JSON(fiber.Map{"message": "Media post deleted successfully"})
} 
