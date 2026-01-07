# iOS Quick Start Guide

**Goal:** Get ForkIt on the Apple App Store
**Prerequisites:** Android app already live on Google Play Store

---

## TL;DR - What You Need

1. **Apple Developer account** ($99/year)
2. **iOS build** (via EAS Build - no Mac required!)
3. **iOS screenshots** (exact dimensions required)
4. **App Store Connect setup** (similar to Play Console)
5. **TestFlight beta testing** (like Play Store Internal Testing)
6. **App Store submission** (24-48 hour review)

---

## Step-by-Step

### 1. Enroll in Apple Developer Program (Day 1)

**Cost:** $99/year (required)

1. Go to: https://developer.apple.com/programs/enroll/
2. Sign in with your Apple ID (or create one)
3. Choose **Individual** enrollment type
4. Fill out enrollment form
5. Pay $99 via credit card
6. Wait 24-48 hours for approval

**You'll receive:** Email confirmation when approved

---

### 2. Configure iOS Build (Day 1 - 5 minutes)

Your app is already configured! ✓

Files updated:
- `app.json` - iOS configuration added
- `eas.json` - iOS build profiles added

**When you get your Apple Developer account, update eas.json:**

```json
"ios": {
  "appleId": "ctuckersolutions@gmail.com",  // Your Apple ID
  "ascAppId": "1234567890",  // Get from App Store Connect after creating app
  "appleTeamId": "ABCD123456"  // Get from developer.apple.com/account
}
```

---

### 3. Build for iOS (Day 2 - 20 minutes)

Once Apple Developer account is approved:

```bash
cd AppFiles
eas build --platform ios --profile production
```

**First time prompts:**
```
? Would you like EAS to handle iOS credentials for you? → Yes
```

EAS will automatically:
- Create Apple Distribution Certificate
- Generate Provisioning Profile
- Build your app for iOS
- Give you download link for .ipa file

**Wait 10-20 minutes** for build to complete.

---

### 4. Create App in App Store Connect (Day 2 - 30 minutes)

1. Go to: https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**

**Fill in:**
- **Platform:** iOS
- **Name:** ForkIt
- **Primary Language:** English (U.S.)
- **Bundle ID:** com.forkit.app (select from dropdown)
- **SKU:** forkit-2026

**Complete App Information:**
- **Category:** Food & Drink
- **Subtitle:** Fork indecision, done.
- **Privacy Policy URL:** https://CherrelleTucker.github.io/forkit/privacy.html
- **Description:** (Copy from IOS_APP_STORE_DEPLOYMENT.md)
- **Keywords:** restaurant,food,random,decide,picker,local,recipe,dinner,lunch,eat
- **Support URL:** https://github.com/CherrelleTucker/forkit

---

### 5. Upload iOS Assets (Day 2 - 1 hour)

**App Icon:** Already have it! (AppFiles/assets/icon.png - 1024x1024)

**Screenshots:** Need iOS-specific dimensions

**iPhone 6.7" Display (Required):**
- Size: 1290 x 2796 pixels (portrait)
- Quantity: 3-10 screenshots

**How to get screenshots:**
- Run app in iOS Simulator (via Mac) OR
- Use iPhone with Expo Go OR
- Resize Android screenshots (use Canva/Figma)

---

### 6. Complete App Privacy (Day 2 - 15 minutes)

In App Store Connect → App Privacy:

**Location Data:**
- ✓ Precise Location
- **Purpose:** App Functionality
- **Linked to User:** No
- **Used for Tracking:** No

**No other data collected**

---

### 7. TestFlight Beta (Day 3-4 - Optional but Recommended)

```bash
eas submit --platform ios --profile production
```

This uploads your build to TestFlight.

**Invite beta testers:**
1. App Store Connect → TestFlight
2. Add testers via email
3. They get invitation → install TestFlight app → download ForkIt beta

**Test for 1-2 days**, fix any iOS-specific bugs.

---

### 8. Submit for App Store Review (Day 5 - 10 minutes)

In App Store Connect:
1. Go to **App Store** tab
2. Select your build from TestFlight
3. Click **Submit for Review**

**Apple reviews within 24-48 hours**

---

## Cost Breakdown

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Program | $99 | Annual |
| EAS Build (optional upgrade) | $29/month | Monthly (optional) |
| **Total Year 1** | **$99-$450** | |

**Note:** Free EAS tier works fine initially. Upgrade if you hit build limits.

---

## Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Apple Developer enrollment | 24-48 hours | Wait for approval |
| App configuration | 5 minutes | Already done! |
| iOS build | 10-20 minutes | First build slower |
| App Store Connect setup | 1-2 hours | Similar to Play Console |
| Screenshot creation | 1-2 hours | iOS-specific dimensions |
| TestFlight beta (optional) | 3-7 days | Recommended |
| App Store review | 24-48 hours | Manual review |
| **Total** | **5-10 days** | Most time is waiting |

---

## Common Questions

### Do I need a Mac?
**No!** EAS Build runs in the cloud. You only need:
- Your Windows computer (what you already have)
- Apple Developer account ($99/year)

### Can I use my Android screenshots?
**No.** iOS requires exact pixel dimensions. You'll need to:
- Capture new screenshots from iOS Simulator OR
- Resize your Android screenshots to iOS dimensions

### How is this different from Android?
- **Cost:** $99/year (vs $25 one-time for Android)
- **Review:** Manual + stricter (vs mostly automated)
- **Timeline:** 24-48 hours (vs 1-7 days)
- **Assets:** Exact dimensions required (vs flexible)

### What if Apple rejects my app?
- **Rare** for quality apps like ForkIt
- Common reasons: crashes, poor UI, missing privacy info
- Your app should pass easily (polished, clear value, privacy policy ready)

---

## Files to Reference

- **Full Guide:** [IOS_APP_STORE_DEPLOYMENT.md](IOS_APP_STORE_DEPLOYMENT.md)
- **Roadmap:** [ROADMAP.md](ROADMAP.md) (iOS is Phase 3: Q3-Q4 2026)
- **Current Config:**
  - [app.json](AppFiles/app.json) - iOS section lines 18-29
  - [eas.json](AppFiles/eas.json) - iOS build profiles

---

## Next Steps

**Right now:**
- [ ] Enroll in Apple Developer Program ($99)

**After approval (24-48 hours):**
- [ ] Run `eas build --platform ios --profile production`
- [ ] Create app in App Store Connect
- [ ] Upload screenshots
- [ ] Complete App Privacy
- [ ] Submit for TestFlight
- [ ] Submit for App Store review

---

## Support

**Need help?**
- Full documentation: [IOS_APP_STORE_DEPLOYMENT.md](IOS_APP_STORE_DEPLOYMENT.md)
- Expo docs: https://docs.expo.dev/build/setup/
- Apple docs: https://developer.apple.com/app-store/review/guidelines/
- Email: ctuckersolutions@gmail.com

---

**You already did the hard part (Android)! iOS is just repeating the process with Apple's tools.** 🍴📱
