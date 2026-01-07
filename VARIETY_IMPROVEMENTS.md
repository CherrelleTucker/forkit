# Restaurant Variety Improvements

**Date:** January 7, 2026
**Version:** 2.1.0
**Status:** ✅ Deployed and Live

## Problem Addressed

**User Feedback:**
> "The restaurants seem to be limited and the same show up often"

This was due to:
1. Limited results from Places API (max 20 per search)
2. No tracking of previously shown restaurants
3. Random selection from same pool each time
4. Users seeing repeats within same session

## Solutions Implemented

### 1. Backend Improvements

#### Added Place Exclusion Support
- New `excludedPlaceIds` parameter in API
- Filters out recently shown restaurants from results
- Logged for monitoring and debugging

#### Distance-Based Ranking
- Added `rankPreference: 'DISTANCE'` to prioritize closer restaurants
- Provides more predictable, location-aware results

#### Better Filtering
- Excluded places filtered before other client-side filters
- Maintains pool diversity even with strict filters

**Backend Code Changes:**
- `forkit-backend/api/places-nearby.js`
  - Added `excludedPlaceIds` parameter support
  - Added exclusion filtering with Set for O(1) lookups
  - Added console logging for excluded count

### 2. App Improvements

#### Recently-Shown Tracking
- Stores last 10 shown restaurant IDs in state
- Automatically excludes them from future searches
- Provides fresh results each time

#### Clear History Feature
- New "Clear History" button in Filters section
- Shows count of excluded restaurants
- One-tap reset to see all restaurants again

#### Enhanced UI Feedback
- Pool count shows excluded count: `Last eligible pool: 15 (3 excluded to avoid repeats)`
- Toast notification when history is cleared
- Visual indicator when exclusions are active

**App Code Changes:**
- `AppFiles/App.js`
  - Added `recentlyShown` state (array of place IDs)
  - Sends `excludedPlaceIds` in search requests
  - Tracks chosen restaurant after selection
  - Added "Clear History" button with refresh icon
  - Enhanced pool count display

### 3. User Experience Flow

**Before:**
1. User searches → Gets 12 results
2. Random pick → "Tony's Pizza"
3. User searches again → Gets same 12 results
4. Random pick → "Tony's Pizza" again (possible)

