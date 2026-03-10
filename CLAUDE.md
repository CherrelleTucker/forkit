# ForkIt! — Project Guide

## Overview
Random restaurant picker app. Users tap "Fork It" to get a random nearby restaurant suggestion based on their location and optional filters (keyword, radius, price, rating, open now, hidden gems).

## Architecture

### Mobile App (`AppFiles/`)
- **Framework**: React Native + Expo (SDK 54)
- **Entry point**: `index.js` → `App.js` (single-file app, all UI + logic)
- **Key dependencies**: expo-location, expo-haptics, expo-linear-gradient, react-native-svg, @expo-google-fonts/montserrat
- **Platform features**: Play Integrity (Android)
- **Config**: `app.json`, `.env` (EXPO_PUBLIC_BACKEND_URL)

### Web App (`web/`)
- **Built from the same codebase** as the mobile app via `npx expo export --platform web`
- **Hosted at**: https://forkit-web.vercel.app
- **Deploy process**: See "Deploying the Web App" below
- **Platform wrappers** (in `AppFiles/utils/`):
  - `platform.js` — Haptics (no-op on web) and Alert (window.alert on web)
  - `location.js` — Browser Geolocation API on web, expo-location on native
- `App.js` skips auto-location-request on web (deferred to user tap)
- RefreshControl disabled on web

### Backend (`forkit-backend/`)
- **Platform**: Vercel serverless functions (Node.js, ESM)
- **Hosted at**: https://forkit-backend.vercel.app
- **Endpoints**:
  - `api/places-nearby.js` — Main search (Text Search for keywords, Nearby Search otherwise)
  - `api/places-details.js` — Detailed place info
  - `api/verify-integrity.js` — Play Integrity verification
- **Security** (`lib/security.js`):
  - Rate limiting: 10 req/min per IP
  - Origin checking: only allows forkit-web.vercel.app and localhost
  - Mobile (no Origin header) passes through
- **API key**: Google Places API key stored in Vercel env vars (restricted to Places API only)

## Deploying

### Backend
```bash
cd forkit-backend
npx vercel --prod --yes
```

### Web App
The web app requires a multi-step deploy because Vercel blocks `node_modules` paths (font assets use `@expo-google-fonts` paths with `@` symbol):

```bash
# 1. Build the static export
cd AppFiles
npx expo export --platform web --clear

# 2. Copy to web deploy directory
cd ..
rm -rf web/public
cp -r AppFiles/dist web/public

# 3. Flatten font files (Vercel ignores node_modules paths)
mkdir -p web/public/assets/fonts
cd web/public/assets
find node_modules -type f -name "*.ttf" -exec cp {} fonts/ \;
cd ../../..

# 4. Deploy
cd web
npx vercel deploy --prod --scope ctuckers-projects-c72f1fff --yes
```

The `web/vercel.json` has rewrite rules that redirect font requests from the deep `node_modules` paths to the flat `assets/fonts/` directory.

### Android (Closed Testing)
Standard Expo/EAS build process. Changes to `AppFiles/` code require a new build. Backend changes deploy independently.

## Keeping Android + Web in Sync
- Both platforms share the same `AppFiles/App.js` codebase
- Platform-specific behavior is handled via `Platform.OS` checks and the utility wrappers in `utils/`
- **Backend changes** (in `forkit-backend/`) take effect for both platforms immediately after deploy
- **App code changes** (in `AppFiles/`) require:
  - Web: rebuild + redeploy (see deploy steps above)
  - Android: new EAS build + Play Store update
- When adding new features, always check if they need web-specific handling (haptics, alerts, location, native modules)

## Key Patterns
- `pickRandom(arr)` — Core randomization function (App.js)
- `looksLikeChain(name)` — Chain restaurant detection for Hidden Gems mode
- Backend transforms Google Places API v1 responses to legacy format for client compatibility
- Keyword search uses Text Search API with `locationRestriction` (rectangle bounding box)
- No-keyword search uses 6 parallel Nearby Search requests for variety

## Future Ideas (Pinned)
- "Local Love" / community spotlight system for featuring local restaurants
