#!/bin/bash

# Build all Docker images for the e-commerce application

echo "Building Docker images..."

# Build backend services
echo "Building user-service..."
docker build -t user-service:latest ./backend/user-service

echo "Building product-service..."
docker build -t product-service:latest ./backend/product-service

echo "Building order-service..."
docker build -t order-service:latest ./backend/order-service

echo "Building api-gateway..."
docker build -t api-gateway:latest ./backend/api-gateway

# Build frontend
echo "Building frontend..."
docker build -t ecommerce-frontend:latest ./frontend

echo "All images built successfully!"
echo ""
echo "Images:"
docker images | grep -E "user-service|product-service|order-service|api-gateway|ecommerce-frontend"
