# Google Play Store Assets Guide for ForkIt

## Overview
This guide provides specifications and templates for all visual assets required for the Google Play Store listing.

---

## 1. App Icon (High-Resolution)

### Requirements
- **Size:** 512 x 512 pixels
- **Format:** 32-bit PNG with alpha channel
- **File size:** Maximum 1 MB
- **Design guidelines:**
  - Simple, recognizable icon
  - Works at small sizes
  - Matches brand identity
  - No transparency on edges (use adaptive icon instead)

### ForkIt Recommendations
**Concept Ideas:**
1. Fork icon with gradient (matches app theme: #0B0B0F to #17163B)
2. Stylized "F" with fork tines
3. Fork with location pin
4. Minimalist fork silhouette

**Color Scheme:**
- Primary: Dark background (#0B0B0F)
- Accent: White (#FFFFFF) or gradient
- Optional: Purple tint (#17163B)

### Current Status
✅ You already have `icon.png` and `adaptive-icon.png` in `/assets`
- **TODO:** Verify these are 512x512 and high quality
- **TODO:** Test how they look on various backgrounds

### Validation Commands
```bash
cd AppFiles/assets
# Check icon dimensions
file icon.png
identify icon.png  # if imagemagick installed
```

---

## 2. Feature Graphic

### Requirements
- **Size:** 1024 x 500 pixels
- **Format:** JPEG or 24-bit PNG (no alpha)
- **File size:** Maximum 1 MB
- **Usage:** Top of Play Store listing page

### Design Guidelines
- Must not contain app icon or device frames
- Should showcase app's value proposition
- Text should be readable at small sizes
- Follows Material Design principles

### ForkIt Feature Graphic Template

**Layout Concept:**
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  🍴  ForkIt                                           │
│  Fork indecision. Fork regret. Fork it all.          │
│                                                        │
│  [Screenshot of app UI showing "Fork It Now" button]  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Text Content:**
- Title: "ForkIt"
- Tagline: "Can't decide? We'll pick for you."
- Alternative: "Stop scrolling. Start eating."

**Design Elements:**
- Background: Dark gradient (#0B0B0F → #17163B)
- Fork emoji or icon: 🍴
- Show main button or result card
- Keep it clean and minimal

### Tools for Creation
- **Figma** (recommended, free): https://figma.com
- **Canva** (easy templates): https://canva.com
- **Photoshop** / **GIMP** (advanced)

### Template Dimensions
- Width: 1024px
- Height: 500px
- Safe area for text: Center 900x400px (avoid edges)

---

## 3. Screenshots

### Requirements
- **Minimum:** 2 screenshots (4-8 recommended)
- **Formats:** JPEG or 24-bit PNG
- **Dimensions:**
  - Minimum: 320px on shortest side
  - Maximum: 3840px on longest side
  - Recommended: 1080 x 2340 pixels (9:19.5 aspect ratio)

### Screenshot Specifications for Android
For most Android devices (portrait):
- **1080 x 2340 pixels** (matches modern Android phones)
- OR **1080 x 2400 pixels** (alternative)

### ForkIt Screenshot Plan

**Screenshot 1: Main Screen**
- Show initial state with "Fork It Now" button
- Display filters section
- Include tagline/subtitle
- **Caption:** "One tap to decide"

**Screenshot 2: Loading State**
- Show "Forking Hard…" loading animation
- Display fun loading phrase
- Show slot-machine preview
- **Caption:** "We're choosing for you"

**Screenshot 3: Restaurant Result**
- Show selected restaurant card
- Display rating, price, distance
- Show action buttons (Re-Fork, Maps, Call)
- **Caption:** "Your pick is ready"

**Screenshot 4: Recipe Fallback**
- Show "Make at home" section
- Display signature dish
- Show recipe link buttons
- **Caption:** "Or fork it at home"

**Screenshot 5: Filters**
- Close-up of filter options
- Show Hidden Gems toggle
- Display radius, price, rating options
- **Caption:** "Customize your search"

**Screenshot 6: Result with Filters** (Optional)
- Show complete flow with filter → result
- **Caption:** "Filters + random selection"

### How to Take Screenshots

#### Option 1: From Running App
1. Run app on Android emulator or device
2. Navigate to each screen
3. Take screenshots (Ctrl+M in Android Studio emulator)
4. Pull files: `adb pull /sdcard/Pictures/Screenshots/`

#### Option 2: From Expo
1. Run: `npx expo start`
2. Open on Android device via QR code
3. Take screenshots on device
4. Transfer via USB or cloud

#### Option 3: Manual Creation
1. Use Figma/Sketch to recreate screens
2. Ensures perfect quality and consistency
3. Can add device frames

### Screenshot Formatting Tips
- **Remove status bar clutter**: Use clean status bar (full battery, good signal)
- **Consistent time**: Set all screenshots to same time (10:09 is common)
- **Add device frames**: Optional, can make screenshots more appealing
- **Add text overlays**: Highlight key features (keep minimal)

---

## 4. Promotional Video (Optional)

### Requirements
- **Platform:** YouTube
- **Length:** 30 seconds - 2 minutes recommended
- **Content:** Show app in action, highlight key features
- **Quality:** 1080p minimum

### ForkIt Video Script (30 seconds)

```
[0-5s]   Logo animation: "ForkIt" with fork emoji
[5-10s]  Problem: "Can't decide where to eat?"
[10-15s] Solution: Tap "Fork It Now" → restaurant appears
[15-20s] Show filters and Hidden Gems
[20-25s] Show "Make at home" recipe feature
[25-30s] CTA: "Download ForkIt. Fork indecision."
```

---

## 5. Play Store Listing Text Assets

### Short Description
**Limit:** 80 characters
**ForkIt Short Description:**
```
Fork indecision. Random restaurant picker + copycat recipes.
```
(68 characters)

Alternative:
```
Can't decide? We'll pick a restaurant for you. Plus recipes!
```
(62 characters)

### Full Description
**Limit:** 4000 characters
**ForkIt Full Description:**

```
Can't decide where to eat? Fork it. 🍴

ForkIt removes food decision fatigue by choosing a restaurant for you—no scrolling, no analysis paralysis. Just tap "Fork It" and we'll pick one spot from your filtered preferences.

🎯 TRUE RANDOM SELECTION
One button. One choice. Done. No browsing, no second-guessing.

🏡 MAKE IT AT HOME FALLBACK
Every pick includes the restaurant's signature dish + copycat recipe links. Don't want to go out? Recreate the vibe at home.

✨ HIDDEN GEMS MODE
Prioritizes local restaurants over chains. Discover your neighborhood.

🎚️ SMART FILTERS (NOT BROWSING TOOLS)
• Distance radius (1-15 miles)
• Price range ($-$$$$)
• Minimum rating (3.5+)
• Cuisine keywords (optional)
• Open now toggle
• Hidden Gems mode

WHY FORKIT?

The problem isn't lack of information—it's decision overload. Google Maps already shows you restaurants, ratings, and reviews. What it doesn't do well: **"Just tell me where to go."**

ForkIt makes the decision *for* you, then offers a cooking fallback if you don't want to leave the house.

FEATURES

✓ Random restaurant selection with guardrails
✓ Google Maps integration for directions
✓ One-tap phone call to restaurant
✓ Signature dish identification
✓ Copycat recipe links (YouTube, Google, Allrecipes)
✓ Re-roll if you really don't vibe with the pick
✓ Playful UI with fun loading phrases
✓ Local-first with Hidden Gems prioritization

PHILOSOPHY

We're not a replacement for Google Maps search. We're the "just pick one already" button you wish existed. Decision paralysis is real. ForkIt solves it.

Fork responsibly. Tines may vary. 🍴

---

PRIVACY

ForkIt uses your location only to find nearby restaurants. We don't store your location data, don't require an account, and don't track your behavior. Simple as that.

Read our full Privacy Policy: https://CherrelleTucker.github.io/forkit/privacy.html

---

FEEDBACK

Found a bug? Have a feature request? Visit our GitHub: https://github.com/CherrelleTucker/forkit

Made with ❤️ (and hunger) for the indecisive eaters everywhere.
```

---

## 6. Asset Checklist

### Required Before Submission
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500)
- [ ] At least 2 screenshots (recommend 4-6)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Privacy Policy URL

### Optional But Recommended
- [ ] Promotional video (YouTube)
- [ ] Additional screenshots showing all features
- [ ] Device-framed screenshots
- [ ] Localized descriptions (other languages)

---

## 7. Tools & Resources

### Design Tools
- **Figma**: https://figma.com (free, collaborative)
- **Canva**: https://canva.com (templates, easy)
- **Unsplash**: https://unsplash.com (free images for backgrounds)
- **Google Fonts**: https://fonts.google.com (typography)

### Screenshot Tools
- **Android Studio Emulator**: Built-in screenshot capability
- **Screely**: https://screely.com (add browser/device frames)
- **Screenshot Framer**: https://screenshots.pro (device mockups)

### Video Creation
- **CapCut**: Free video editor (mobile & desktop)
- **DaVinci Resolve**: Professional, free video editor
- **Loom**: Quick screen recording tool

### Verification Tools
- **ImageMagick**: Check image dimensions
  ```bash
  identify icon.png
  ```
- **Google Play Console**: Has built-in validators

---

## 8. Example Directory Structure

Create this folder structure for organization:

```
ForkIt/
├── AppFiles/
│   └── assets/
│       ├── icon.png (existing)
│       ├── adaptive-icon.png (existing)
│       └── splash-icon.png (existing)
├── PlayStoreAssets/
│   ├── app-icon-512.png
│   ├── feature-graphic-1024x500.png
│   ├── screenshots/
│   │   ├── 01-main-screen.png
│   │   ├── 02-loading.png
│   │   ├── 03-result.png
│   │   ├── 04-recipes.png
│   │   ├── 05-filters.png
│   │   └── 06-hidden-gems.png
│   ├── video/
│   │   └── promo-video.mp4
│   └── text/
│       ├── short-description.txt
│       ├── full-description.txt
│       └── release-notes.txt
└── PRIVACY_POLICY.md
```

---

## 9. Next Steps

1. **Verify existing icons**
   ```bash
   cd AppFiles/assets
   ls -lh *.png
   identify icon.png
   ```

2. **Create PlayStoreAssets folder**
   ```bash
   mkdir -p PlayStoreAssets/screenshots
   mkdir -p PlayStoreAssets/video
   mkdir -p PlayStoreAssets/text
   ```

3. **Take screenshots**
   - Run app on Android device/emulator
   - Capture 4-6 key screens
   - Export as PNG (1080x2340 or similar)

4. **Design feature graphic**
   - Use Figma/Canva template
   - Size: 1024x500px
   - Export as JPEG or PNG

5. **Copy listing text**
   - Save short and full descriptions
   - Customize with your info (email, GitHub, privacy URL)

6. **Upload to Play Console** (after app creation)

---

## 10. Quality Checklist

Before uploading to Play Console:

### Visual Quality
- [ ] All images are high resolution (no blur/pixelation)
- [ ] Text is readable at thumbnail sizes
- [ ] Colors are consistent with brand
- [ ] No copyrighted content used

### Technical Specs
- [ ] App icon: 512x512 PNG, 32-bit with alpha
- [ ] Feature graphic: 1024x500, no transparency
- [ ] Screenshots: Correct aspect ratio for target devices
- [ ] All files under 1 MB

### Content Quality
- [ ] No misleading imagery
- [ ] Screenshots show actual app (not mockups)
- [ ] Text is grammatically correct
- [ ] Privacy Policy URL is accessible
- [ ] No prohibited content (violence, adult content, etc.)

---

## Questions?

Refer to Google's official guidelines:
https://support.google.com/googleplay/android-developer/answer/9866151
