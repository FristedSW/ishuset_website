// MongoDB initialization script
db = db.getSiblingDB('ishuset');

// Create collections if they don't exist
db.createCollection('media_posts');

// Create indexes for better performance
db.media_posts.createIndex({ "platform": 1 });
db.media_posts.createIndex({ "is_published": 1 });
db.media_posts.createIndex({ "publish_date": -1 });

print('MongoDB initialized for Ishuset application'); 