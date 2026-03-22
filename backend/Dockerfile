# --- Builder stage ---
FROM golang:1.23.11-alpine AS builder

# Install build tools and SQLite dev headers
RUN apk add --no-cache git ca-certificates gcc musl-dev
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# Build with CGO enabled
RUN CGO_ENABLED=1 go build -v -o main .

# --- Runtime stage ---
FROM alpine:3.20
RUN apk add --no-cache ca-certificates sqlite-libs
WORKDIR /app
COPY --from=builder /app/main ./main
COPY --from=builder /app/init-mongo.js ./init-mongo.js
COPY --from=builder /app/config ./config
COPY --from=builder /app/handlers ./handlers
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/models ./models
COPY --from=builder /app/go.mod ./go.mod
COPY --from=builder /app/go.sum ./go.sum
EXPOSE 8080
CMD ["./main"] 
