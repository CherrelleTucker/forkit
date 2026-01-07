# iOS App Store Deployment Guide

**App:** ForkIt - Random Restaurant Picker
**Current Status:** Android-only (Google Play Internal Testing)
**Goal:** Launch on iOS App Store

---

## Prerequisites

### 1. Apple Developer Program Membership
**Required:** Yes (cannot distribute on App Store without it)

- **Cost:** $99 USD/year
- **Enrollment:** https://developer.apple.com/programs/enroll/
- **Timeline:** 24-48 hours for approval (can take longer)
- **Payment:** Credit card required

**What you get:**
- Access to App Store Connect
- TestFlight beta testing (up to 10,000 testers)
- Developer certificates and provisioning profiles
- App Store distribution rights

**Action Items:**
- [ ] Enroll in Apple Developer Program
- [ ] Verify identity (may require ID scan)
- [ ] Accept Apple Developer Program License Agreement
- [ ] Set up payment method

---

### 2. Development Environment

**Good News:** You don't need a Mac for EAS Build!

EAS Build handles iOS builds in the cloud without requiring:
- ❌ Physical Mac computer
- ❌ Xcode installation
- ❌ Local iOS simulator

**What you DO need:**
- ✅ Apple Developer account ($99/year)
- ✅ EAS CLI (you already have this: v16.28.0)
- ✅ Your existing React Native/Expo codebase

---

## iOS Configuration

### Step 1: Update app.json

Your `app.json` already has a basic iOS section. We need to expand it:

```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.forkit.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "ForkIt needs your location to find nearby restaurants and help you decide where to eat.",
        "NSLocationAlwaysUsageDescription": "ForkIt needs your location to find nearby restaurants and help you decide where to eat."
      },
      "config": {
        "googleMapsApiKey": ""
      }
    }
  }
}
```

**Key Fields:**
- `bundleIdentifier`: Must match Android package name for consistency
- `buildNumber`: iOS version incrementor (increment for each build)
- `infoPlist`: iOS permission descriptions (required for location access)

---

### Step 2: Update eas.json for iOS

Add iOS profiles to your existing `eas.json`:

```json
{
  "cli": {
    "version": ">= 13.2.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildType": "app-store"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal",
        "releaseStatus": "draft"
      },
      "ios": {
        "appleId": "YOUR_APPLE_ID_EMAIL@example.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      }
    }
  }
}
```

---

## iOS Build Process

### Step 1: Generate Apple Credentials

EAS can automatically manage your iOS credentials:

```bash
eas build --platform ios --profile production
```

**First time only:** EAS will prompt:

```
? Would you like EAS to handle iOS credentials for you? (Y/n)
```

**Select YES**. EAS will:
1. Create a Distribution Certificate
2. Generate a Provisioning Profile
3. Store credentials securely
4. Link them to your build

**Alternative (Manual):** If you want to manage credentials yourself:

```bash
eas credentials
```

---

### Step 2: Build for iOS

```bash
# Production build for App Store
eas build --platform ios --profile production
```

**Build Options:**
- `--platform ios` - Build for iOS only
- `--platform all` - Build both Android and iOS
- `--profile production` - Use production profile (App Store)
- `--profile preview` - Internal testing build

**Expected Output:**
```
✔ Build successful
🍏 iOS app: https://expo.dev/artifacts/eas/[build-id].ipa
```

**Build Time:** 10-20 minutes (first build slower, subsequent builds faster)

**Output Format:** `.ipa` file (iOS App Archive)

---

### Step 3: Set Up App Store Connect

#### Create Your App

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** (plus icon) → **New App**

**App Information:**
- **Platform:** iOS
- **Name:** ForkIt
- **Primary Language:** English (U.S.)
- **Bundle ID:** com.forkit.app (select from dropdown after creating in Developer Portal)
- **SKU:** forkit-2026 (your internal identifier, not visible to users)

---

#### Complete App Information

**Category:**
- **Primary:** Food & Drink
- **Secondary:** Lifestyle (optional)

**Content Rights:**
- [ ] Check: "This app uses the Apple Maps API for maps functionality"
- [ ] Check: "I confirm this app meets export compliance requirements"

**Age Rating:**
- Answer questionnaire (likely result: 4+, no objectionable content)

**Privacy Policy URL:**
```
https://CherrelleTucker.github.io/forkit/privacy.html
```

---

### Step 4: Prepare iOS Assets

Apple requires specific asset sizes (different from Google Play):

