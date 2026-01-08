# ForkIt Development Build Testing Guide

## Why Development Build?

Development builds include native modules (like @expo/app-integrity) that don't work in Expo Go or Snack.

**Use this for:**
- Full Play Integrity testing
- Production-like environment
- Testing before pushing to internal testers

## Create Development Build

### 1. Create Development Build

```bash
cd ForkIt/AppFiles

# Create dev client for Android
eas build --profile development --platform android
```

### 2. Install on Device

Once build completes (~10-15 minutes):
1. Download APK from EAS build page
2. Install on your Android device
3. Open the app

### 3. Start Dev Server

```bash
cd ForkIt/AppFiles
npx expo start --dev-client
```

### 4. Connect App to Dev Server

1. Shake device or press Ctrl+M (Android)
2. Tap "Settings"
3. Enter dev server URL
4. Reload app

## What to Test

### ✅ Full Feature Testing

1. **Play Integrity** (Now works!)
   - Check console: "Play Integrity verification result: ..."
   - Should show actual token verification

2. **Variety Improvements**
   - Search multiple times
   - Verify different restaurants
   - Check exclusion count

3. **Backend Connection**
   - Verify https://forkit-backend.vercel.app connections
   - Check network tab for API calls

4. **All Features**
   - Location permissions
   - Filters
   - Place details
   - Recipe links
   - Everything works as production

## Development Build vs Production Build

| Feature | Dev Build | Production Build |
|---------|-----------|------------------|
| Hot Reload | ✅ Yes | ❌ No |
| Debug Tools | ✅ Yes | ❌ No |
| Connects to Dev Server | ✅ Yes | ❌ No |
| Play Integrity | ✅ Works | ✅ Works |
| Size | Larger | Optimized |
| Use Case | Testing | Release to users |

## Configure Development Profile

Your `eas.json` should have:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

## Quick Commands

```bash
# Build dev client
eas build --profile development --platform android

# Start dev server (after installing dev build on device)
npx expo start --dev-client

# Build for production (when ready for testers)
eas build --profile production --platform android
```

## Tips

1. **Keep dev build installed**: You can use same dev build for multiple code changes
2. **Fast iteration**: Make code changes → Save → App hot reloads
3. **Full debugging**: Use React DevTools, console logs, network inspector
4. **Real device**: Must test on physical device (emulator has limited Play Integrity)

## When to Use Each Build Type

**Development Build:**
- Daily development
- Testing new features
- Debugging issues
- Before submitting to testers

**Production Build:**
- Internal testing releases
- Beta testing
- Production releases
- When you need AAB for Play Store

## Current Status

Your app is production-ready, but if you want to:
- Test Play Integrity fully → Use development build
- Just test variety feature → Use Snack (faster)
- Release to testers → Use production build (what you're already doing)
