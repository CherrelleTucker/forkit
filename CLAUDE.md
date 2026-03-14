# ForkIt! — Project Guide

## Overview
Random restaurant picker app. Users tap "Fork It" to get a random nearby restaurant suggestion based on their location and optional filters (keyword, radius, price, rating, open now, hidden gems).

## Architecture

### Mobile App (`AppFiles/`)
- **Framework**: React Native + Expo (SDK 54)
- **Entry point**: `index.js` → `App.js` (main orchestrator) → `components/`, `utils/`, `constants/`
- **Key dependencies**: expo-location, expo-haptics, expo-linear-gradient, react-native-svg, @expo-google-fonts/montserrat, react-native-purchases (RevenueCat)
- **Platform features**: Play Integrity (Android)
- **Config**: `app.json`, `.env` (EXPO_PUBLIC_BACKEND_URL)

### Web App (`web/`)
- **Landing page + group joiner only** (not the full Expo app — prevents free usage bypassing in-app limits)
- **Hosted at**: https://forkit-web.vercel.app
- **Pages**:
  - `web/public/index.html` — Static landing page (download CTAs + "Join a Session" link)
  - `web/public/group/index.html` — Standalone Fork Around web joiner (no app required)
- **No Expo build needed** — both pages are static HTML/CSS/JS
- **Platform wrappers** (in `AppFiles/utils/`) still exist for the mobile Expo web export if ever needed:
  - `platform.js` — Haptics (no-op on web) and Alert (window.alert on web)
  - `location.js` — Browser Geolocation API on web, expo-location on native

### Backend (`forkit-backend/`)
- **Platform**: Vercel serverless functions (Node.js, ESM)
- **Hosted at**: https://forkit-backend.vercel.app
- **Endpoints**:
  - `api/places-nearby.js` — Main search (Text Search for keywords, Nearby Search otherwise)
  - `api/places-details.js` — Detailed place info
  - `api/verify-integrity.js` — Play Integrity verification
- **Group Fork endpoints** (`api/group/`):
  - `create.js` — Host creates session, returns 4-letter code
  - `join.js` — Join session with code + name
  - `filters.js` — Submit filter preferences
  - `status.js` (GET) — Poll session status and participants
  - `pick.js` — Host triggers the pick (merges filters, searches, picks random)
  - `leave.js` — Leave/end session
  - `rejoin.js` — Host reconnects to active session after app restart
- **Session storage** (`lib/group.js`): Vercel KV (Redis), 1-hour TTL, max 8 participants
- **Security** (`lib/security.js`):
  - Rate limiting: 30 req/min per IP
  - Origin checking: only allows forkit-web.vercel.app and localhost
  - Mobile (no Origin header) passes through
- **API key**: Google Places API key stored in Vercel env vars (restricted to Places API only)
- **Vercel KV**: Requires `KV_REST_API_URL` and `KV_REST_API_TOKEN` env vars (set in Vercel dashboard)

## Pre-Push / Pre-Deploy (ForkIt-specific)

See `~/Documents/CLAUDE.md` for universal rules (impact check, review timing, doc sync, repo hygiene).

**ForkIt impact check platforms:**

| Platform | How it goes live |
|----------|------------------|
| Google Play | New EAS build + manual AAB upload (no service account) |
| App Store | New EAS build + submit for review |
| Web (forkit-web.vercel.app) | `cd web && npx vercel deploy --prod --scope ctuckers-projects-c72f1fff --yes` |
| Backend (forkit-backend.vercel.app) | `cd forkit-backend && npx vercel --prod --yes` |
| GitHub Pages (docs/) | **Immediate on push to main** |

**ForkIt doc sync targets:** Info modal (App.js), README.md, CHANGELOG.md, CLAUDE.md, ROADMAP.md, privacy docs, docs/index.html, web/public/index.html

**Post-release: update rebrand branch.** After each feature release deploys, rebase or recreate `rebrand/fork-around` on top of current main. This is a standby rebrand from "ForkIt!" to "Fork Around" — kept ready in case of trademark action. Don't update during dev, only after final deployed code lands on main.

## Deploying

### Backend
```bash
cd forkit-backend
npx vercel --prod --yes
```

### Web App
The web app is a **landing page + group joiner only** (not the full Expo app). The full app is not served on web to prevent free usage bypassing in-app limits.

- `web/public/index.html` — Static landing page (download CTA + "Join a Session" link)
- `web/public/group/index.html` — Standalone group joiner (Fork Around)

**Deploy** (no Expo build needed — both pages are static):
```bash
cd web
npx vercel deploy --prod --scope ctuckers-projects-c72f1fff --yes
```

If you ever need to rebuild the Expo web export for testing, the old process still works — just make sure to back up and restore `index.html` and `group/` after copying `dist/`.

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
- **Pool caching**: First tap fetches full pool, subsequent taps pick locally (zero API calls). Cache invalidates on filter change or after 4 hours.
- **Group Fork (Fork Around)**: 1 free session/month, unlimited with Pro ($1.99/month). Host creates session → shares 4-letter code or web link → friends join and set filters → merged filters (most restrictive) → random pick. Sessions auto-expire after 1 hour.
- **Free tier**: 20 searches/month, 1 Fork Around session/month. A "search" = new API fetch (filter change or cache expiry). Re-rolls from cached pool are free and unlimited. Resets on the 1st. No countdown shown to users — soft Pro nudge after 10 searches, hard paywall at 20. Pro ($1.99/month) unlocks unlimited everything.
- **IAP**: RevenueCat (`react-native-purchases`). Products: Apple `com.ctuckersolutions.forkit.pro.monthly`, Google `forkit_pro_monthly`. Both products ACTIVE. Apple subscription price set ($1.99, 175 regions). Offer codes prepped for beta testers (generate after approval). No push notifications in v2 (deferred to v3, needs Firebase/FCM setup).
- **Web joiner**: `web/public/group/index.html` — standalone HTML/JS page for browser-based group joining (no app required)
- **Interactive Tour**: 12-step spotlight overlay, auto-launches on first open or when `TOUR_VERSION` bumped. Back/Next navigation. Covers all features + free/Pro explainer. Replayable from info modal ("Take a Tour" button). Tour refs attached to key UI elements via `tourRefs` object.
- **Custom Spot Tags**: Spots have a `tags` field (comma-separated string). During fork, spots are filtered by cuisine keyword (matched against tags + name) and exclude terms. No tags = spot only appears when no keyword is set.
- **Fork Around Session Persistence**: Host session saved to AsyncStorage on create, restored on app restart. Backend `rejoin.js` endpoint verifies code+hostId.
- **Color theory**: Orange (`THEME.accent`) = problem/challenge/call-to-action. Teal (`THEME.pop`) = solution/answer/resolution. Applied to headings, buttons, and branding throughout.

## Future Ideas (Pinned)
- "Local Love" / community spotlight system for featuring local restaurants
