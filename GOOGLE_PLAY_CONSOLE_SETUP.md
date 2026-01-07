# Google Play Console Setup Guide for ForkIt

## Prerequisites

Before starting, ensure you have:
- [ ] Google Play Developer account ($25 one-time fee)
- [ ] Production AAB file (from EAS Build)
- [ ] All Play Store assets ready (icons, screenshots, feature graphic)
- [ ] Privacy Policy hosted and accessible
- [ ] App tested on Android device

---

## Step 1: Access Google Play Console

1. Go to https://play.google.com/console
2. Sign in with your Google account
3. If first time: Pay $25 registration fee and complete developer profile

---

## Step 2: Create New App

### 2.1 Basic Information

1. Click **"Create app"** button
2. Fill in the form:

**App details:**
- **App name:** ForkIt
- **Default language:** English (United States)
- **App or game:** App
- **Free or paid:** Free

**Declarations:**
- [ ] Check "I declare that this app complies with Google Play's Developer Program Policies"
- [ ] Check "I acknowledge that this app complies with US export laws"

3. Click **"Create app"**

---

## Step 3: Complete Dashboard Tasks

The Play Console dashboard shows required tasks. Complete them in this order:

---

### Task 1: Set Up Your App

#### 3.1 App Access
**Path:** Dashboard → Set up → App access

**Question:** Is your entire app restricted by a login?
- **Answer:** No (ForkIt has no login)

**Action:** Click "Save"

---

#### 3.2 Ads
**Path:** Dashboard → Set up → Ads

**Question:** Does your app contain ads?
- **Answer:** No (currently, ForkIt has no ads)

**Action:** Click "Save"

---

#### 3.3 Content Rating
**Path:** Dashboard → Set up → Content rating

1. Click **"Start questionnaire"**
2. Enter your email address
3. Select category: **"Utility, Productivity, Communication, or Other"** → Select "Other"

**Questionnaire responses:**

**Violence:**
- Does your app depict realistic violence? → No
- Does your app depict unrealistic or cartoon violence? → No
- Does your app depict any violence or blood? → No

**Sexuality:**
- Does your app contain sexual content? → No

**Language:**
- Does your app contain profanity or crude humor? → No

**Controlled Substances:**
- Does your app reference drugs, alcohol, or tobacco? → No
  - *Note: ForkIt shows restaurants that may serve alcohol, but doesn't promote it*

**User Interaction:**
- Can users interact with each other? → No
- Does your app allow users to share their location? → No
  - *Note: Location is used only for functionality, not shared with other users*
- Does your app allow unrestricted web access? → Yes
  - *Explanation: Users can click links to recipe websites*

**Data Collection:**
- Does your app collect user data? → No
  - *Explanation: Location is not stored/collected, only used ephemerally*

4. Click **"Save questionnaire"**
5. Click **"Submit"**
6. Review the assigned rating (likely E for Everyone)
7. Click **"Apply rating"**

---

#### 3.4 Target Audience and Content
**Path:** Dashboard → Set up → Target audience

**Target age groups:**
- [ ] Check **"Ages 13 and over"**

**Store presence:**
- **Question:** Is your app designed for children?
  - **Answer:** No

**Ads:**
- Already answered in 3.2

**Action:** Click "Save"

---

#### 3.5 News Apps
**Path:** Dashboard → Set up → News apps

**Question:** Is this a news app?
- **Answer:** No

**Action:** Click "Save"

---

#### 3.6 COVID-19 Contact Tracing and Status Apps
**Path:** Dashboard → Set up → COVID-19 apps

**Question:** Is this a COVID-19 contact tracing or status app?
- **Answer:** No

**Action:** Click "Save"

---

#### 3.7 Data Safety
**Path:** Dashboard → Set up → Data safety

This is critical. Answer carefully based on ForkIt's actual behavior.

**Data collection and security:**

1. Click **"Start"**

**Does your app collect or share any of the required user data types?**
- **Answer:** Yes

2. Click **"Next"**

**Data types collected or shared:**

**Location:**
- [ ] Check **"Approximate location"**
- [ ] Check **"Precise location"**

Configure each:

**Approximate Location:**
- Is this data collected, shared, or both?
  - [ ] Collected
  - [ ] Shared (with Google Places API for search functionality)
- Is this data processed ephemerally?
  - [ ] Yes ✓ (critical: data is not stored)
- Is collecting this data required or optional?
  - [ ] Required for app functionality
- Why is this user data collected? (select all that apply)
  - [ ] App functionality

**Precise Location:**
- (Same responses as Approximate Location)

**Other categories:**
- Check all other categories and confirm "No data collected" for each

3. **Data usage and handling**

For Location data:
- **All collected user data is encrypted in transit?** Yes ✓
- **Do you provide a way for users to request data deletion?** No
  - *Explanation: Data is not stored, so deletion is not applicable*

