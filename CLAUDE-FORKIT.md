# 🍴 ForkIt - Claude Code Setup Guide

This file provides complete setup instructions for ForkIt that can be executed by Claude Code on a new machine.

## Project Overview

**ForkIt** is a random restaurant picker mobile app built with React Native/Expo that removes decision fatigue. Key features:
- Random restaurant selection using Google Places API
- Hidden Gems mode (prioritizes local, non-chain restaurants)
- Recipe links for making restaurant dishes at home
- Smart filters (distance, price, rating, cuisine, open now)

**Tech Stack:**
- **Frontend:** React Native (Expo) - Android & iOS
- **Backend:** Node.js serverless functions (Vercel)
- **APIs:** Google Places API (New), Play Integrity API
- **Build System:** EAS (Expo Application Services)
- **Deployment:** Google Play Store (live), Apple App Store (planned)

## Repository Information

- **GitHub:** https://github.com/CherrelleTucker/forkit
- **Expo Owner:** cjtucker
- **Expo Project ID:** 0abe90d5-587c-4918-ad8b-7d472c687ace
- **Android Package:** com.forkit.app
- **iOS Bundle ID:** com.forkit.app

## Prerequisites Check

Before starting setup, Claude should verify these are installed:

### Required Software
1. **Node.js 18+** - Check with: `node --version`
2. **npm** - Check with: `npm --version`
3. **Git** - Check with: `git --version`
4. **Expo CLI** - Will be installed if missing
5. **EAS CLI** - Will be installed if missing

### Optional (for full development)
6. **Android Studio** - For Android development/emulator
7. **Xcode** - For iOS development (macOS only)
8. **Vercel CLI** - For backend deployment

### Required Accounts
- **Expo Account** - For building and deploying
- **Google Cloud Console** - For API keys
- **Vercel Account** - For backend hosting (free tier)
- **Google Play Console** - For Android deployment ($25 one-time)
- **Apple Developer** - For iOS deployment ($99/year)

## Setup Instructions for Claude Code

When user says "Claude, set up ForkIt by viewing CLAUDE-FORKIT", follow these steps:

---

## STEP 1: Clone Repository

```bash
# Ask user where they want to clone the repo
# Default suggestion: ~/projects/forkit or C:\Users\USERNAME\projects\forkit

git clone https://github.com/CherrelleTucker/forkit.git
cd forkit
```

**Questions to ask user:**
- "Where would you like to clone the ForkIt repository? (default: current directory)"
- "Do you have an Expo account? If yes, what's your username?"

---

## STEP 2: Install Global Dependencies

```bash
# Install Expo CLI globally (if not already installed)
npm install -g expo-cli

# Install EAS CLI globally (if not already installed)
npm install -g eas-cli
```

**Verification:**
```bash
expo --version
eas --version
```

---

## STEP 3: Set Up Mobile App (AppFiles)

### 3.1 Navigate to app directory
```bash
cd AppFiles
```

### 3.2 Install dependencies
```bash
npm install
```

### 3.3 Configure environment variables

**Ask user for:**
1. "Do you have a Google Places API key?"
   - If NO: Guide them to create one (see "Creating Google Places API Key" section below)
   - If YES: "What is your Google Places API key?"

2. "Will you be using the production backend (https://forkit-backend.vercel.app) or running locally?"
   - Production: Use `https://forkit-backend.vercel.app`
   - Local: Use `http://localhost:3000`

**Create .env file:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with user's values
# EXPO_PUBLIC_BACKEND_URL=https://forkit-backend.vercel.app (or http://localhost:3000)
```

**Claude should use Edit tool to update .env with the user's provided values**

### 3.4 Login to Expo

```bash
eas login
```

**Ask user:** "Please log in to your Expo account when prompted in the browser."

### 3.5 Verify configuration

```bash
# Check app.json is properly configured
cat app.json | grep -E "(name|slug|version|package|bundleIdentifier)"