#### App Icon (Required)
- **Size:** 1024x1024px
- **Format:** PNG (no transparency)
- **File:** Already exists: `AppFiles/assets/icon.png`
- **Note:** Verify it's 1024x1024 and has no alpha channel

#### Screenshots (Required)

**iPhone 6.7" Display** (iPhone 14 Pro Max, 15 Pro Max):
- **Size:** 1290 x 2796 pixels (portrait) or 2796 x 1290 (landscape)
- **Quantity:** 3-10 screenshots
- **Note:** These scale to all other iPhone sizes

**Optional but Recommended - iPad Pro 12.9" Display:**
- **Size:** 2048 x 2732 pixels (portrait) or 2732 x 2048 (landscape)
- **Quantity:** 3-10 screenshots

**Your Current Screenshots:**
Your Android screenshots (1080x2171) won't work - iOS requires exact dimensions.

**Action Items:**
- [ ] Run app on iOS Simulator (via Expo Go or via EAS Build simulator)
- [ ] Capture screenshots at required dimensions
- [ ] Or use screenshot resizing tools

#### App Preview Video (Optional)
- **Format:** .mov, .m4v, or .mp4
- **Length:** 15-30 seconds
- **Size:** Same as screenshot dimensions

---

### Step 5: App Store Product Page

**App Name:**
```
ForkIt - Random Restaurant Picker
```

**Subtitle (30 characters max):**
```
Fork indecision, done.
```

**Promotional Text (170 characters max - can update without new build):**
```
Can't decide where to eat? ForkIt makes the choice for you. One tap. One restaurant. No scrolling. Includes copycat recipes if you'd rather stay home.
```

**Description (4000 characters max):**

```
FORK INDECISION. FORK IT ALL.

Ever spend 30 minutes scrolling through restaurant options, unable to decide? ForkIt solves that problem by making the decision FOR you.

HOW IT WORKS:
1. Tap "Fork It"
2. We pick a restaurant
3. You go eat

It's that simple.

FEATURES:

🎲 TRUE RANDOM SELECTION
No algorithms trying to manipulate you. Pure, unbiased randomness with smart filters.

✨ HIDDEN GEMS MODE
Prioritizes local restaurants over chains. Support small businesses and discover new favorites.

🏡 MAKE AT HOME FALLBACK
Don't want to go out? Every restaurant includes its signature dish with links to copycat recipes. Fork It at home.

🎯 SMART FILTERS
Control your randomness with filters for:
• Distance (how far you'll travel)
• Price range ($-$$$$)
• Minimum rating
• Cuisine type
• Open now only
• Exclude chains

📍 POWERED BY YOUR LOCATION
ForkIt uses your current location to find nearby options. Location permission required.

WHO IS THIS FOR?

• Anyone tired of decision fatigue
• Couples who can't agree on where to eat
• People who want to try new places but don't know where to start
• Local-support-minded eaters
• Busy people who want fast decisions

PHILOSOPHY:

You're not lacking restaurant information—you're lacking decision resolution. ForkIt removes the paralysis of choice. We don't show you 50 options—we show you ONE.

PRIVACY:

• No user accounts required
• No tracking or personal data collection
• Location used only for restaurant search, never stored
• Full privacy policy: https://CherrelleTucker.github.io/forkit/privacy.html

Fork the endless scrolling.
Fork the indecision.
Fork it all.

---

Support: ctuckersolutions@gmail.com
Open Source: github.com/CherrelleTucker/forkit
```

**Keywords (100 characters max, comma-separated):**
```
restaurant,food,random,decide,picker,local,recipe,dinner,lunch,eat,choice,decision
```

**Support URL:**
```
https://github.com/CherrelleTucker/forkit
```

**Marketing URL (optional):**
```
https://CherrelleTucker.github.io/forkit
```

---

### Step 6: TestFlight Beta Testing

**TestFlight = iOS equivalent of Google Play Internal Testing**

#### Upload Build to TestFlight

**Option 1: Via EAS Submit (Automated)**

```bash
# After eas build completes successfully
eas submit --platform ios --profile production
```

EAS will:
1. Download your .ipa file
2. Upload to App Store Connect
3. Submit for App Store review (if configured)

**Option 2: Manual Upload**

