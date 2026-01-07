# ForkIt Migration & Deployment Guide

## Overview

ForkIt has been successfully updated with:
- ✅ Migration from Google Places API (Legacy) to Places API (New)
- ✅ Integration of Google Play Integrity API for app security
- ✅ Backend proxy implementation (Vercel serverless functions)
- ✅ Secure API key management (server-side only)

## What Changed

### Architecture
- **Before**: App made direct API calls to Google Places API with client-side API key
- **After**: App makes requests to backend proxy, which handles all Google API calls with server-side API keys

### Security Improvements
- API keys never exposed in client app
- Play Integrity verification on app launch
- All sensitive operations happen server-side

### API Updates
- Using Places API (New) endpoints
- New field names (displayName, nationalPhoneNumber, etc.)
- POST requests instead of GET for nearby search
- Field masking for optimized responses

## Deployment Steps

### Phase 1: Backend Deployment (Vercel)

#### 1.1 Install Dependencies
```bash
cd ForkIt/forkit-backend
npm install
```

#### 1.2 Set Up Vercel Account
- Create account at https://vercel.com (free tier)
- Install Vercel CLI: `npm install -g vercel`
- Login: `vercel login`

#### 1.3 Configure Environment Variables

Create a `.env` file in `forkit-backend/`:
```bash
cp .env.example .env
```

Add your API keys:
```
GOOGLE_PLACES_API_KEY=your_places_api_key_here
GOOGLE_CLOUD_PROJECT_NUMBER=your_project_number_here
```

**Where to find these:**
- **GOOGLE_PLACES_API_KEY**: Google Cloud Console → Credentials
- **GOOGLE_CLOUD_PROJECT_NUMBER**: Google Cloud Console → Project Settings

#### 1.4 Deploy to Vercel

```bash
cd forkit-backend
vercel --prod
```

Follow the prompts:
- Link to Vercel account
- Set project name (e.g., "forkit-backend")
- Add environment variables when prompted

**Important**: Copy the deployed URL (e.g., `https://forkit-backend.vercel.app`)

#### 1.5 Add Environment Variables to Vercel

If not added during deployment:
```bash
vercel env add GOOGLE_PLACES_API_KEY production
# Paste your API key when prompted

vercel env add GOOGLE_CLOUD_PROJECT_NUMBER production
# Paste your project number when prompted
```

### Phase 2: Google Cloud Configuration

#### 2.1 Enable Places API (New)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Library**
3. Search for **"Places API (New)"**
4. Click **Enable**

#### 2.2 Enable Play Integrity API

1. In Google Cloud Console, search for **"Play Integrity API"**
2. Click **Enable**

#### 2.3 Update API Key Restrictions