4. **Privacy Policy**
- Enter your Privacy Policy URL
- Example: `https://yourdomain.com/forkit-privacy-policy`
- OR use GitHub Pages: `https://yourusername.github.io/forkit/privacy.html`

5. Click **"Save"** and then **"Submit"**

---

#### 3.8 Government Apps
**Path:** Dashboard → Set up → Government apps

**Question:** Is this a government app?
- **Answer:** No

**Action:** Click "Save"

---

#### 3.9 Financial Features
**Path:** Dashboard → Set up → Financial features

**Question:** Does your app facilitate financial transactions?
- **Answer:** No

**Action:** Click "Save"

---

#### 3.10 Health & Fitness
**Path:** Dashboard → Set up → Health

**Question:** Does your app contain health or fitness features?
- **Answer:** No

**Action:** Click "Save"

---

## Step 4: Store Settings

### 4.1 App Category and Contact Details
**Path:** Dashboard → Store settings → App category

**App category:**
- **Category:** Food & Drink
- **Tags (optional):** restaurants, food, dining, decision

**Contact details:**
- **Email:** your-email@example.com
- **Phone (optional):** your phone number
- **Website (optional):** your website or GitHub repo

**External marketing:**
- [ ] Opt in to Google Play promotional emails (optional)

**Action:** Click "Save"

---

### 4.2 Store Listing
**Path:** Dashboard → Store settings → Main store listing

This is where you add all your marketing assets.

#### App Details

**App name:**
```
ForkIt
```

**Short description:** (80 characters max)
```
Fork indecision. Random restaurant picker + copycat recipes.
```

**Full description:** (4000 characters max)
*Copy from PLAY_STORE_ASSETS_GUIDE.md section 5*

#### Graphics

**App icon:**
- Upload: `AppFiles/assets/icon.png` (1024x1024)
- Will be resized to 512x512 by Play Console

**Feature graphic:**
- Upload: Create 1024x500 banner
- Follow guide in PLAY_STORE_ASSETS_GUIDE.md

**Phone screenshots:**
- Upload: 4-8 screenshots (1080x2340 recommended)
- Take from running app (see PLAY_STORE_ASSETS_GUIDE.md)

**7-inch tablet screenshots:** (optional)
- Skip for MVP

**10-inch tablet screenshots:** (optional)
- Skip for MVP

**Promotional video:** (optional)
- Add YouTube URL if you create one

#### Save
- Click **"Save"** at bottom of page

---

### 4.3 Store Settings - Other Languages (Optional)

If you want to support other languages:
1. Path: Dashboard → Store settings → Translations
2. Add languages
3. Provide translated text and screenshots

**For MVP:** Skip this, launch in English only

---

## Step 5: Production Release

### 5.1 Create Release

**Path:** Dashboard → Production → Create release (or Testing → Internal testing → Create release)

**Important:** Start with **Internal Testing** track, NOT Production!

#### Internal Testing Track

1. Go to **Testing → Internal testing**
2. Click **"Create release"**

**Release name:**
```
1.0.0 (1)
```

**Release notes:**
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

3. Click **"Upload"** under "App bundles"
4. Upload your AAB file (from EAS Build)
5. Wait for upload to complete (Play Console will scan it)

**Review release:**
- Check for errors or warnings
- Fix any issues

6. Click **"Save"**
7. Click **"Review release"**
8. Click **"Start rollout to internal testing"**

---

### 5.2 Manage Testers

**Path:** Testing → Internal testing → Testers tab

1. Click **"Create email list"**
2. **List name:** "ForkIt Beta Testers"
3. Add email addresses (comma-separated, up to 100 emails)
4. Click **"Save changes"**

**Share opt-in link:**
- Copy the opt-in URL from the page
- Send to your friends/testers
- They must:
  1. Click link
  2. Accept invitation
  3. Download app from Play Store

---

## Step 6: Pre-Launch Report (Automatic)

After uploading AAB, Google runs automated tests:
- Installs app on real devices
- Tests for crashes
- Checks performance
- Security scan
- Accessibility check

**Review results:**
- Path: Release → Testing → Pre-launch report
- Fix critical issues
- Warnings are okay for initial release

---

## Step 7: Rollout Strategy

### Phase 1: Internal Testing (You are here)
- **Audience:** Friends, family (up to 100 people)
- **Duration:** 1-2 weeks
- **Goal:** Catch bugs, gather feedback
- **Approval time:** Hours (no manual review needed)

### Phase 2: Closed Testing (After Internal)
- **Audience:** Larger group (up to 100,000 testers)
- **Duration:** 1-4 weeks
- **Goal:** Stress test, polish based on feedback
- **Approval time:** Hours

