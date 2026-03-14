// ForkIt — Main app (App.js)

import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BlockedModal from './components/BlockedModal';
import Chip from './components/Chip';
import CustomPlacesModal from './components/CustomPlacesModal';
import FavoritesModal from './components/FavoritesModal';
import FeaturePills from './components/FeaturePills';
import ForkIcon from './components/ForkIcon';
import GhostButton from './components/GhostButton';
import GlassCard from './components/GlassCard';
import GroupForkModal from './components/GroupForkModal';
import InfoModal from './components/InfoModal';
import LocationSearchSection from './components/LocationSearchSection';
import PrimaryButton from './components/PrimaryButton';
import Toast from './components/Toast';
import TourOverlay from './components/TourOverlay';
import UsageHint from './components/UsageHint';
import {
  BACKEND_URL,
  TOAST_SHORT,
  TOAST_DEFAULT,
  TOAST_LONG,
  FETCH_TIMEOUT,
  DEBOUNCE_DELAY,
  THROTTLE_WINDOW,
  THROTTLE_MAX_TAPS,
  RECENTLY_SHOWN_MAX,
  POOL_STALE_MS,
  WALK_RESULTS_THRESHOLD,
  CLOSING_SOON_EXCLUDE_MIN,
  MILES_TO_METERS,
  HTTP_TOO_MANY_REQUESTS,
  BOUNCE_OFFSET,
  DEFAULT_TOAST_MS,
  THROTTLE_TOAST_MS,
  WALK_SUGGEST_DELAY,
  SLOT_BASE_DELAY,
  SLOT_INCREMENT,
  SLOT_MIN_CYCLES,
  SLOT_MAX_CYCLES,
  DRAMATIC_PAUSE,
  FAV_TOAST_MS,
  RATING_LOW,
  RATING_DEFAULT,
  RATING_HIGH,
  RATING_TOP,
  WALK_RADIUS_MAX,
  WALK_RADIUS_DEFAULT,
  DRIVE_RADIUS_MIN,
  DRIVE_RADIUS_DEFAULT,
  RADIUS_CLAMP_MIN,
  RADIUS_CLAMP_MAX,
  TITLE_FONT_SIZE,
  TITLE_LINE_HEIGHT,
  GROUP_RESULT_EXPIRY_MS,
  GROUP_RESULT_TICK_MS,
} from './constants/config';
import { FORKING_LINES, SUCCESS_LINES, FAIL_LINES } from './constants/content';
import { STORAGE_KEYS } from './constants/storage';
import { THEME, scale } from './constants/theme';
import useGroupSession from './hooks/useGroupSession';
import useTour from './hooks/useTour';
import useUsage from './hooks/useUsage';
import { fetchAddressSuggestions, getPlaceDetails } from './utils/api';
import { blockPlace, isBlocked } from './utils/blocked';
import { toggleFavorite } from './utils/favorites';
import {
  safeStore,
  clamp,
  pickRandom,
  dollars,
  sleep,
  looksLikeChain,
  getSignatureDish,
  buildRecipeLinks,
  matchesExclude,
  getMinutesUntilClosing,
  getClosingSoonToast,
  openMapsSearchByText,
  callPhone,
} from './utils/helpers';
import { getIntegrityToken, verifyIntegrityToken } from './utils/integrity';
import { requestLocationPermission, getCurrentPosition } from './utils/location';
import { haptics, showAlert } from './utils/platform';
import { parseStoredState } from './utils/storageParser';

// Cap font scaling so large-font accessibility settings don't break the layout.
// Users still get ~30% larger text; anything beyond that clips fixed containers.
const MAX_FONT_SCALE = 1.3;
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.maxFontSizeMultiplier = MAX_FONT_SCALE;
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.maxFontSizeMultiplier = MAX_FONT_SCALE;

// ==============================
// APP
// ==============================

/**
 * Banner displaying the group fork result with a countdown timer.
 * @param {object} props
 * @param {string} props.groupCode - The 4-letter group session code
 * @param {string} props.resultName - Name of the picked restaurant
 * @param {number} props.resultTime - Timestamp (ms) when the result was picked
 * @param {boolean} props.isHost - Whether the current user is the session host
 * @param {() => void} props.onPress - Handler when the banner is tapped
 * @returns {JSX.Element}
 */
function ResultBanner({ groupCode, resultName, resultTime, isHost, onPress }) {
  const [minsLeft, setMinsLeft] = useState(() =>
    resultTime
      ? Math.max(
          0,
          Math.ceil((GROUP_RESULT_EXPIRY_MS - (Date.now() - resultTime)) / GROUP_RESULT_TICK_MS),
        )
      : 30,
  );

  useEffect(() => {
    if (!resultTime) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((GROUP_RESULT_EXPIRY_MS - (Date.now() - resultTime)) / GROUP_RESULT_TICK_MS),
      );
      setMinsLeft(remaining);
    }, GROUP_RESULT_TICK_MS);
    return () => clearInterval(interval);
  }, [resultTime]);

  return (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="View the group's restaurant pick"
    >
      <View style={styles.resultCardHeader}>
        <Ionicons name="restaurant" size={18} color={THEME.pop} />
        <Text style={styles.resultCardName} numberOfLines={2}>
          {resultName}
        </Text>
      </View>
      <Text style={styles.resultCardMeta}>
        {groupCode} · {isHost ? 'Hosted' : 'Joined'} · Info card expires in {minsLeft} minutes
      </Text>
      <View style={styles.resultCardCta}>
        <Text style={styles.resultCardCtaText}>Let's Forking Go!</Text>
        <Ionicons name="chevron-forward" size={14} color={THEME.pop} />
      </View>
    </TouchableOpacity>
  );
}

/**
 *
 */
