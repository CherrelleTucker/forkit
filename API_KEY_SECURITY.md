# Google Places API Key Security Guide

## Current Status

✅ **API Key moved to environment variables** (`.env`)
✅ **`.gitignore` updated** to prevent committing `.env`
✅ **EAS Build configured** to use secrets or environment variables

---

## Security Levels

### Level 1: Basic Protection (Current - OK for Testing)

**What's done:**
- API key in `.env` (not in source code)
- `.gitignore` excludes `.env`

**Risk:**
- Key is still in client app (can be extracted from APK/AAB)
- Anyone with the APK can decompile and find the key

**When this is OK:**
- Internal testing with friends
- Low usage volume
- Restricted API key (see below)

---

## Level 2: API Key Restrictions (Recommended for MVP)

### Step 1: Get Your App's SHA-1 Fingerprint

```bash
# For EAS Build managed keystore
eas credentials

# Select:
# 1. Android
# 2. Production
# 3. Keystore
# 4. View credentials

# Copy the SHA-1 fingerprint
```

### Step 2: Restrict API Key in Google Cloud Console

1. Go to https://console.cloud.google.com/google/maps-apis/credentials
2. Click on your API key
3. **Application restrictions:**
   - Select "Android apps"
   - Click "Add an item"
   - **Package name:** `com.forkit.app`
   - **SHA-1 certificate fingerprint:** [Paste from EAS credentials]
4. **API restrictions:**
   - Select "Restrict key"
   - Check only:
     - Places API
     - Maps SDK for Android (if using maps)
5. **Save**

**Now your API key:**
- Only works with ForkIt app
- Only works with Places API
- Can't be abused even if extracted

---

## Level 3: Backend Proxy (Best Practice for Production)

### Why Use a Backend?

**Benefits:**
- API key never in client code
- Full control over requests
- Can implement rate limiting
- Can add analytics
- Can cache responses
- Can add custom logic

**Trade-offs:**
- More complex setup
- Requires server (costs money)
- Adds latency (minimal if done right)

### Simple Backend Options

#### Option A: Vercel Serverless Function (Free Tier Available)

**Create backend:**
```javascript
// api/places-search.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { lat, lng, radius, keyword, opennow } = req.query;

  // Validate request (prevent abuse)
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  const params = new URLSearchParams({
    key: process.env.GOOGLE_PLACES_API_KEY,
    location: `${lat},${lng}`,
    radius: radius || '5000',
    type: 'restaurant',
  });

  if (keyword) params.set('keyword', keyword);
  if (opennow) params.set('opennow', 'true');

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Places API error' });
  }
};
```

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel login
vercel deploy
```

**Update ForkIt to use backend:**
```javascript
// In App.js, replace direct Places API call with:
const BACKEND_URL = "https://your-app.vercel.app/api/places-search";

const url = `${BACKEND_URL}?lat=${latitude}&lng=${longitude}&radius=${radiusMeters}&keyword=${cuisineKeyword}&opennow=${openNow}`;
const data = await fetchJson(url);
```

#### Option B: AWS Lambda (Free Tier Available)

Similar setup using AWS Lambda + API Gateway.

#### Option C: Firebase Cloud Functions (Free Tier Available)

Similar setup using Firebase Functions.

---

## Level 4: Additional Security Measures

### 1. Rate Limiting

**In your backend proxy:**
```javascript
// Use Redis or in-memory store to track requests per user/IP
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
});

app.use('/api/places-search', limiter);
```

### 2. Request Validation

**Validate all parameters:**
```javascript
// Ensure radius is reasonable
if (radius < 100 || radius > 50000) {
  return res.status(400).json({ error: 'Invalid radius' });
}

// Ensure coordinates are valid
if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
  return res.status(400).json({ error: 'Invalid coordinates' });
}
```

### 3. Response Caching

**Cache common requests:**
```javascript
// Use Redis or similar
const cache = new Map();

const cacheKey = `${lat},${lng},${radius},${keyword}`;
if (cache.has(cacheKey)) {
  return res.json(cache.get(cacheKey));
}

