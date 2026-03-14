# ForkIt! Changelog

## v2.0.0 — March 2026

### New Features
- **Interactive Tour**: 12-step spotlight walkthrough, auto-launches on first open. Covers all features and Free vs Pro. Replayable from info modal ("Take a Tour")
- **Custom Spot Tags**: Tag your saved spots (e.g. "pasta, homecooking, spicy") so they filter alongside Google results by cuisine keyword and exclusions
- **Pro Subscription (IAP)**: RevenueCat-powered $1.99/month via Apple and Google. 20 free searches + 1 Fork Around session/month for free users
- **Fork Around Improvements**:
  - Host session persists across app restarts
  - Host name optional at session creation, entered on the hosting screen
  - Solo result card hidden during group sessions
  - Backend rejoin endpoint for session recovery
  - Guest close minimizes modal instead of leaving session
  - Scroll indicators on scrollable group modal steps
- **Your Spots in Fork Around**: Location field searches Your Spots by name, geocodes address on selection
- **Pool caching**: First "Fork It" tap fetches full pool; subsequent taps pick locally with zero API calls. Cache invalidates on filter change or after 4 hours
- **Color theory branding**: Orange = problem/challenge, Teal = solution/answer — applied consistently throughout

### Improvements
- Font scaling accessibility: maxFontSizeMultiplier capped at 1.3 for consistent layouts at all system font sizes
- Pill button styling consistency fixes (compact padding, no forced minHeight)

### Architecture
- Multi-file refactor: App.js split into components/, utils/, and constants/ modules
- Cross-platform tour spotlight alignment (StatusBar offset for Android)
- Responsive bottom-anchored tooltip positioning

### Bug Fixes
- Fixed RevenueCat crash on dev builds when API key is empty
- Fixed solo result card persisting into group fork mode
- Fixed tour spotlight offset on Android
- Fixed tooltip covering spotlighted elements on lower-screen tour steps

---

## v1.1.0 — March 2026

### New Features
- **Fork Around (Group Fork)**: Host creates session, friends join via 4-letter code or web link, merged filters, random pick
- **Web joiner**: Browser-based group joining at forkit-web.vercel.app/group (no app required)
- **iOS launch**: Live on App Store
- **Closing soon filter**: Excludes restaurants closing within 30 min, warns within 60 min
- **Search near a different location**: Enter an address instead of only GPS

### Improvements
- Walk mode suggestion threshold tuning
- Web landing page replacing full Expo web export

---

## v1.0.0 — January 2026

### Initial Release
- Random restaurant selection with smart filters (distance, price, rating, cuisine, open now)
- Hidden Gems mode (skip chains, discover local)
- Google Maps navigation + call restaurant
- Favorites, blocked list, custom spots
- Backend proxy (Vercel serverless) with Play Integrity
- API key protection (server-side only)
- Android: Google Play launch
