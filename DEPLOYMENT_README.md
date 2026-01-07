# ForkIt - Google Play Store Deployment Guide

## 🚀 Quick Start Deployment

This guide will take you from the current state to a published app on Google Play Store's Internal Testing track in about 2-3 hours.

---

## ✅ What's Already Done

Your ForkIt app is now **ready for deployment** with:

✓ **App Configuration** (`app.json`)
  - Package name: `com.forkit.app`
  - Version: 1.0.0
  - Version code: 1
  - Android permissions configured
  - Icon and splash screen configured

✓ **Security**
  - API key moved to environment variables (`.env`)
  - `.gitignore` updated to protect `.env`
  - Instructions for EAS Secrets included

✓ **Build Configuration** (`eas.json`)
  - Production, preview, and development profiles
  - Android App Bundle (AAB) configured
  - Submit configuration for automated uploads

✓ **Legal & Compliance**
  - Privacy Policy document created (`PRIVACY_POLICY.md`)
  - Ready to host and link in Play Console

✓ **App Icons**
  - High-resolution icons (1024x1024) ready
  - Meets Play Store requirements

✓ **Documentation**
  - Complete deployment guide
  - Play Console setup instructions
  - Asset creation guide

---

## 📋 Deployment Checklist

### Phase 1: Pre-Build Preparation

- [x] 1. Configure `app.json` with package name and permissions
- [x] 2. Set up environment variables for API key
- [x] 3. Create `eas.json` build configuration
- [x] 4. Create Privacy Policy
- [ ] 5. **Host Privacy Policy online** (see step below)
- [ ] 6. **Take screenshots** (4-6 recommended)
- [ ] 7. **Create feature graphic** (1024x500 PNG)
- [ ] 8. **Test app locally** to ensure everything works

### Phase 2: Build

- [ ] 9. Install EAS CLI: `npm install -g eas-cli`
- [ ] 10. Configure EAS project ID (see step below)
- [ ] 11. Build production AAB
- [ ] 12. Download AAB from EAS dashboard

### Phase 3: Play Console Setup

- [ ] 13. Create Google Play Developer account ($25)
- [ ] 14. Create new app in Play Console
- [ ] 15. Complete all setup tasks (content rating, data safety, etc.)
- [ ] 16. Upload AAB to Internal Testing
- [ ] 17. Add testers and share opt-in link

### Phase 4: Testing & Launch

- [ ] 18. Test app from Play Store Internal Testing
- [ ] 19. Gather feedback from testers
- [ ] 20. Fix bugs and iterate
- [ ] 21. Promote to Production when ready

---

## 🛠️ Step-by-Step Instructions

### Step 1: Host Your Privacy Policy

#### Option A: GitHub Pages (Free, Easy)
```bash
# Create a simple HTML page
cd ForkIt
mkdir docs
cp PRIVACY_POLICY.md docs/privacy.html

# Enable GitHub Pages in repo settings
# Your URL will be: https://yourusername.github.io/forkit/privacy.html
```

#### Option B: Your Own Website
Upload `PRIVACY_POLICY.md` (converted to HTML) to your website.

#### Option C: Privacy Policy Generators
Use services like:
- https://www.privacypolicygenerator.info
- https://www.freeprivacypolicy.com

**Update app.json after hosting:**
```json
"privacy": "https://yourusername.github.io/forkit/privacy.html"
```

---

### Step 2: Take Screenshots

1. **Run app on Android device or emulator:**
   ```bash
   cd AppFiles
   npx expo start
   # Scan QR code with Android device
   ```

2. **Take screenshots of these screens:**
   - Main screen with "Fork It Now" button
   - Loading state with slot preview
   - Restaurant result card
   - "Make at home" recipe section
   - Filters interface
   - Hidden Gems toggle (optional)

3. **Save screenshots** (1080x2340 recommended)
   - Use device screenshot function
   - Transfer to computer
   - Save in organized folder

**Screenshot Requirements:**
- Minimum: 2 screenshots
- Recommended: 4-6 screenshots
- Format: PNG or JPEG
- Dimensions: 320px minimum, up to 3840px