# Verify .env exists and has correct values
cat .env
```

---

## STEP 4: Set Up Backend (forkit-backend)

### 4.1 Navigate to backend directory
```bash
cd ../forkit-backend
```

### 4.2 Install dependencies
```bash
npm install
```

### 4.3 Configure backend environment variables

**Ask user for:**
1. "What is your Google Places API key?" (same as mobile app)
2. "What is your Google Cloud Project Number?"
   - If they don't know: "You can find this in Google Cloud Console > Project Settings"
   - Guide: "Go to https://console.cloud.google.com/ → Select your project → Click gear icon → Copy 'Project number'"

**Create .env file:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with user's values
# GOOGLE_PLACES_API_KEY=user_provided_key
# GOOGLE_CLOUD_PROJECT_NUMBER=user_provided_number
```

**Claude should use Edit tool to update .env with the user's provided values**

### 4.4 Test backend locally (optional)

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Start local dev server
npm run dev
```

**Ask user:** "Backend is running at http://localhost:3000. Would you like to test it before proceeding?"

---

## STEP 5: Run Development Build

### 5.1 Start Expo dev server

```bash
cd ../AppFiles
npx expo start
```

**Ask user:**
- "Would you like to run on:"
  - "1. Android device/emulator (scan QR with Expo Go)"
  - "2. iOS simulator (macOS only)"
  - "3. Web browser"

### 5.2 Test basic functionality

**Guide user to verify:**
- App launches successfully
- Location permission prompt appears
- Can search for restaurants
- Filters work correctly
- "Fork It Now" button works
- Restaurant details load
- Recipe links open
- Google Maps integration works

---

## STEP 6: Optional - Build Production APK/AAB

Only proceed if user explicitly requests production build.

### 6.1 Configure EAS Build

```bash
cd AppFiles

# Initialize EAS (if not already done)
eas init --id 0abe90d5-587c-4918-ad8b-7d472c687ace
```

### 6.2 Set up EAS Secrets (for production security)

**Ask user:** "Would you like to set up EAS secrets for production builds? This keeps your API key secure."

```bash
# Create secret for API key
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_PLACES_API_KEY --value "USER_PROVIDED_KEY"

# Verify
eas secret:list
```

### 6.3 Build for Android

```bash
# Development build (for testing with full features)
eas build --profile development --platform android

# Production build (for Play Store)
eas build --profile production --platform android
```

**Note to user:** "Build will take 15-20 minutes. You can monitor progress at https://expo.dev"

### 6.4 Build for iOS (macOS only)

```bash
eas build --profile production --platform ios
```

---

## STEP 7: Deploy Backend to Vercel (Optional)

Only if user wants to deploy their own backend instance.

### 7.1 Login to Vercel

```bash
cd ../forkit-backend
vercel login
```

### 7.2 Add environment variables to Vercel

```bash
vercel env add GOOGLE_PLACES_API_KEY
# Enter the key when prompted

