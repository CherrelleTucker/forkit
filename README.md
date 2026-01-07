# 🍴 ForkIt

**Fork indecision. Fork regret. Fork it all.**

ForkIt is a random restaurant picker that removes decision fatigue. One tap, one choice, done. Plus copycat recipes if you'd rather cook at home.

---

## 🎯 The Problem

Google Maps already shows you restaurants, ratings, reviews, and filters. What it doesn't do well:

**"Just tell me where to eat."**

ForkIt solves decision paralysis by making the choice for you.

---

## ✨ Features

### 🎲 True Random Selection
- One button: **"Fork It Now"**
- No scrolling, no browsing, no analysis paralysis
- App picks ONE restaurant from your filtered preferences
- Re-roll if you really don't vibe with it

### 🏡 Make at Home Fallback
- Every pick includes the restaurant's **signature dish**
- Links to **copycat recipes** (YouTube, Google, Allrecipes)
- Don't want to go out? Recreate the experience at home

### ✨ Hidden Gems Mode
- Prioritizes local, non-chain restaurants
- Discover your neighborhood instead of defaulting to chains
- Toggle on/off as needed

### 🎚️ Smart Filters (Not Browsing Tools)
- **Distance:** 1-15 miles radius
- **Price:** $-$$$$
- **Rating:** Minimum 3.5-4.5 stars
- **Cuisine:** Optional keyword search
- **Open Now:** Toggle to filter closed restaurants
- **Hidden Gems:** Exclude chains, prioritize local

### 🗺️ Integrations
- **Google Maps:** One-tap navigation
- **Phone Calls:** Call restaurant directly
- **Recipe Links:** YouTube, Google Search, Allrecipes

---

## 🚀 Technology

- **Framework:** React Native (Expo)
- **Platform:** Android (live), iOS (configured, launching Q3-Q4 2026)
- **Data:** Google Places API
- **Build:** EAS Build
- **Distribution:** Google Play Store, Apple App Store (coming soon)

---

## 📱 Download

### Android
> Currently in internal beta testing on Google Play Store

Want to be a beta tester? [Contact me](#contact) or check out [FACEBOOK_TESTER_POST.md](FACEBOOK_TESTER_POST.md) for more info.

### iOS
> Coming Q3-Q4 2026

iOS app is configured and ready to build. See [IOS_QUICK_START.md](IOS_QUICK_START.md) for deployment timeline.

---

## 🎨 Design Philosophy

### Decision Removal > Information Discovery
You don't need more restaurant options. You need someone to pick one for you.

### Personality Matters
- Playful loading phrases: *"Consulting the vibes…"*
- Slot-machine animation for reveals
- Haptic feedback
- Fun, confident tone

### Local-First
Hidden Gems mode isn't a filter—it's the philosophy. Support local restaurants, not chains.

---

## 🏗️ Project Structure

```
ForkIt/
├── AppFiles/           # Expo React Native app
│   ├── App.js         # Main app logic
│   ├── app.json       # Expo configuration
│   ├── eas.json       # Build configuration
│   └── assets/        # Icons, images
├── docs/              # GitHub Pages (Privacy Policy)
├── DEPLOYMENT_README.md      # How to deploy to Play Store
├── PRIVACY_POLICY.md         # Privacy policy
└── prd.md                    # Product requirements
```

---

## 🔐 Privacy & Security

- **Location:** Used only to find nearby restaurants (not stored)
- **No Accounts:** No login, no personal data collection
- **No Tracking:** No analytics, no behavior tracking
- **Ephemeral:** Location data is temporary (not retained)

[Read Full Privacy Policy](https://CherrelleTucker.github.io/forkit/privacy.html)

---

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android development)

### Setup

```bash
# Clone repository
git clone https://github.com/CherrelleTucker/forkit.git
cd forkit/AppFiles

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Google Places API key to .env

# Start development server
npx expo start
```

### Environment Variables

```bash
# .env file
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

Get your API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials).

---

## 📦 Building

### Local Development
```bash
npx expo start
# Scan QR code with Expo Go app
```

### Production Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build Android App Bundle
eas build --platform android --profile production
```

See [DEPLOYMENT_README.md](DEPLOYMENT_README.md) for full deployment guide.

---

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for the complete product roadmap.

### v1.0 (Current - Android Beta)
- [x] Random restaurant selection
- [x] Google Places API integration
- [x] Hidden Gems mode
- [x] Make at home with recipe links
- [x] Smart filters
- [x] Google Maps integration
- [x] Android app on Google Play Store (Internal Testing)

### Phase 1: Post-Beta (Q1 2026)
- [ ] Improve chain detection logic
- [ ] "Avoid repeats" within session
- [ ] Saved favorites
- [ ] History view

### Phase 2: Enhanced Features (Q1-Q2 2026)
- [ ] **Picky eater exclusion mode** (never show specific cuisines/ingredients)
- [ ] Recipe import with ingredient parsing
- [ ] Shopping list generation
- [ ] Pantry tracking

### Phase 3: iOS Launch (Q3-Q4 2026)
- [ ] **iOS App Store release**
- [ ] TestFlight beta testing
- [ ] iOS-specific UI polish
- [ ] Meal planning
- [ ] Budget-aware mode

---

## 🤝 Contributing

ForkIt is currently a solo project in early development. Contributions welcome once v1.0 is publicly released!

**Ideas for contributions:**
- Better chain detection heuristics
- Expanded signature dish database
- UI/UX improvements
- Bug fixes
- Documentation improvements

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🐛 Known Issues

- Signature dish detection is heuristic (manual database for major chains)
- Chain detection uses keyword matching (not perfect)
- iOS version planned for Q3-Q4 2026 (see [ROADMAP.md](ROADMAP.md))

---

## 📞 Contact

- **GitHub Issues:** [Report bugs or request features](https://github.com/CherrelleTucker/forkit/issues)
- **Email:** ctuckersolutions@gmail.com

---

## 🙏 Acknowledgments

- **Google Places API** for restaurant data
- **Expo** for incredible React Native tooling
- **React Native Community** for support and libraries

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/CherrelleTucker/forkit?style=social)
![GitHub forks](https://img.shields.io/github/forks/CherrelleTucker/forkit?style=social)
![GitHub issues](https://img.shields.io/github/issues/CherrelleTucker/forkit)
![License](https://img.shields.io/github/license/CherrelleTucker/forkit)

---

## 🎉 One-Sentence Pitch

**ForkIt removes food decision fatigue by choosing a restaurant for you — and if you don't go, it gives you the recipe to recreate the best thing there.**

---

**Fork indecision. Fork it all. 🍴**