1. Go to **APIs & Services** → **Credentials**
2. Click on your API key
3. Under **Application restrictions**:
   - Select **"None"** (Places API New doesn't support HTTP referrer restrictions)
4. Under **API restrictions**:
   - Select **"Restrict key"**
   - Enable only:
     - ✅ Places API (New)
     - ✅ Play Integrity API
5. Click **Save**

**Note:** While "None" for application restrictions may seem less secure, your API key is still protected because:
- It only works with specific APIs (Places API New, Play Integrity API)
- It's stored server-side only (never in client app)
- Backend validates all requests
- Vercel provides rate limiting and DDoS protection

#### 2.4 Link Google Cloud to Play Console

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your app (com.forkit.app)
3. Navigate to **Test and release** → **App integrity**
4. Click **Link a Cloud project**
5. Select your Google Cloud project
6. Confirm linkage

### Phase 3: App Configuration

#### 3.1 Install Dependencies

```bash
cd ForkIt/AppFiles
npm install
```

This will install `@expo/app-integrity` along with other dependencies.

#### 3.2 Configure Backend URL

Update `.env` file:
```
EXPO_PUBLIC_BACKEND_URL=https://your-backend.vercel.app
```

Replace `your-backend.vercel.app` with your actual Vercel URL from Phase 1.4.

#### 3.3 Add EAS Secret (for Production Builds)

```bash
eas secret:create --scope project --name EXPO_PUBLIC_BACKEND_URL --value "https://your-backend.vercel.app"
```

Replace with your actual Vercel URL.

### Phase 4: Testing

#### 4.1 Test Backend Locally

```bash
cd forkit-backend
vercel dev
```

The backend will start at `http://localhost:3000`. Test endpoints:

**Test Nearby Search:**
```bash
curl -X POST http://localhost:3000/api/places-nearby \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radius": 5000,
    "keyword": "pizza",
    "opennow": true,
    "maxPrice": 2,
    "minRating": 4.0
  }'
```

**Test Place Details:**
```bash
curl -X POST http://localhost:3000/api/places-details \
  -H "Content-Type: application/json" \
  -d '{
    "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4"
  }'
```

#### 4.2 Test App Locally

In `.env`, use local backend:
```
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
```

Start the app:
```bash
cd ForkIt/AppFiles
npx expo start
```

Test on Android device or emulator:
- Press `a` to open on Android
- Grant location permissions
- Try searching for restaurants
- Verify results are returned
- Check console logs for integrity check results

#### 4.3 Test Production Backend

Update `.env` to use production URL:
```
EXPO_PUBLIC_BACKEND_URL=https://your-backend.vercel.app
```

Restart the app and test again.

### Phase 5: Build & Deploy App

#### 5.1 Prebuild (if needed)

If using bare workflow for Play Integrity:
```bash
cd ForkIt/AppFiles
npx expo prebuild --platform android
```

#### 5.2 Build APK/AAB

```bash
eas build --platform android --profile production
```

This will:
- Use the `EXPO_PUBLIC_BACKEND_URL` from EAS secrets
- Include `@expo/app-integrity` module
- Generate signed APK/AAB for Play Store

#### 5.3 Test on Physical Device

1. Download the built APK from EAS
2. Install on Android device
3. Test all functionality:
   - Location permissions
   - Restaurant search
   - Place details
   - Integrity checks (check logs)

#### 5.4 Upload to Play Console

1. Go to [Play Console](https://play.google.com/console/)
2. Select your app
3. Navigate to **Production** → **Create new release**
4. Upload the AAB file
5. Complete release notes
6. Submit for review

## Monitoring & Maintenance

### Monitor API Usage

**Google Cloud Console:**
1. Go to **APIs & Services** → **Dashboard**
2. Check usage for:
   - Places API (New)
   - Play Integrity API
3. Set up billing alerts:
   - Billing → Budgets & alerts
   - Create alerts at $10, $50, $100

**Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. View:
   - Function invocations
   - Response times
   - Error rates
   - Logs

### Check Logs

**Vercel Logs:**
```bash
vercel logs --follow
```

Or view in Vercel dashboard → Project → Logs

**App Logs:**
Use React Native Debugger or check device logs:
```bash
adb logcat | grep ForkIt
```

### Update Backend

To deploy backend changes:
```bash
cd forkit-backend
git add .
git commit -m "Update backend"
vercel --prod
```

### Update App

For JS-only changes (no native module changes):
```bash
cd ForkIt/AppFiles
eas update --branch production --message "Update app logic"
```

For changes requiring rebuild:
```bash
eas build --platform android --profile production
```

## Troubleshooting

### Backend Issues

**Problem**: Backend returns 500 error
- **Check**: Environment variables are set in Vercel
- **Fix**: `vercel env ls` to verify, add missing vars

**Problem**: CORS errors
- **Check**: Headers in vercel.json include your domain
- **Fix**: Update `Access-Control-Allow-Origin` in vercel.json

### App Issues

**Problem**: "Backend URL not configured" error
- **Check**: `.env` file exists with `EXPO_PUBLIC_BACKEND_URL`
- **Fix**: Create `.env` from `.env.example` and add URL

**Problem**: No restaurants found
- **Check**: Backend logs for API errors
- **Fix**: Verify API key is correct and Places API (New) is enabled

**Problem**: Integrity checks failing
- **Check**: Play Integrity API is enabled and linked
- **Fix**: Link Cloud project in Play Console → App integrity

### Google Cloud Issues

**Problem**: API key restrictions blocking requests
- **Check**: API restrictions include Places API (New)
- **Fix**: Update restrictions in Cloud Console

**Problem**: Quota exceeded
- **Check**: API usage in Cloud Console dashboard
- **Fix**: Request quota increase or optimize requests

## Cost Management

### Current Usage Estimates

**Assumed Usage:**
- 100 daily active users
- 5 searches per user per day
- Total: 500 searches/day

**Costs:**
- **Places API (New)**: $0 (under $200/month free tier)
- **Play Integrity API**: $0 (under 10,000 requests/day)
- **Vercel**: $0 (free tier)

**Total: $0/month**

### When to Upgrade

**Vercel ($20/month Pro):**
- More than 100GB bandwidth/month
- Need custom domains
- Need password protection

**Google Cloud (pay-as-you-go):**
- Exceeding $200/month free credit
- ~11,764 searches/month = ~393 searches/day
- Should be fine for testing phase

## Next Steps

1. ✅ Complete backend deployment (Phase 1)
2. ✅ Configure Google Cloud APIs (Phase 2)
3. ✅ Update app configuration (Phase 3)
4. ✅ Test locally (Phase 4.1-4.3)
5. ⏳ Build and deploy app (Phase 5)
6. ⏳ Monitor usage and costs

## Support Resources

- **Places API (New) Docs**: https://developers.google.com/maps/documentation/places/web-service/overview
- **Play Integrity Docs**: https://developer.android.com/google/play/integrity
- **Vercel Docs**: https://vercel.com/docs
- **Expo App Integrity**: https://docs.expo.dev/versions/latest/sdk/app-integrity/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/

## Questions?

- Backend issues → Check Vercel logs
- API issues → Check Google Cloud Console
- App issues → Check React Native logs
- Build issues → Check EAS build logs

Good luck with your deployment! 🍴