1. Download .ipa from EAS build URL
2. Open [App Store Connect](https://appstoreconnect.apple.com)
3. Go to **My Apps** → **ForkIt** → **TestFlight** tab
4. Use **Transporter app** (Mac) or **Xcode** → **Organizer** to upload .ipa

#### Set Up TestFlight

**Internal Testing (First 100 testers):**
1. Add testers via email address
2. Testers get invitation email
3. They install TestFlight app from App Store
4. They download ForkIt beta via TestFlight

**External Testing (Up to 10,000 testers):**
- Requires Apple review (1-2 days)
- Can share public link for anyone to join
- More scalable for broader beta

**Beta App Information:**
- **Beta App Description:** (Same as App Store description)
- **Feedback Email:** ctuckersolutions@gmail.com
- **What to Test:** (Provide testing instructions)

---

### Step 7: App Store Submission

#### Complete All Required Fields

**1. App Privacy**

Go to **App Store Connect** → **My Apps** → **ForkIt** → **App Privacy**

**Location Data:**
- **Data Type:** Precise Location
- **Usage:** App Functionality (restaurant search)
- **Linked to User:** No
- **Used for Tracking:** No
- **Ephemeral:** Yes (not stored, used only during session)

**No Other Data Collected**

**Action Items:**
- [ ] Complete App Privacy questionnaire
- [ ] Publish privacy declarations

---

**2. Content Rights & Age Rating**

**Apple Age Rating Questionnaire:**

Key questions (all "No" for ForkIt):
- Frequent/Intense Cartoon or Fantasy Violence? **No**
- Unrestricted Web Access? **No**
- Simulated Gambling? **No**
- Alcohol, Tobacco, or Drug Use? **No**

**Expected Rating:** 4+ (no restrictions)

---

**3. Export Compliance**

If your app uses encryption (HTTPS counts!):

**Your Answer:**
- **Uses Encryption:** Yes (HTTPS for API calls)
- **Qualifies for Exemption:** Yes
- **Exemption Reason:** "App uses standard encryption for HTTPS calls only"

---

#### Submit for Review

**Before Submitting Checklist:**
- [ ] App icon uploaded (1024x1024)
- [ ] Screenshots uploaded (3-10 per device size)
- [ ] App description completed
- [ ] Keywords added
- [ ] Privacy policy URL added
- [ ] App Privacy questionnaire completed
- [ ] Age rating questionnaire completed
- [ ] Export compliance completed
- [ ] Build uploaded to TestFlight
- [ ] TestFlight beta tested (recommended)

**Submit:**
1. Go to **App Store Connect** → **ForkIt** → **App Store** tab
2. Select your build from TestFlight
3. Click **Submit for Review**

---

## App Store Review Timeline

**Average:** 24-48 hours
**Range:** 12 hours - 7 days

**Common Rejection Reasons (How to Avoid):**

### 1. Guideline 2.1 - App Completeness
**Issue:** App crashes or major bugs
**Solution:** Thoroughly test via TestFlight first

### 2. Guideline 4.2 - Minimum Functionality
**Issue:** App doesn't provide enough value
**Solution:** Your app is fine - clear value proposition

### 3. Guideline 5.1.1 - Privacy
**Issue:** Missing privacy policy or unclear data usage
**Solution:** You already have privacy policy at https://CherrelleTucker.github.io/forkit/privacy.html

### 4. Guideline 2.3.10 - Accurate Metadata
**Issue:** Screenshots/description don't match app
**Solution:** Ensure screenshots show actual app features

### 5. Guideline 4.0 - Design
**Issue:** Poor UI/UX or looks unfinished
**Solution:** Your app is polished - should pass easily

---

## Key Differences: iOS vs Android

| Aspect | Android (Google Play) | iOS (App Store) |
|--------|----------------------|-----------------|
| **Developer Cost** | $25 one-time | $99/year |
| **Review Time** | 1-7 days | 24-48 hours |
| **Review Strictness** | Automated mostly | Manual, stricter |
| **Beta Testing** | Internal Testing (100), Closed (unlimited) | TestFlight (10,000 total) |
| **Build Format** | .aab (Android App Bundle) | .ipa (iOS App Archive) |
| **Updates** | Can skip review for minor updates | Every update reviewed |
| **Permissions** | Declared in manifest | Runtime + Info.plist descriptions |
| **Required Mac** | No | No (with EAS Build) |
| **Asset Requirements** | More flexible sizes | Exact pixel dimensions required |

---

## Complete Command Reference

### iOS Build Commands

```bash
# Log in to Expo (if not already)
eas login

# Configure iOS credentials (first time)
eas credentials

# Build for iOS (production)
eas build --platform ios --profile production

# Build for iOS (preview/internal)
eas build --platform ios --profile preview

# Build both platforms
eas build --platform all --profile production

# Submit to App Store (after build completes)
eas submit --platform ios --profile production

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

---

## iOS-Specific Testing

### Testing Options

**1. Physical iOS Device (via TestFlight)**
- Most realistic testing
- Requires Apple Developer account
- Upload build → invite yourself via TestFlight

**2. iOS Simulator (via EAS Build)**
```bash
eas build --platform ios --profile preview
```
- Download .app file
- Open in Xcode Simulator (Mac required)

**3. Expo Go App**
- Quick testing without builds
- Limited native module support
- Good for UI/UX validation

---

## Cost Analysis

### Apple Developer Program
- **Enrollment:** $99/year
- **Renewal:** $99/year (auto-renew or manual)
- **Cannot distribute without this**

### EAS Build (Optional but Recommended)
Your current plan already covers Android builds. iOS builds:
- **Free Tier:** Limited builds/month
- **Production Plan:** $29/month (unlimited builds, priority queue)
- **Enterprise:** $999/month (advanced features)

**Recommendation:** Start with free tier, upgrade if you hit limits

### Total First-Year iOS Costs
- **Minimum:** $99 (Apple Developer Program only)
- **Recommended:** $99 + $29/month EAS = ~$450/year

---

## Post-Launch Checklist

After App Store approval:

- [ ] Announce iOS launch on social media
- [ ] Update GitHub README with App Store link
- [ ] Update ROADMAP.md to mark iOS as complete
- [ ] Monitor crash reports in App Store Connect
- [ ] Respond to user reviews
- [ ] Plan first update with iOS-specific polish

---

## iOS-Specific Features to Add Later

**Nice-to-Have iOS Enhancements:**
- [ ] Haptic feedback (iOS has better haptics than Android)
- [ ] Siri Shortcuts ("Hey Siri, Fork It")
- [ ] iOS Widgets (home screen restaurant suggestion)
- [ ] Apple Maps integration (in addition to Google Maps)
- [ ] iPad-optimized layout
- [ ] Apple Watch companion app (future)

---

## Resources

**Apple Developer:**
- Enrollment: https://developer.apple.com/programs/enroll/
- App Store Connect: https://appstoreconnect.apple.com
- Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/

**Expo/EAS:**
- iOS Builds: https://docs.expo.dev/build/setup/
- Credentials: https://docs.expo.dev/app-signing/managed-credentials/
- Submit to App Store: https://docs.expo.dev/submit/ios/

**TestFlight:**
- Guide: https://developer.apple.com/testflight/

---

## Quick Start Checklist

**Complete these steps to go live on iOS:**

### Phase 1: Account Setup (1-2 days)
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Wait for approval (24-48 hours)
- [ ] Accept Apple Developer Program License Agreement

### Phase 2: Configuration (1 hour)
- [ ] Update app.json with iOS configuration
- [ ] Update eas.json with iOS build profiles
- [ ] Commit changes to GitHub

### Phase 3: Build (1 hour)
- [ ] Run `eas build --platform ios --profile production`
- [ ] Let EAS handle iOS credentials (select Yes when prompted)
- [ ] Wait for build to complete (10-20 minutes)
- [ ] Download .ipa file

### Phase 4: App Store Connect (2-3 hours)
- [ ] Create app in App Store Connect
- [ ] Upload app icon (1024x1024)
- [ ] Complete app information
- [ ] Add screenshots (capture from iOS simulator or device)
- [ ] Write app description
- [ ] Complete App Privacy questionnaire
- [ ] Complete Age Rating questionnaire

### Phase 5: TestFlight Beta (1 week)
- [ ] Upload build to TestFlight (via eas submit)
- [ ] Invite 5-10 beta testers
- [ ] Collect feedback
- [ ] Fix critical bugs
- [ ] Submit updated build if needed

### Phase 6: App Store Submission (2-3 days)
- [ ] Complete all required fields in App Store Connect
- [ ] Submit for review
- [ ] Wait for approval (24-48 hours)
- [ ] Go live! 🎉

---

## Need Help?

**Issues during iOS deployment?**
- Expo EAS Docs: https://docs.expo.dev
- Apple Developer Forums: https://developer.apple.com/forums/
- GitHub Issues: https://github.com/CherrelleTucker/forkit/issues
- Email: ctuckersolutions@gmail.com

---

**Ready to Fork It on iOS!** 🍴📱
