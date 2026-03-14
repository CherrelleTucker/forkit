# ForkIt! Product Roadmap

**Last Updated:** March 2026
**Current Version:** 2.0.0

---

## Shipped

### v1.0.0 — Initial Release (January 2026)
- Random restaurant selection with smart filters (distance, price, rating, cuisine, open now)
- Hidden Gems mode (skip chains, discover local)
- Google Maps navigation + call restaurant
- Favorites, blocked list, custom spots ("Mom's house")
- Backend proxy (Vercel serverless) with Play Integrity
- Android: Google Play (internal testing → production)

### v1.1.0 — Fork Around & Polish (March 2026)
- **Fork Around (Group Fork)**: Host creates session, friends join via 4-letter code or web link, merged filters, random pick
- **Web joiner**: Browser-based group joining at forkit-web.vercel.app/group (no app required)
- **iOS launch**: Live on App Store
- **Closing soon filter**: Excludes restaurants closing within 30 min, warns within 60 min
- **Search near a different location**: Enter an address instead of only GPS
- Walk mode suggestion threshold tuning
- Web landing page replacing full Expo web export

### v2.0.0 — Tour, Pro, & Custom Spot Tags (March 2026)
- **Interactive Tour**: 12-step spotlight walkthrough, auto-launches on first open, replayable from info modal
- **Pro Subscription (IAP)**: RevenueCat-powered $1.99/month. 20 free searches + 1 Fork Around/month for free users
- **Custom Spot Tags**: Tag saved spots with cuisine keywords for filtered matching alongside Google results
- **Fork Around UX**: Host session persistence, rejoin after restart, streamlined host name flow, guest close minimizes instead of leaving, scroll indicators
- **Pool caching**: First tap fetches full pool; re-rolls are free with zero API calls
- **Font scaling accessibility**: maxFontSizeMultiplier 1.3 across all text
- **Color theory branding**: Orange = problem/challenge, Teal = solution/answer
- **Multi-file architecture**: Components, utils, constants extracted from monolithic App.js

---

## Up Next

### v3 — Ideas
- **Push Notifications for Fork Around**: Background notifications when participants join or submit filters (requires Firebase/FCM setup)
- **Food Truck Mode**: Discover food trucks near you
- **History & Stats**: "Your ForkIt! Journal" — map of picks, cuisine breakdown
- **Picky Eater Mode**: Dietary preference filters (vegetarian, gluten-free, etc.)
- **Fork Around Session History**: Review past group sessions and their picks
- **Multi-Session Support**: Host one session while joining another simultaneously
- **Solo Fork History**: Recent picks shown on main screen in the same card style
- **Meet-Up Time**: Host sets a time to meet, shared with all guests in the result
- **User Accounts**: Lightweight accounts for cross-device sync and historical session tracking

---

## Future Ideas

- **Community Spotlight**: Highlight local businesses (women-owned, Black-owned, etc.) — needs external data source
- **Favorites Sync**: Cross-device sync (requires lightweight backend + optional account)
- **Budget-aware mode**: Weekly/monthly food budget tracking
- **Weather-aware suggestions**: Indoor dining when it's raining

---

## Monetization

- **Free tier**: 20 searches/month, 1 Fork Around session/month. Re-rolls from cached pool are free and unlimited
- **Pro** ($1.99/month): Unlimited everything
- No ads — user experience over revenue

---

## Contact

**Developer:** Cherrelle Tucker
**GitHub:** https://github.com/CherrelleTucker/forkit
**Privacy Policy:** https://CherrelleTucker.github.io/forkit/privacy.html
