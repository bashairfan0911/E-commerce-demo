# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:8000`
   - Add authorized redirect URIs:
     - `http://localhost:3000`
   - Click "Create"
   - Copy your **Client ID** (it will look like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - Copy your **Client Secret** (it will look like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

## Step 2: Configure Your Application

### Frontend Configuration

1. Create a `.env` file in the `frontend` directory:
```bash
REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:8000/api
```

2. Replace `your-actual-client-id` with your Google Client ID

### Backend Configuration

1. Update `docker-compose.yml` to add the Google Client ID:
```yaml
user-service:
  environment:
    GOOGLE_CLIENT_ID: your-actual-client-id.apps.googleusercontent.com
```

Or if running locally, set environment variable:
```bash
export GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

## Step 3: Rebuild and Restart

### Using Docker:
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### Running Locally:
```bash
# Backend
cd backend/user-service
pip install -r requirements.txt
python app.py

# Frontend
cd frontend
npm install
npm start
```

## Step 4: Test Google Login

1. Go to `http://localhost:3000/login`
2. Click the "Sign in with Google" button
3. Select your Google account
4. You should be logged in and redirected to the products page

## Troubleshooting

### "Invalid Client ID" Error
- Make sure you copied the correct Client ID
- Check that the Client ID is set in both frontend and backend

### "Redirect URI Mismatch" Error
- Add `http://localhost:3000` to authorized JavaScript origins
- Add `http://localhost:3000` to authorized redirect URIs

### "Access Blocked" Error
- Make sure Google+ API is enabled
- Check OAuth consent screen is configured

## Security Notes

- Never commit your `.env` file with real credentials
- Use different Client IDs for development and production
- In production, update authorized origins to your actual domain