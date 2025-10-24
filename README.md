# E-Commerce Microservices Application

## Architecture Overview

### Microservices
- **API Gateway** (Port 8000) - Routes requests to appropriate services
- **User Service** (Port 8001) - Authentication & user management with Google OAuth
- **Product Service** (Port 8002) - Product catalog management
- **Order Service** (Port 8003) - Order processing
- **Frontend** (Port 3000) - React application

### Tech Stack
- Frontend: React + Axios + Google OAuth
- Backend: Python (Flask) + MySQL
- Database: MySQL (separate DB per service)
- Authentication: JWT + Google OAuth 2.0

## Features
✅ User registration & login (email/password)
✅ Google OAuth login
✅ Product browsing with images
✅ Shopping cart with quantity management
✅ Order checkout and history
✅ Modern gradient UI with animations

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+ (or Docker)
- Google OAuth Client ID (see GOOGLE_SETUP.md)

### Quick Start with Docker

1. **Get Google OAuth Credentials** (see GOOGLE_SETUP.md for detailed steps)

2. **Create .env file** in project root:
```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

3. **Create frontend/.env file**:
```bash
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

4. **Start all services**:
```bash
docker-compose up --build
```

5. **Access the application**:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- phpMyAdmin: http://localhost:8080 (username: root, password: rootpassword)

### Manual Setup

#### Database Setup
```bash
mysql -u root -p < init.sql
```

#### Backend Setup
```bash
# User Service
cd backend/user-service
pip install -r requirements.txt
export GOOGLE_CLIENT_ID=your-client-id
python app.py

# Product Service
cd backend/product-service
pip install -r requirements.txt
python app.py

# Order Service
cd backend/order-service
pip install -r requirements.txt
python app.py

# API Gateway
cd backend/api-gateway
pip install -r requirements.txt
python app.py
```

#### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env and add your Google Client ID
npm install
npm start
```

## API Endpoints

### User Service
- POST /api/users/register - Register with email/password
- POST /api/users/login - Login with email/password
- POST /api/users/google-login - Login with Google
- GET /api/users/profile/:id - Get user profile

### Product Service
- GET /api/products - Get all products
- GET /api/products/:id - Get product by ID
- POST /api/products - Create product (admin)

### Order Service
- POST /api/orders - Create new order
- GET /api/orders/user/:userId - Get user orders
- GET /api/orders/:id - Get order details

## Google OAuth Setup

See [GOOGLE_SETUP.md](GOOGLE_SETUP.md) for detailed instructions on:
- Creating Google OAuth credentials
- Configuring authorized origins
- Setting up environment variables

## Project Structure
```
├── backend/
│   ├── api-gateway/      # API Gateway service
│   ├── user-service/     # User authentication service
│   ├── product-service/  # Product catalog service
│   └── order-service/    # Order management service
├── frontend/             # React frontend application
├── init.sql             # Database initialization with sample data
├── docker-compose.yml   # Docker orchestration
└── GOOGLE_SETUP.md      # Google OAuth setup guide
```
