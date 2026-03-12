# ForkIt!

**Can't decide where to eat? Let fate decide.**

ForkIt! is a random restaurant picker that removes decision fatigue. One tap, one random restaurant near you, done.

[Google Play](https://play.google.com/store/apps/details?id=com.ctuckersolutions.forkit) | [App Store](https://apps.apple.com/app/forkit-restaurant-picker/id6759990349) | [Web](https://forkit-web.vercel.app)

---

## Features

- **Random picks** — One button, one restaurant. No scrolling, no analysis paralysis
- **Walk or drive** — Travel mode filter with smart walk-mode suggestions in dense areas
- **Skip the chains** — Hidden Gems mode filters out chain restaurants so you discover local spots
- **Cuisine filters** — Distance, price, rating, keyword, open now
- **Fork Around** — Group restaurant picking with friends. Host creates a session, shares a code or link, everyone sets filters, app picks from the overlap
- **Save Mom's house to the rotation** — Add custom spots to the random pool
- **Block the restaurant your ex works at** — Permanently exclude places you never want to see
- **Closing soon warnings** — Skips places closing within 30 min, warns you about places closing within 60 min
- **Search near a different location** — Enter an address instead of using GPS
- **Favorites** — Save restaurants you love

---

## Platforms

| Platform | Status | Version |
|----------|--------|---------|
| Android  | Live on Google Play | v1.1.0 |
| iOS      | Live on App Store | v1.1.0 |
| Web      | Landing page + Fork Around joiner | — |

---

## Architecture

```
forkit/
├── AppFiles/              # React Native + Expo (SDK 54) mobile app
│   ├── App.js             # Single-file app (all UI + logic)
│   ├── app.json           # Expo config
│   └── utils/             # Platform wrappers (location, haptics)
├── forkit-backend/        # Vercel serverless functions (Node.js, ESM)
│   ├── api/               # places-nearby, places-details, verify-integrity
│   └── api/group/         # Fork Around endpoints (create, join, filters, status, pick, leave)
├── web/public/            # Static web app (landing page + group joiner)
│   ├── index.html         # Landing page with download CTAs
│   └── group/index.html   # Fork Around web joiner
├── docs/                  # GitHub Pages (privacy policy)
├── CLAUDE.md              # Project guide for AI-assisted development
├── CHANGELOG.md           # Version history
└── PRIVACY_POLICY.md      # Privacy policy (markdown)
```

### Backend
- Vercel serverless functions proxying Google Places API (New)
- API key stored server-side only
- Play Integrity verification (Android)
- Fork Around sessions: Vercel KV (Redis), 1-hour TTL, max 8 participants
- Rate limiting (30 req/min per IP) and origin checking

### Web
The web app is a **landing page + group joiner only** — not the full app. This prevents free unlimited usage via browser. Web joiners can only submit filters; the host (in-app) triggers API calls.

---

## Development

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio / Xcode (for native development)

### Setup
```bash
cd AppFiles
npm install
cp .env.example .env
# Add EXPO_PUBLIC_BACKEND_URL to .env
npx expo start
```

### Deploy
```bash
# Backend
cd forkit-backend && npx vercel --prod --yes

# Web (static — no build needed)
cd web && npx vercel deploy --prod --scope ctuckers-projects-c72f1fff --yes

# Mobile — EAS build + store upload
cd AppFiles && eas build --platform android --profile production
```

---

## Privacy

- Location used only to find nearby restaurants — not stored on servers
- No accounts, no login, no personal data collection
- No analytics or behavior tracking
- Fork Around sessions auto-delete after 1 hour

[Full Privacy Policy](https://CherrelleTucker.github.io/forkit/privacy.html)

---

## Links

- [Google Play](https://play.google.com/store/apps/details?id=com.ctuckersolutions.forkit)
- [App Store](https://apps.apple.com/app/forkit-restaurant-picker/id6759990349)
- [Web](https://forkit-web.vercel.app)
- [Privacy Policy](https://CherrelleTucker.github.io/forkit/privacy.html)
- [Changelog](CHANGELOG.md)
- [Report an Issue](https://github.com/CherrelleTucker/forkit/issues)

---

**Fork indecision. Let fate decide.**
