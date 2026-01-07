# ForkIt Product Roadmap

**Last Updated:** January 2026
**Current Version:** 1.0.0 (Internal Testing)

---

## Overview

ForkIt is a decision-resolution food app that removes choice paralysis by randomly selecting where to eat. This roadmap outlines planned features based on user feedback and strategic priorities.

**Core Philosophy:**
- Keep the decision-making simple (one tap)
- Add value when users don't want to go out
- Prioritize local discovery over chains

---

## Current State (v1.0.0) - LIVE

**Platform:** Android (Google Play Store - Internal Testing)

**Core Features:**
- True random restaurant selection
- Smart filters (distance, price, rating, cuisine, open now)
- Hidden Gems mode (exclude chains, prioritize local)
- "Make at Home" mode with copycat recipes
- Signature dish identification
- Google Maps integration
- Call restaurant directly

**Tech Stack:**
- React Native / Expo SDK ~54.0.31
- Google Places API
- EAS Build & Updates

---

## Phase 1: Post-Beta Refinements
**Timeline:** During Beta Testing (January - February 2026)
**Focus:** Polish & Bug Fixes

### Priority Features
- [ ] Improve chain detection logic (expand keyword list)
- [ ] User overrides for signature dish suggestions
- [ ] "Avoid repeats" logic (don't show same place twice in a session)
- [ ] Saved/Favorites view
- [ ] Bug fixes from tester feedback
- [ ] Performance optimizations

### Stretch Goals
- [ ] Recent history view ("Where did I Fork It last week?")
- [ ] Share result with friends (text/social)

---

## Phase 2: Enhanced Filtering & Personalization
**Timeline:** Q1-Q2 2026
**Focus:** User Customization

### Key Features
- [ ] **Picky Eater Exclusion Mode**
  - Allow users to create a "Never Show Me" list
  - Exclude specific cuisines (e.g., "No seafood", "No sushi")
  - Exclude specific ingredients (e.g., "No mushrooms")
  - Saved exclusion profiles ("Vegetarian", "Gluten-free", "Kid-friendly")

- [ ] Recipe import & ingredient parsing
  - Parse recipe URLs to extract ingredients
  - Display full recipe in-app (no external browser)

- [ ] Shopping list generation
  - One-tap "Add ingredients to list"
  - Share shopping list via text/email

- [ ] Pantry tracking (basic)
  - "What can I make with what I have?"
  - Ingredient inventory management

- [ ] Cuisine rotation logic
  - "You've had Mexican 3 times this week - try something new?"
  - Configurable rotation preferences

### Technical Improvements
- [ ] Backend API proxy for Google Places (security & cost)
- [ ] Enhanced signature dish database
- [ ] Improved recipe source curation
- [ ] Local data persistence (Room database)

---

## Phase 3: Advanced Features & iOS Launch
**Timeline:** Q3-Q4 2026
**Focus:** Platform Expansion & Intelligence

### Major Features
- [ ] **iOS App Store Release**
  - iOS build via EAS
  - App Store submission & review
  - iOS-specific UI polish (haptics, native components)
  - TestFlight beta testing

- [ ] Meal planning
  - "Plan my week" mode
  - Calendar integration
  - Mix of restaurant + home-cooked meals

- [ ] Budget-aware mode
  - Set weekly/monthly food budget
  - Track spending estimates
  - Suggest cheaper alternatives when over budget

- [ ] History-based novelty scoring
  - Prioritize restaurants you haven't tried
  - "Branch out" vs "comfort zone" toggle

- [ ] Lightweight personalization
  - Learn from your saves/favorites
  - NOT algorithmic recommendations (stay true to random ethos)

### Nice-to-Have
- [ ] Group mode (multiple people deciding together)
- [ ] Restaurant blacklist (never show specific places)
- [ ] Weather-aware suggestions ("It's raining - indoor dining only")

---

## Phase 4: Future Vision
**Timeline:** 2027+
**Focus:** Ecosystem & Monetization

### Potential Features (Under Evaluation)
- [ ] User accounts & cloud sync
- [ ] Social features (friends' favorites)
- [ ] Restaurant partnerships (featured spots)
- [ ] Premium tier (ad-free, advanced filters)
- [ ] API for developers
- [ ] Web version (desktop/mobile web)

### Monetization Strategy (TBD)
- Keep core "Fork It" free forever
- Premium features as optional subscription
- No ads in free tier (user experience > revenue)

---

## Success Metrics

**Current Focus:**
- Time from app open → decision made
- Reroll frequency (lower = better trust in results)
- % of sessions using "Make at Home" mode
- Saved places count
- 7-day and 30-day retention

**Future Metrics:**
- iOS adoption rate
- Picky Eater mode usage
- Shopping list generation rate
- Budget mode engagement

---

## Feedback Loop

**How to Influence the Roadmap:**
- Beta testers: Share feedback via [GitHub Issues](https://github.com/CherrelleTucker/forkit/issues)
- Email: ctuckersolutions@gmail.com
- Feature requests voted on by community

**Prioritization Criteria:**
1. Does it reduce decision fatigue?
2. Does it add value when users don't go out?
3. Can it be built without bloating the app?
4. Does it align with the "Fork It" philosophy?

---

## Technical Debt Tracking

**Known Shortcuts (Acceptable for MVP):**
- Google API key is client-side (move to backend proxy in Phase 2)
- Signature dish logic is heuristic/manual (expand database in Phase 2)
- Chain detection is keyword-based (improve in Phase 1)
- No user accounts (add in Phase 4 if needed)
- Local-only state (add cloud sync in Phase 4 if needed)

---

## Release Philosophy

**Internal Testing → Closed Testing → Open Testing → Production**

Each phase follows Google's recommended release track progression:
- Internal Testing: Friends & family (up to 100 testers)
- Closed Testing: Broader audience (up to 100,000 testers)
- Open Testing: Public opt-in
- Production: Full Play Store release

**Update Strategy:**
- Minor changes: EAS Update (OTA, no rebuild)
- Major features: New AAB build → staged rollout
- iOS: TestFlight → App Store review → release

---

## Contact

**Developer:** Cherrelle Tucker
**Email:** ctuckersolutions@gmail.com
**GitHub:** https://github.com/CherrelleTucker/forkit
**Privacy Policy:** https://CherrelleTucker.github.io/forkit/privacy.html

---

**Fork indecision. Fork it all.** 🍴