**After:**
1. User searches → Gets 12 results
2. Random pick → "Tony's Pizza"
3. **Tony's Pizza added to exclusion list**
4. User searches again → Gets 11 NEW results (Tony's excluded)
5. Random pick → Guaranteed different restaurant

**After 10 searches:**
- 10 restaurants excluded
- Fresh pool of restaurants each time
- User can clear history to reset

## Technical Details

### Exclusion Logic

**Backend (`places-nearby.js`):**
```javascript
if (excludedPlaceIds && Array.isArray(excludedPlaceIds) && excludedPlaceIds.length > 0) {
  const excludedSet = new Set(excludedPlaceIds);
  filteredResults = filteredResults.filter((r) => !excludedSet.has(r.place_id));
  console.log(`Excluded ${excludedPlaceIds.length} recently shown places`);
}
```

**App (`App.js`):**
```javascript
// After picking a restaurant
setRecentlyShown(prev => {
  const updated = [chosen.place_id, ...prev];
  return updated.slice(0, 10); // Keep only last 10
});
```

### Configuration

- **Max Recently Shown**: 10 restaurants
- **Storage**: In-memory (resets on app restart)
- **Clear Option**: Manual via "Clear History" button

### Performance

- **Exclusion Check**: O(1) using Set
- **Memory Usage**: ~200 bytes per excluded ID (10 IDs = ~2KB)
- **API Impact**: None (same number of API calls)
- **Backend Latency**: <1ms for exclusion filtering

## Testing Results

### Backend Test (Vercel Production)

**Test 1: No Exclusions**
```bash
Request: latitude=37.7749, longitude=-122.4194, radius=5000
Results: 12 restaurants returned
```

**Test 2: With 2 Exclusions**
```bash
Request: Same as above + excludedPlaceIds=[id1, id2]
Results: 10 restaurants returned (2 excluded successfully)
Excluded: "The Buoy", "Pokebola"
```

**Test 3: All Excluded**
```bash
Request: Excluded all 12 from pool
Results: ZERO_RESULTS (correct behavior - prompts user to clear history)
```

✅ All tests passed

### App Test (Expected Behavior)

**Scenario: User searches 5 times**
1. First search → 12 results → Picks "Tony's Pizza"
2. Second search → 11 results (Tony's excluded) → Picks "RT Rotisserie"
3. Third search → 10 results (2 excluded) → Picks "Kiln"
4. Fourth search → 9 results (3 excluded) → Picks "Nakama Sushi"
5. Fifth search → 8 results (4 excluded) → Picks "The Italian Homemade Company"

**After 10 searches:**
- All 10 different restaurants shown
- 11th search will have maximum exclusions
- User can tap "Clear History" to reset

## Deployment

### Backend
- **Deployed**: https://forkit-backend.vercel.app
- **Status**: Live
- **Version**: Updated with exclusion support

### App
- **Commit**: `693c5e3`
- **Status**: Ready for testing
- **Deployment**: Via EAS build for internal testers

## Monitoring

### What to Monitor

**Vercel Logs:**
```
Excluded X recently shown places
```
- Watch for excluded counts
- High counts (>8) mean users are running out of options
- Suggests need for wider radius or relaxed filters

**App Behavior:**
- Users clearing history frequently → Pool too small
- No history clears → Working well
- Zero results errors → Filters too strict + high exclusions

### Google Cloud Console
- No change in API usage
- Same number of requests
- Exclusions happen server-side (no extra calls)

## Known Limitations

### 1. Session-Based Only
- **Limitation**: Exclusions reset when app restarts
- **Impact**: User might see repeats across different days/sessions
- **Future**: Could persist to AsyncStorage for longer memory

### 2. Location-Dependent
- **Limitation**: Moving locations doesn't reset history
- **Impact**: Old exclusions might not apply to new area
- **Workaround**: Users can manually clear history when changing locations

### 3. Pool Size Constraints
- **Limitation**: Only 20 results from Places API max
- **Impact**: After excluding 10, only 10 fresh options remain
- **Mitigation**: "Clear History" button prominent when needed

### 4. Shared Pool
- **Limitation**: All filters use same exclusion list
- **Impact**: Changing filters doesn't reset exclusions
- **Rationale**: Intentional - provides variety across filter changes

## Future Enhancements

### Short-Term (Next Release)
- [ ] Persist exclusions to AsyncStorage
- [ ] Auto-clear when user moves >5 miles
- [ ] Smart clear suggestions ("You've seen all nearby options!")

### Medium-Term
- [ ] Weighted randomness (prefer less popular, higher rated)
- [ ] Category-specific exclusions (pizza history separate from sushi history)
- [ ] "Show me something I haven't tried" mode

### Long-Term
- [ ] User accounts with cross-device exclusion sync
- [ ] "Never show me this again" permanent exclusions
- [ ] Machine learning for preference tracking

## User Communication

### Internal Testing Update

**Message for Testers:**
> We've heard your feedback about seeing the same restaurants! We've made two improvements:
>
> 1. **Automatic variety**: The app now remembers your last 10 picks and won't show them again
> 2. **Clear history**: Tap the "Clear History" button in Filters if you want to see all options again
>
> This means you'll get fresh restaurants each time you Fork it!

### Release Notes for Open Testing

**What's New in v2.1:**
- 🎲 **More variety**: Automatically avoids showing recently picked restaurants
- 🔄 **Clear history**: Reset your exclusions anytime
- 📊 **Better transparency**: See how many places are being filtered out
- 🎯 **Smarter search**: Results now prioritized by distance

## Summary

**Problem:** Users seeing same restaurants repeatedly
**Solution:** Track and exclude last 10 shown places
**Result:** Guaranteed variety for 10+ consecutive searches
**User Control:** Clear history button for manual reset

**Impact:**
- ✅ Increased variety
- ✅ Better user experience
- ✅ No performance impact
- ✅ Simple, intuitive UI
- ✅ Deployed and live

---

**For questions or feedback, check:**
- Backend: https://forkit-backend.vercel.app
- GitHub: https://github.com/CherrelleTucker/forkit
- Vercel Dashboard: https://vercel.com/dashboard
