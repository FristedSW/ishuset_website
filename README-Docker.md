# Ishuset Website - Docker Setup

This project uses Docker Compose to run all services (MongoDB, Go Backend, React Frontend) together.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Start all services:**
   ```bash
   ./start.sh
   ```
   Or manually:
   ```bash
   docker-compose up --build -d
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin
   - Backend API: http://localhost:8080/api

3. **Default admin credentials:**
   - Email: `admin@ishuset.dk`
   - Password: `admin123`

## Services

### MongoDB (Port 27017)
- Database: `ishuset`
- Username: `admin`
- Password: `password123`
- Data is persisted in a Docker volume

### Go Backend (Port 8080)
- Built from `backend/Dockerfile`
- Connects to MongoDB
- Provides REST API endpoints
- SQLite for user data, MongoDB for media posts

### React Frontend (Port 3000)
- Built from `Dockerfile.frontend`
- Hot reload enabled
- Connects to backend API

## Useful Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v

# Rebuild and restart
docker-compose up --build -d

# Access MongoDB shell
docker exec -it ishuset-mongodb mongosh -u admin -p password123

# Access backend container
docker exec -it ishuset-backend sh

# Access frontend container
docker exec -it ishuset-frontend sh
```

## Environment Variables

### Backend
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Backend port (default: 8080)
- `JWT_SECRET`: JWT signing secret

### Frontend
- `REACT_APP_API_URL`: Backend API URL
- `CHOKIDAR_USEPOLLING`: Enable file watching in Docker

## Troubleshooting

### Services won't start
1. Check if Docker is running
2. Check if ports 3000, 8080, 27017 are available
3. View logs: `docker-compose logs`

### Frontend can't connect to backend
1. Check if backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify API URL in frontend environment

### MongoDB connection issues
1. Check MongoDB logs: `docker-compose logs mongodb`
2. Verify connection string in backend environment
3. Check if MongoDB container is healthy

### Data persistence
- MongoDB data is stored in Docker volume `mongodb_data`
- SQLite database is stored in backend container
- To backup data, use Docker volume commands

## Development

For development, you can:
1. Mount source code as volumes (already configured)
2. Use hot reload for both frontend and backend
3. Access logs in real-time with `docker-compose logs -f`

## Production

For production deployment:
1. Use proper environment variables
2. Set up proper JWT secrets
3. Configure HTTPS
4. Set up proper MongoDB authentication
5. Use production builds for frontend 