vercel env add GOOGLE_CLOUD_PROJECT_NUMBER
# Enter the project number when prompted
```

### 7.3 Deploy

```bash
npm run deploy
# Or: vercel --prod
```

**Note the deployment URL** and update mobile app's .env:
```bash
cd ../AppFiles
# Update EXPO_PUBLIC_BACKEND_URL in .env to the Vercel URL
```

---

## Creating Google Places API Key

If user doesn't have an API key, guide them:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable required APIs:**
   ```
   - Go to "APIs & Services" → "Library"
   - Search for "Places API (New)" → Click "Enable"
   - Search for "Play Integrity API" → Click "Enable"
   ```

3. **Create API Key:**
   ```
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key
   ```

4. **Restrict API Key (Important for production):**
   ```
   - Click on the API key to edit
   - Under "Application restrictions":
     - For development: Leave unrestricted
     - For production: Choose "Android apps"
       - Package name: com.forkit.app
       - SHA-1: Get from `eas credentials`
   - Under "API restrictions":
     - Select "Restrict key"
     - Check "Places API (New)"
   - Save
   ```

5. **Get Project Number:**
   ```
   - Click the gear icon (Project Settings)
   - Copy the "Project number"
   ```

---

## Project Structure Reference

```
forkit/
├── AppFiles/                          # Mobile app (React Native/Expo)
│   ├── App.js                        # Main app logic
│   ├── app.json                      # Expo configuration
│   ├── eas.json                      # EAS Build configuration
│   ├── package.json                  # Dependencies
│   ├── .env                          # Environment variables (create from .env.example)
│   ├── .env.example                  # Template
│   ├── assets/                       # Icons, images, splash screen
│   ├── components/                   # React components
│   └── utils/                        # Utility functions
│
├── forkit-backend/                   # Backend API (Vercel serverless)
│   ├── api/                          # API endpoints
│   │   ├── places-nearby.js         # Search nearby restaurants
│   │   ├── places-details.js        # Get place details
│   │   └── verify-integrity.js      # Play Integrity verification
│   ├── package.json                  # Dependencies
│   ├── .env                          # Environment variables (create from .env.example)
│   ├── .env.example                  # Template
│   ├── vercel.json                   # Vercel configuration
│   └── README.md                     # Backend documentation
│
├── docs/                              # GitHub Pages (privacy policy hosting)
├── screenshot/                        # App screenshots for stores
│
├── README.md                          # Main project README
├── START_HERE.md                      # Deployment package overview
├── CLAUDE-FORKIT.md                   # This file - setup guide
│
├── DEPLOYMENT_README.md               # Complete deployment guide
├── DEV_BUILD_GUIDE.md                 # Development build testing
├── DEVELOPMENT_WORKFLOW.md            # Development workflow and best practices
│
├── PLAY_STORE_DEPLOYMENT.md           # Play Store deployment guide
├── GOOGLE_PLAY_CONSOLE_SETUP.md       # Play Console setup steps
├── PLAY_STORE_ASSETS_GUIDE.md         # Creating store assets
│
├── IOS_QUICK_START.md                 # iOS deployment quick start
├── IOS_APP_STORE_DEPLOYMENT.md        # Complete iOS deployment guide
│
├── API_KEY_SECURITY.md                # API key security best practices
├── PRIVACY_POLICY.md                  # App privacy policy
├── LICENSE                            # MIT License
└── prd.md                            # Product requirements document
```

---

## Common Issues & Troubleshooting

### Issue: "Module not found" errors
**Solution:**
```bash
cd AppFiles
rm -rf node_modules package-lock.json
npm install
```

### Issue: "GOOGLE_PLACES_API_KEY is not defined"
**Solution:**
```bash
# Verify .env file exists in AppFiles/
ls -la AppFiles/.env

# Check contents
cat AppFiles/.env

# Restart Expo dev server after .env changes
cd AppFiles
npx expo start --clear
```

### Issue: Backend not connecting
**Solution:**
```bash
# Check backend URL in .env
cat AppFiles/.env | grep BACKEND_URL

# If using local backend, ensure it's running:
cd forkit-backend
npm run dev

# Test backend endpoint:
curl http://localhost:3000/api/places-nearby -X POST -H "Content-Type: application/json" -d '{"latitude":37.7749,"longitude":-122.4194,"radius":5000}'
```

### Issue: EAS build fails
**Solution:**
```bash
# Clear cache and rebuild
cd AppFiles
eas build --platform android --profile production --clear-cache

# Check EAS secrets are set
eas secret:list

# Verify app.json and eas.json are correct
cat app.json
cat eas.json
```

### Issue: "Expo account not found"
**Solution:**
```bash
# Logout and login again
eas logout
eas login

# Verify account
eas whoami
```

---

## Verification Checklist

After setup, Claude should verify:

### Mobile App (AppFiles)
- [ ] Node modules installed (`node_modules/` directory exists)
- [ ] `.env` file created with correct values
- [ ] Can start Expo dev server (`npx expo start`)
- [ ] App loads in Expo Go or dev build
- [ ] Location permission works
- [ ] Can search for restaurants
- [ ] Backend connection works

### Backend (forkit-backend)
- [ ] Node modules installed (`node_modules/` directory exists)
- [ ] `.env` file created with correct values
- [ ] Can start local server (`npm run dev`)
- [ ] API endpoints respond correctly
- [ ] (Optional) Deployed to Vercel successfully

### Build System
- [ ] Expo CLI installed and accessible
- [ ] EAS CLI installed and accessible
- [ ] Logged into Expo account
- [ ] EAS project initialized correctly
- [ ] (Optional) EAS secrets configured

### Documentation Reviewed
- [ ] User has reviewed README.md
- [ ] User knows where to find deployment guides
- [ ] User understands project structure

---

## Quick Command Reference

### Development
```bash
# Start mobile app dev server
cd AppFiles && npx expo start

# Start backend dev server
cd forkit-backend && npm run dev

# Run on Android
cd AppFiles && npx expo start --android

# Run on iOS (macOS only)
cd AppFiles && npx expo start --ios

