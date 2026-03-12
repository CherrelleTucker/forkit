# ForkIt! Product Roadmap

**Last Updated:** March 2026
**Current Version:** 1.1.0 (Live on Google Play, App Store, and Web)

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

---

## Up Next

### Picky Eater Mode
- Dietary preference filters (vegetarian, gluten-free, etc.)
- Cuisine/ingredient exclusion profiles
- Keyword-based filtering via Places API

### History & Stats
- "Your ForkIt! Journal" — map of picks, cuisine breakdown
- Export/share capability

### Favorites Sync
- Cross-device sync (requires lightweight backend + optional account)

---

## Future Ideas

- **Community Spotlight**: Highlight local businesses (women-owned, Black-owned, etc.) — needs external data source
- **Budget-aware mode**: Weekly/monthly food budget tracking
- **Weather-aware suggestions**: Indoor dining when it's raining
- **Meal planning**: "Plan my week" mixing restaurants + home cooking

---

## Monetization

- **Free tier**: 10 solo forks/month, 1 Fork Around session/month
- **Pro** ($1.99/month): Unlimited everything (IAP stub in place, real purchase flow TBD)
- No ads — user experience over revenue

---

## Contact

**Developer:** Cherrelle Tucker
**GitHub:** https://github.com/CherrelleTucker/forkit
**Privacy Policy:** https://CherrelleTucker.github.io/forkit/privacy.html