// Fetch from API and cache for 5 minutes
const data = await fetchPlaces(...);
cache.set(cacheKey, data);
setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
res.json(data);
```

### 4. Usage Monitoring

**In Google Cloud Console:**
1. Go to APIs & Services → Dashboard
2. Select Places API
3. View quotas and usage
4. Set up alerts for unusual activity

---

## Recommended Approach for ForkIt

### For Internal Testing (Now)
✅ **Level 1 + Level 2:**
- Keep API key in `.env` / EAS Secrets
- Restrict API key to your app's package name and SHA-1
- Monitor usage in Google Cloud Console

### For Public Launch (Later)
🎯 **Level 3:**
- Implement backend proxy (Vercel/AWS/Firebase)
- Move API key completely to backend
- Add rate limiting and caching

---

## Cost Considerations

### Google Places API Pricing

**Nearby Search:**
- $17 per 1,000 requests
- $200 free credit per month (11,764 free requests)

**Place Details:**
- Basic fields: Free
- Contact fields: $3 per 1,000 requests
- Atmosphere fields: $5 per 1,000 requests

**Your free monthly usage:**
- ~11,700 searches before charges
- For 100 users searching 3x/day = ~9,000 searches/month
- **You're safe under free tier for testing**

### Monitoring Usage

**Set up billing alerts:**
1. Google Cloud Console → Billing
2. Create alert at $10, $50, $100 thresholds
3. Get email notifications if usage spikes

---

## Implementation Timeline

### Week 1-2: Internal Testing
- Use Level 1 + Level 2 (restricted API key)
- Monitor usage
- Acceptable risk for small tester group

### Week 3-4: Closed Testing
- Consider implementing Level 3 (backend proxy)
- More testers = more potential for key extraction
- Recommended if >100 testers

### Before Production Launch
- MUST implement Level 3 (backend proxy)
- Add rate limiting
- Add caching
- Set up usage monitoring and alerts

---

## Emergency: Key Compromised

**If your API key is exposed or abused:**

1. **Immediately regenerate key:**
   - Google Cloud Console → Credentials
   - Create new API key
   - Restrict it immediately

2. **Delete old key**

3. **Update all instances:**
   - Update `.env` locally
   - Update EAS Secret:
     ```bash
     eas secret:delete --name EXPO_PUBLIC_GOOGLE_PLACES_API_KEY
     eas secret:create --name EXPO_PUBLIC_GOOGLE_PLACES_API_KEY --value "NEW_KEY"
     ```
   - Rebuild app:
     ```bash
     eas build --platform android --profile production
     ```
   - Upload new AAB to Play Console

4. **Force update if needed:**
   - If old app is widely distributed, push OTA update with new key
   - OR deprecate old version in Play Console

---

## Current ForkIt Configuration

### .env (Local Development)
```bash
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyCmCBxQKEeX24RoVjOHSWqIW4wlFOVncAs
```

### App.js (Updated)
```javascript
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
```

### EAS Build (Production)
**Option 1: EAS Secret**
```bash
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_PLACES_API_KEY --value "YOUR_KEY"
```

**Option 2: eas.json env**
```json
"production": {
  "env": {
    "EXPO_PUBLIC_GOOGLE_PLACES_API_KEY": "YOUR_KEY"
  }
}
```

---

## Action Items

### Now (Before Building AAB)

1. **Restrict your API key:**
   - [ ] Get SHA-1 fingerprint from EAS credentials
   - [ ] Add package name and SHA-1 to API key restrictions
   - [ ] Restrict to Places API only
   - [ ] Save restrictions

2. **Set up monitoring:**
   - [ ] Enable billing alerts in Google Cloud Console
   - [ ] Set alerts at $10, $50, $100

3. **Configure EAS Secret:**
   - [ ] Run: `eas secret:create --name EXPO_PUBLIC_GOOGLE_PLACES_API_KEY --value "YOUR_KEY"`
   - [ ] Verify: `eas secret:list`

### Before Public Launch (After Internal Testing)

- [ ] Implement backend proxy (Vercel/AWS/Firebase)
- [ ] Update ForkIt to call backend instead of Places API directly
- [ ] Add rate limiting to backend
- [ ] Add response caching
- [ ] Remove API key from client entirely
- [ ] Test thoroughly
- [ ] Deploy backend
- [ ] Rebuild app with backend URL

---

## Summary

| Security Level | When to Use | Setup Time | Monthly Cost |
|----------------|-------------|------------|--------------|
| Level 1: Env Variables | Development | 5 min | $0 |
| Level 2: Restricted Key | Internal Testing | 10 min | $0 (under free tier) |
| Level 3: Backend Proxy | Public Launch | 2-4 hours | $0 (free tier) to $5-10 |
| Level 4: Full Security | High-traffic Production | 8+ hours | $10-50+ |

**Recommendation for ForkIt MVP:**
Start with Level 2, move to Level 3 before public launch.

---

## Resources

- **API Key Best Practices:** https://cloud.google.com/docs/authentication/api-keys
- **Places API Docs:** https://developers.google.com/maps/documentation/places/web-service
- **EAS Secrets:** https://docs.expo.dev/build-reference/variables/#using-secrets-in-environment-variables
- **Vercel Docs:** https://vercel.com/docs/functions/serverless-functions

---

**Your API key is currently secure enough for testing. Implement backend proxy before public launch.** 🔒
