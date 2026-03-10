// ForkFate — Main app (App.js)

import { Ionicons } from '@expo/vector-icons';
import { useFonts, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Linking,
  Modal,
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
import Svg, { Circle, Path, G } from 'react-native-svg';

import { getIntegrityToken, verifyIntegrityToken } from './utils/integrity';
import { requestLocationPermission, getCurrentPosition } from './utils/location';
import { haptics, showAlert } from './utils/platform';

// Bootstrap Fork Icon - tines down with teal pea
function ForkIcon({ size = 24, color = THEME.accent, rotation = '0deg' }) {
  const width = size * (6 / 20);
  const height = size;
  return (
    <Svg
      width={width}
      height={height}
      viewBox="2.5 0 6 20"
      style={{ transform: [{ rotate: rotation }] }}
    >
      {/* Fork rotated 180° so tines point down, scaled narrower at tines */}
      <G transform="rotate(180, 5.5, 8) translate(5.5, 0) scale(0.8, 1) translate(-5.5, 0)">
        <Path
          d="M4.25 0a.25.25 0 0 1 .25.25v5.122a.128.128 0 0 0 .256.006l.233-5.14A.25.25 0 0 1 5.24 0h.522a.25.25 0 0 1 .25.238l.233 5.14a.128.128 0 0 0 .256-.006V.25A.25.25 0 0 1 6.75 0h.29a.5.5 0 0 1 .498.458l.423 5.07a1.69 1.69 0 0 1-1.059 1.711l-.053.022a.92.92 0 0 0-.58.884L6.47 15a.971.971 0 1 1-1.942 0l.202-6.855a.92.92 0 0 0-.58-.884l-.053-.022a1.69 1.69 0 0 1-1.059-1.712L3.462.458A.5.5 0 0 1 3.96 0z"
          fill={color}
        />
      </G>
      {/* Teal pea below fork */}
      <Circle cx="5.5" cy="18" r="1.5" fill={THEME.pop} />
    </Svg>
  );
}

// ==============================
// CONFIG
// ==============================

// Backend API URL from environment variables
// For local development, add to .env file
// For EAS Build, use: eas secret:create --scope project --name EXPO_PUBLIC_BACKEND_URL --value your_url
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// Timing constants (milliseconds)
const TOAST_SHORT = 1200;
const TOAST_DEFAULT = 1600;
const TOAST_LONG = 2200;
const FETCH_TIMEOUT = 15000;
const DETAILS_TIMEOUT = 8000;
const DEBOUNCE_DELAY = 350;
const THROTTLE_WINDOW = 60000;
const THROTTLE_MAX_TAPS = 8;
const RECENTLY_SHOWN_MAX = 10;
const WALK_RESULTS_THRESHOLD = 25;
const CLOSING_SOON_EXCLUDE_MIN = 30;
const CLOSING_SOON_WARN_MIN = 60;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;
const DAYS_PER_WEEK = 7;
const OVERNIGHT_CUTOFF_MIN = 360;
const WALK_CLOSE_RADIUS = 0.25;

// Layout constants
const SMALL_SCREEN_THRESHOLD = 700;
const SMALL_SCREEN_SCALE = 0.85;
const MODAL_CONTENT_RATIO = 0.65;
const MODAL_LIST_RATIO = 0.55;
const MODAL_SPOTS_RATIO = 0.35;
const MILES_TO_METERS = 1609.34;

// HTTP status codes
const HTTP_TOO_MANY_REQUESTS = 429;

// Animation & UI timing
const BOUNCE_OFFSET = -5;
const DEFAULT_TOAST_MS = 1700;
const THROTTLE_TOAST_MS = 2000;
const ADDED_TOAST_MS = 2000;
const SPOTS_ERROR_TOAST_MS = 3000;
const WALK_SUGGEST_DELAY = 2500;
const SUPPORT_MODAL_DELAY = 300;
const SLOT_BASE_DELAY = 45;
const SLOT_INCREMENT = 6;
const SLOT_MIN_CYCLES = 10;
const SLOT_MAX_CYCLES = 16;
const DRAMATIC_PAUSE = 250;
const FAV_TOAST_MS = 1400;

// Layout & sizing
const SPOTS_SEARCH_THRESHOLD = 5;
const SCROLL_THUMB_PERCENT = 70;

// Rating thresholds
const RATING_LOW = 3.5;
const RATING_DEFAULT = 4.0;
const RATING_HIGH = 4.3;
const RATING_TOP = 4.5;

// Walk mode radius thresholds
const WALK_RADIUS_MAX = 1.5;
const WALK_RADIUS_DEFAULT = 0.5;
const DRIVE_RADIUS_MIN = 1;
const DRIVE_RADIUS_DEFAULT = 3;
const RADIUS_CLAMP_MIN = 0.25;
const RADIUS_CLAMP_MAX = 15;

// Title font sizing
const TITLE_FONT_SIZE = 40;
const TITLE_LINE_HEIGHT = 46;
const EASTER_EGG_TAPS = 7;

// Screen dimensions and responsive scaling
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_HEIGHT < SMALL_SCREEN_THRESHOLD;
const scale = (size) => (isSmallScreen ? size * SMALL_SCREEN_SCALE : size);

// Tour
const TOUR_VERSION = 1; // Bump to re-show tour after major feature additions
const TOUR_STEP_COUNT = 10;
const TOUR_LAUNCH_DELAY = 800;
const TOUR_EXPAND_DELAY = 350;
const TOUR_TOOLTIP_MIN_TOP = 40;
const TOUR_TOOLTIP_HEIGHT = 195;
const TOUR_ARROW_OFFSET = 30;
const TOUR_SPOT_PAD = 6;
const TOUR_SPOT_RADIUS = 14;
const TOUR_STEPS = [
  {
    ref: 'forkBtn',
    title: 'Just fork it.',
    desc: "Don't overthink it. The default filters work great — just tap the button and we'll pick a spot for you.",
    arrow: 'down',
  },
  {
    ref: 'modeToggle',
    title: 'Walk vs Drive',
    desc: "In a city? Switch to walk mode for spots you can stroll to. We'll even nudge you when there's a ton of options nearby.",
    arrow: 'up',
  },
  {
    ref: 'filtersToggle',
    title: 'Filters',
    desc: 'Tap here to open filters — distance, price, rating, cuisine, and more. Filters expand to reveal all your options.',
    arrow: 'up',
    expandFilters: true,
  },
  {
    ref: 'distanceRow',
    title: 'How Far?',
    desc: 'Pick your distance. These change based on walk or drive mode. Or tap the pin to search near a custom address.',
    arrow: 'up',
  },
  {
    ref: 'maxDamageRow',
    title: 'Max Damage & At Least This Good',
    desc: 'These filters are inclusive. $$ means "up to $$." 3 stars means "3 stars and above." You get what you pick and everything below/above.',
    arrow: 'up',
  },
  {
    ref: 'openNowRow',
    title: 'Open Now',
    desc: "Only shows places that'll be open for at least another hour. No rushing to beat a closing kitchen.",
    arrow: 'up',
  },
  {
    ref: 'hiddenGemsRow',
    title: 'Skip the Chains',
    desc: "Filters out big chain restaurants so you discover local gems. Great for finding spots you'd never Google on your own.",
    arrow: 'up',
  },
  {
    ref: 'spotsRow',
    title: '+ Spots & Your Lists',
    desc: "Add your own spots — Mom's house, that taco truck, anywhere. Save favorites \u2764\uFE0F and block \uD83D\uDEAB places you never want to see again.",
    arrow: 'up',
  },
  {
    ref: null,
    title: 'Copycat Recipes',
    desc: "Don't want to leave the house after all? Every pick comes with easy-search buttons for copycat recipes on YouTube, Google, and Allrecipes.",
    arrow: null,
    mock: 'recipes',
  },
  {
    ref: 'infoBtn',
    title: 'Info & Support',
    desc: "Tap \u2139\uFE0F anytime for details on how everything works, take this tour again, or support ForkFate's development.",
    arrow: 'up',
  },
];

const STORAGE_KEYS = {
  FAVORITES: '@forkit_favorites',
  BLOCKED: '@forkit_blocked',
  CUSTOM_PLACES: '@forkit_custom_places',
  TRAVEL_MODE: '@forkit_travel_mode',
  TOUR_VERSION: '@forkit_tour_version',
};

// Theme colors - "Fork it" energy (Orange + Teal + Cream)
const THEME = {
  // Core palette
  accent: '#FB923C', // Bright orange - primary accent
  accentLight: '#FDBA74', // Lighter orange for gradients
  accentDark: '#EA580C', // Deeper orange for contrast
  pop: '#2DD4BF', // Punchy teal - secondary pop color
  success: '#2DD4BF', // Teal for success states
  cream: '#FEF3E2', // Warm cream for highlights
  muted: '#A1A1AA', // Zinc for muted elements
  white: '#FFFFFF',
  dark: '#0D0D0D', // Near-black background
  black: '#000000',
  background: ['#0D0D0D', '#1A1410', '#0D0D0D'], // Warm dark gradient

  // Alpha variants (reusable throughout UI)
  textPrimary: 'rgba(255,255,255,0.92)',
  textSecondary: 'rgba(255,255,255,0.75)',
  textMuted: 'rgba(255,255,255,0.55)',
  textFaint: 'rgba(255,255,255,0.45)',
  textHint: 'rgba(255,255,255,0.35)',
  textSubtle: 'rgba(255,255,255,0.7)',
  textBright: 'rgba(255,255,255,0.9)',
  textBold: 'rgba(255,255,255,0.88)',
  textIcon: 'rgba(255,255,255,0.6)',
  borderLight: 'rgba(255,255,255,0.18)',
  borderFaint: 'rgba(255,255,255,0.14)',
  borderSubtle: 'rgba(255,255,255,0.12)',
  borderDim: 'rgba(255,255,255,0.08)',
  surfaceLight: 'rgba(255,255,255,0.06)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  surfaceInput: 'rgba(0,0,0,0.20)',
  overlay: 'rgba(0,0,0,0.75)',
  toastBg: 'rgba(0,0,0,0.40)',

  // Accent alpha variants
  accentBg: 'rgba(251,146,60,0.15)',
  accentBgLight: 'rgba(251,146,60,0.1)',
  accentBorder: 'rgba(251,146,60,0.3)',
  accentBorderLight: 'rgba(251,146,60,0.25)',
  accentChip: 'rgba(251,146,60,0.9)',
  accentToastBorder: 'rgba(251,146,60,0.5)',
  accentToastBorderLight: 'rgba(251,146,60,0.4)',
  popBg: 'rgba(45,212,191,0.06)',
  popBgMedium: 'rgba(45,212,191,0.15)',
  popBorder: 'rgba(45,212,191,0.25)',
  popBorderMedium: 'rgba(45,212,191,0.3)',
  popFaint: 'rgba(45,212,191,0.7)',
  popThumb: 'rgba(45,212,191,0.5)',

  // Brand colors (support modals)
  venmo: '#008CFF',
  cashApp: '#00D632',
  kofi: '#FF5E5B',
  error: '#FF5E5B',

  // Disabled states
  disabledGradientStart: 'rgba(255,255,255,0.26)',
  disabledGradientEnd: 'rgba(255,255,255,0.18)',

  // StyleSheet-only color tokens (no-color-literals)
  textNearWhite: 'rgba(255,255,255,0.86)',
  textAlmostWhite: 'rgba(255,255,255,0.95)',
  textDimmed: 'rgba(255,255,255,0.40)',
  textHalf: 'rgba(255,255,255,0.50)',
  borderMedium: 'rgba(255,255,255,0.16)',
  borderThin: 'rgba(255,255,255,0.10)',
  borderHover: 'rgba(255,255,255,0.20)',
  surfaceClearBtn: 'rgba(255,255,255,0.10)',
  surfaceCard: 'rgba(13,13,13,0.85)',
  surfaceModal: 'rgba(26,20,16,0.95)',
  surfaceDropdown: 'rgba(26,20,16,0.98)',
  surfaceFavAction: 'rgba(255,255,255,0.04)',
  transparent: 'transparent',

  // Tour colors
  tourOverlay: 'rgba(0,0,0,0.75)',
  tourSpotBorder: 'rgba(255,215,0,0.6)',
  tourSpotBg: 'rgba(255,215,0,0.06)',
  tourCard: '#1C1C2E',
  tourCardBorder: '#2a2a3e',
  tourGold: '#FFD700',
  tourText: '#aaaaaa',
  tourDotBg: '#333333',
  tourBtnBg: '#FFD700',
  tourBtnText: '#0B0B0F',
  tourSkipText: '#666666',
  tourLaunchBg: 'rgba(45,212,191,0.1)',
  tourLaunchBorder: 'rgba(45,212,191,0.3)',
  tourMockYoutube: 'rgba(255,0,0,0.15)',
  tourMockGoogle: 'rgba(66,133,244,0.15)',
  tourMockAllrecipes: 'rgba(255,165,0,0.15)',
};

const FORKING_LINES = [
  'Picking for you…',
  'One sec…',
  'Finding food…',
  'Consulting the vibes…',
  'Rolling the dinner dice…',
  'Cross-referencing cravings…',
  'Selecting your destiny…',
  'Spearing the perfect spot…',
  'Pronging through possibilities…',
  'Overthinking is over…',
  'Almost there…',
];

const SUCCESS_LINES = [
  'There. Done. Go eat.',
  'Picked. Now go.',
  "That's the one.",
  'Decision made.',
  'Done. Stop scrolling. Go.',
  'No more debates. Just go.',
];

const FAIL_LINES = [
  'Nothing? Lower your standards.',
  'Zero results. Widen the radius.',
  'Your filters said no to everything.',
  'Too picky. Loosen up.',
];

const HIDDEN_GEMS_MAX_REVIEWS = 500;

const CHAIN_KEYWORDS = [
  'mcdonald',
  'burger king',
  'wendy',
  'taco bell',
  'kfc',
  'popeyes',
  'chick-fil-a',
  'chickfila',
  'subway',
  'domino',
  'pizza hut',
  'papa john',
  'starbucks',
  'dunkin',
  'panera',
  'chipotle',
  'five guys',
  'applebee',
  'chili',
  'olive garden',
  'outback',
  'buffalo wild wings',
  'arbys',
  'sonic',
  'hardee',
  "carl's jr",
  'jersey mike',
  'jimmy john',
  'qdoba',
  'whataburger',
];

const SIGNATURE_DISH_RULES = [
  { match: ['mcdonald'], dish: 'Big Mac' },
  { match: ['chick-fil-a', 'chickfila'], dish: 'Chick-fil-A Chicken Sandwich' },
  { match: ['taco bell'], dish: 'Crunchwrap Supreme' },
  { match: ['chipotle'], dish: 'Chicken Burrito Bowl' },
  { match: ['wendy'], dish: 'Baconator' },
  { match: ['popeyes'], dish: 'Spicy Chicken Sandwich' },
  { match: ['kfc'], dish: 'Original Recipe Fried Chicken' },
  { match: ['starbucks'], dish: 'Caramel Macchiato' },
];

// ==============================
// HELPERS
// ==============================

function safeStore(key, data) {
  AsyncStorage.setItem(key, JSON.stringify(data)).catch(() => {});
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalize(s) {
  return (s || '').toLowerCase().trim();
}

function looksLikeChain(name, userRatingsTotal) {
  const n = normalize(name);
  const nameMatch = CHAIN_KEYWORDS.some((k) => n.includes(k));
  const highReviewCount = (userRatingsTotal || 0) >= HIDDEN_GEMS_MAX_REVIEWS;
  return nameMatch || highReviewCount;
}

function pickRandom(arr) {
  if (!arr?.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function dollars(priceLevel) {
  if (!priceLevel || priceLevel < 1) return 'Price —';
  return '$'.repeat(priceLevel);
}

function getSignatureDish(restaurantName) {
  const n = normalize(restaurantName);
  for (const rule of SIGNATURE_DISH_RULES) {
    if (rule.match.some((m) => n.includes(normalize(m)))) return rule.dish;
  }
  return 'Signature dish';
}

function buildRecipeLinks(restaurantName, dishName) {
  // If dishName is empty (unknown signature dish), just search restaurant name
  const searchTerm = dishName ? `${restaurantName} ${dishName}` : restaurantName;
  const q = encodeURIComponent(`${searchTerm} copycat recipe`);
  const qDish = encodeURIComponent(`${dishName || restaurantName} copycat recipe`);
  return [
    {
      label: 'YouTube',
      icon: 'logo-youtube',
      url: `https://www.youtube.com/results?search_query=${q}`,
    },
    { label: 'Google', icon: 'search', url: `https://www.google.com/search?q=${q}` },
    { label: 'Allrecipes', icon: 'book', url: `https://www.allrecipes.com/search?q=${qDish}` },
  ];
}

function migrateFavorite(fav) {
  if (fav.schemaVersion === 2) return fav;
  return {
    ...fav,
    userNotes: fav.userNotes || '',
    userDishes: fav.userDishes || '',
    userRating: fav.userRating ?? null,
    visitCount: fav.visitCount || 0,
    lastVisitedAt: fav.lastVisitedAt ?? null,
    updatedAt: fav.updatedAt || fav.savedAt || Date.now(),
    schemaVersion: 2,
  };
}

function toggleFavorite(place, currentFavorites, setFavs) {
  const exists = currentFavorites.some((f) => f.place_id === place.place_id);
  let updated;
  if (exists) {
    updated = currentFavorites.filter((f) => f.place_id !== place.place_id);
  } else {
    const now = Date.now();
    updated = [
      {
        place_id: place.place_id,
        name: place.name,
        vicinity: place.vicinity || '',
        rating: place.rating || null,
        price_level: place.price_level || null,
        savedAt: now,
        userNotes: '',
        userDishes: '',
        userRating: null,
        visitCount: 0,
        lastVisitedAt: null,
        updatedAt: now,
        schemaVersion: 2,
      },
      ...currentFavorites,
    ];
  }
  setFavs(updated);
  safeStore(STORAGE_KEYS.FAVORITES, updated);
  return !exists;
}

function updateFavorite(placeId, changes, currentFavorites, setFavs) {
  const updated = currentFavorites.map((fav) => {
    if (fav.place_id !== placeId) return fav;
    return { ...fav, ...changes, updatedAt: Date.now() };
  });
  setFavs(updated);
  safeStore(STORAGE_KEYS.FAVORITES, updated);
}

function blockPlace(place, { currentBlocked, setBlocked, currentFavorites, setFavs, byName }) {
  if (!byName && currentBlocked.some((b) => b.place_id === place.place_id)) return;
  const entry = {
    place_id: place.place_id,
    name: place.name,
    blockedAt: Date.now(),
    byName: byName || false,
  };
  const updated = [entry, ...currentBlocked];
  setBlocked(updated);
  safeStore(STORAGE_KEYS.BLOCKED, updated);
  // Also remove matching favorites
  const matchFav = byName
    ? (f) => normalize(f.name) === normalize(place.name)
    : (f) => f.place_id === place.place_id;
  if (currentFavorites?.some(matchFav)) {
    const updatedFavs = currentFavorites.filter((f) => !matchFav(f));
    setFavs(updatedFavs);
    safeStore(STORAGE_KEYS.FAVORITES, updatedFavs);
  }
}

function isBlocked(placeId, name, blockedList) {
  return blockedList.some(
    (b) => b.place_id === placeId || (b.byName && normalize(b.name) === normalize(name)),
  );
}

function unblockPlace(placeId, currentBlocked, setBlocked) {
  const updated = currentBlocked.filter((b) => b.place_id !== placeId);
  setBlocked(updated);
  safeStore(STORAGE_KEYS.BLOCKED, updated);
}

function addCustomPlace(name, address, { notes, currentCustom, setCustom }) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false };
  const normalName = normalize(trimmed);
  const normalAddr = normalize(address.trim());
  const nameMatch = currentCustom.find((cp) => normalize(cp.name) === normalName);
  if (nameMatch) {
    return { ok: false, reason: 'name', dupe: nameMatch.name, dupeAddr: nameMatch.vicinity };
  }
  if (normalAddr) {
    const addrMatch = currentCustom.find(
      (cp) => cp.vicinity && normalize(cp.vicinity) === normalAddr,
    );
    if (addrMatch) {
      return { ok: false, reason: 'address', dupe: addrMatch.name };
    }
  }
  const newPlace = {
    place_id: `custom_${Date.now()}`,
    name: trimmed,
    vicinity: address.trim() || '',
    notes: notes.trim() || '',
    isCustom: true,
    rating: null,
    price_level: null,
    user_ratings_total: 0,
    createdAt: Date.now(),
  };
  const updated = [newPlace, ...currentCustom];
  setCustom(updated);
  safeStore(STORAGE_KEYS.CUSTOM_PLACES, updated);
  return { ok: true };
}

function removeCustomPlace(placeId, currentCustom, setCustom) {
  const updated = currentCustom.filter((p) => p.place_id !== placeId);
  setCustom(updated);
  safeStore(STORAGE_KEYS.CUSTOM_PLACES, updated);
}

function openMapsSearchByText(name) {
  const q = encodeURIComponent(name);
  const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
  Linking.openURL(url).catch(() => showAlert('Error', 'Could not open maps.'));
}

function callPhone(phoneNumber) {
  if (!phoneNumber) return;
  Linking.openURL(`tel:${phoneNumber}`).catch(() => showAlert('Error', 'Could not start a call.'));
}

async function fetchAddressSuggestions(input, coords) {
  if (!input || input.trim().length < 3) return { suggestions: [], error: null };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DETAILS_TIMEOUT);
  try {
    const body = { input: input.trim() };
    if (coords?.latitude && coords?.longitude) {
      body.latitude = coords.latitude;
      body.longitude = coords.longitude;
    }
    const response = await fetch(`${BACKEND_URL}/api/places-autocomplete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.status === HTTP_TOO_MANY_REQUESTS) return { suggestions: [], error: 'rate_limit' };
    if (!response.ok) return { suggestions: [], error: null };
    const data = await response.json();
    return { suggestions: data.suggestions || [], error: null };
  } catch {
    clearTimeout(timeoutId);
    return { suggestions: [], error: null };
  }
}

async function getPlaceDetails(placeId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DETAILS_TIMEOUT);
  try {
    const response = await fetch(`${BACKEND_URL}/api/places-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeId }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 'OK') return null;
    return data.result;
  } catch (_) {
    clearTimeout(timeoutId);
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ==============================
// UI COMPONENTS
// ==============================

function LocationSearchSection({
  customLocation,
  showLocationSearch,
  locationQuery,
  locationSuggestions,
  onQueryChange,
  onSelectSuggestion,
  onCancel,
}) {
  if (!showLocationSearch && !customLocation) return null;
  if (customLocation) {
    return (
      <View style={styles.customLocationRow}>
        <View style={styles.customLocationPill}>
          <Ionicons name="location" size={13} color={THEME.pop} />
          <Text style={styles.customLocationText} numberOfLines={1}>
            Searching near {customLocation.label}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.locationFieldWrap}>
      <View style={styles.inputWrap}>
        <Ionicons name="location-outline" size={16} color={THEME.textSubtle} />
        <TextInput
          value={locationQuery}
          onChangeText={onQueryChange}
          placeholder="Search from a different location"
          placeholderTextColor={THEME.textFaint}
          style={styles.input}
          accessibilityLabel="Search near a different location"
          keyboardAppearance="dark"
          returnKeyType="search"
          autoFocus
        />
        <TouchableOpacity
          onPress={onCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Cancel location search"
        >
          <Ionicons name="close" size={16} color={THEME.textSubtle} />
        </TouchableOpacity>
      </View>
      {locationSuggestions.length > 0 && (
        <View style={styles.suggestionsDropdown}>
          {locationSuggestions.map((s) => (
            <TouchableOpacity
              key={s.placeId}
              style={styles.suggestionItem}
              onPress={() => onSelectSuggestion(s)}
              accessibilityRole="button"
              accessibilityLabel={s.description}
            >
              <Ionicons
                name="location"
                size={13}
                color={THEME.accent}
                style={styles.suggestionIconWrap}
              />
              <View style={styles.flex1}>
                <Text style={styles.suggestionMain}>{s.mainText}</Text>
                {s.secondaryText ? (
                  <Text style={styles.suggestionSub}>{s.secondaryText}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function Chip({ active, label, icon, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? THEME.white : THEME.textBright}
          style={label ? styles.iconMarginRight6 : null}
        />
      ) : null}
      {label ? (
        <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextIdle]}>
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

function GlassCard({ title, icon, children, accent }) {
  return (
    <View style={[styles.cardOuter, accent && styles.cardOuterAccent]}>
      <View style={[styles.card, accent && styles.cardAccent]}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            {icon ? (
              <Ionicons name={icon} size={18} color={accent ? THEME.accent : THEME.textPrimary} />
            ) : null}
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
          {children}
        </View>
      </View>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled, loading, spinDeg, bounceY }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={loading ? 'Finding a restaurant' : 'Fork It, pick a random restaurant'}
      accessibilityState={{ disabled, busy: loading }}
    >
      <LinearGradient
        colors={
          disabled
            ? [THEME.disabledGradientStart, THEME.disabledGradientEnd]
            : [THEME.accent, THEME.accentDark]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.primaryBtn, disabled ? styles.opacity07 : null]}
      >
        <Animated.View
          style={[
            { transform: [{ rotate: spinDeg }, { translateY: bounceY }] },
            styles.animatedForkWrap,
          ]}
        >
          <Ionicons name="restaurant" size={18} color={THEME.white} />
        </Animated.View>

        <Text style={styles.primaryText}>{label}</Text>
        {loading ? <ActivityIndicator color={THEME.white} style={styles.iconMarginLeft10} /> : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function GhostButton({ label, icon, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.ghostBtn, disabled ? styles.opacity05 : null]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      {icon ? (
        <Ionicons name={icon} size={16} color={THEME.pop} style={styles.iconMarginRight8} />
      ) : null}
      <Text style={[styles.ghostText, { color: THEME.pop }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Toast({ text, kind }) {
  if (!text) return null;
  // Skip success toasts entirely
  if (kind === 'success') return null;
  const icon = kind === 'warn' ? 'alert-circle' : 'information-circle';
  const iconColor = THEME.accent;
  const borderColor = kind === 'warn' ? THEME.accentToastBorder : THEME.accentToastBorderLight;
  return (
    <View style={styles.toastWrap} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <View style={[styles.toast, { borderColor }]}>
        <Ionicons name={icon} size={16} color={iconColor} importantForAccessibility="no" />
        <Text style={styles.toastText}>{text}</Text>
      </View>
    </View>
  );
}

// ==============================
// APP
// ==============================

/**
 * ForkIt main app component. Random restaurant picker with filters,
 * favorites, blocked list, and custom spots.
 * @returns {JSX.Element} The rendered app
 */
export default function App() {
  // Load Montserrat Bold font
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
  });

  // Location
  const [hasLocationPerm, setHasLocationPerm] = useState(false);
  const [coords, setCoords] = useState(null);

  // Filters
  const [travelMode, setTravelMode] = useState('drive'); // 'walk' or 'drive'
  const [radiusMiles, setRadiusMiles] = useState(3);
  const [openNow, setOpenNow] = useState(true);
  const [maxPrice, setMaxPrice] = useState(2);
  const [minRating, setMinRating] = useState(4.0);
  const [cuisineKeyword, setCuisineKeyword] = useState('');
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
  const [infoScrollRatio, setInfoScrollRatio] = useState(0);
  const [infoScrollVisible, setInfoScrollVisible] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Favorites, Block list & Custom places
  const [favorites, setFavorites] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  const [customPlaces, setCustomPlaces] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [expandedFavId, setExpandedFavId] = useState(null);
  const [editingFavId, setEditingFavId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editDishes, setEditDishes] = useState('');
  const [showBlocked, setShowBlocked] = useState(false);
  const [showCustomPlaces, setShowCustomPlaces] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourSpotLayout, setTourSpotLayout] = useState(null);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomAddress, setNewCustomAddress] = useState('');
  const [newCustomNotes, setNewCustomNotes] = useState('');
  const [spotsSearch, setSpotsSearch] = useState('');
  const [spotsMsg, setSpotsMsg] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const addressDebounceRef = useRef(null);
  const locationDebounceRef = useRef(null);
  const easterEggTaps = useRef(0);

  // Animations
  const spin = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const toastTimerRef = useRef(null);
  const isForkingRef = useRef(false);
  const forkTapsRef = useRef([]);
  const walkSuggestedRef = useRef(false);

  // Tour spotlight refs
  const tourRefs = {
    forkBtn: useRef(null),
    modeToggle: useRef(null),
    filtersToggle: useRef(null),
    distanceRow: useRef(null),
    maxDamageRow: useRef(null),
    openNowRow: useRef(null),
    hiddenGemsRow: useRef(null),
    spotsRow: useRef(null),
    infoBtn: useRef(null),
  };

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

  // Cleanup timers on unmount
  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
      if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    },
    [],
  );

  // Load persisted favorites, blocked, and custom places on mount
  useEffect(() => {
    (async () => {
      try {
        const [favData, blockData, customData, travelData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
          AsyncStorage.getItem(STORAGE_KEYS.BLOCKED),
          AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_PLACES),
          AsyncStorage.getItem(STORAGE_KEYS.TRAVEL_MODE),
        ]);
        if (favData) {
          const migrated = JSON.parse(favData).map(migrateFavorite);
          setFavorites(migrated);
          safeStore(STORAGE_KEYS.FAVORITES, migrated);
        }
        if (blockData) setBlockedIds(JSON.parse(blockData));
        if (customData) setCustomPlaces(JSON.parse(customData));
        if (travelData === 'walk' || travelData === 'drive') {
          setTravelMode(travelData);
          if (travelData === 'walk') {
            setRadiusMiles((prev) => (prev > WALK_RADIUS_MAX ? WALK_RADIUS_DEFAULT : prev));
          }
        }
      } catch (_) {
        // Storage read failures are non-critical — app works with defaults
      }
    })();
  }, []);

  function measureTourRef(refName) {
    return new Promise((resolve) => {
      const ref = tourRefs[refName];
      if (!ref?.current?.measureInWindow) {
        resolve(null);
        return;
      }
      ref.current.measureInWindow((x, y, width, height) => {
        resolve(width === 0 && height === 0 ? null : { x, y, width, height });
      });
    });
  }

  async function startTour() {
    setTourStep(0);
    setFiltersExpanded(false);
    const layout = await measureTourRef('forkBtn');
    setTourSpotLayout(layout);
    setShowTour(true);
  }

  async function advanceTour() {
    const next = tourStep + 1;
    if (next >= TOUR_STEP_COUNT) {
      endTour();
      return;
    }

    const stepDef = TOUR_STEPS[next];

    // Expand filters if needed for this step
    const needsFilters =
      stepDef.expandFilters ||
      ['distanceRow', 'maxDamageRow', 'openNowRow', 'hiddenGemsRow'].includes(stepDef.ref);
    if (needsFilters && !filtersExpanded) {
      setFiltersExpanded(true);
    }

    // Steps with no ref (e.g. recipes mock) — center the tooltip
    if (!stepDef.ref) {
      setTourStep(next);
      setTourSpotLayout(null);
      return;
    }

    // Wait for layout to fully settle, then measure
    await new Promise((r) => setTimeout(r, TOUR_EXPAND_DELAY));
    await new Promise((r) => requestAnimationFrame(r));
    const layout = await measureTourRef(stepDef.ref);
    setTourStep(next);
    setTourSpotLayout(layout);
  }

  function endTour() {
    setShowTour(false);
    setTourStep(0);
    setTourSpotLayout(null);
    AsyncStorage.setItem(STORAGE_KEYS.TOUR_VERSION, String(TOUR_VERSION)).catch(() => {});
  }

  // Check if tour should show (first launch or new tour version)
  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem(STORAGE_KEYS.TOUR_VERSION);
        if (!seen || Number(seen) < TOUR_VERSION) {
          setTimeout(() => startTour(), TOUR_LAUNCH_DELAY);
        }
      } catch (_) {
        // Non-critical
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      showAlert(
        'Location needed',
        'Please enable location permissions in Settings to use ForkFate!',
      );
      return null;
    }
    setHasLocationPerm(true);
    const loc = await getCurrentPosition();
    const newCoords = loc.coords;
    setCoords(newCoords);
    safeStore('lastLocation', {
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
        excludedPlaceIds: [...recentlyShown, ...blockedIds.map((b) => b.place_id)].slice(0, 20),
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

  /**
   * Returns minutes until the restaurant closes, or null if unknown/open 24hrs.
   * Compares device local time against the place's closing periods.
   * Note: assumes device timezone matches the restaurant's timezone.
   * @param {object|null} openingHours - opening_hours from the Places API response
   * @returns {number|null} minutes until closing, or null if no closing data
   */
  function getMinutesUntilClosing(openingHours) {
    if (!openingHours?.periods?.length) return null;
    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * MINUTES_PER_HOUR + now.getMinutes();

    // Check for a closing time later today
    for (const period of openingHours.periods) {
      if (!period.close || period.close.day !== currentDay) continue;
      const closeMinutes = period.close.hour * MINUTES_PER_HOUR + period.close.minute;
      if (closeMinutes > currentMinutes) return closeMinutes - currentMinutes;
    }

    // Check for overnight closing (closes tomorrow before 6am)
    const tomorrow = (currentDay + 1) % DAYS_PER_WEEK;
    for (const period of openingHours.periods) {
      if (!period.close || period.close.day !== tomorrow) continue;
      const closeMinutes = period.close.hour * MINUTES_PER_HOUR + period.close.minute;
      if (closeMinutes < OVERNIGHT_CUTOFF_MIN) {
        return MINUTES_PER_DAY - currentMinutes + closeMinutes;
      }
    }

    return null;
  }

  function filterAndEnrichResults(raw) {
    let results = raw.filter((r) => {
      if (isBlocked(r.place_id, r.name, blockedIds)) return false;
      if (hiddenGems && looksLikeChain(r.name, r.user_ratings_total)) return false;
      const mins = getMinutesUntilClosing(r.opening_hours);
      return mins === null || mins >= CLOSING_SOON_EXCLUDE_MIN;
    });
    const eligibleCustom = customPlaces.filter(
      (cp) => !recentlyShown.includes(cp.place_id) && !isBlocked(cp.place_id, cp.name, blockedIds),
    );
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

      const raw = await fetchNearbyPlaces(currentCoords);
      maybeNudgeWalkMode(raw.length);
      const results = filterAndEnrichResults(raw);
      setPoolCount(results.length);

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
      const closingMins = getMinutesUntilClosing(chosen.opening_hours);
      if (closingMins !== null && closingMins <= CLOSING_SOON_WARN_MIN) {
        let hurryMsg = 'Drive safely!';
        if (travelMode === 'walk' && radiusMiles <= WALK_CLOSE_RADIUS) {
          hurryMsg = 'Get walking!';
        } else if (travelMode === 'walk') {
          hurryMsg = 'Better hurry!';
        }
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

  const placeName = pickedDetails?.name || picked?.name;
  const signatureDish = placeName ? getSignatureDish(placeName) : null;
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
    <SafeAreaView style={[styles.flex1, styles.safeAreaDark]}>
      <LinearGradient colors={THEME.background} style={styles.flex1}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
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
              <Text style={styles.title}>
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
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroLine}>
              {statusLine} <Text style={styles.heroBold}>✨</Text>
            </Text>

            <View ref={tourRefs.forkBtn} collapsable={false}>
              <PrimaryButton
                label={loading ? 'Picking…' : 'Just fork it.'}
                onPress={forkIt}
                disabled={loading}
                loading={loading}
                spinDeg={spinDeg}
                bounceY={bounceY}
              />
            </View>

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

            {/* Collapsible Filters */}
            <TouchableOpacity
              ref={tourRefs.filtersToggle}
              collapsable={false}
              onPress={() => setFiltersExpanded(!filtersExpanded)}
              activeOpacity={0.85}
              style={styles.filtersToggle}
              accessibilityRole="button"
              accessibilityLabel={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
              accessibilityState={{ expanded: filtersExpanded }}
            >
              <View style={styles.rowCenter}>
                <Ionicons name="options" size={16} color={THEME.textBright} />
                <Text style={styles.filtersToggleText}>Filters</Text>
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
                  onClear={clearCustomLocation}
                  onOpen={() => setShowLocationSearch(true)}
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
                    <Text style={styles.toggleLabel}>Recently shown: {recentlyShown.length}</Text>
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

            <View ref={tourRefs.spotsRow} collapsable={false} style={styles.featurePills}>
              <TouchableOpacity
                ref={tourRefs.modeToggle}
                collapsable={false}
                onPress={() => {
                  const next = travelMode === 'drive' ? 'walk' : 'drive';
                  setTravelMode(next);
                  AsyncStorage.setItem(STORAGE_KEYS.TRAVEL_MODE, next).catch(() => {});
                  if (next === 'walk' && radiusMiles > WALK_RADIUS_MAX)
                    setRadiusMiles(WALK_RADIUS_DEFAULT);
                  if (next === 'drive' && radiusMiles < DRIVE_RADIUS_MIN)
                    setRadiusMiles(DRIVE_RADIUS_DEFAULT);
                  if (next === 'drive') walkSuggestedRef.current = false;
                }}
                style={[
                  styles.footerActionBtn,
                  {
                    backgroundColor: travelMode === 'walk' ? THEME.popBgMedium : THEME.surfaceHover,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Switch to ${travelMode === 'walk' ? 'drive' : 'walk'} mode`}
              >
                <Ionicons
                  name={travelMode === 'walk' ? 'walk' : 'car'}
                  size={14}
                  color={travelMode === 'walk' ? THEME.pop : THEME.textSubtle}
                />
              </TouchableOpacity>
              {favorites.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowFavorites(true)}
                  style={styles.footerActionBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${favorites.length} favorites`}
                >
                  <Ionicons name="heart" size={14} color={THEME.accent} />
                  <Text style={styles.footerActionText}>{favorites.length}</Text>
                </TouchableOpacity>
              )}
              {blockedIds.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowBlocked(true)}
                  style={styles.footerActionBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${blockedIds.length} blocked restaurants`}
                >
                  <Ionicons name="ban" size={14} color={THEME.muted} />
                  <Text style={styles.footerActionText}>{blockedIds.length}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowCustomPlaces(true)}
                style={styles.footerActionBtn}
                accessibilityRole="button"
                accessibilityLabel="Manage your spots"
              >
                <Ionicons name="add-circle" size={14} color={THEME.pop} />
                <Text style={styles.footerActionText}>Spots</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Result - Moved to top */}
          {picked ? (
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
                        onPress={() => Linking.openURL(l.url)}
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
                onPress={() => setShowSupport(true)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Support ForkFate"
              >
                <Ionicons name="cafe-outline" size={18} color={THEME.textHint} />
              </TouchableOpacity>
              <TouchableOpacity
                ref={tourRefs.infoBtn}
                collapsable={false}
                onPress={() => setShowInfo(true)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="About ForkFate"
              >
                <Ionicons name="information-circle-outline" size={18} color={THEME.textHint} />
              </TouchableOpacity>
            </View>
            <Text style={styles.footer}>Life's too short to debate dinner.</Text>
          </View>
        </ScrollView>

        {/* Tour Spotlight Modal */}
        <Modal
          visible={showTour}
          transparent
          animationType="fade"
          onRequestClose={endTour}
          statusBarTranslucent
        >
          <View style={styles.tourOverlay} accessibilityViewIsModal>
            {/* Dark overlay with spotlight cutout */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={endTour}
              accessibilityLabel="Skip tour"
              accessibilityRole="button"
            />

            {/* Spotlight ring */}
            {tourSpotLayout && (
              <View
                style={[
                  styles.tourSpotlight,
                  {
                    top: tourSpotLayout.y - TOUR_SPOT_PAD,
                    left: tourSpotLayout.x - TOUR_SPOT_PAD,
                    width: tourSpotLayout.width + TOUR_SPOT_PAD * 2,
                    height: tourSpotLayout.height + TOUR_SPOT_PAD * 2,
                    borderRadius: TOUR_STEPS[tourStep]?.ref === 'infoBtn' ? 999 : TOUR_SPOT_RADIUS,
                  },
                ]}
                pointerEvents="none"
              />
            )}

            {/* Tooltip — positioned near spotlight, or centered if no spotlight */}
            {(tourSpotLayout || TOUR_STEPS[tourStep]?.mock) && (
              <View
                style={[
                  styles.tourTooltip,
                  tourSpotLayout
                    ? TOUR_STEPS[tourStep]?.arrow === 'down'
                      ? { top: tourSpotLayout.y + tourSpotLayout.height + TOUR_SPOT_PAD * 3 }
                      : {
                          top: Math.max(
                            tourSpotLayout.y - TOUR_TOOLTIP_HEIGHT,
                            TOUR_TOOLTIP_MIN_TOP,
                          ),
                        }
                    : styles.tourTooltipCentered,
                ]}
                pointerEvents="box-none"
              >
                {/* Arrow (only when attached to a spotlight) */}
                {tourSpotLayout && TOUR_STEPS[tourStep]?.arrow && (
                  <View
                    style={[
                      styles.tourArrow,
                      TOUR_STEPS[tourStep]?.arrow === 'down'
                        ? styles.tourArrowUp
                        : styles.tourArrowDown,
                      {
                        left: Math.min(
                          Math.max(
                            tourSpotLayout.x + tourSpotLayout.width / 2 - TOUR_ARROW_OFFSET,
                            10,
                          ),
                          Dimensions.get('window').width - TOUR_ARROW_OFFSET * 2,
                        ),
                      },
                    ]}
                  />
                )}
                <Text style={styles.tourStepCount}>
                  {tourStep + 1} of {TOUR_STEP_COUNT}
                </Text>
                <Text style={styles.tourTitle}>{TOUR_STEPS[tourStep]?.title}</Text>
                <Text style={styles.tourDesc}>{TOUR_STEPS[tourStep]?.desc}</Text>

                {/* Mock recipe preview */}
                {TOUR_STEPS[tourStep]?.mock === 'recipes' && (
                  <View style={styles.tourMockCard}>
                    <Text style={styles.tourMockTitle}>Joe's Pizza</Text>
                    <Text style={styles.tourMockSub}>0.3 mi · $$ · 4.5 ★</Text>
                    <View style={styles.tourMockDivider} />
                    <View style={styles.tourMockRow}>
                      <View style={[styles.tourMockBtn, styles.tourMockYoutube]}>
                        <Text style={styles.tourMockBtnText}>▶ YouTube</Text>
                      </View>
                      <View style={[styles.tourMockBtn, styles.tourMockGoogle]}>
                        <Text style={styles.tourMockBtnText}>🔍 Google</Text>
                      </View>
                      <View style={[styles.tourMockBtn, styles.tourMockAllrecipes]}>
                        <Text style={styles.tourMockBtnText}>📖 Allrecipes</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Dots */}
                <View style={styles.tourFooter}>
                  <View style={styles.tourDots}>
                    {Array.from({ length: TOUR_STEP_COUNT }).map((_, i) => (
                      <View
                        key={i}
                        style={[styles.tourDot, i === tourStep && styles.tourDotActive]}
                      />
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.tourNextBtn}
                    onPress={advanceTour}
                    accessibilityRole="button"
                    accessibilityLabel={
                      tourStep === TOUR_STEP_COUNT - 1 ? 'Finish tour' : 'Next step'
                    }
                  >
                    <Text style={styles.tourNextText}>
                      {tourStep === TOUR_STEP_COUNT - 1 ? 'Get Forking!' : 'Next'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {tourStep < TOUR_STEP_COUNT - 1 && (
                  <TouchableOpacity
                    onPress={endTour}
                    style={styles.tourSkip}
                    accessibilityRole="button"
                    accessibilityLabel="Skip tour"
                  >
                    <Text style={styles.tourSkipText}>Skip tour</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </Modal>

        <Modal
          visible={showInfo}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowInfo(false);
            easterEggTaps.current = 0;
          }}
          statusBarTranslucent
        >
          <View style={styles.infoOverlay} accessibilityViewIsModal>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => {
                setShowInfo(false);
                easterEggTaps.current = 0;
              }}
              accessibilityLabel="Close info"
              accessibilityRole="button"
            />
            <View style={styles.infoCard} accessibilityRole="none">
              <TouchableOpacity
                style={styles.infoClose}
                onPress={() => {
                  setShowInfo(false);
                  easterEggTaps.current = 0;
                }}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={22} color={THEME.textIcon} />
              </TouchableOpacity>

              <View style={[styles.infoModalRow, styles.modalContentHeight]}>
                <ScrollView
                  style={styles.flex1}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={(w, h) =>
                    setInfoScrollVisible(h > SCREEN_HEIGHT * MODAL_CONTENT_RATIO)
                  }
                  onScroll={({ nativeEvent }) => {
                    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
                    const maxScroll = contentSize.height - layoutMeasurement.height;
                    setInfoScrollRatio(maxScroll > 0 ? contentOffset.y / maxScroll : 0);
                  }}
                  scrollEventThrottle={16}
                >
                  <TouchableOpacity
                    style={styles.tourLaunchBtn}
                    onPress={() => {
                      setShowInfo(false);
                      easterEggTaps.current = 0;
                      setTimeout(() => startTour(), SUPPORT_MODAL_DELAY);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Take a tour of ForkFate features"
                  >
                    <Ionicons name="compass-outline" size={16} color={THEME.pop} />
                    <Text style={styles.tourLaunchText}>Take a Tour</Text>
                    <Text style={styles.tourLaunchSub}>or read below</Text>
                  </TouchableOpacity>

                  <Text
                    style={[styles.infoHeading, styles.marginTopNone]}
                    accessibilityRole="header"
                  >
                    How ForkFate Works
                  </Text>
                  <Text style={styles.infoText}>
                    ForkFate uses Google Maps to find restaurants near you based on your filters,
                    then picks one at random - so you never have to debate dinner again.
                  </Text>

                  <Text style={styles.infoHeading} accessibilityRole="header">
                    Powered by Google Places
                  </Text>
                  <Text style={styles.infoText}>
                    Restaurant names, ratings, prices, and hours all come from Google's Places API.
                    We don't make this stuff up.
                  </Text>

                  <Text style={styles.infoHeading} accessibilityRole="header">
                    Filters & Search
                  </Text>
                  <Text style={styles.infoText}>
                    Use cuisine keywords to narrow results (e.g. "pizza", "seafood"). Pick quick-tap
                    filters for common cravings. ForkFate also remembers what it already showed you
                    during your session and won't repeat them - resets when you close the app.
                  </Text>

                  <Text style={styles.infoHeading} accessibilityRole="header">
                    Skip the Chains
                  </Text>
                  <Text style={styles.infoText}>
                    When this is on, ForkFate filters out common chain restaurants and places with
                    lots of reviews (500+) so you're more likely to discover local spots. Turn it
                    off if you're cool with the usual suspects.
                  </Text>

                  <Text style={styles.infoHeading} accessibilityRole="header">
                    Limitations
                  </Text>
                  <Text style={styles.infoText}>
                    Results depend on what Google has listed in your area. Some spots may be
                    missing, have outdated hours, or inaccurate info. Ratings and prices come
                    straight from Google. The more specific your filters, the fewer results you'll
                    get.
                  </Text>

                  <Text style={styles.infoHeading} accessibilityRole="header">
                    Your Location
                  </Text>
                  <Text style={styles.infoText}>
                    Your location is used only to find nearby spots. It's temporarily cached on your
                    device, expires after 1 hour, and is never sent to our servers.
                  </Text>

                  <Text
                    style={[styles.infoHeading, { color: THEME.pop }]}
                    accessibilityRole="header"
                  >
                    Your Stuff
                  </Text>
                  <Text style={styles.infoText}>
                    {'\u2022'} Tap the heart on a result to save favorites{'\n'}
                    {'\u2022'} Tap "Never Again" to permanently block a place{'\n'}
                    {'\u2022'} Use "Spots" to add your own places (like Mom's house) to the random
                    pool{'\n'}
                    {'\u2022'} Tap "More Like This" to instantly search for more of the same cuisine
                    - if ForkFate picks a Thai place, it'll find other Thai spots nearby{'\n'}
                    {'\u2022'} Your favorites, blocked list, and custom spots are saved on your
                    device
                  </Text>

                  <Text
                    style={[styles.infoHeading, { color: THEME.pop }]}
                    accessibilityRole="header"
                  >
                    Coming Soon
                  </Text>
                  <Text style={styles.infoText}>
                    {'\u2022'} Restricted eater mode - dietary filters for allergies, preferences,
                    and restrictions{'\n'}
                    {'\u2022'} Copycat recipe optimization - better recipe matches for your picked
                    spot{'\n'}
                    {'\u2022'} More to come - we're just getting started
                  </Text>

                  <View style={styles.infoSupportDivider}>
                    <Text
                      style={[styles.infoHeading, styles.infoSupportHeading]}
                      accessibilityRole="header"
                    >
                      {'\u2615'} Support ForkFate
                    </Text>
                    <Text style={styles.infoText}>
                      Born in the heat of a dinner battle royale. Maintained by coffee. If ForkFate
                      saved you from the "I don't know" spiral, contribute to the addiction.
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowInfo(false);
                        setTimeout(() => setShowSupport(true), SUPPORT_MODAL_DELAY);
                      }}
                      style={[
                        styles.supportBtn,
                        {
                          backgroundColor: THEME.accentBg,
                          borderColor: THEME.accentBorder,
                        },
                        styles.infoSupportBtnWrap,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Open support options"
                    >
                      <Ionicons name="cafe" size={16} color={THEME.accent} />
                      <Text style={[styles.supportBtnText, { color: THEME.accent }]}>
                        Support ForkFate
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={styles.versionText}
                    onPress={() => {
                      easterEggTaps.current += 1;
                      if (easterEggTaps.current >= EASTER_EGG_TAPS) {
                        easterEggTaps.current = 0;
                        setShowInfo(false);
                        openMapsSearchByText('88 Buffet Huntsville AL');
                      }
                    }}
                    suppressHighlighting
                  >
                    v1.0.0
                  </Text>
                </ScrollView>
                {infoScrollVisible && (
                  <View style={styles.scrollTrack}>
                    <View
                      style={[
                        styles.scrollThumb,
                        { top: `${infoScrollRatio * SCROLL_THUMB_PERCENT}%` },
                      ]}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* Support Modal */}
        <Modal
          visible={showSupport}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSupport(false)}
          statusBarTranslucent
        >
          <View style={styles.infoOverlay} accessibilityViewIsModal>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowSupport(false)}
              accessibilityLabel="Close support"
              accessibilityRole="button"
            />
            <View style={styles.infoCard} accessibilityRole="none">
              <TouchableOpacity
                style={styles.infoClose}
                onPress={() => setShowSupport(false)}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={22} color={THEME.textIcon} />
              </TouchableOpacity>

              <Text
                style={[styles.infoHeading, styles.supportHeadingCenter]}
                accessibilityRole="header"
              >
                Support ForkFate
              </Text>
              <Text style={[styles.infoText, styles.supportSubCenter]}>
                Born in the heat of a dinner battle royale. Maintained by coffee.{'\n'}
                <Text style={styles.supportHighlight}>Contribute to the addiction?</Text>
              </Text>

              <TouchableOpacity
                style={[styles.supportBtn, { backgroundColor: THEME.venmo }]}
                onPress={() => Linking.openURL('https://venmo.com/Cherrelle-Tucker')}
                accessibilityRole="link"
                accessibilityLabel="Support via Venmo"
              >
                <Text style={styles.supportBtnIcon}>V</Text>
                <Text style={styles.supportBtnText}>Venmo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.supportBtn, { backgroundColor: THEME.cashApp }]}
                onPress={() => Linking.openURL('https://cash.app/$CherrelleJTucker')}
                accessibilityRole="link"
                accessibilityLabel="Support via Cash App"
              >
                <Text style={styles.supportBtnIcon}>$</Text>
                <Text style={styles.supportBtnText}>Cash App</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.supportBtn, { backgroundColor: THEME.kofi }]}
                onPress={() => Linking.openURL('https://ko-fi.com/ctucker')}
                accessibilityRole="link"
                accessibilityLabel="Support via Ko-fi"
              >
                <Text style={styles.supportBtnIcon}>{'\u2615'}</Text>
                <Text style={styles.supportBtnText}>Ko-fi</Text>
              </TouchableOpacity>

              <View style={styles.supportFooterRow}>
                <Text style={styles.supportBrandText}>ForkFate</Text>
                <ForkIcon size={16} color={THEME.accent} />
              </View>
            </View>
          </View>
        </Modal>

        {/* Favorites Modal */}
        <Modal
          visible={showFavorites}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowFavorites(false);
            setExpandedFavId(null);
            setEditingFavId(null);
          }}
          statusBarTranslucent
        >
          <View style={styles.infoOverlay} accessibilityViewIsModal>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => {
                setShowFavorites(false);
                setExpandedFavId(null);
                setEditingFavId(null);
              }}
              accessibilityLabel="Close favorites"
              accessibilityRole="button"
            />
            <View style={styles.listCard}>
              <TouchableOpacity
                style={styles.infoClose}
                onPress={() => {
                  setShowFavorites(false);
                  setExpandedFavId(null);
                  setEditingFavId(null);
                }}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={22} color={THEME.textIcon} />
              </TouchableOpacity>
              <Text style={[styles.infoHeading, styles.marginTopNone]} accessibilityRole="header">
                Favorites ({favorites.length})
              </Text>
              <ScrollView
                style={styles.modalListHeight}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {favorites.length === 0 ? (
                  <Text style={styles.infoText}>
                    No favorites yet. Tap the heart on a result to save it.
                  </Text>
                ) : (
                  favorites.map((fav) => {
                    const isExpanded = expandedFavId === fav.place_id;
                    const isEditing = editingFavId === fav.place_id;
                    return (
                      <View key={fav.place_id} style={[styles.listItem, styles.listItemColumn]}>
                        {/* Collapsed row — always visible */}
                        <TouchableOpacity
                          onPress={() => {
                            setExpandedFavId(isExpanded ? null : fav.place_id);
                            setEditingFavId(null);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} ${fav.name}`}
                        >
                          <View style={styles.rowCenter}>
                            <View style={styles.flex1}>
                              <Text style={styles.listItemName}>{fav.name}</Text>
                              <Text style={styles.listItemSub}>
                                {fav.rating ? `${fav.rating} \u2605` : ''}
                                {fav.vicinity ? ` \u00B7 ${fav.vicinity}` : ''}
                              </Text>
                              {!isExpanded && fav.userNotes ? (
                                <Text
                                  style={[styles.listItemSub, styles.fontItalic]}
                                  numberOfLines={1}
                                >
                                  {fav.userNotes}
                                </Text>
                              ) : null}
                            </View>
                            <Ionicons
                              name={isExpanded ? 'chevron-up' : 'chevron-down'}
                              size={16}
                              color={THEME.textFaint}
                            />
                          </View>
                        </TouchableOpacity>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <View style={styles.favDetailSection}>
                            {/* Notes & dishes — edit or read-only */}
                            {isEditing ? (
                              <View style={styles.marginTop8}>
                                <View style={styles.inputWrap}>
                                  <Ionicons
                                    name="chatbubble-outline"
                                    size={14}
                                    color={THEME.textHalf}
                                  />
                                  <TextInput
                                    value={editNotes}
                                    onChangeText={setEditNotes}
                                    placeholder="Personal notes..."
                                    placeholderTextColor={THEME.textHint}
                                    style={[styles.input, styles.fontSize12]}
                                    accessibilityLabel="Personal notes for this favorite"
                                    keyboardAppearance="dark"
                                    multiline
                                  />
                                </View>
                                <View style={[styles.inputWrap, styles.inputMarginTop6]}>
                                  <Ionicons
                                    name="restaurant-outline"
                                    size={14}
                                    color={THEME.textHalf}
                                  />
                                  <TextInput
                                    value={editDishes}
                                    onChangeText={setEditDishes}
                                    placeholder="What to order..."
                                    placeholderTextColor={THEME.textHint}
                                    style={[styles.input, styles.fontSize12]}
                                    accessibilityLabel="Dishes to order at this favorite"
                                    keyboardAppearance="dark"
                                    multiline
                                  />
                                </View>
                                <TouchableOpacity
                                  style={[styles.addBtn, styles.editSaveBtn]}
                                  onPress={() => {
                                    updateFavorite(
                                      fav.place_id,
                                      {
                                        userNotes: editNotes.trim(),
                                        userDishes: editDishes.trim(),
                                      },
                                      favorites,
                                      setFavorites,
                                    );
                                    setEditingFavId(null);
                                    showToast('Saved!', 'success', TOAST_SHORT);
                                  }}
                                  accessibilityRole="button"
                                  accessibilityLabel="Save notes"
                                >
                                  <Ionicons name="checkmark" size={16} color={THEME.white} />
                                  <Text style={styles.addBtnText}>Save</Text>
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <View style={styles.marginTop8}>
                                {fav.userNotes ? (
                                  <Text style={styles.favDetailText}>
                                    <Text style={styles.favDetailLabel}>Notes: </Text>
                                    {fav.userNotes}
                                  </Text>
                                ) : null}
                                {fav.userDishes ? (
                                  <Text style={styles.favDetailText}>
                                    <Text style={styles.favDetailLabel}>Order: </Text>
                                    {fav.userDishes}
                                  </Text>
                                ) : null}
                              </View>
                            )}

                            {/* Action buttons */}
                            <View style={styles.favActionRow}>
                              <TouchableOpacity
                                onPress={() => openMapsSearchByText(fav.vicinity || fav.name)}
                                style={styles.favActionBtn}
                                accessibilityLabel={`Directions to ${fav.name}`}
                                accessibilityRole="button"
                              >
                                <Ionicons name="map-outline" size={16} color={THEME.pop} />
                                <Text style={styles.favActionBtnText}>Directions</Text>
                              </TouchableOpacity>
                              {!isEditing && (
                                <TouchableOpacity
                                  onPress={() => {
                                    setEditNotes(fav.userNotes || '');
                                    setEditDishes(fav.userDishes || '');
                                    setEditingFavId(fav.place_id);
                                  }}
                                  style={styles.favActionBtn}
                                  accessibilityLabel={`Edit notes for ${fav.name}`}
                                  accessibilityRole="button"
                                >
                                  <Ionicons
                                    name="pencil-outline"
                                    size={16}
                                    color={THEME.textSubtle}
                                  />
                                </TouchableOpacity>
                              )}
                              <TouchableOpacity
                                onPress={() => {
                                  showAlert(
                                    'Remove Favorite',
                                    `Remove "${fav.name}" from favorites?`,
                                    [
                                      { text: 'Cancel', style: 'cancel' },
                                      {
                                        text: 'Remove',
                                        style: 'destructive',
                                        onPress: () => {
                                          toggleFavorite(fav, favorites, setFavorites);
                                          setExpandedFavId(null);
                                          showToast(
                                            'Removed from favorites.',
                                            'success',
                                            TOAST_SHORT,
                                          );
                                        },
                                      },
                                    ],
                                  );
                                }}
                                style={styles.favActionBtn}
                                accessibilityLabel={`Remove ${fav.name}`}
                                accessibilityRole="button"
                              >
                                <Ionicons
                                  name="heart-dislike-outline"
                                  size={16}
                                  color={THEME.accent}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Blocked Places Modal */}
        <Modal
          visible={showBlocked}
          transparent
          animationType="fade"
          onRequestClose={() => setShowBlocked(false)}
          statusBarTranslucent
        >
          <View style={styles.infoOverlay} accessibilityViewIsModal>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowBlocked(false)}
              accessibilityLabel="Close blocked list"
              accessibilityRole="button"
            />
            <View style={styles.listCard}>
              <TouchableOpacity
                style={styles.infoClose}
                onPress={() => setShowBlocked(false)}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={22} color={THEME.textIcon} />
              </TouchableOpacity>
              <Text style={[styles.infoHeading, styles.marginTopNone]} accessibilityRole="header">
                Blocked ({blockedIds.length})
              </Text>
              <ScrollView style={styles.modalListHeight} showsVerticalScrollIndicator={false}>
                {blockedIds.length === 0 ? (
                  <Text style={styles.infoText}>No blocked restaurants.</Text>
                ) : (
                  blockedIds.map((b) => (
                    <View key={b.place_id} style={styles.listItem}>
                      <Text style={[styles.listItemName, styles.blockedItemName]}>{b.name}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          unblockPlace(b.place_id, blockedIds, setBlockedIds);
                          showToast(`Unblocked ${b.name}.`, 'success', TOAST_SHORT);
                        }}
                        accessibilityLabel={`Unblock ${b.name}`}
                        accessibilityRole="button"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close-circle-outline" size={20} color={THEME.muted} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Custom Places Modal */}
        <Modal
          visible={showCustomPlaces}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowCustomPlaces(false);
            setSpotsSearch('');
            setSpotsMsg(null);
            setAddressSuggestions([]);
          }}
          statusBarTranslucent
        >
          <View style={styles.infoOverlay} accessibilityViewIsModal>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => {
                setShowCustomPlaces(false);
                setSpotsSearch('');
                setSpotsMsg(null);
                setAddressSuggestions([]);
              }}
              accessibilityLabel="Close your spots"
              accessibilityRole="button"
            />
            <View style={styles.listCard}>
              <TouchableOpacity
                style={styles.infoClose}
                onPress={() => {
                  setShowCustomPlaces(false);
                  setSpotsSearch('');
                  setSpotsMsg(null);
                  setAddressSuggestions([]);
                }}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={22} color={THEME.textIcon} />
              </TouchableOpacity>
              <Text style={[styles.infoHeading, styles.marginTopNone]} accessibilityRole="header">
                Your Spots ({customPlaces.length})
              </Text>

              <View style={styles.customForm}>
                {spotsMsg && (
                  <Text
                    style={[
                      styles.spotsMsg,
                      { color: spotsMsg.type === 'error' ? THEME.error : THEME.pop },
                    ]}
                  >
                    {spotsMsg.text}
                  </Text>
                )}
                <View style={styles.inputWrap}>
                  <Ionicons name="restaurant-outline" size={16} color={THEME.textSubtle} />
                  <TextInput
                    value={newCustomName}
                    onChangeText={(t) => {
                      setNewCustomName(t);
                      setSpotsMsg(null);
                    }}
                    placeholder="Name (e.g. Mom's house)"
                    accessibilityLabel="Name of your custom spot"
                    placeholderTextColor={THEME.textFaint}
                    style={styles.input}
                    keyboardAppearance="dark"
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.addressFieldWrap}>
                  <View style={styles.inputWrap}>
                    <Ionicons name="location-outline" size={16} color={THEME.textSubtle} />
                    <TextInput
                      value={newCustomAddress}
                      accessibilityLabel="Address of your custom spot"
                      onChangeText={(text) => {
                        setNewCustomAddress(text);
                        if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
                        if (text.trim().length >= 3) {
                          addressDebounceRef.current = setTimeout(async () => {
                            const { suggestions, error } = await fetchAddressSuggestions(
                              text,
                              coords,
                            );
                            setAddressSuggestions(suggestions);
                            if (error === 'rate_limit') {
                              setSpotsMsg({
                                type: 'error',
                                text: 'Slow down — too many requests. Wait a moment.',
                              });
                              setTimeout(() => setSpotsMsg(null), SPOTS_ERROR_TOAST_MS);
                            }
                          }, DEBOUNCE_DELAY);
                        } else {
                          setAddressSuggestions([]);
                        }
                      }}
                      placeholder="Address (optional)"
                      placeholderTextColor={THEME.textFaint}
                      style={styles.input}
                      keyboardAppearance="dark"
                      returnKeyType="next"
                    />
                  </View>
                  {addressSuggestions.length > 0 && (
                    <View style={styles.suggestionsDropdown}>
                      {addressSuggestions.map((s) => (
                        <TouchableOpacity
                          key={s.placeId}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setNewCustomAddress(s.description);
                            setAddressSuggestions([]);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={s.description}
                        >
                          <Ionicons
                            name="location"
                            size={13}
                            color={THEME.accent}
                            style={styles.suggestionIconWrap}
                          />
                          <View style={styles.flex1}>
                            <Text style={styles.suggestionMain}>{s.mainText}</Text>
                            {s.secondaryText ? (
                              <Text style={styles.suggestionSub}>{s.secondaryText}</Text>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <View style={[styles.inputWrap, styles.spotInputMarginTop8]}>
                  <Ionicons name="chatbubble-outline" size={16} color={THEME.textSubtle} />
                  <TextInput
                    value={newCustomNotes}
                    onChangeText={setNewCustomNotes}
                    placeholder="Notes (optional)"
                    accessibilityLabel="Notes for your custom spot"
                    placeholderTextColor={THEME.textFaint}
                    style={styles.input}
                    keyboardAppearance="dark"
                    returnKeyType="done"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const result = addCustomPlace(newCustomName, newCustomAddress, {
                      notes: newCustomNotes,
                      currentCustom: customPlaces,
                      setCustom: setCustomPlaces,
                    });
                    if (result.ok) {
                      setNewCustomName('');
                      setNewCustomAddress('');
                      setNewCustomNotes('');
                      setAddressSuggestions([]);
                      setSpotsMsg({ type: 'success', text: 'Added!' });
                      setTimeout(() => setSpotsMsg(null), ADDED_TOAST_MS);
                    } else if (result.dupe) {
                      const dupeMsg =
                        result.reason === 'address'
                          ? `Not saved — address is already in your spots under "${result.dupe}".`
                          : `Not saved — "${result.dupe}" is already in your spots${result.dupeAddr ? ` at ${result.dupeAddr}` : ''}.`;
                      setSpotsMsg({ type: 'error', text: dupeMsg });
                    }
                  }}
                  disabled={!newCustomName.trim()}
                  style={[styles.addBtn, !newCustomName.trim() && styles.opacity05]}
                  accessibilityRole="button"
                  accessibilityLabel="Add spot"
                >
                  <Ionicons name="add" size={18} color={THEME.white} />
                  <Text style={styles.addBtnText}>Add Spot</Text>
                </TouchableOpacity>
              </View>

              {customPlaces.length > SPOTS_SEARCH_THRESHOLD && (
                <View style={[styles.inputWrap, styles.spotsSearchWrap]}>
                  <Ionicons name="search" size={14} color={THEME.textHalf} />
                  <TextInput
                    value={spotsSearch}
                    onChangeText={setSpotsSearch}
                    placeholder="Search your spots..."
                    accessibilityLabel="Search your custom spots"
                    placeholderTextColor={THEME.textHint}
                    style={[styles.input, styles.fontSize12]}
                    keyboardAppearance="dark"
                    returnKeyType="done"
                  />
                </View>
              )}
              <ScrollView
                style={styles.modalSpotsHeight}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {customPlaces
                  .filter((cp) => {
                    if (!spotsSearch.trim()) return true;
                    const q = normalize(spotsSearch);
                    return (
                      normalize(cp.name).includes(q) ||
                      normalize(cp.vicinity || '').includes(q) ||
                      normalize(cp.notes || '').includes(q)
                    );
                  })
                  .map((cp) => (
                    <View key={cp.place_id} style={styles.listItem}>
                      <View style={styles.flex1}>
                        <Text style={styles.listItemName}>{cp.name}</Text>
                        {cp.vicinity ? <Text style={styles.listItemSub}>{cp.vicinity}</Text> : null}
                        {cp.notes ? (
                          <Text style={[styles.listItemSub, styles.fontItalic]}>{cp.notes}</Text>
                        ) : null}
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          showAlert('Remove Spot', `Remove "${cp.name}" from your spots?`, [
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: () => {
                                removeCustomPlace(cp.place_id, customPlaces, setCustomPlaces);
                                showToast(`Removed ${cp.name}.`, 'success', TOAST_SHORT);
                              },
                            },
                            { text: 'Cancel', style: 'cancel' },
                          ]);
                        }}
                        accessibilityLabel={`Remove ${cp.name}`}
                        accessibilityRole="button"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={18} color={THEME.muted} />
                      </TouchableOpacity>
                    </View>
                  ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
        <Toast text={toast.text} kind={toast.kind} />
      </LinearGradient>
    </SafeAreaView>
  );
}

// ==============================
// STYLES
// ==============================

const styles = StyleSheet.create({
  container: { padding: scale(14), paddingTop: scale(30), paddingBottom: scale(20) },

  header: { alignItems: 'center', marginBottom: scale(10), marginTop: scale(16) },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  title: {
    color: THEME.accent,
    fontSize: scale(TITLE_FONT_SIZE),
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 0.2,
    lineHeight: scale(TITLE_LINE_HEIGHT),
  },
  titleIt: { color: THEME.pop },

  toastWrap: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    zIndex: 1100,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: THEME.toastBg,
    borderWidth: 1,
    borderColor: THEME.borderFaint,
  },
  toastText: { color: THEME.textPrimary, fontWeight: '900' },

  hero: {
    padding: scale(12),
    borderRadius: 18,
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: THEME.borderFaint,
    backgroundColor: THEME.surfaceLight,
  },
  heroLine: { color: THEME.textBold, fontSize: 14, lineHeight: 18, marginBottom: 12 },
  heroBold: { color: THEME.white, fontWeight: '900' },

  primaryBtn: {
    borderRadius: 14,
    paddingVertical: scale(12),
    paddingHorizontal: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryText: { color: THEME.white, fontWeight: '900', fontSize: 16 },

  forkingLine: {
    marginTop: 10,
    color: THEME.textNearWhite,
    fontSize: 13,
    fontWeight: '900',
  },
  filtersToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    backgroundColor: THEME.surfaceLight,
  },
  filtersToggleText: {
    color: THEME.textBright,
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 8,
  },
  filterCount: {
    color: THEME.pop,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 10,
  },
  filtersContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.borderThin,
  },

  slotBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.borderFaint,
    backgroundColor: THEME.surfaceInput,
  },
  slotLabel: { color: THEME.textIcon, fontSize: 12, fontWeight: '800' },
  slotText: { marginTop: 6, color: THEME.textPrimary, fontSize: 14, fontWeight: '950' },

  cardOuter: {
    borderRadius: 18,
    marginBottom: scale(10),
    shadowColor: THEME.black,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardOuterAccent: {
    shadowColor: THEME.accent,
    shadowOpacity: 0.4,
  },
  card: {
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: THEME.borderMedium,
    backgroundColor: THEME.accentBg,
    overflow: 'hidden',
  },
  cardContent: {
    backgroundColor: THEME.surfaceCard,
    borderRadius: 14,
    padding: scale(14),
  },
  cardAccent: {
    borderColor: THEME.accentBorder,
    backgroundColor: THEME.accentBgLight,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardTitle: { color: THEME.white, fontSize: 16, fontWeight: '900' },

  label: { color: THEME.textSecondary, fontSize: 12, marginTop: 10, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 34,
  },
  chipIdle: { backgroundColor: THEME.surfaceLight, borderColor: THEME.borderLight },
  chipActive: { backgroundColor: THEME.accentChip, borderColor: THEME.accent },
  chipText: { fontSize: 11, fontWeight: '900' },
  chipTextIdle: { color: THEME.textBold },
  chipTextActive: { color: THEME.white },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  toggleLabel: { color: THEME.textSecondary, fontSize: 12, fontWeight: '900' },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: THEME.surfaceClearBtn,
    borderWidth: 1,
    borderColor: THEME.borderHover,
  },
  clearBtnText: { color: THEME.textBright, fontSize: 11, fontWeight: '900' },

  placeName: {
    color: THEME.white,
    fontSize: scale(20),
    fontWeight: '950',
    marginTop: 2,
    marginBottom: scale(8),
  },

  metaRow: { flexDirection: 'row', flexWrap: 'nowrap', gap: scale(6), marginBottom: scale(10) },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.borderMedium,
    backgroundColor: THEME.surfaceLight,
    flexShrink: 1,
  },
  metaText: { color: THEME.textBold, fontWeight: '700', fontSize: 11 },

  actionRow: { flexDirection: 'row', gap: scale(8), flexWrap: 'wrap' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(10),
    paddingHorizontal: scale(10),
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.pop,
    backgroundColor: THEME.transparent,
    flexGrow: 1,
    minHeight: 44,
  },
  ghostText: { color: THEME.textAlmostWhite, fontWeight: '900' },

  divider: { height: 1, backgroundColor: THEME.borderFaint, marginVertical: scale(10) },

  sectionTitle: { color: THEME.white, fontSize: 14, fontWeight: '950', marginBottom: 6 },
  muted: { color: THEME.textSubtle, fontSize: 13, lineHeight: 18 },

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
  attribution: { color: THEME.textDimmed, fontSize: 11, textAlign: 'right', marginTop: 8 },

  footer: {
    marginTop: 6,
    textAlign: 'center',
    color: THEME.textHalf,
    fontSize: 12,
    lineHeight: 16,
  },
  footerRow: { alignItems: 'center', marginTop: 4, marginBottom: 8 },
  infoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: THEME.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  infoCard: {
    backgroundColor: THEME.surfaceModal,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    padding: 24,
    marginHorizontal: 24,
    maxWidth: 380,
    width: '90%',
  },
  infoClose: { position: 'absolute', top: 12, right: 12, zIndex: 1 },
  infoHeading: {
    color: THEME.accent,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 14,
    marginBottom: 4,
  },
  infoText: { color: THEME.textSecondary, fontSize: 13, fontWeight: '600', lineHeight: 19 },
  scrollTrack: {
    width: 4,
    backgroundColor: THEME.borderDim,
    borderRadius: 2,
    marginLeft: 8,
    marginTop: 30,
  },
  scrollThumb: {
    position: 'absolute',
    width: 4,
    height: '30%',
    backgroundColor: THEME.popThumb,
    borderRadius: 2,
  },

  // Favorites, Block, Custom Places
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
    gap: 6,
    flex: 1,
    paddingVertical: scale(8),
    paddingHorizontal: scale(10),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.popBorder,
    backgroundColor: THEME.popBg,
    minHeight: 44,
  },
  moreLikeBtnText: { color: THEME.pop, fontSize: 12, fontWeight: '900' },
  listCard: {
    backgroundColor: THEME.surfaceModal,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    padding: 24,
    marginHorizontal: 24,
    maxWidth: 380,
    width: '90%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderDim,
  },
  listItemName: { color: THEME.textPrimary, fontSize: 14, fontWeight: '800' },
  listItemSub: { color: THEME.textMuted, fontSize: 12, marginTop: 2 },
  featurePills: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  footerIcons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  supportBtnIcon: { color: THEME.white, fontSize: 18, fontWeight: '900', fontStyle: 'italic' },
  supportBtnText: { color: THEME.white, fontSize: 15, fontWeight: '700' },
  footerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: THEME.surfaceHover,
  },
  footerActionText: { color: THEME.textSubtle, fontSize: 11, fontWeight: '800' },
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: THEME.popBgMedium,
    borderWidth: 1,
    borderColor: THEME.popBorderMedium,
    marginBottom: 6,
  },
  customBadgeText: { color: THEME.pop, fontSize: 10, fontWeight: '800' },
  customForm: {
    marginVertical: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderDim,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: THEME.accent,
  },
  addBtnText: { color: THEME.white, fontWeight: '900', fontSize: 14 },
  suggestionsDropdown: {
    backgroundColor: THEME.surfaceDropdown,
    borderWidth: 1,
    borderColor: THEME.accentBorderLight,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    maxHeight: 180,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.surfaceLight,
  },
  suggestionMain: { color: THEME.cream, fontSize: 13, fontWeight: '700' },
  suggestionSub: { color: THEME.muted, fontSize: 11, marginTop: 1 },
  favDetailSection: { width: '100%', paddingTop: 10, paddingBottom: 4 },
  favDetailLabel: { color: THEME.textMuted, fontSize: 11, fontWeight: '800' },
  favDetailText: { color: THEME.textSecondary, fontSize: 12, lineHeight: 17, marginBottom: 4 },
  favActionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  favActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.borderSubtle,
    backgroundColor: THEME.surfaceFavAction,
  },
  favActionBtnText: { color: THEME.textSecondary, fontSize: 11, fontWeight: '800' },

  // Extracted inline styles
  iconMarginRight6: { marginRight: 6 },
  iconMarginRight8: { marginRight: 8 },
  iconMarginLeft10: { marginLeft: 10 },
  opacity07: { opacity: 0.7 },
  opacity05: { opacity: 0.5 },
  animatedForkWrap: { marginRight: 10 },
  flex1: { flex: 1 },
  safeAreaDark: { backgroundColor: THEME.dark },
  loadingContainer: { flex: 1, backgroundColor: THEME.dark },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconNudge: { marginLeft: -5, marginTop: -6 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  addressPill: { minWidth: 120, maxWidth: 140 },
  flexShrink1: { flexShrink: 1 },
  recipeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  sectionTitleNoMargin: { marginBottom: 0, marginLeft: 8 },
  spacer10: { height: 10 },
  infoModalRow: { flexDirection: 'row' },
  marginTopNone: { marginTop: 0 },
  infoSupportDivider: {
    borderTopWidth: 1,
    borderTopColor: THEME.borderDim,
    marginTop: 16,
    paddingTop: 14,
  },
  infoSupportHeading: { color: THEME.cream, marginTop: 0 },
  infoSupportBtnWrap: { borderWidth: 1, marginTop: 10 },
  versionText: { color: THEME.textHint, fontSize: 11, textAlign: 'center', marginTop: 16 },
  supportHeadingCenter: { marginTop: 0, textAlign: 'center' },
  supportSubCenter: { marginBottom: 18, textAlign: 'center' },
  supportHighlight: { color: THEME.cream, fontWeight: '800' },
  supportFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  supportBrandText: { color: THEME.cream, fontSize: 13, fontWeight: '900', marginRight: 1 },
  listItemColumn: { flexDirection: 'column', alignItems: 'stretch' },
  fontItalic: { fontStyle: 'italic' },
  marginTop8: { marginTop: 8 },
  inputMarginTop6: { marginTop: 6 },
  fontSize12: { fontSize: 12 },
  editSaveBtn: { marginTop: 8, paddingVertical: 8 },
  spotsMsg: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  addressFieldWrap: { marginTop: 8, zIndex: 10 },
  locationFieldWrap: { zIndex: 10, marginTop: 10, marginBottom: 4 },
  customLocationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 6 },
  customLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: THEME.popBgMedium,
    borderWidth: 1,
    borderColor: THEME.popBorderMedium,
    maxWidth: '100%',
  },
  customLocationText: { color: THEME.pop, fontSize: 12, fontWeight: '900', flexShrink: 1 },
  suggestionIconWrap: { marginRight: 8, marginTop: 2 },
  spotsSearchWrap: { marginTop: 10, marginBottom: 4 },
  spotInputMarginTop8: { marginTop: 8 },
  blockedItemName: { flex: 1 },
  modalContentHeight: { maxHeight: SCREEN_HEIGHT * MODAL_CONTENT_RATIO },
  modalListHeight: { maxHeight: SCREEN_HEIGHT * MODAL_LIST_RATIO },
  modalSpotsHeight: { maxHeight: SCREEN_HEIGHT * MODAL_SPOTS_RATIO },

  // Tour Spotlight
  tourOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: THEME.tourOverlay,
    zIndex: 2000,
  },
  tourSpotlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: THEME.tourSpotBorder,
    backgroundColor: THEME.tourSpotBg,
    zIndex: 2001,
  },
  tourTooltip: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: THEME.tourCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.tourCardBorder,
    zIndex: 2002,
    shadowColor: THEME.black,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  tourArrow: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: THEME.tourCard,
    borderWidth: 1,
    borderColor: THEME.tourCardBorder,
    transform: [{ rotate: '45deg' }],
  },
  tourArrowUp: {
    top: -8,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tourArrowDown: {
    bottom: -8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tourStepCount: {
    fontSize: 10,
    color: THEME.tourGold,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tourTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.white,
    marginBottom: 6,
  },
  tourDesc: {
    fontSize: 12.5,
    color: THEME.tourText,
    lineHeight: 19,
    marginBottom: 10,
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  tourDots: {
    flexDirection: 'row',
    gap: 4,
  },
  tourDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.tourDotBg,
  },
  tourDotActive: {
    backgroundColor: THEME.tourGold,
    width: 16,
    borderRadius: 3,
  },
  tourNextBtn: {
    backgroundColor: THEME.tourBtnBg,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 999,
  },
  tourNextText: {
    color: THEME.tourBtnText,
    fontWeight: '800',
    fontSize: 12,
  },
  tourSkip: {
    alignSelf: 'center',
    marginTop: 8,
  },
  tourSkipText: {
    fontSize: 11,
    color: THEME.tourSkipText,
  },
  tourTooltipCentered: {
    top: '25%',
  },
  tourMockCard: {
    backgroundColor: THEME.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.borderFaint,
  },
  tourMockTitle: {
    color: THEME.tourGold,
    fontSize: 14,
    fontWeight: '900',
  },
  tourMockSub: {
    color: THEME.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  tourMockDivider: {
    height: 1,
    backgroundColor: THEME.borderDim,
    marginVertical: 8,
  },
  tourMockRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tourMockBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  tourMockYoutube: {
    backgroundColor: THEME.tourMockYoutube,
  },
  tourMockGoogle: {
    backgroundColor: THEME.tourMockGoogle,
  },
  tourMockAllrecipes: {
    backgroundColor: THEME.tourMockAllrecipes,
  },
  tourMockBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  tourLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: THEME.tourLaunchBg,
    borderWidth: 1,
    borderColor: THEME.tourLaunchBorder,
    marginBottom: 14,
  },
  tourLaunchText: {
    color: THEME.pop,
    fontSize: 14,
    fontWeight: '800',
  },
  tourLaunchSub: {
    color: THEME.tourSkipText,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 'auto',
  },
});