# Clear cache
cd AppFiles && npx expo start --clear
```

### Building
```bash
# Development build
cd AppFiles && eas build --profile development --platform android

# Production build for Android
cd AppFiles && eas build --profile production --platform android

# Production build for iOS
cd AppFiles && eas build --profile production --platform ios
```

### Backend
```bash
# Deploy backend to Vercel
cd forkit-backend && npm run deploy

# View backend logs
vercel logs
```

---

## What Claude Should Ask User During Setup

### Initial Questions
1. "Where would you like to clone the ForkIt repository?"
2. "Do you have an Expo account? What's your username?"
3. "Do you have a Google Cloud account with Places API enabled?"

### Environment Setup
4. "What is your Google Places API key?"
5. "What is your Google Cloud Project Number?"
6. "Will you be using the production backend (https://forkit-backend.vercel.app) or running locally?"

### Development Preferences
7. "Would you like to run the app on Android, iOS, or web?"
8. "Do you need to set up the backend, or just the mobile app?"
9. "Are you planning to build for production, or just development?"

### Optional Steps
10. "Would you like to deploy your own backend instance to Vercel?"
11. "Would you like to configure EAS secrets for production builds?"
12. "Would you like me to guide you through creating a Google Places API key?"

---

## Success Criteria

Setup is complete when:

1. **Mobile app runs successfully** - User can open app in Expo Go or dev build
2. **Backend responds** - API endpoints return data
3. **Core features work** - Location permission, restaurant search, filters
4. **User can make changes** - Can edit code and see hot reload
5. **Build system configured** - Can create production builds if needed

---

## Next Steps After Setup

Guide user to:

1. **Read Documentation:**
   - `README.md` - Project overview
   - `START_HERE.md` - Deployment roadmap
   - `DEVELOPMENT_WORKFLOW.md` - Development best practices

2. **Test Features:**
   - Search for restaurants in different locations
   - Try all filters
   - Test Hidden Gems mode
   - Verify recipe links work
   - Test phone and maps integration

3. **Make Changes:**
   - Customize app colors/branding
   - Adjust filter defaults
   - Modify loading messages
   - Update signature dish database

4. **Deployment (when ready):**
   - Follow `DEPLOYMENT_README.md` for Play Store
   - Follow `IOS_QUICK_START.md` for App Store
   - Configure API key restrictions for production
   - Set up EAS secrets

---

## Important Security Notes

### API Key Security
- **Development:** API key can be in `.env` file
- **Production:** Must use EAS Secrets + restricted API key
- **Never commit** `.env` files to version control (already in `.gitignore`)

### API Key Restrictions
For production builds:
1. Restrict to package name: `com.forkit.app`
2. Add SHA-1 fingerprint (get from `eas credentials`)
3. Restrict to Places API (New) only
4. Consider implementing backend proxy for all API calls

### Environment Files
```
# These should NEVER be committed:
AppFiles/.env
forkit-backend/.env
forkit-backend/google-play-service-account.json

# These are safe to commit:
AppFiles/.env.example
forkit-backend/.env.example
```

---

## Support & Resources

### Documentation
- **Main README:** `README.md`
- **Deployment:** `DEPLOYMENT_README.md`, `START_HERE.md`
- **Development:** `DEV_BUILD_GUIDE.md`, `DEVELOPMENT_WORKFLOW.md`
- **Platform Specific:** `PLAY_STORE_DEPLOYMENT.md`, `IOS_QUICK_START.md`

### External Resources
- **Expo Docs:** https://docs.expo.dev/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Google Places API:** https://developers.google.com/maps/documentation/places/web-service/overview
- **Vercel Docs:** https://vercel.com/docs

### Getting Help
- **GitHub Issues:** https://github.com/CherrelleTucker/forkit/issues
- **Expo Forums:** https://forums.expo.dev/
- **Stack Overflow:** Tag with `expo`, `react-native`, `google-places-api`

---

## Version Information

- **ForkIt Version:** 1.0.0
- **Last Updated:** January 2026
- **Status:** Production-ready (Android), iOS-ready (pending launch)
- **License:** MIT

---

**Fork indecision. Fork regret. Fork it all. 🍴**

*This setup guide is designed to be read and executed by Claude Code. Human users can follow along or simply say "Claude, set up ForkIt" after reading this file.*