export default function App() {
  // Load Montserrat Bold font
  const [fontsLoaded] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  // Location
  const [hasLocationPerm, setHasLocationPerm] = useState(false);
  const [coords, setCoords] = useState(null);

  // Filters
  const [travelMode, setTravelMode] = useState('drive'); // 'walk' or 'drive'
  const [forkMode, setForkMode] = useState('solo'); // 'solo' or 'group'
  const [radiusMiles, setRadiusMiles] = useState(3);
  const [openNow, setOpenNow] = useState(true);
  const [maxPrice, setMaxPrice] = useState(2);
  const [minRating, setMinRating] = useState(4.0);
  const [cuisineKeyword, setCuisineKeyword] = useState('');
  const [excludeKeyword, setExcludeKeyword] = useState('');
  const [hiddenGems, setHiddenGems] = useState(true);

  // Custom search location (null = GPS mode)
  const [customLocation, setCustomLocation] = useState(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  // Data
  const [loading, setLoading] = useState(false);
  const [poolCount, setPoolCount] = useState(0);

  // Recently shown tracking (avoid repeats)
  const [recentlyShown, setRecentlyShown] = useState([]);

  // Slot-style reveal state
  const [slotText, setSlotText] = useState('');
  const [picked, setPicked] = useState(null);
  const [pickedDetails, setPickedDetails] = useState(null);

  // Playful status
  const [statusLine, setStatusLine] = useState('Hungry? Just pick already.');
  const [forkingLine, setForkingLine] = useState('');
  const [toast, setToast] = useState({ text: '', kind: 'info' });
  const [showInfo, setShowInfo] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Favorites, Block list & Custom places
  const [favorites, setFavorites] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  const [customPlaces, setCustomPlaces] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [showCustomPlaces, setShowCustomPlaces] = useState(false);
  const locationDebounceRef = useRef(null);

  // savedLocations removed — all spots now stored in customPlaces

  // Animations
  const spin = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const scrollOffsetRef = useRef(0);
  const toastTimerRef = useRef(null);
  const isForkingRef = useRef(false);
  const forkTapsRef = useRef([]);
  const walkSuggestedRef = useRef(false);

  // API fetch counter for tip prompt
  const apiFetchCountRef = useRef(0);

  // Pool cache — stores fetched restaurants so subsequent taps don't hit the API
  const poolCacheRef = useRef({
    results: [], // raw results from backend
    fetchedAt: 0, // Date.now() when fetched
    filterKey: '', // serialized filter state when fetched
  });

  const spinDeg = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bounceY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BOUNCE_OFFSET],
  });

  function animateForking() {
    spin.setValue(0);
    bounce.setValue(0);

    Animated.parallel([
      Animated.timing(spin, {
        toValue: 1,
        duration: 650,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 140, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]),
    ]).start();
  }

  function showToast(text, kind = 'info', ms = DEFAULT_TOAST_MS) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, kind });
    toastTimerRef.current = setTimeout(() => {
      setToast({ text: '', kind: 'info' });
      toastTimerRef.current = null;
    }, ms);
  }

  const radiusMeters = useMemo(
    () => Math.round(clamp(radiusMiles, RADIUS_CLAMP_MIN, RADIUS_CLAMP_MAX) * MILES_TO_METERS),
    [radiusMiles],
  );

  // ──── Custom hooks ────
  const {
    showTour,
    tourStep,
    tourSpotLayout,
    tourRefs,
    startTour,
    advanceTour,
    retreatTour,
    confirmCloseTour,
  } = useTour({ filtersExpanded, setFiltersExpanded, setForkMode, scrollViewRef, scrollOffsetRef });

  const { isPro, getCurrentUsage, incrementUsage, checkQuota, showPaywall } = useUsage({
    showToast,
  });

  const group = useGroupSession({
    ensureLocation,
    customLocation,
    checkQuota,
    incrementUsage,
  });

  // Cleanup timers on unmount
  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    },
    [],
  );

  // Load persisted favorites, blocked, and custom places on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
          AsyncStorage.getItem(STORAGE_KEYS.BLOCKED),
          AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_PLACES),
          AsyncStorage.getItem(STORAGE_KEYS.TRAVEL_MODE),
          AsyncStorage.getItem(STORAGE_KEYS.API_FETCH_COUNT),
          AsyncStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS),
        ]);
        const s = parseStoredState(raw);
        if (s.favorites) {
          setFavorites(s.favorites);
          safeStore(STORAGE_KEYS.FAVORITES, s.favorites);
        }
        if (s.blockedIds) setBlockedIds(s.blockedIds);
        if (s.customPlaces) setCustomPlaces(s.customPlaces);
        if (s.travelMode) {
          setTravelMode(s.travelMode);
          if (s.travelMode === 'walk') {
            setRadiusMiles((prev) => (prev > WALK_RADIUS_MAX ? WALK_RADIUS_DEFAULT : prev));
          }
        }
        if (s.fetchCount) apiFetchCountRef.current = s.fetchCount;
        // Clean up deprecated savedLocations storage
        AsyncStorage.removeItem(STORAGE_KEYS.SAVED_LOCATIONS).catch(() => {});
      } catch (_) {
        // Storage read failures are non-critical — app works with defaults
      }
    })();
  }, []);

  // Location is deferred to first "Fork It" tap via ensureLocation() on all
  // platforms for a consistent, contextual permission prompt experience.

  // Play Integrity check — Android only, runs silently on launch
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    (async () => {
      try {
        const integrityToken = await getIntegrityToken();
        if (integrityToken && BACKEND_URL) {
          await verifyIntegrityToken(integrityToken, BACKEND_URL);
        }
      } catch (_) {
        // Silent — integrity failure doesn't block the user
      }
    })();
  }, []);

  function isThrottled() {
    const now = Date.now();
    forkTapsRef.current = forkTapsRef.current.filter((t) => now - t < THROTTLE_WINDOW);
    if (forkTapsRef.current.length >= THROTTLE_MAX_TAPS) {
      showToast('Easy there — slow down a bit!', 'warn', THROTTLE_TOAST_MS);
      return true;
    }
    forkTapsRef.current.push(now);
    return false;
  }

  async function ensureLocation() {
    if (hasLocationPerm && coords) return coords;
    const { status } = await requestLocationPermission();
    if (status !== 'granted') {
      showAlert('Location needed', 'Please enable location permissions in Settings to use ForkIt!');
      return null;
    }
    setHasLocationPerm(true);
    const loc = await getCurrentPosition();
    const newCoords = loc.coords;
    setCoords(newCoords);
    safeStore(STORAGE_KEYS.LAST_LOCATION, {
      latitude: newCoords.latitude,
      longitude: newCoords.longitude,
      timestamp: Date.now(),
    });
    showToast('Location acquired! Forking now...', 'success', TOAST_SHORT);
    return newCoords;
  }

  function handleLocationQueryChange(text) {
    setLocationQuery(text);
    setLocationSuggestions([]);
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    if (text.trim().length >= 3) {
      locationDebounceRef.current = setTimeout(async () => {
        const { suggestions } = await fetchAddressSuggestions(text, coords);
        setLocationSuggestions(suggestions);
      }, DEBOUNCE_DELAY);
    }
  }

  async function selectCustomLocation(suggestion) {
    setLocationQuery(suggestion.description);
    setLocationSuggestions([]);
    const details = await getPlaceDetails(suggestion.placeId);
    if (details?.geometry?.location) {
      setCustomLocation({
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        label: suggestion.mainText || suggestion.description,
      });
      showToast(`Searching near ${suggestion.mainText}`, 'success', TOAST_SHORT);
    } else {
      showToast('Could not get location. Try another address.', 'warn', TOAST_DEFAULT);
      setLocationQuery('');
    }
  }

  function clearCustomLocation() {
    setCustomLocation(null);
    setLocationQuery('');
    setLocationSuggestions([]);
    setShowLocationSearch(false);
    showToast('Switched back to your GPS location', 'info', TOAST_SHORT);
  }

  function handleForkError(e) {
    const code = e?.message || '';
    if (code === 'RATE_LIMIT') {
      showAlert('Slow Down', 'Too many requests. Please wait a moment and try again.');
    } else if (code === 'SERVER_ERROR') {
      showAlert('Server Error', 'Something went wrong on our end. Please try again.');
    } else if (code === 'SEARCH_FAILED') {
      showAlert(
        'Search Failed',
        'Could not complete the restaurant search. Try adjusting your filters.',
      );
    } else if (e?.name === 'AbortError' || code === 'AbortError') {
      showAlert('Timeout', 'The search took too long. Check your connection and try again.');
    } else {
      showAlert('Error', 'Something unexpected happened. Please try again.');
    }
  }

  async function fetchNearbyPlaces(currentCoords) {
    const { latitude, longitude } = currentCoords;
    const integrityToken = await getIntegrityToken();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(`${BACKEND_URL}/api/places-nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Integrity-Token': integrityToken || '',
      },
      body: JSON.stringify({
        latitude,
        longitude,
        radius: radiusMeters,
        keyword: cuisineKeyword.trim(),
        opennow: openNow,
        maxPrice,
        minRating,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.status === HTTP_TOO_MANY_REQUESTS) throw new Error('RATE_LIMIT');
    if (!response.ok) throw new Error('SERVER_ERROR');

    const data = await response.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') throw new Error('SEARCH_FAILED');

    return Array.isArray(data.results) ? data.results : [];
  }

  function filterAndEnrichResults(raw, recentOverride) {
    const recentSet = new Set(recentOverride !== undefined ? recentOverride : recentlyShown);
    const excludeTerms = excludeKeyword
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    let results = raw.filter((r) => {
      if (recentSet.has(r.place_id)) return false;
      if (isBlocked(r.place_id, r.name, blockedIds)) return false;
      if (hiddenGems && looksLikeChain(r.name, r.user_ratings_total)) return false;
      if (matchesExclude(r, excludeTerms)) return false;
      const mins = getMinutesUntilClosing(r.opening_hours);
      return mins === null || mins >= CLOSING_SOON_EXCLUDE_MIN;
    });
    const eligibleCustom = customPlaces.filter((cp) => {
      if (recentSet.has(cp.place_id)) return false;
      if (isBlocked(cp.place_id, cp.name, blockedIds)) return false;
      // Filter by exclude terms (match against name + tags)
      if (excludeTerms.length > 0) {
        const nameLower = (cp.name || '').toLowerCase();
        const tagsLower = (cp.tags || '').toLowerCase();
        if (excludeTerms.some((t) => nameLower.includes(t) || tagsLower.includes(t))) return false;
      }
      // Filter by cuisine keyword (match against tags)
      if (cuisineKeyword.trim()) {
        const kw = cuisineKeyword.trim().toLowerCase();
        const tagsLower = (cp.tags || '').toLowerCase();
        const nameLower = (cp.name || '').toLowerCase();
        if (!tagsLower.includes(kw) && !nameLower.includes(kw)) return false;
      }
      return true;
    });
    if (eligibleCustom.length > 0) {
      results = [...results, ...eligibleCustom];
    }
    return results;
  }

  function maybeNudgeWalkMode(resultCount) {
    if (walkSuggestedRef.current || travelMode !== 'drive' || resultCount < WALK_RESULTS_THRESHOLD)
      return;
    walkSuggestedRef.current = true;
    setTimeout(() => {
      showAlert('Lots of spots nearby!', 'Try switching to walk mode for closer picks.', [
        {
          text: 'Switch to Walk',
          onPress: () => {
            setTravelMode('walk');
            setRadiusMiles(WALK_RADIUS_DEFAULT);
            AsyncStorage.setItem(STORAGE_KEYS.TRAVEL_MODE, 'walk').catch(() => {});
          },
        },
        { text: 'Keep Driving', style: 'cancel' },
      ]);
    }, WALK_SUGGEST_DELAY);
  }

  async function runSlotReveal(results) {
    const cycles = Math.min(SLOT_MAX_CYCLES, Math.max(SLOT_MIN_CYCLES, results.length));
    const forkEmojis = ['🍴', '🥄', '🔱', '⚡'];
    for (let i = 0; i < cycles; i++) {
      const peek =
        i % 3 === 0 ? forkEmojis[i % 4] : results[i % results.length]?.name || 'Forking…';
      setSlotText(peek);
      await haptics.selectionAsync();
      await sleep(SLOT_BASE_DELAY + i * SLOT_INCREMENT);
    }
  }

  /**
   * Build a cache key from the current filter/location state.
   * When any of these change, the pool must be re-fetched.
   * @param {{latitude: number, longitude: number}} coords - user coordinates
   * @returns {string} serialized filter key
   */
  function buildFilterKey(coords) {
    return JSON.stringify({
      lat: coords.latitude,
      lng: coords.longitude,
      r: radiusMeters,
      kw: cuisineKeyword.trim(),
      on: openNow,
      mp: maxPrice,
      mr: minRating,
    });
  }

  /**
   * Increment the API fetch counter.
   * Called only when we actually hit the backend (not from cache).
   */
  function trackApiFetch() {
    const count = ++apiFetchCountRef.current;
    AsyncStorage.setItem(STORAGE_KEYS.API_FETCH_COUNT, String(count)).catch(() => {});
  }

  async function forkIt() {
    if (isForkingRef.current) return;
    if (isThrottled()) return;

    isForkingRef.current = true;

    if (!BACKEND_URL) {
      showAlert('Configuration Error', 'Backend URL not configured. Please check your .env file.');
      isForkingRef.current = false;
      return;
    }

    let currentCoords;
    if (customLocation) {
      currentCoords = { latitude: customLocation.latitude, longitude: customLocation.longitude };
    } else {
      try {
        currentCoords = await ensureLocation();
      } catch (_) {
        showAlert(
          'Location error',
          'Could not get your location. Please check that location services are enabled.',
        );
        isForkingRef.current = false;
        return;
      }
      if (!currentCoords) {
        isForkingRef.current = false;
        return;
      }
    }

    setLoading(true);
    setPicked(null);
    setPickedDetails(null);
    setSlotText('');
    setStatusLine('Picking…');
    setForkingLine(pickRandom(FORKING_LINES));

    try {
      animateForking();
      await haptics.selectionAsync();

      if (
        typeof currentCoords.latitude !== 'number' ||
        typeof currentCoords.longitude !== 'number'
      ) {
        showAlert('Location error', 'Could not get valid coordinates. Please try again.');
        setLoading(false);
        return;
      }

      // Check if we can reuse the cached pool
      const currentFilterKey = buildFilterKey(currentCoords);
      const cache = poolCacheRef.current;
      const cacheAge = Date.now() - cache.fetchedAt;
      const cacheValid =
        cache.results.length > 0 &&
        cache.filterKey === currentFilterKey &&
        cacheAge < POOL_STALE_MS;

      let raw;
      if (cacheValid) {
        raw = cache.results;
      } else {
        // Quota check only on actual API fetch — cached re-rolls are always free
        if (!checkQuota('solo')) {
          setLoading(false);
          isForkingRef.current = false;
          return;
        }
        raw = await fetchNearbyPlaces(currentCoords);
        // Store the full unfiltered pool in cache
        poolCacheRef.current = {
          results: raw,
          fetchedAt: Date.now(),
          filterKey: currentFilterKey,
        };
        trackApiFetch();
        incrementUsage('solo');
      }

      let results = filterAndEnrichResults(raw);

      // If the pool has places but all were recently shown, reset and cycle again
      if (!results.length && raw.length > 0 && recentlyShown.length > 0) {
        setRecentlyShown([]);
        results = filterAndEnrichResults(raw, []);
      }

      setPoolCount(results.length);
      maybeNudgeWalkMode(raw.length);

      if (!results.length) {
        await haptics.notificationAsync(haptics.NotificationFeedbackType.Warning);
        setStatusLine('Nothing matched. Try again.');
        setForkingLine('');
        showToast(pickRandom(FAIL_LINES), 'warn', TOAST_LONG);
        return;
      }

      await runSlotReveal(results);
      const chosen = pickRandom(results);
      await sleep(DRAMATIC_PAUSE);

      setPicked(chosen);
      setSlotText('');
      setFiltersExpanded(false);
      setStatusLine(pickRandom(SUCCESS_LINES));
      setForkingLine('');
      await haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
      const hurryMsg = getClosingSoonToast(
        getMinutesUntilClosing(chosen.opening_hours),
        travelMode,
        radiusMiles,
      );
      if (hurryMsg) {
        showToast(`Closing soon — ${hurryMsg}`, 'warn', TOAST_LONG);
      } else {
        showToast('Forking complete. Bon appétit! 🍴', 'success', TOAST_DEFAULT);
      }

      // Track this restaurant to avoid showing it again soon
      setRecentlyShown((prev) => [chosen.place_id, ...prev].slice(0, RECENTLY_SHOWN_MAX));

      // Scroll to top to show result
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);

      if (chosen.place_id && !chosen.isCustom) {
        setPickedDetails(await getPlaceDetails(chosen.place_id));
      } else {
        setPickedDetails(null);
      }
    } catch (e) {
      handleForkError(e);
    } finally {
      setLoading(false);
      isForkingRef.current = false;
    }
  }

  const placeName = useMemo(
    () => pickedDetails?.name || picked?.name,
    [pickedDetails?.name, picked?.name],
  );
  const signatureDish = useMemo(
    () => (placeName ? getSignatureDish(placeName) : null),
    [placeName],
  );
  const recipeLinks = useMemo(() => {
    if (!placeName || !signatureDish) return [];
    // Pass empty string for unknown signature dish to avoid "copycat copycat" in search
    const dish = signatureDish === 'Signature dish' ? '' : signatureDish;
    return buildRecipeLinks(placeName, dish);
  }, [placeName, signatureDish]);

  const rating = pickedDetails?.rating ?? picked?.rating ?? null;
  const price = pickedDetails?.price_level ?? picked?.price_level ?? null;
  const vicinity = pickedDetails?.vicinity ?? picked?.vicinity ?? '';

  const isFavorite = useMemo(
    () => (picked ? favorites.some((f) => f.place_id === picked.place_id) : false),
    [picked, favorites],
  );

  // Wait for fonts to load
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={THEME.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex1}>
      <LinearGradient colors={THEME.background} style={styles.flex1}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          onScroll={(e) => {
            scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          refreshControl={
            Platform.OS !== 'web' ? (
              <RefreshControl
                refreshing={loading}
                onRefresh={forkIt}
                tintColor={THEME.accent}
                colors={[THEME.accent]}
              />
            ) : undefined
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                Fork<Text style={styles.titleIt}>It</Text>
              </Text>
              <View
                style={styles.iconNudge}
                importantForAccessibility="no-hide-descendants"
                accessible={false}
              >
                <ForkIcon size={44} color={THEME.accent} rotation="0deg" />
              </View>
            </View>
            <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit>
              RANDOM RESTAURANT PICKER
            </Text>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroLine}>
              {statusLine} <Text style={styles.heroBold}>✨</Text>
            </Text>

            {forkMode === 'solo' ? (
              <View ref={tourRefs.forkBtn} collapsable={false}>
                <PrimaryButton
                  label={loading ? 'Picking…' : 'Just Fork It'}
                  onPress={forkIt}
                  disabled={loading}
                  loading={loading}
                  spinDeg={spinDeg}
                  bounceY={bounceY}
                />
              </View>
            ) : (
              <View ref={tourRefs.forkAroundBtn} collapsable={false}>
                <PrimaryButton
                  label="Fork Around"
                  icon="people"
                  onPress={() => {
                    if (group.groupStep === 'hosting' || group.groupStep === 'waiting') {
                      group.setShowGroupModal(true);
                      return;
                    }
                    group.resetGroupState();
                    group.setShowGroupModal(true);
                  }}
                  disabled={false}
                  loading={false}
                  spinDeg={spinDeg}
                  bounceY={bounceY}
                />
              </View>
            )}

            {!group.showGroupModal &&
              (group.groupStep === 'hosting' || group.groupStep === 'waiting') && (
                <TouchableOpacity
                  style={styles.activeSessionBanner}
                  onPress={() => group.setShowGroupModal(true)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Return to active Fork Around session"
                >
                  <Ionicons name="people" size={16} color={THEME.white} />
                  <Text style={styles.activeSessionText}>
                    {group.groupHostId ? 'Hosting' : 'Joined'} {group.groupCode} — tap to return
                  </Text>
                </TouchableOpacity>
              )}

            {!isPro() && !loading && (
              <UsageHint mode={forkMode} usage={getCurrentUsage()} onPaywall={showPaywall} />
            )}

            {!!forkingLine && loading ? (
              <Text style={styles.forkingLine}>{forkingLine}</Text>
            ) : null}

            {!!slotText && loading ? (
              <View
                style={styles.slotBox}
                importantForAccessibility="no-hide-descendants"
                accessible={false}
              >
                <Text style={styles.slotLabel}>Picking...</Text>
                <Text style={styles.slotText} numberOfLines={1}>
                  {slotText}
                </Text>
              </View>
            ) : null}

            {/* Collapsible Filters — hidden in group mode */}
            {forkMode === 'group' ? (
              <Text style={styles.groupFiltersHint}>
                Set your filters after starting a session.
              </Text>
            ) : (
              <>
                <TouchableOpacity
                  ref={tourRefs.filtersToggle}
                  onPress={() => setFiltersExpanded(!filtersExpanded)}
                  activeOpacity={0.85}
                  style={styles.filtersToggle}
                  accessibilityRole="button"
                  accessibilityLabel={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
                  accessibilityState={{ expanded: filtersExpanded }}
                >
                  <View style={styles.rowCenter}>
                    <Ionicons name="options" size={16} color={THEME.textBright} />
                    <Text style={styles.filtersToggleText} numberOfLines={1}>
                      Filters
                    </Text>
                    {!filtersExpanded && poolCount > 0 && (
                      <Text style={styles.filterCount}>{poolCount} found</Text>
                    )}
                  </View>
                  <Ionicons
                    name={filtersExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={THEME.textSubtle}
                  />
                </TouchableOpacity>

                {filtersExpanded && (
                  <View style={styles.filtersContent}>
                    <Text style={styles.label}>How far?</Text>
                    <View ref={tourRefs.distanceRow} collapsable={false} style={styles.row}>
                      {(travelMode === 'walk'
                        ? [
                            { v: 0.25, t: '¼ mi' },
                            { v: 0.5, t: '½ mi' },
                            { v: 1, t: '1 mi' },
                            { v: 1.5, t: '1½ mi' },
                          ]
                        : [
                            { v: 1, t: '1 mi' },
                            { v: 3, t: '3 mi' },
                            { v: 5, t: '5 mi' },
                            { v: 10, t: '10 mi' },
                          ]
                      ).map((m) => (
                        <Chip
                          key={m.v}
                          label={m.t}
                          icon="navigate"
                          active={radiusMiles === m.v}
                          onPress={() => setRadiusMiles(m.v)}
                        />
                      ))}
                      <Chip
                        label=""
                        icon="location"
                        active={!!customLocation || showLocationSearch}
                        onPress={() => {
                          if (customLocation) {
                            clearCustomLocation();
                          } else {
                            setShowLocationSearch((v) => !v);
                          }
                        }}
                      />
                    </View>
                    <LocationSearchSection
                      customLocation={customLocation}
                      showLocationSearch={showLocationSearch}
                      locationQuery={locationQuery}
                      locationSuggestions={locationSuggestions}
                      onQueryChange={handleLocationQueryChange}
                      onSelectSuggestion={selectCustomLocation}
                      onCancel={() => {
                        setShowLocationSearch(false);
                        setLocationQuery('');
                        setLocationSuggestions([]);
                      }}
                    />

                    <View ref={tourRefs.maxDamageRow} collapsable={false}>
                      <Text style={styles.label}>Max damage</Text>
                      <View style={styles.row}>
                        {[
                          { v: 1, t: '$' },
                          { v: 2, t: '$$' },
                          { v: 3, t: '$$$' },
                          { v: 4, t: '$$$$' },
                        ].map((p) => (
                          <Chip
                            key={p.v}
                            label={p.t}
                            icon="pricetag"
                            active={maxPrice === p.v}
                            onPress={() => setMaxPrice(p.v)}
                          />
                        ))}
                      </View>

                      <Text style={styles.label}>At least this good</Text>
                      <View style={styles.row}>
                        {[RATING_LOW, RATING_DEFAULT, RATING_HIGH, RATING_TOP].map((r) => (
                          <Chip
                            key={r}
                            label={`${r}+`}
                            icon="star"
                            active={minRating === r}
                            onPress={() => setMinRating(r)}
                          />
                        ))}
                      </View>
                    </View>

                    <View ref={tourRefs.keywordFields} collapsable={false}>
                      <Text style={styles.label}>Cuisine keyword (optional)</Text>
                      <View style={styles.inputWrap}>
                        <Ionicons name="search" size={16} color={THEME.textSubtle} />
                        <TextInput
                          value={cuisineKeyword}
                          onChangeText={setCuisineKeyword}
                          placeholder="ramen, tacos, thai…"
                          placeholderTextColor={THEME.textFaint}
                          style={styles.input}
                          accessibilityLabel="Cuisine keyword filter"
                          returnKeyType="search"
                          keyboardAppearance="dark"
                          autoCorrect={false}
                          onSubmitEditing={forkIt}
                        />
                      </View>

                      <Text style={styles.label}>Not in the mood for (optional)</Text>
                      <View style={styles.inputWrap}>
                        <Ionicons name="close-circle" size={16} color={THEME.textSubtle} />
                        <TextInput
                          value={excludeKeyword}
                          onChangeText={setExcludeKeyword}
                          placeholder="pizza, indian, sushi…"
                          placeholderTextColor={THEME.textFaint}
                          style={styles.input}
                          accessibilityLabel="Exclude cuisine filter"
                          returnKeyType="search"
                          keyboardAppearance="dark"
                          autoCorrect={false}
                          onSubmitEditing={forkIt}
                        />
                      </View>
                    </View>

                    <View ref={tourRefs.openNowRow} collapsable={false} style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Open now</Text>
                      <Chip
                        label={openNow ? 'ON' : 'OFF'}
                        icon="time"
                        active={openNow}
                        onPress={() => setOpenNow((v) => !v)}
                      />
                    </View>

                    <View ref={tourRefs.hiddenGemsRow} collapsable={false} style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Skip the chains</Text>
                      <Chip
                        label={hiddenGems ? 'ON' : 'OFF'}
                        icon="sparkles"
                        active={hiddenGems}
                        onPress={() => setHiddenGems((v) => !v)}
                      />
                    </View>

                    {recentlyShown.length > 0 && (
                      <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>
                          Recently shown: {recentlyShown.length}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setRecentlyShown([]);
                            showToast(
                              'History cleared! All restaurants available again.',
                              'success',
                              TOAST_DEFAULT,
                            );
                          }}
                          activeOpacity={0.85}
                          style={styles.clearBtn}
                          accessibilityRole="button"
                          accessibilityLabel={`Clear history, ${recentlyShown.length} restaurants shown`}
                        >
                          <Ionicons
                            name="refresh"
                            size={12}
                            color={THEME.textAlmostWhite}
                            style={styles.iconMarginRight6}
                            importantForAccessibility="no"
                          />
                          <Text style={styles.clearBtnText}>Clear History</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

            <View ref={tourRefs.spotsRow} collapsable={false}>
              <FeaturePills
                travelMode={travelMode}
                onToggleTravel={() => {
                  const next = travelMode === 'drive' ? 'walk' : 'drive';
                  setTravelMode(next);
                  AsyncStorage.setItem(STORAGE_KEYS.TRAVEL_MODE, next).catch(() => {});
                  if (next === 'walk' && radiusMiles > WALK_RADIUS_MAX)
                    setRadiusMiles(WALK_RADIUS_DEFAULT);
                  if (next === 'drive' && radiusMiles < DRIVE_RADIUS_MIN)
                    setRadiusMiles(DRIVE_RADIUS_DEFAULT);
                }}
                forkMode={forkMode}
                onToggleFork={() => {
                  setForkMode((m) => (m === 'solo' ? 'group' : 'solo'));
                  setFiltersExpanded(false);
                }}
                favorites={favorites}
                blockedIds={blockedIds}
                onShowFavorites={() => setShowFavorites(true)}
                onShowBlocked={() => setShowBlocked(true)}
                onShowCustomPlaces={() => setShowCustomPlaces(true)}
                tourRefsExt={tourRefs}
              />
            </View>
          </View>

          {/* Result - solo mode only (group results show in modal) */}
          {picked && forkMode === 'solo' ? (
            <GlassCard title="You're going here" icon="restaurant" accent>
              <>
                <Text style={styles.placeName} accessibilityRole="header">
                  {placeName}
                </Text>

                {picked?.isCustom && (
                  <View style={styles.customBadge}>
                    <Ionicons
                      name="person"
                      size={10}
                      color={THEME.pop}
                      importantForAccessibility="no"
                    />
                    <Text style={styles.customBadgeText}>Your spot</Text>
                  </View>
                )}

                <View style={styles.metaRow}>
                  <View
                    style={styles.metaPill}
                    accessibilityLabel={`Rating: ${rating ? String(rating) : 'not available'}`}
                  >
                    <Ionicons
                      name="star"
                      size={12}
                      color={THEME.pop}
                      importantForAccessibility="no"
                    />
                    <Text style={styles.metaText}>{rating ? String(rating) : '—'}</Text>
                  </View>
                  <View style={styles.metaPill} accessibilityLabel={`Price: ${dollars(price)}`}>
                    <Ionicons
                      name="cash"
                      size={12}
                      color={THEME.success}
                      importantForAccessibility="no"
                    />
                    <Text style={styles.metaText}>{dollars(price)}</Text>
                  </View>
                  <View
                    style={[styles.metaPill, styles.addressPill]}
                    accessibilityLabel={`Location: ${vicinity || 'Nearby'}`}
                  >
                    <Ionicons
                      name="location"
                      size={12}
                      color={THEME.accent}
                      importantForAccessibility="no"
                    />
                    <Text
                      style={[styles.metaText, styles.flexShrink1]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {vicinity || 'Nearby'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <GhostButton
                    label="Let's Go"
                    icon="map"
                    onPress={() =>
                      openMapsSearchByText(picked?.isCustom && vicinity ? vicinity : placeName)
                    }
                  />
                  <GhostButton
                    label="Website"
                    icon="globe"
                    onPress={() => {
                      const url = pickedDetails?.website;
                      if (!url) return;
                      const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
                      Linking.openURL(normalized).catch(() =>
                        showAlert('Error', 'Could not open website.'),
                      );
                    }}
                    disabled={!pickedDetails?.website}
                  />
                  <GhostButton
                    label="Call"
                    icon="call"
                    onPress={() => callPhone(pickedDetails?.formatted_phone_number)}
                    disabled={!pickedDetails?.formatted_phone_number}
                  />
                </View>

                <View style={styles.actionRow2}>
                  <TouchableOpacity
                    onPress={() => {
                      if (isFavorite) {
                        showAlert('Remove Favorite', `Remove "${placeName}" from favorites?`, [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: () => {
                              toggleFavorite(
                                { place_id: picked.place_id, name: placeName },
                                favorites,
                                setFavorites,
                              );
                              showToast('Removed from favorites.', 'success', FAV_TOAST_MS);
                              haptics.selectionAsync();
                            },
                          },
                        ]);
                      } else {
                        toggleFavorite(
                          {
                            place_id: picked.place_id,
                            name: placeName,
                            vicinity,
                            rating,
                            price_level: price,
                          },
                          favorites,
                          setFavorites,
                        );
                        showToast('Saved to favorites!', 'success', FAV_TOAST_MS);
                        haptics.selectionAsync();
                      }
                    }}
                    activeOpacity={0.85}
                    style={styles.iconBtn}
                    accessibilityRole="button"
                    accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
                  >
                    <Ionicons
                      name={isFavorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFavorite ? THEME.accent : THEME.textSubtle}
                      importantForAccessibility="no"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const place = { place_id: picked.place_id, name: placeName };
                      const doBlock = (byName) => {
                        blockPlace(place, {
                          currentBlocked: blockedIds,
                          setBlocked: setBlockedIds,
                          currentFavorites: favorites,
                          setFavs: setFavorites,
                          byName,
                        });
                        showToast(
                          byName
                            ? `Blocked all "${placeName}" locations.`
                            : "Blocked. You won't see this one again.",
                          'info',
                          TOAST_DEFAULT,
                        );
                        haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
                        setPicked(null);
                        setPickedDetails(null);
                      };
                      showAlert('Block Restaurant', `How do you want to block ${placeName}?`, [
                        { text: 'Just This Location', onPress: () => doBlock(false) },
                        { text: 'All With This Name', onPress: () => doBlock(true) },
                        { text: 'Cancel', style: 'cancel' },
                      ]);
                    }}
                    activeOpacity={0.85}
                    style={styles.iconBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Never show this restaurant again"
                  >
                    <Ionicons
                      name="ban-outline"
                      size={20}
                      color={THEME.textSubtle}
                      importantForAccessibility="no"
                    />
                  </TouchableOpacity>

                  {!picked?.isCustom && picked?.types?.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        const skip = [
                          'restaurant',
                          'food',
                          'point_of_interest',
                          'establishment',
                          'store',
                        ];
                        const specific = (picked.types || []).find((t) => !skip.includes(t));
                        if (specific) {
                          setCuisineKeyword(specific.replace(/_/g, ' '));
                        }
                        forkIt();
                      }}
                      activeOpacity={0.85}
                      style={styles.moreLikeBtn}
                      disabled={loading}
                      accessibilityRole="button"
                      accessibilityLabel="Find similar restaurants"
                    >
                      <Ionicons
                        name="shuffle"
                        size={16}
                        color={THEME.pop}
                        importantForAccessibility="no"
                      />
                      <Text style={styles.moreLikeBtnText}>More Like This</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {!picked?.isCustom && (
                  <>
                    <View style={styles.divider} />

                    <View style={styles.recipeHeader}>
                      <Ionicons name="home" size={16} color={THEME.pop} />
                      <Text style={[styles.sectionTitle, styles.sectionTitleNoMargin]}>
                        Don't want to leave after all?
                      </Text>
                    </View>

                    <Text style={styles.muted}>
                      {signatureDish === 'Signature dish'
                        ? 'Copycat recipes. Close enough.'
                        : `Try making: ${signatureDish}`}
                    </Text>

                    <View style={styles.spacer10} />
                    {recipeLinks.map((l) => (
                      <TouchableOpacity
                        key={l.url}
                        onPress={() => Linking.openURL(l.url).catch(() => {})}
                        activeOpacity={0.85}
                        style={styles.linkRow}
                        accessibilityRole="link"
                        accessibilityLabel={`${l.label}, opens in browser`}
                      >
                        <View style={styles.rowCenter}>
                          <Ionicons
                            name={l.icon}
                            size={16}
                            color={THEME.pop}
                            importantForAccessibility="no"
                          />
                          <Text style={styles.linkText}>{l.label}</Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={THEME.popFaint}
                          importantForAccessibility="no"
                        />
                      </TouchableOpacity>
                    ))}

                    <Text style={styles.attribution}>Powered by Google</Text>
                  </>
                )}
              </>
            </GlassCard>
          ) : null}

          <View style={styles.footerRow}>
            <View style={styles.footerIcons}>
              <TouchableOpacity
                ref={tourRefs.infoBtn}
                onPress={() => setShowInfo(true)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="About ForkIt"
              >
                <Ionicons name="information-circle-outline" size={18} color={THEME.textHint} />
              </TouchableOpacity>
            </View>
            <Text style={styles.footer}>Life's too short to debate dinner.</Text>
          </View>

          {!group.showGroupModal && group.groupStep === 'result' && group.groupResult && (
            <View>
              <Text style={styles.resultSectionHeader}>Recent Fork Around</Text>
              <ResultBanner
                groupCode={group.groupCode}
                resultName={group.groupResult.name}
                resultTime={group.groupResultTime}
                isHost={!!group.groupHostId}
                onPress={() => group.setShowGroupModal(true)}
              />
            </View>
          )}
        </ScrollView>

        {/* Tour Spotlight Modal */}
        <TourOverlay
          visible={showTour}
          tourStep={tourStep}
          tourSpotLayout={tourSpotLayout}
          onAdvance={advanceTour}
          onRetreat={retreatTour}
          onClose={confirmCloseTour}
        />

        <InfoModal
          visible={showInfo}
          onClose={() => setShowInfo(false)}
          isPro={isPro()}
          showPaywall={showPaywall}
          showToast={showToast}
          startTour={startTour}
        />

        {/* Fork Around Modal */}
        <GroupForkModal
          visible={group.showGroupModal}
          onClose={group.closeGroupModal}
          groupStep={group.groupStep}
          groupCode={group.groupCode}
          groupName={group.groupName}
          setGroupName={group.setGroupName}
          groupJoinCode={group.groupJoinCode}
          setGroupJoinCode={group.setGroupJoinCode}
          groupLocationName={group.groupLocationName}
          setGroupLocationName={group.setGroupLocationName}
          groupHostName={group.groupHostName}
          groupHostRadius={group.groupHostRadius}
          customPlaces={customPlaces}
          setCustomPlaces={setCustomPlaces}
          groupParticipants={group.groupParticipants}
          groupResult={group.groupResult}
          groupLoading={group.groupLoading}
          groupError={group.groupError}
          groupFiltersSubmitted={group.groupFiltersSubmitted}
          groupEditFilters={group.groupEditFilters}
          groupCreate={group.groupCreate}
          groupJoin={group.groupJoin}
          groupSubmitFilters={group.groupSubmitFilters}
          groupTriggerPick={group.groupTriggerPick}
          groupLeave={group.groupLeave}
          groupPollStale={group.groupPollStale}
          isHost={!!group.groupHostId}
          canHost={isPro() || getCurrentUsage().group < 1}
          showPaywall={showPaywall}
        />

        {/* Favorites Modal */}
        <FavoritesModal
          visible={showFavorites}
          onClose={() => setShowFavorites(false)}
          favorites={favorites}
          setFavorites={setFavorites}
          showToast={showToast}
        />

        {/* Blocked Places Modal */}
        <BlockedModal
          visible={showBlocked}
          onClose={() => setShowBlocked(false)}
          blockedIds={blockedIds}
          setBlockedIds={setBlockedIds}
          showToast={showToast}
        />

        {/* Custom Places Modal */}
        <CustomPlacesModal
          visible={showCustomPlaces}
          onClose={() => setShowCustomPlaces(false)}
          customPlaces={customPlaces}
          setCustomPlaces={setCustomPlaces}
          coords={coords}
          showToast={showToast}
        />
        <Toast text={toast.text} kind={toast.kind} />
      </LinearGradient>
    </SafeAreaView>
  );
}

// ==============================
// STYLES
// ==============================

const styles = StyleSheet.create({
  container: { padding: scale(16), paddingTop: scale(34), paddingBottom: scale(24) },

  header: { alignItems: 'center', marginBottom: scale(12), marginTop: scale(18) },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  title: {
    color: THEME.accent,
    fontSize: scale(TITLE_FONT_SIZE),
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 0.2,
    lineHeight: scale(TITLE_LINE_HEIGHT),
  },
  titleIt: { color: THEME.pop },
  subtitle: {
    color: THEME.textHint,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginTop: 3,
  },

  hero: {
    padding: scale(14),
    borderRadius: 18,
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: THEME.borderFaint,
    backgroundColor: THEME.surfaceLight,
  },
  heroLine: { color: THEME.textBold, fontSize: 16, lineHeight: 22, marginBottom: 14 },
  heroBold: { color: THEME.white, fontWeight: '900' },

  forkingLine: {
    marginTop: 12,
    color: THEME.textNearWhite,
    fontSize: 15,
    fontWeight: '900',
  },
  groupFiltersHint: {
    color: THEME.textHint,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  activeSessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: THEME.pop,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 12,
  },
  activeSessionText: {
    color: THEME.white,
    fontSize: 15,
    fontWeight: '700',
  },
  filtersToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    backgroundColor: THEME.surfaceLight,
  },
  filtersToggleText: {
    color: THEME.textBright,
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 10,
  },
  filterCount: {
    color: THEME.pop,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 12,
  },
  filtersContent: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.borderThin,
  },

  slotBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.borderFaint,
    backgroundColor: THEME.surfaceInput,
  },
  slotLabel: { color: THEME.textIcon, fontSize: 14, fontWeight: '800' },
  slotText: { marginTop: 7, color: THEME.textPrimary, fontSize: 16, fontWeight: '950' },

  label: { color: THEME.textSecondary, fontSize: 14, marginTop: 12, marginBottom: 7 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.borderMedium,
    backgroundColor: THEME.surfaceInput,
  },
  input: { color: THEME.white, flex: 1, fontWeight: '800' },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleLabel: { color: THEME.textSecondary, fontSize: 14, fontWeight: '900' },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: THEME.surfaceClearBtn,
    borderWidth: 1,
    borderColor: THEME.borderHover,
  },
  clearBtnText: { color: THEME.textBright, fontSize: 13, fontWeight: '900' },

  placeName: {
    color: THEME.white,
    fontSize: scale(24),
    fontWeight: '950',
    marginTop: 3,
    marginBottom: scale(10),
  },

  metaRow: { flexDirection: 'row', flexWrap: 'nowrap', gap: scale(7), marginBottom: scale(12) },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.borderMedium,
    backgroundColor: THEME.surfaceLight,
    flexShrink: 1,
  },
  metaText: { color: THEME.textBold, fontWeight: '700', fontSize: 13 },

  actionRow: { flexDirection: 'row', gap: scale(8), flexWrap: 'wrap' },
  divider: { height: 1, backgroundColor: THEME.borderFaint, marginVertical: scale(10) },

  sectionTitle: { color: THEME.white, fontSize: 16, fontWeight: '950', marginBottom: 7 },
  muted: { color: THEME.textSubtle, fontSize: 15, lineHeight: 22 },

  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(10),
    paddingHorizontal: scale(10),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.popBorder,
    backgroundColor: THEME.popBg,
    marginBottom: scale(8),
  },
  linkText: { color: THEME.textPrimary, fontWeight: '950', marginLeft: 10 },
  attribution: { color: THEME.textDimmed, fontSize: 13, textAlign: 'right', marginTop: 10 },

  footer: {
    marginTop: 7,
    textAlign: 'center',
    color: THEME.textHalf,
    fontSize: 14,
    lineHeight: 19,
  },
  resultSectionHeader: {
    color: THEME.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 4,
  },
  resultCard: {
    borderWidth: 1.5,
    borderColor: THEME.popBorder,
    backgroundColor: THEME.surfaceLight,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  resultCardName: {
    color: THEME.white,
    fontSize: 17,
    fontWeight: '900',
    flex: 1,
  },
  resultCardMeta: {
    color: THEME.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  resultCardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: THEME.popBg,
    borderWidth: 1,
    borderColor: THEME.popBorder,
  },
  resultCardCtaText: {
    color: THEME.pop,
    fontSize: 15,
    fontWeight: '800',
  },
  footerRow: { alignItems: 'center', marginTop: 4, marginBottom: 8 },

  // Result card action rows
  actionRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    marginTop: scale(8),
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  moreLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    flex: 1,
    paddingVertical: scale(10),
    paddingHorizontal: scale(12),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.popBorder,
    backgroundColor: THEME.popBg,
    minHeight: 48,
  },
  moreLikeBtnText: { color: THEME.pop, fontSize: 14, fontWeight: '900' },
  footerIcons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: THEME.popBgMedium,
    borderWidth: 1,
    borderColor: THEME.popBorderMedium,
    marginBottom: 7,
  },
  customBadgeText: { color: THEME.pop, fontSize: 12, fontWeight: '800' },

  // Extracted inline styles
  iconMarginRight6: { marginRight: 6 },
  flex1: { flex: 1, backgroundColor: THEME.dark },
  loadingContainer: { flex: 1, backgroundColor: THEME.dark },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconNudge: { marginLeft: -5, marginTop: -6 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  addressPill: { minWidth: 120, maxWidth: 140 },
  flexShrink1: { flexShrink: 1 },
  recipeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  sectionTitleNoMargin: { marginBottom: 0, marginLeft: 8 },
  spacer10: { height: 10 },
});
