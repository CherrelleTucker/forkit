# ForkIt Development Workflow

**Complete guide for developing, testing, building, and deploying ForkIt**

This document covers the entire workflow from setting up a new development machine to pushing updates to production. Use this as your reference when switching machines or onboarding new developers.

---

## Table of Contents

1. [Initial Setup (New Machine)](#1-initial-setup-new-machine)
2. [Project Structure](#2-project-structure)
3. [Daily Development Workflow](#3-daily-development-workflow)
4. [Testing Strategy](#4-testing-strategy)
5. [Version Management](#5-version-management)
6. [Git Workflow](#6-git-workflow)
7. [Building for Different Environments](#7-building-for-different-environments)
8. [Deployment Pipeline](#8-deployment-pipeline)
9. [Maintenance & Updates](#9-maintenance--updates)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Initial Setup (New Machine)

### 1.1 Prerequisites Installation

Install these tools on your new machine:

```bash
# Node.js (v18 or higher)
# Download from: https://nodejs.org/
node --version  # Verify installation

# Git
# Download from: https://git-scm.com/
git --version  # Verify installation

# EAS CLI (Expo Application Services)
npm install -g eas-cli
eas --version  # Verify installation

# Optional: Expo CLI (for local development)
npm install -g expo-cli
```

### 1.2 Clone Repository

```bash
# Navigate to your projects directory
cd ~/Documents/Personal/Personal_Admin/research

# Clone the repository
git clone https://github.com/CherrelleTucker/forkit.git
cd forkit/ForkIt

# Check current branch
git branch
git status
```

### 1.3 Install Project Dependencies

```bash
cd AppFiles
npm install

# Verify installation
npm list --depth=0
```

### 1.4 Configure Environment Variables

```bash
# Copy example .env file
cp .env.example .env

# Edit .env with your API key
# Use your preferred text editor (VS Code, Notepad++, nano, vim, etc.)
code .env  # If using VS Code

# Add your Google Places API key:
# EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_actual_api_key_here
```

**Get API Key from Google Cloud Console:**
1. Go to: https://console.cloud.google.com/google/maps-apis/credentials
2. Create new project or select existing
3. Enable "Places API"
4. Create credentials → API Key
5. Copy key to `.env`

### 1.5 EAS Authentication

```bash
# Log in to your Expo account
eas login

# Enter credentials when prompted
# If you don't have an account, create one at: https://expo.dev

# Verify authentication
eas whoami
```

### 1.6 Link EAS Project

```bash
cd AppFiles

# Option A: Link to existing project
eas init --id your-existing-project-id

# Option B: Create new project (if starting fresh)
eas init

# This updates app.json with:
# "extra": { "eas": { "projectId": "..." } }
```

### 1.7 Configure EAS Secrets (Production API Key)

```bash
# Create secret for production builds
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_PLACES_API_KEY --value "your_actual_api_key"

# Verify secret was created
eas secret:list
```

### 1.8 Google Cloud Console API Key Restrictions

**For production security:**

1. Go to: https://console.cloud.google.com/google/maps-apis/credentials
2. Click your API key
3. Under "Application restrictions":
   - Choose "Android apps"
   - Add package name: `com.forkit.app`
   - Get SHA-1 fingerprint:
     ```bash
     eas credentials
     # Navigate to Android → Production → Keystore
     # Copy SHA-1 fingerprint
     ```
   - Add SHA-1 to allowed list
4. Under "API restrictions":
   - Select "Restrict key"
   - Check only "Places API"
5. Save changes

---

## 2. Project Structure

```
ForkIt/
├── AppFiles/                          # React Native app source code
│   ├── App.js                         # Main app entry point (edit here)
│   ├── app.json                       # App configuration (name, permissions, version)
│   ├── eas.json                       # Build profiles (dev, preview, production)
│   ├── package.json                   # Dependencies
│   ├── .env                           # Local API keys (DO NOT COMMIT)
│   ├── .env.example                   # Template for .env
│   ├── .gitignore                     # Excludes .env from git
│   ├── node_modules/                  # Installed dependencies
│   ├── assets/                        # App icons and images
│   │   ├── icon.png                   # App icon (1024x1024)
│   │   ├── adaptive-icon.png          # Android adaptive icon
│   │   └── splash-icon.png            # Splash screen
│   └── components/                    # React components (if you add any)
│
├── docs/                              # GitHub Pages (privacy policy hosting)
│   ├── index.html
│   └── privacy.html
│
├── .git/                              # Git repository data
├── START_HERE.md                      # Deployment overview
├── DEPLOYMENT_README.md               # Play Store deployment guide
├── DEV_BUILD_GUIDE.md                 # Development build testing
├── DEVELOPMENT_WORKFLOW.md            # This file
├── README.md                          # Project README
├── ROADMAP.md                         # Feature roadmap
├── CHANGELOG.md                       # Version history
├── prd.md                             # Product requirements
└── [other documentation files]
```

### Key Files to Know

| File | Purpose | When to Edit |
|------|---------|--------------|
| `AppFiles/App.js` | Main application logic | Every code change |
| `AppFiles/app.json` | App metadata, permissions, version | Config changes, version bumps |
| `AppFiles/eas.json` | Build configuration | Build profile changes |
| `AppFiles/package.json` | Dependencies | Adding/removing packages |
| `AppFiles/.env` | Local API keys | Local development only |

---

## 3. Daily Development Workflow

### 3.1 Start Development Server (Most Common)

```bash
cd ForkIt/AppFiles

# Start Expo development server
npx expo start

# OR use Expo CLI if installed globally
expo start
```

**What happens:**
- Metro bundler starts on `http://localhost:8081`
- QR code appears in terminal
- Development server runs on your machine

### 3.2 Preview on Device/Emulator

**Option A: Physical Device with Expo Go (Fastest)**
1. Install "Expo Go" app from:
   - Android: Google Play Store
   - iOS: Apple App Store
2. Scan QR code from terminal
3. App loads with live reload

**Option B: Android Emulator**
```bash
# Press 'a' in terminal to open Android emulator
# (Requires Android Studio installed)
```

**Option C: iOS Simulator (macOS only)**
```bash
# Press 'i' in terminal to open iOS simulator
# (Requires Xcode installed)
```

### 3.3 Make Code Changes

**Primary development file: `AppFiles/App.js`**

```javascript
// Example: Update filter max distance
// Line ~50-60 in App.js
const [maxDistance, setMaxDistance] = useState(5000); // Changed from 3000

// Save file → App automatically reloads
```

**Live Reload:**
- Save file → App reloads instantly
- No need to restart server
- Errors show in app and terminal

### 3.4 Test Changes

After making changes, test:
1. Location permission flow
2. "Fork It Now" button
3. All filters work
4. Restaurant result displays correctly
5. Google Maps integration
6. Phone call feature
7. Recipe links
8. Re-roll feature

### 3.5 Stop Development Server

```bash
# In terminal where server is running
Ctrl + C
```

---

## 4. Testing Strategy

### 4.1 Testing Hierarchy

```
Level 1: Expo Go (Fastest)
   ↓ Use for: Quick UI/UX changes, JavaScript-only updates
   ↓ Limitations: No native modules, no Play Integrity

Level 2: Development Build (Medium)
   ↓ Use for: Testing native features, pre-release validation
   ↓ Limitations: Requires rebuild for native changes

Level 3: Production Build (Slowest)
   ↓ Use for: Final testing before release
   ↓ Limitations: No dev tools, no hot reload
```

### 4.2 Quick Testing (Expo Go)

**When to use:**
- UI/UX changes
- Filter logic updates
- Text/copy changes
- JavaScript-only features

**How to test:**
```bash
cd AppFiles
npx expo start

# Scan QR with Expo Go app
# Make changes → Save → Auto reload
```

### 4.3 Development Build Testing

**When to use:**
- Testing Play Integrity
- Testing native modules
- Pre-release validation
- Production-like environment

**Create development build:**
```bash
cd AppFiles

# Build for Android (takes ~10-15 minutes)
eas build --profile development --platform android

# Download APK when complete
# Install on physical Android device
# (Emulator has limited Play Integrity support)
```

**Connect to dev server:**
```bash
# Install dev build APK on device first
# Then start dev server
npx expo start --dev-client

# In app:
# - Shake device or press Ctrl+M
# - Tap "Settings"
# - Enter dev server URL
# - Reload app
```

**Benefits:**
- Hot reload still works
- Full native feature support
- Debug tools available
- Mirrors production environment

### 4.4 Production Build Testing

**When to use:**
- Final testing before release to testers
- Validating production-only features
- Performance testing

**Create production build:**
```bash
cd AppFiles
eas build --profile production --platform android

# Download AAB when complete
# Upload to Play Console Internal Testing
# Install from Play Store
```

---

## 5. Version Management

### 5.1 Version Numbering (Semantic Versioning)

**Format:** `MAJOR.MINOR.PATCH` + `versionCode`

```
Version: 1.0.0
         │ │ │
         │ │ └─ PATCH: Bug fixes (1.0.1, 1.0.2)
         │ └─── MINOR: New features (1.1.0, 1.2.0)
         └───── MAJOR: Breaking changes (2.0.0, 3.0.0)

versionCode: Integer incremented for EVERY build
```

### 5.2 When to Bump Versions

**PATCH (1.0.0 → 1.0.1):**
- Bug fixes
- Performance improvements
- Small UI tweaks
- No new features

**MINOR (1.0.0 → 1.1.0):**
- New features
- Non-breaking changes
- New filters or options
- Enhancements

**MAJOR (1.0.0 → 2.0.0):**
- Breaking changes
- Complete UI redesign
- New architecture
- Removed features

### 5.3 Update app.json

```json
{
  "expo": {
    "version": "1.0.1",        // Update this (semantic version)
    "android": {
      "versionCode": 2         // Update this (increment by 1)
    },
    "ios": {
      "buildNumber": "2"       // Update this too (same as versionCode)
    }
  }
}
```

**Rules:**
- `versionCode` MUST increase for every AAB upload
- `version` follows semantic versioning
- Both must be updated before building

### 5.4 Version History Tracking

Update `CHANGELOG.md` after each release:

```markdown
## [1.0.1] - 2026-01-15

### Fixed
- Fixed crash when location permission denied
- Improved recipe link handling

### Changed
- Updated filter distance to max 15 miles
```

---

## 6. Git Workflow

### 6.1 Daily Commit Workflow

```bash
# Check current status
git status

# See what changed
git diff

# Stage specific files
git add AppFiles/App.js

# OR stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: add cuisine filter to restaurant search

- Added cuisine keyword search filter
- Updated UI to show cuisine input field
- Tested with Italian, Mexican, Asian cuisines

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to remote
git push origin master
```

### 6.2 Commit Message Format

```
<type>: <short description>

<detailed description>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: UI/styling changes (no logic change)
- `refactor`: Code restructuring (no behavior change)
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "fix: resolve crash on empty location results"

git commit -m "feat: add Hidden Gems mode toggle

- Added switch to enable/exclude chain restaurants
- Updated filter logic to prioritize local restaurants
- Added state management for Hidden Gems toggle"

git commit -m "docs: update deployment guide with new EAS steps"
```

### 6.3 Branching Strategy (Optional)

**Simple workflow (solo developer):**
```bash
# Work directly on master
git checkout master
# make changes
git add .
git commit -m "feat: new feature"
git push origin master
```

**Feature branch workflow (recommended for larger changes):**
```bash
# Create feature branch
git checkout -b feature/cuisine-filter

# Make changes
# ... edit files ...

# Commit changes
git add .
git commit -m "feat: add cuisine filter"

# Push feature branch
git push origin feature/cuisine-filter

# Merge back to master
git checkout master
git merge feature/cuisine-filter
git push origin master

# Delete feature branch (optional)
git branch -d feature/cuisine-filter
git push origin --delete feature/cuisine-filter
```

### 6.4 Before Making Changes

**Always pull latest changes first:**
```bash
cd ForkIt
git pull origin master

# Then start developing
cd AppFiles
npx expo start
```

### 6.5 What NOT to Commit

**Already in `.gitignore`:**
- `.env` (API keys)
- `node_modules/` (dependencies)
- `.expo/` (cache)
- Build artifacts

**If you accidentally committed `.env`:**
```bash
# Remove from git (keeps local file)
git rm --cached AppFiles/.env

# Commit removal
git commit -m "chore: remove .env from version control"

# Push
git push origin master

# Verify .env is in .gitignore
cat AppFiles/.gitignore | grep .env
```

---

## 7. Building for Different Environments

### 7.1 Build Profiles (eas.json)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "distribution": "store",
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

### 7.2 Development Build (APK)

**Purpose:** Testing native features with hot reload

```bash
cd AppFiles
eas build --profile development --platform android

# Build takes ~10-15 minutes
# Download APK from EAS dashboard
# Install on physical device
# Connect to dev server: npx expo start --dev-client
```

**Output:** APK file (can be directly installed on device)

### 7.3 Preview Build (APK)

**Purpose:** Testing without dev server, but not for Play Store

```bash
cd AppFiles
eas build --profile preview --platform android

# Build takes ~10-15 minutes
# Download APK
# Install directly on device
```

**Output:** APK file (standalone, no dev server needed)

### 7.4 Production Build (AAB)

**Purpose:** Upload to Play Store

```bash
cd AppFiles

# Build Android App Bundle
eas build --profile production --platform android

# Build takes ~15-20 minutes
# Download AAB from EAS dashboard
# Upload to Play Console
```

**Output:** AAB file (Android App Bundle for Play Store)

### 7.5 Build Monitoring

**Check build status:**
1. Terminal shows build URL
2. OR visit: https://expo.dev
3. Go to: Your Projects → ForkIt → Builds
4. Monitor progress, logs, and errors

**Download builds:**
- Click build in EAS dashboard
- Click "Download" button
- Save to safe location

---

## 8. Deployment Pipeline

### 8.1 Deployment Stages

```
Local Development (Expo Go)
   ↓ [Build AAB]
Internal Testing (1-20 testers)
   ↓ [Promote/Build new AAB]
Closed Testing (up to 100,000 testers)
   ↓ [Promote/Build new AAB]
Open Testing (unlimited, opt-in)
   ↓ [Promote/Submit for review]
Production (public, staged rollout)
```

### 8.2 Internal Testing Deployment

**When:** First release, major updates, bug fixes

**Steps:**
```bash
# 1. Update version in app.json
# version: "1.0.1"
# versionCode: 2

# 2. Build production AAB
cd AppFiles
eas build --profile production --platform android

# 3. Download AAB when complete

# 4. Upload to Play Console
# - Go to: https://play.google.com/console
# - Dashboard → Testing → Internal testing
# - Create new release OR update existing
# - Upload AAB
# - Add release notes
# - Save → Review → Start rollout

# 5. Test installation
# - Use opt-in link
# - Install from Play Store
# - Verify all features work
```

**Timeline:**
- Build: 15-20 minutes
- Available to testers: Immediately (no review)
- Testers receive update: Within 24 hours

### 8.3 Closed Testing Deployment

**When:** After internal testing passes, need more testers

**Steps:**
1. Play Console → Testing → Closed testing
2. Create release (or promote from Internal Testing)
3. Upload AAB OR promote existing release
4. Manage testers (email lists, up to 100,000)
5. Save → Review → Start rollout

**Timeline:**
- Available to testers: Immediately (no review)
- Expands testing to more users

### 8.4 Open Testing Deployment

**When:** Public beta, anyone can opt-in

**Steps:**
1. Play Console → Testing → Open testing
2. Create release (or promote from Closed Testing)
3. Upload AAB OR promote existing release
4. Release notes
5. Save → Review → Start rollout

**Timeline:**
- Available publicly: Immediately (no review)
- Anyone can find and join via Play Store

### 8.5 Production Deployment

**When:** App is stable, tested, ready for public

**Steps:**
```bash
# 1. Ensure app is fully tested in previous stages

# 2. Update version for production (if needed)
# app.json:
# version: "1.0.0"  (or whatever version)
# versionCode: [increment]

# 3. Build production AAB (if not promoting existing)
cd AppFiles
eas build --profile production --platform android

# 4. Submit to Production
# - Play Console → Production
# - Create new release OR promote from testing
# - Upload AAB OR promote existing
# - Add production release notes (user-facing)
# - Set rollout percentage (start at 20%)
# - Submit for review

# 5. Wait for Google review
# - First-time: 2-7 days
# - Subsequent updates: 1-3 days

# 6. Monitor rollout
# - Dashboard → Production → Release details
# - Gradually increase rollout: 20% → 50% → 100%
```

**Staged Rollout Strategy:**
- Day 1: 20% (monitor crashes, ANRs)
- Day 3: 50% (if no issues)
- Day 5: 100% (full rollout)

### 8.6 Release Notes (User-Facing)

**Internal Testing:**
```
v1.0.1 - Internal Testing

- Fixed crash when location denied
- Improved recipe link handling
- Testing variety algorithm improvements
```

**Production:**
```
What's New in v1.0.1

🐛 Bug Fixes:
• Improved location permission handling
• Fixed recipe link navigation

✨ Improvements:
• Faster restaurant search
• Better variety in recommendations

Fork indecision. Fork it all. 🍴
```

---

## 9. Maintenance & Updates

### 9.1 JavaScript-Only Updates (Fast)

**Use EAS Update for:**
- UI changes
- Logic updates (filters, algorithms)
- Text/copy changes
- Bug fixes in JavaScript

**How to deploy:**
```bash
cd AppFiles

# Make code changes
# ... edit App.js ...

# Publish update to production
eas update --branch production --message "Fix: improve filter logic"

# Users receive update:
# - Next time they open app
# - OR after a few hours
# - No Play Store review needed
```

**When users get updates:**
- App checks for updates on launch
- Downloads in background
- Applies on next restart

**Limitations:**
- JavaScript changes only
- No native module changes
- No config changes (app.json)
- No new permissions

### 9.2 Native Updates (Requires AAB Rebuild)

**Rebuild AAB for:**
- New permissions
- Native module changes (new packages)
- App config changes (app.json)
- Version bumps

**How to deploy:**
```bash
# 1. Update app.json
# version: "1.1.0"
# versionCode: 3

# 2. Rebuild AAB
cd AppFiles
eas build --profile production --platform android

# 3. Upload to Play Console
# 4. Submit for review (if going to production)
```

### 9.3 Hotfix Workflow

**For critical bugs in production:**

```bash
# 1. Create hotfix branch (optional)
git checkout -b hotfix/crash-on-launch

# 2. Fix bug
# ... edit App.js ...

# 3. Test locally
npx expo start
# Verify fix works

# 4. Commit fix
git add .
git commit -m "fix: resolve crash on app launch"
git push origin hotfix/crash-on-launch

# 5. Merge to master
git checkout master
git merge hotfix/crash-on-launch
git push origin master

# 6. Update version
# app.json:
# version: "1.0.2" (patch bump)
# versionCode: 3

# 7. Build and deploy
cd AppFiles
eas build --profile production --platform android

# 8. Upload to Internal Testing first
# Test installation
# If stable, promote to Production with expedited review request
```

### 9.4 Regular Update Schedule

**Recommended:**
- **Patch releases:** As needed (critical bugs)
- **Minor releases:** Monthly (new features)
- **Major releases:** Quarterly or as needed

**Before each update:**
1. Review crash reports (Play Console → Vitals → Crashes)
2. Review user feedback (Play Console → User feedback)
3. Check ANR reports (Application Not Responding)
4. Plan feature additions from ROADMAP.md

### 9.5 Monitoring Production

**Daily checks:**
- Crash-free rate (target: >99%)
- ANR rate (target: <0.5%)

**Weekly checks:**
- User reviews and ratings
- Statistics (installs, uninstalls)

**Monthly checks:**
- Feature usage analytics (if implemented)
- Update roadmap based on feedback

**Where to monitor:**
- Play Console: https://play.google.com/console
- Dashboard → Vitals
- Dashboard → User feedback
- Dashboard → Statistics

---

## 10. Troubleshooting

### 10.1 Build Failures

**Error: "Unable to resolve module"**
```bash
cd AppFiles
rm -rf node_modules
rm package-lock.json
npm install
eas build --platform android --profile production --clear-cache
```

**Error: "EAS Build failed"**
1. Check build logs in EAS dashboard
2. Look for specific error messages
3. Common issues:
   - Missing dependencies
   - Incorrect eas.json configuration
   - API key not set
   - Invalid app.json

**Error: "Keystore error"**
```bash
# Reset credentials
eas credentials

# Navigate to Android → Production → Keystore
# Delete existing keystore
# Rebuild (EAS will generate new keystore)
```

### 10.2 Local Development Issues

**Error: "Expo Go couldn't connect"**
- Ensure device and computer on same WiFi
- Try tunnel mode: `npx expo start --tunnel`
- Disable firewall temporarily
- Restart Expo server: Ctrl+C → `npx expo start`

**Error: "API key not working"**
1. Check `.env` file exists and has correct key
2. Restart Expo server after editing `.env`
3. Verify API key in Google Cloud Console is unrestricted (for local dev)

**Error: "Location permission not prompting"**
1. Verify `app.json` has `expo-location` in plugins
2. Check permissions array includes location permissions
3. Restart Expo server
4. Clear Expo Go app cache

### 10.3 Production Build Issues

**Error: "API key missing in production build"**
```bash
# Verify EAS Secret exists
eas secret:list

# If missing, create:
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_PLACES_API_KEY --value "your_key"

# Rebuild
eas build --profile production --platform android
```

**Error: "App crashes on launch"**
1. Check Play Console → Vitals → Crashes
2. Review stack traces
3. Test locally first: `npx expo run:android`
4. Verify all dependencies installed: `npm install`

### 10.4 Play Console Issues

**Error: "Privacy Policy URL not accessible"**
- Test URL in incognito browser
- Ensure HTTPS (not HTTP)
- Verify GitHub Pages is enabled
- Check URL is publicly accessible

**Error: "AAB upload failed"**
1. Ensure versionCode is higher than previous
2. Verify package name matches (com.forkit.app)
3. Check AAB is signed correctly (EAS handles this)
4. Try uploading via Play Console UI instead of automated

**Error: "Production review rejected"**
- Read rejection reason carefully
- Common issues:
  - Privacy policy doesn't match app behavior
  - Screenshots don't show actual app
  - Misleading description
  - Missing required permissions declarations
- Fix issues, rebuild if needed, resubmit

### 10.5 Git Issues

**Error: "Merge conflict"**
```bash
# View conflicts
git status

# Edit conflicted files
# Look for <<<<<<< HEAD and >>>>>>> markers
# Choose which changes to keep
# Remove conflict markers

# Stage resolved files
git add .

# Complete merge
git commit -m "fix: resolve merge conflict"
```

**Error: "Accidentally committed .env"**
```bash
# Remove from git (keeps local file)
git rm --cached AppFiles/.env

# Add to .gitignore if not already there
echo ".env" >> AppFiles/.gitignore

# Commit removal
git commit -m "chore: remove .env from git"
git push origin master

# IMPORTANT: Rotate API key in Google Cloud Console
# (since it was exposed in git history)
```

### 10.6 Getting Help

**Resources:**
- Expo Docs: https://docs.expo.dev
- Expo Forums: https://forums.expo.dev
- Play Console Help: https://support.google.com/googleplay/android-developer
- React Native Docs: https://reactnative.dev
- Stack Overflow: Tag with `expo`, `react-native`, `eas-build`

**ForkIt-Specific Help:**
- GitHub Issues: https://github.com/CherrelleTucker/forkit/issues
- Email: ctuckersolutions@gmail.com

---

## Quick Reference Commands

### Development
```bash
# Start development server
cd AppFiles && npx expo start

# Start with dev client
npx expo start --dev-client

# Clear cache
npx expo start --clear
```

### Building
```bash
# Development build (APK with hot reload)
eas build --profile development --platform android

# Preview build (standalone APK)
eas build --profile preview --platform android

# Production build (AAB for Play Store)
eas build --profile production --platform android
```

### Updates
```bash
# JavaScript-only update
eas update --branch production --message "Bug fix"

# List all EAS updates
eas update:list --branch production
```

### Git
```bash
# Status and diff
git status
git diff

# Commit and push
git add .
git commit -m "feat: description"
git push origin master

# Pull latest
git pull origin master
```

### EAS
```bash
# Login
eas login

# Check credentials
eas credentials

# List secrets
eas secret:list

# Create secret
eas secret:create --name KEY_NAME --value "value"
```

---

## Workflow Cheat Sheet

### Making a Code Change
1. `cd ForkIt/AppFiles`
2. `npx expo start`
3. Edit `App.js`
4. Test in Expo Go
5. `git add . && git commit -m "feat: description"`
6. `git push origin master`

### Releasing an Update (JavaScript Only)
1. Make changes
2. Test locally
3. `eas update --branch production --message "description"`
4. Users get update on next app launch

### Releasing an Update (Native/Config Change)
1. Update `app.json` (version + versionCode)
2. Make changes
3. Test locally
4. `eas build --profile production --platform android`
5. Download AAB
6. Upload to Play Console → Internal Testing
7. Test installation
8. Promote to Production

### Setting Up New Machine
1. Install Node.js, Git, EAS CLI
2. Clone repo
3. `cd AppFiles && npm install`
4. Copy `.env.example` to `.env`, add API key
5. `eas login`
6. `eas init --id existing-project-id`
7. `npx expo start`

---

**Last Updated:** 2026-01-08
**ForkIt Version:** 1.0.0
**Author:** Cherrelle Tucker

---

**Fork indecision. Fork it all. 🍴**