---

### Step 3: Create Feature Graphic

**Dimensions:** 1024 x 500 pixels

**Tools:**
- **Figma** (recommended): https://figma.com
- **Canva**: https://canva.com
- **Photoshop/GIMP** (advanced)

**Content Ideas:**
- App name: "ForkIt"
- Tagline: "Fork indecision. Fork it all."
- Screenshot of main UI
- Fork emoji: 🍴
- Dark gradient background (#0B0B0F → #17163B)

**Save as:** `feature-graphic-1024x500.png` or `.jpg`

---

### Step 4: Install EAS CLI

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account (create if needed)
eas login

# Navigate to AppFiles directory
cd AppFiles
```

---

### Step 5: Configure EAS Project

```bash
# Initialize EAS in your project
eas init

# This will:
# 1. Create or link to an Expo project
# 2. Generate a project ID
# 3. Update app.json with the project ID
```

**After running `eas init`, your `app.json` will be updated with:**
```json
"extra": {
  "eas": {
    "projectId": "your-actual-project-id"
  }
}
```

---

### Step 6: Configure Google API Key for EAS

Your API key is currently in `.env` for local development. For EAS Build, use EAS Secrets:

```bash
# Set API key as EAS Secret
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_PLACES_API_KEY --value "AIzaSyCmCBxQKEeX24RoVjOHSWqIW4wlFOVncAs"

# Verify secret was created
eas secret:list
```

**Alternatively**, update `eas.json` production profile:
```json
"production": {
  "android": {
    "buildType": "app-bundle"
  },
  "env": {
    "EXPO_PUBLIC_GOOGLE_PLACES_API_KEY": "AIzaSyCmCBxQKEeX24RoVjOHSWqIW4wlFOVncAs"
  }
}
```

**⚠️ Security Note:** For production, consider:
1. Restricting API key in Google Cloud Console (package name + SHA-1 fingerprint)
2. OR creating a backend proxy for Places API calls

---

### Step 7: Build Production AAB

```bash
cd AppFiles

# Build Android App Bundle for production
eas build --platform android --profile production

# This will:
# 1. Upload your project to EAS servers
# 2. Build AAB (takes ~10-20 minutes)
# 3. Sign with automatically managed keystore
# 4. Provide download link when complete
```

**Monitor build progress:**
- Check terminal for build URL
- OR visit: https://expo.dev/accounts/[your-username]/projects/forkit/builds

**When build completes:**
- Download the `.aab` file
- Save it in a safe location

---

### Step 8: Create Play Console Account

1. Go to https://play.google.com/console
2. Sign in with Google account
3. If first time:
   - Pay $25 registration fee (one-time)
   - Complete developer profile
   - Accept terms of service

---

### Step 9: Create App in Play Console

Follow the detailed guide in `GOOGLE_PLAY_CONSOLE_SETUP.md`.

**Quick summary:**
1. Click "Create app"
2. Fill in basic info:
   - Name: ForkIt
   - Language: English
   - App type: App
   - Free or paid: Free
3. Complete declarations
4. Click "Create app"

---

### Step 10: Complete Play Console Setup Tasks

**Dashboard shows required tasks. Complete in order:**

1. **App access:** No restrictions
2. **Ads:** No ads
3. **Content rating:** Complete questionnaire → E (Everyone)
4. **Target audience:** Ages 13+
5. **Data safety:**
   - Location: Collected, Shared with Google Places, Ephemeral, Required
   - Privacy Policy URL: [Your hosted URL]

**See `GOOGLE_PLAY_CONSOLE_SETUP.md` for detailed answers to each section.**

---

### Step 11: Upload Store Listing Assets

**Path:** Dashboard → Store settings → Main store listing

**Required uploads:**
- **App icon:** Upload `AppFiles/assets/icon.png` (1024x1024)
- **Feature graphic:** Upload your 1024x500 banner
- **Screenshots:** Upload 4-6 screenshots

**Fill in text:**
- **Short description** (80 chars):
  ```
  Fork indecision. Random restaurant picker + copycat recipes.
  ```

- **Full description** (4000 chars):
  See `PLAY_STORE_ASSETS_GUIDE.md` section 5 for full text

**Save changes**

---

### Step 12: Create Internal Testing Release

**Path:** Dashboard → Testing → Internal testing → Create release

1. **Release name:** `1.0.0 (1)`

2. **Upload AAB:**
   - Click "Upload"
   - Select your downloaded `.aab` file
   - Wait for upload and processing

3. **Release notes:**
   ```
   Initial release of ForkIt!

   ✨ Features:
   • Random restaurant selection with smart filters
   • Hidden Gems mode for local discovery
   • "Make at home" with copycat recipe links
   • Google Maps integration
   • Distance, price, rating, and cuisine filters

   🍴 Fork indecision. Fork it all.
   ```

4. **Review release** → Fix any errors/warnings

5. **Save** → **Review release** → **Start rollout to internal testing**

---

### Step 13: Add Testers

**Path:** Testing → Internal testing → Testers tab

1. Click "Create email list"
2. List name: "ForkIt Beta Testers"
3. Add emails (comma-separated, up to 100)
4. Save changes

**Share opt-in URL:**
- Copy the opt-in link
- Send to your testers
- They must click link → Accept → Download from Play Store

---

### Step 14: Test the App

**Download and test:**
1. Click your own opt-in link
2. Accept invitation
3. Install ForkIt from Play Store
4. Test all features:
   - Location permission prompt
   - "Fork It Now" button
   - Random restaurant selection
   - All filters (radius, price, rating, cuisine, open now, Hidden Gems)
   - Google Maps integration
   - Phone call functionality
   - Recipe links
   - Re-roll feature

**Test edge cases:**
- Deny location permission → Should show error
- No internet connection → Should handle gracefully
- No restaurants match filters → Should show friendly message
- Very tight filters → Test pool count display

---

### Step 15: Gather Feedback & Iterate

**During internal testing:**
- Ask testers to use app for 1-2 weeks
- Gather feedback via email, survey, or chat
- Monitor crash reports in Play Console (Dashboard → Vitals)

**Make updates:**

**For JavaScript-only changes:**
```bash
cd AppFiles
eas update --branch production --message "Bug fix: improve filter logic"
```

**For native code or config changes:**
```bash
# 1. Update versionCode in app.json (increment by 1)
# 2. Update version (e.g., 1.0.1)
# 3. Rebuild
eas build --platform android --profile production

# 4. Upload new AAB to Internal Testing
```

---

### Step 16: Promote to Production

**When ready (after testing):**

1. **Path:** Dashboard → Production → Create release
2. **Promote from Internal Testing** OR upload new AAB
3. **Fill in production release notes**
4. **Set rollout percentage** (start at 20%, increase gradually)
5. **Submit for review**

**First review takes 2-7 days**. Subsequent updates are faster.

---

## 📚 Additional Documentation

| Document | Purpose |
|----------|---------|
| `PLAY_STORE_DEPLOYMENT.md` | Comprehensive deployment overview |
| `GOOGLE_PLAY_CONSOLE_SETUP.md` | Detailed Play Console configuration |
| `PLAY_STORE_ASSETS_GUIDE.md` | How to create all visual assets |
| `PRIVACY_POLICY.md` | Privacy Policy (needs to be hosted) |

---

## 🔧 Maintenance & Updates

### Semantic Versioning

- **Major (2.0.0):** Breaking changes, major new features
- **Minor (1.1.0):** New features, non-breaking
- **Patch (1.0.1):** Bug fixes

### Version Code

Increment by 1 for every new AAB upload:
- Version 1.0.0 → versionCode: 1
- Version 1.0.1 → versionCode: 2
- Version 1.1.0 → versionCode: 3

### Update Strategy

**Use EAS Update for:**
- UI/UX changes
- Bug fixes in JavaScript
- Text/content updates
- Logic changes (non-native)

**Rebuild AAB for:**
- New permissions
- Native module changes
- App config changes
- Major version bumps

---

## 🐛 Troubleshooting

### Build Fails

**Error:** "Unable to resolve module"
**Solution:**
```bash
cd AppFiles
rm -rf node_modules
npm install
eas build --platform android --profile production --clear-cache
```

---

### API Key Not Working in Production Build

**Issue:** App says "Missing API Key" when running production build

**Solutions:**
1. Verify EAS Secret:
   ```bash
   eas secret:list
   ```
2. OR check `eas.json` has `env` object with API key
3. Rebuild after fixing

---

### Location Permission Denied

**Issue:** App doesn't prompt for location permission

**Solution:**
- Check `app.json` has `expo-location` plugin
- Verify permissions array includes `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION`
- Rebuild with corrected config

---

### Play Console Rejects Privacy Policy

**Issue:** "Privacy Policy URL is not accessible"

**Solutions:**
1. Ensure URL is publicly accessible (not behind login)
2. Use HTTPS (not HTTP)
3. Privacy Policy must cover location data usage
4. Test URL in incognito browser window

---

### App Crashes on Startup

**Check:**
1. API key is configured correctly
2. All dependencies are installed
3. Review crash logs in Play Console (Dashboard → Vitals → Crashes)
4. Test locally with: `npx expo run:android`

---

## ⏱️ Timeline Expectations

| Phase | Time Estimate |
|-------|---------------|
| Pre-build preparation (screenshots, graphics) | 2-4 hours |
| EAS Build setup and first build | 30-60 minutes |
| Play Console account and app setup | 1-2 hours |
| Upload and configure release | 30 minutes |
| **Total to Internal Testing** | **4-8 hours** |
| Internal testing period | 1-2 weeks |
| Production submission | 15 minutes |
| **Production approval (first time)** | **2-7 days** |

---

## 🎯 Success Metrics

**After launching to Internal Testing, track:**
- Installation success rate
- Crash-free rate (target: >99%)
- ANR (Application Not Responding) rate (target: <0.5%)
- User feedback (surveys, reviews)
- Feature usage (how often users click "Fork It")

**Monitor in Play Console:**
- Dashboard → Vitals
- Dashboard → User feedback → Reviews
- Dashboard → Statistics

---

## 🚀 Next Steps After Deployment

1. **Week 1:** Monitor crashes and critical bugs
2. **Week 2-3:** Gather feature requests from testers
3. **Week 4:** Plan v1.1 update with improvements
4. **Month 2:** Promote to Closed/Open Testing
5. **Month 3:** Launch to Production with confidence

---

## 📞 Support Resources

- **Expo EAS Docs:** https://docs.expo.dev/build/introduction
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **React Native Docs:** https://reactnative.dev/docs/getting-started
- **ForkIt GitHub Issues:** [Your repo URL]

---

## 🎉 Final Checklist Before Submission

Before clicking "Start rollout to internal testing":

- [ ] Privacy Policy is hosted and URL is accessible
- [ ] All Play Console setup tasks are completed (green checkmarks)
- [ ] AAB uploaded successfully with no errors
- [ ] Release notes are clear and descriptive
- [ ] Screenshots show actual app functionality
- [ ] Feature graphic looks professional
- [ ] Short and full descriptions are accurate
- [ ] Contact email is valid and monitored
- [ ] Data safety form matches actual app behavior
- [ ] Content rating is appropriate (E for Everyone)
- [ ] App has been tested locally on Android device
- [ ] API key is configured and working
- [ ] Location permissions are handled correctly

---

## 📝 Notes

- **First-time Play Console setup takes longer.** Subsequent updates are much faster.
- **Internal Testing has no manual review.** Your app is available to testers within hours.
- **Be patient with Production approval.** Google's review process for first-time apps can take up to a week.
- **Iterate based on feedback.** Don't wait for perfection—launch, learn, improve.

---

**You're ready to deploy ForkIt to the Google Play Store! 🍴**

Good luck, and may your users never face decision fatigue again. Fork it!
