# Google Play Store Deployment Guide for ForkIt

## Overview
This guide covers all requirements for deploying ForkIt to the Google Play Store according to Google's official documentation and best practices.

---

## 1. App Configuration (app.json)

### Required Changes
- [ ] **Package Name**: Set unique Android package identifier (e.g., `com.yourname.forkit`)
- [ ] **Version Management**:
  - `version`: User-facing version (e.g., "1.0.0")
  - `android.versionCode`: Integer version number (starts at 1, increment for each release)
- [ ] **Permissions**: Explicitly declare all required permissions
- [ ] **App Description**: Add name, description for Play Store
- [ ] **Icons**: Ensure proper icon assets exist (✓ Already present)

---

## 2. Security Requirements

### Google API Key
**Current Issue**: API key hardcoded in client code (App.js:33)

**Solution Options**:
1. **For Testing**: Add API key restrictions in Google Cloud Console:
   - Restrict to Places API only
   - Add Android app restrictions (package name + SHA-1 fingerprint)

2. **For Production** (Recommended):
   - Create backend proxy for Places API calls
   - OR use Expo's secure environment variables with EAS Secrets

**Action Items**:
- [ ] Restrict API key in Google Cloud Console
- [ ] Move API key to environment variables (.env)
- [ ] Update App.js to use environment variable

---

## 3. Legal Requirements

### Privacy Policy (Required)
Google requires a Privacy Policy URL for apps that request dangerous permissions or access user data.

**What to Include**:
- What data is collected (location, search queries)
- How data is used (restaurant search)
- Third-party services (Google Places API)
- Data retention and deletion
- Contact information

**Action**:
- [ ] Create Privacy Policy document
- [ ] Host on accessible URL (GitHub Pages, website, etc.)
- [ ] Add URL to app.json and Play Console

### Terms of Service (Optional but Recommended)
- [ ] Create Terms of Service
- [ ] Add disclaimer about restaurant information accuracy

---

## 4. Android Permissions

### Required Permissions
```json
"android": {
  "permissions": [
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION",
    "INTERNET"
  ]
}
```

### Play Console Data Safety Form
Must declare:
- Location data collection (precise and approximate)
- Purpose: App functionality (finding nearby restaurants)
- Data not shared with third parties
- Data not sold
- Users can request deletion

---

## 5. EAS Build Configuration

### Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Initialize EAS
```bash
cd AppFiles
eas build:configure
```

### Create eas.json
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### Build Commands
```bash
# Build for internal testing
eas build --platform android --profile production

# Build for local testing (APK)
eas build --platform android --profile preview
```

---

## 6. Play Store Listing Assets

### Required Assets

#### App Icon
- **Format**: 512x512 PNG
- **Requirements**: 32-bit PNG with alpha
- **Current**: Check existing icon.png dimensions
- [ ] Verify/create 512x512 high-quality icon

#### Feature Graphic
- **Size**: 1024x500 pixels
- **Format**: JPEG or 24-bit PNG (no alpha)
- **Content**: Eye-catching banner showing app UI or concept
- [ ] Design feature graphic

#### Screenshots
- **Minimum**: 2 screenshots
- **Recommended**: 4-8 screenshots
- **Size**: 320px minimum dimension, up to 3840px
- **Format**: JPEG or 24-bit PNG
- **Content**: Show main features:
  1. Main screen with "Fork It" button
  2. Restaurant result card
  3. Filters interface
  4. "Make at home" recipe links
- [ ] Take/create 4-6 screenshots

#### Promotional Video (Optional)
- YouTube URL showing app in action
- [ ] Create promo video (optional)

---

## 7. Play Console Configuration

### App Details
- **App Name**: ForkIt
- **Short Description** (80 chars max):
  "Fork indecision. Random restaurant picker + copycat recipes."

- **Full Description** (4000 chars max):
```
Can't decide where to eat? Fork it. 🍴

ForkIt removes food decision fatigue by choosing a restaurant for you—no scrolling, no analysis paralysis. Just tap "Fork It" and we'll pick one spot from your filtered preferences.

🎯 TRUE RANDOM SELECTION
One button. One choice. Done. No browsing, no second-guessing.

🏡 MAKE IT AT HOME FALLBACK
Every pick includes signature dish + copycat recipe links. Don't want to go out? Recreate the vibe at home.

✨ HIDDEN GEMS MODE
Prioritizes local restaurants over chains. Discover your neighborhood.

🎚️ SMART FILTERS
• Distance radius
• Price range
• Minimum rating
• Cuisine keywords
• Open now toggle

PHILOSOPHY
You don't need more restaurant options. You need someone to just pick one. ForkIt does that—and gives you a cooking backup plan if you change your mind.

Fork responsibly. 🍴
```