### Phase 3: Open Testing (Optional)
- **Audience:** Anyone with link
- **Duration:** 1-2 weeks
- **Goal:** Public beta
- **Approval time:** Usually within 24-48 hours

### Phase 4: Production
- **Audience:** Everyone
- **Approval time:** Usually within 2-7 days (longer for first release)
- **Staged rollout:** Start at 20%, increase gradually

---

## Step 8: Monitor and Iterate

### After Release

**Monitor:**
- Crash reports: Dashboard → Vitals → Crashes & ANRs
- User reviews: Dashboard → User feedback → Reviews
- Installation metrics: Dashboard → Statistics

**Respond to:**
- Crash reports (fix in updates)
- Negative reviews (address concerns)
- Feature requests (prioritize roadmap)

---

## Step 9: Updates

### For JavaScript-Only Changes (No Native Code)
Use **EAS Update** (OTA updates):
```bash
npx eas update --branch production --message "Bug fix: adjust filter logic"
```

Users get update without re-downloading from Play Store.

### For Native Changes or Major Updates
Rebuild and upload new AAB:
```bash
# Increment versionCode in app.json
# Change version to 1.1.0 (or next version)
# Build new AAB
npx eas build --platform android --profile production

# Upload to Play Console
# Create new release in desired track
```

**Remember:**
- Increment `versionCode` by 1 for every new AAB
- Follow semantic versioning for `version`
- Provide clear release notes

---

## Common Issues & Solutions

### Issue: AAB Upload Fails
**Causes:**
- versionCode not incremented
- Package name mismatch
- Invalid signing key

**Solutions:**
- Check app.json versionCode
- Verify package name: `com.forkit.app`
- Use EAS Build (handles signing automatically)

---

### Issue: App Rejected for Privacy Policy
**Cause:** Privacy Policy URL not accessible or doesn't cover location data

**Solution:**
- Ensure Privacy Policy is publicly accessible
- Covers location data collection and usage
- Mentions Google Places API data sharing

---

### Issue: Data Safety Form Rejected
**Cause:** Mismatch between declared data usage and actual app behavior

**Solution:**
- Review ForkIt's actual data handling
- Location: Collected, Shared with Google, Ephemeral, Required
- No other data collected

---

### Issue: Content Rating Incorrect
**Cause:** Questionnaire answered incorrectly

**Solution:**
- Re-submit content rating questionnaire
- Answer accurately based on app behavior
- ForkIt should be E (Everyone)

---

### Issue: Pre-Launch Report Shows Crashes
**Causes:**
- Missing API key
- Permission handling issues
- Device compatibility

**Solutions:**
- Ensure .env is used correctly
- Test on multiple devices
- Handle edge cases (no location permission, no internet, etc.)

---

## Step 10: Post-Launch Checklist

After app is live in Internal Testing:

- [ ] Test opt-in link works
- [ ] Install app from Play Store link
- [ ] Verify all features work in production build
- [ ] Check location permissions prompt
- [ ] Test all filters and random selection
- [ ] Verify recipe links work
- [ ] Test Google Maps integration
- [ ] Try phone call feature
- [ ] Test with poor network
- [ ] Test permission denial scenarios

---

## Resources

- **Play Console:** https://play.google.com/console
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Policy Center:** https://play.google.com/about/developer-content-policy
- **EAS Build Docs:** https://docs.expo.dev/build/introduction
- **EAS Submit Docs:** https://docs.expo.dev/submit/introduction

---

## Quick Reference: Required Fields

| Field | Value |
|-------|-------|
| Package Name | `com.forkit.app` |
| Version | `1.0.0` |
| Version Code | `1` |
| App Name | ForkIt |
| Category | Food & Drink |
| Content Rating | E (Everyone) |
| Price | Free |
| Ads | No |
| In-app Purchases | No |
| Target Age | 13+ |
| Privacy Policy | [Your URL] |

---

## Timeline Estimate

| Task | Time |
|------|------|
| Create Play Console account | 15 min |
| Create app & complete setup | 30-45 min |
| Upload AAB & configure release | 15 min |
| Automated pre-launch testing | 1-2 hours |
| Internal testing approval | Instant |
| Internal testing period | 1-2 weeks |
| Closed testing approval | Hours |
| Production approval (first time) | 2-7 days |

**Total time to Internal Testing:** ~2-3 hours of work, plus automated testing time

---

## Next Steps

1. **Build production AAB:**
   ```bash
   cd AppFiles
   npx eas build --platform android --profile production
   ```

2. **Wait for build to complete** (~10-20 minutes)

3. **Download AAB** from EAS Build dashboard

4. **Follow this guide** to set up Play Console

5. **Upload AAB** to Internal Testing track

6. **Invite testers** and share opt-in link

7. **Gather feedback** and iterate

8. **Promote to Production** when ready

---

Good luck with your ForkIt launch! 🍴
