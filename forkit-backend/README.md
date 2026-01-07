# ForkIt Backend

Backend proxy for the ForkIt mobile app. Handles Google Places API calls and Play Integrity verification with server-side API key management.

## Setup

### Prerequisites

- Node.js 18+
- Vercel account (free tier works)
- Google Cloud project with Places API (New) and Play Integrity API enabled

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Add your API keys to `.env`:
```
GOOGLE_PLACES_API_KEY=your_actual_api_key
GOOGLE_CLOUD_PROJECT_NUMBER=your_project_number
```

4. Start local development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

### Deployment to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Add environment variables to Vercel:
```bash
vercel env add GOOGLE_PLACES_API_KEY
vercel env add GOOGLE_CLOUD_PROJECT_NUMBER
```

4. Deploy:
```bash
npm run deploy
```

Or simply:
```bash
vercel --prod
```

5. Note the deployed URL (e.g., `https://forkit-backend.vercel.app`)

## API Endpoints

### POST /api/places-nearby

Search for nearby restaurants using Google Places API (New).

**Request Body:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "radius": 5000,
  "keyword": "pizza",
  "opennow": true,
  "maxPrice": 2,
  "minRating": 4.0
}
```

**Response:**
```json
{
  "status": "OK",
  "results": [
    {
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "name": "Pizza Place",
      "vicinity": "123 Main St",
      "rating": 4.5,
      "price_level": 2,
      ...
    }
  ]
}
```

### POST /api/places-details

Get detailed information about a specific place.

**Request Body:**
```json
{
  "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4"
}
```

**Response:**
```json
{
  "status": "OK",
  "result": {
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "name": "Pizza Place",
    "formatted_address": "123 Main St, City, State 12345",
    "formatted_phone_number": "+1 123-456-7890",
    "website": "https://example.com",
    "rating": 4.5,
    ...
  }
}
```

### POST /api/verify-integrity

Verify Google Play Integrity token from Android app.

**Request Body:**
```json
{
  "token": "integrity_token_from_client"
}
```

**Response:**
```json
{
  "verified": true,
  "message": "Token verified successfully",
  "timestamp": "2026-01-07T12:00:00.000Z"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_PLACES_API_KEY` | Google Places API key with Places API (New) enabled | Yes |
| `GOOGLE_CLOUD_PROJECT_NUMBER` | Google Cloud project number for Play Integrity | Yes |

## Google Cloud Setup

1. **Enable Places API (New)**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Library
   - Search for "Places API (New)"
   - Click Enable

2. **Enable Play Integrity API**:
   - In Google Cloud Console, search for "Play Integrity API"
   - Click Enable

3. **Link to Play Console**:
   - Go to [Play Console](https://play.google.com/console/)
   - Select your app
   - Navigate to Test and release → App integrity
   - Click "Link a Cloud project"
   - Select your Google Cloud project

4. **Get Project Number**:
   - In Google Cloud Console, go to Project Settings
   - Copy the Project Number

## Security Notes

- Never commit `.env` file to version control
- API keys are kept server-side only
- CORS is configured to allow requests from any origin (adjust for production)
- Play Integrity tokens are logged but not fully verified in MVP (add @googleapis/playintegrity for production)

## Monitoring

- View logs in Vercel dashboard
- Monitor API usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges

## Cost Estimate

- **Places API (New)**: Free tier ($200/month credit)
- **Play Integrity API**: Free (under 10,000 requests/day)
- **Vercel**: Free tier (sufficient for testing)

Total: $0 during testing phase
