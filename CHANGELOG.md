# ForkIt Changelog

## Version 2.0.0 - Tour, Fork Around UX, Free/Pro Tier (In Development)

### New Features

#### Interactive Tour (11 Steps)
- Spotlight overlay tour with back/next navigation, auto-launches on first open
- Covers all features: Fork It button, walk/drive, filters, distance, price/rating, open now, hidden gems, spots/lists, Fork Around, info, and free vs Pro tiers
- "Take a Tour" button in info modal for replay
- Tour version system: bump `TOUR_VERSION` to re-show after major updates

#### Fork Around UX Overhaul
- **Branding**: "Fork Around. Find Out." side-by-side header — orange (problem) + teal (solution) color theory
- **Your Spots integration**: Typing in the location field now searches Your Spots by name (with bookmark icon), geocodes address on selection
- **"Save to Your Spots"**: Saves to both Your Spots and Fork Around quick-access (previously only saved to Fork Around's separate list)
- Removed redundant Saved Spots pill row from Fork Around modal
- Cleaner instructional text: italic, smaller, tighter to fields
- Better input field visibility: subtle background fill on all group inputs

### Improvements
- Color theory style guide: orange = problem/challenge, teal = solution/answer (applied throughout)
- Input fields in Fork Around now have subtle `surfaceLight` background for visual balance
- "or" divider spacing improved between Host/Join sections

---

## Version 1.1.0 - Closing Soon, Fork Around & Web (2026-03-09)

### New Features

#### Fork Around (Group Fork)
- **Group restaurant picking**: Host creates a session, shares a 4-letter code or web link, friends join and set their filters, merged filters pick a random restaurant
- **Web joiner**: Friends can join sessions from any browser at forkit-web.vercel.app/group — no app required
- **Session validation**: Web joiner verifies session exists before showing join form
- **Backend**: Vercel KV (Redis) sessions with 1-hour TTL, max 8 participants, rate limiting

#### Closing Soon Filter
- Excludes restaurants closing within 30 minutes
- Warning toast for places closing within 60 minutes: "Get walking!" / "Better hurry!" / "Drive safely!"
- Backend passes opening hours periods data to client

#### Web Landing Page
- Static landing page at forkit-web.vercel.app with download CTAs and session join link
- Replaced full Expo web export to prevent free unlimited usage via browser
- Semantic HTML, accessibility (aria-pressed, aria-live, role="alert"), Open Graph tags

### Improvements
- Walk mode suggestion threshold lowered from 40 to 25 results
- Tighter filter chip sizing (all distance pills fit on one row)
- Custom location pill spacing improved
- Info modal: added privacy policy link, updated version display, updated Coming Soon
- Search near a different location: enter an address instead of only GPS

### Platform
- **iOS**: v1.1.0 approved and live on App Store
- **Android**: v1.1.0 live on Google Play
- **Web**: Landing page + group joiner deployed to forkit-web.vercel.app

---

## Version 2.0.0 - API Migration & Security Update (2026-01-07)

### Major Changes

#### 🔄 Places API Migration
- **Migrated from Google Places API (Legacy) to Places API (New)**
  - Updated to use new endpoint: `https://places.googleapis.com/v1/places:searchNearby`
  - Updated to use new Place Details endpoint: `https://places.googleapis.com/v1/places/{placeId}`
  - Implemented field masking for optimized API responses
  - Adapted to new JSON response format (displayName, nationalPhoneNumber, etc.)

#### 🔒 Security Enhancements
- **Implemented backend proxy using Vercel serverless functions**
  - API keys now stored server-side only (never in client app)
  - All Google API calls proxied through backend
  - CORS configuration for secure client-server communication

- **Integrated Google Play Integrity API**
  - Added app authenticity verification on launch
  - Silent integrity checks (don't block users)
  - Token verification on backend
  - Prepared for production-grade verification

#### 🏗️ Architecture Changes
- **New Backend Structure** (`forkit-backend/`)
  - `api/places-nearby.js` - Nearby search proxy endpoint
  - `api/places-details.js` - Place details proxy endpoint
  - `api/verify-integrity.js` - Play Integrity verification endpoint
  - Serverless deployment configuration for Vercel

- **App Updates**
  - New utility module: `utils/integrity.js` for Play Integrity handling
  - Updated API calls to use backend instead of direct Google API calls
  - Added integrity token generation and caching
  - Updated environment variable configuration

### New Files

#### Backend
- `forkit-backend/api/places-nearby.js` - Nearby search endpoint
- `forkit-backend/api/places-details.js` - Place details endpoint
- `forkit-backend/api/verify-integrity.js` - Integrity verification endpoint
- `forkit-backend/package.json` - Backend dependencies
- `forkit-backend/vercel.json` - Vercel configuration
- `forkit-backend/.env.example` - Backend environment template
- `forkit-backend/README.md` - Backend documentation

#### App
- `AppFiles/utils/integrity.js` - Play Integrity helper functions

#### Documentation
- `MIGRATION_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `CHANGELOG.md` - This file

### Modified Files

#### App Configuration
- `AppFiles/App.js`
  - Updated imports to include integrity functions
  - Changed config to use `EXPO_PUBLIC_BACKEND_URL` instead of API key
  - Updated `getPlaceDetails()` to call backend
  - Updated `forkIt()` to call backend with integrity token
  - Added integrity check on app launch in `useEffect`

- `AppFiles/package.json`
  - Added `@expo/app-integrity` dependency

- `AppFiles/.env`
  - Replaced `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` with `EXPO_PUBLIC_BACKEND_URL`
  - Added security notes

- `AppFiles/.env.example`
  - Updated template for new configuration

### API Changes

#### Request Format Changes

**Old (Direct API):**
```javascript
const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${apiKey}&location=${lat},${lng}&radius=${radius}`;
const data = await fetch(url).then(r => r.json());
```

**New (Backend Proxy):**
```javascript
const response = await fetch(`${BACKEND_URL}/api/places-nearby`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Integrity-Token': integrityToken,
  },
  body: JSON.stringify({
    latitude, longitude, radius, keyword, opennow, maxPrice, minRating
  }),
});
```

#### Response Format Changes

The backend transforms new API responses to match the old format for client compatibility:

| Old Field | New Field |
|-----------|-----------|
| `name` | `displayName.text` |
| `formatted_phone_number` | `nationalPhoneNumber` |
| `url` | `googleMapsUri` |
| `website` | `websiteUri` |
| `opening_hours` | `currentOpeningHours` |
| `vicinity` | `formattedAddress` |
| `price_level` | `priceLevel` (enum → number) |

### Dependencies Added

- `@expo/app-integrity` (latest) - For Play Integrity API integration

### Environment Variables

#### New (App)
- `EXPO_PUBLIC_BACKEND_URL` - Backend API URL

#### Removed (App)
- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` - Now stored in backend

#### New (Backend)
- `GOOGLE_PLACES_API_KEY` - Google Places API key (server-side)
- `GOOGLE_CLOUD_PROJECT_NUMBER` - For Play Integrity verification

### Security Improvements

1. **API Key Protection**
   - API keys never exposed in client bundle
   - Can't be extracted from APK/AAB

2. **App Integrity Verification**
   - Detects modified or unofficial app versions
   - Verifies app is installed from Google Play
   - Checks device integrity

3. **Request Validation**
   - Backend validates all request parameters
   - Prevents abuse and invalid requests

4. **CORS Protection**
   - Configured to allow only legitimate origins

### Breaking Changes

⚠️ **Configuration Required:**
- Must deploy backend before using updated app
- Must update `.env` file with backend URL
- Must configure Google Cloud APIs (Places API New, Play Integrity)

⚠️ **Google Cloud Setup:**
- Old Places API key won't work (must enable Places API New)
- Must link Google Cloud project to Play Console for integrity checks

### Upgrade Path

1. Deploy backend to Vercel
2. Enable Google Cloud APIs
3. Update app configuration
4. Test locally
5. Build and deploy updated app

See [MIGRATION_DEPLOYMENT_GUIDE.md](MIGRATION_DEPLOYMENT_GUIDE.md) for detailed steps.

### Cost Impact

- **Before**: Direct API usage, API key in client (security risk)
- **After**: Backend proxy + integrity checks
  - Free tier sufficient for testing (100+ users)
  - Better security, no additional cost
  - Pay-as-you-grow pricing model

### Performance Considerations

- **Latency**: Added ~50-100ms for backend proxy (minimal impact)
- **Caching**: Backend can cache common searches (future optimization)
- **Quota**: Integrity checks only on app launch (minimal quota usage)

### Future Improvements

- [ ] Full Play Integrity token decryption on backend (using `@googleapis/playintegrity`)
- [ ] Response caching for common searches
- [ ] Rate limiting on backend endpoints
- [ ] Service account for production integrity verification
- [ ] Metrics and analytics dashboard

### Migration Timeline

- **Legacy API Deprecation**: Q3 2026
- **Recommended Migration**: Before Q2 2026
- **This Update**: January 2026 ✅

### Acknowledgments

Migration based on:
- [Google Places API Migration Guide](https://developers.google.com/maps/documentation/places/web-service/legacy/migrate-overview)
- [Play Integrity Setup Guide](https://developer.android.com/google/play/integrity/setup)
- [Expo App Integrity Docs](https://docs.expo.dev/versions/latest/sdk/app-integrity/)

---

## Version 1.0.0 - Initial Release

See [prd.md](prd.md) for original feature set and requirements.