### Content Rating
- [ ] Complete Content Rating questionnaire
- Expected: E (Everyone) - contains location data but no mature content

### Target Audience
- [ ] Select age groups: 13+
- [ ] No ads or in-app purchases (currently)

### Store Presence
- **Countries**: Start with your country, expand later
- **Pricing**: Free

---

## 8. Data Safety & Privacy

### Data Safety Form (Required)
Answer these questions in Play Console:

**Does your app collect or share user data?**
- Yes

**Data Types Collected**:
- ✓ Location: Approximate and Precise
  - Purpose: App functionality
  - Collected: Yes
  - Shared: No (with Google Places API, disclosed)
  - Optional: No
  - Ephemeral: Yes (not stored beyond session)

**Security Practices**:
- Data encrypted in transit (HTTPS)
- No user account system
- No data deletion available (data not stored)

---

## 9. Pre-Launch Checklist

### Code Quality
- [ ] Remove console.log statements
- [ ] Test on multiple Android devices/screen sizes
- [ ] Test with poor network conditions
- [ ] Test permission denial scenarios
- [ ] Verify all external links work

### Testing
- [ ] Test all filters combinations
- [ ] Verify Google Maps integration
- [ ] Test recipe links
- [ ] Check phone call functionality
- [ ] Test reroll feature
- [ ] Verify location permission flow

### Performance
- [ ] App loads under 2 seconds
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] Handle API errors gracefully

---

## 10. Release Process

### Step-by-Step Release

1. **Prepare Code**
   ```bash
   # Clean project
   cd AppFiles
   rm -rf node_modules
   npm install
   ```

2. **Build AAB**
   ```bash
   eas build --platform android --profile production
   ```

3. **Create Play Console App**
   - Go to https://play.google.com/console
   - Create new app
   - Fill in all details

4. **Upload to Internal Testing**
   - Upload AAB to Internal Testing track
   - Add testers via email list
   - Publish to internal testing

5. **Share with Friends**
   - Get opt-in URL from Play Console
   - Share with up to 100 testers
   - Gather feedback

6. **Iterate**
   - Fix bugs using EAS Update (for JS-only changes)
   - Rebuild AAB for native changes
   - Promote to closed/open testing when ready

---

## 11. Post-Launch Maintenance

### Updates
- **OTA Updates** (EAS Update): For JS, assets, non-native changes
- **New Builds**: For native module changes, permissions, config changes

### Monitoring
- [ ] Set up Sentry or similar error tracking
- [ ] Monitor Play Console crash reports
- [ ] Track ANR (Application Not Responding) rates
- [ ] Monitor reviews and ratings

### Version Strategy
- Increment `versionCode` for every AAB upload
- Use semantic versioning for `version`:
  - Major: Breaking changes
  - Minor: New features
  - Patch: Bug fixes

---

## 12. Common Issues & Solutions

### Issue: API Key Exposed
**Solution**: Use EAS Secrets and environment variables

### Issue: App Rejected for Permissions
**Solution**: Ensure Data Safety form matches actual permissions requested

### Issue: Build Fails
**Solution**: Check EAS build logs, verify expo version compatibility

### Issue: Location Permission Denied
**Solution**: Handle gracefully with clear user messaging (already implemented)

---

## 13. Resources

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android App Bundle Docs](https://developer.android.com/guide/app-bundle)
- [Content Rating Guidelines](https://support.google.com/googleplay/android-developer/answer/9859655)

---

## Quick Start Checklist

Priority items to do NOW:

1. ✅ Configure app.json with proper package name
2. ✅ Add Android permissions
3. ✅ Move API key to environment variables
4. ✅ Create Privacy Policy
5. ✅ Set up EAS Build
6. ✅ Take screenshots
7. ✅ Create Play Console app
8. ✅ Build production AAB
9. ✅ Upload to Internal Testing
10. ✅ Test with friends
