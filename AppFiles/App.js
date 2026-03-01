// ForkIt — Expo Snack single-file app (App.js)
// Dependencies to add in Snack:
// - expo-location
// - expo-linear-gradient
// - expo-haptics
// - @expo/vector-icons

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFonts, Montserrat_700Bold } from "@expo-google-fonts/montserrat";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmallScreen = SCREEN_HEIGHT < 700;
const scale = (size) => isSmallScreen ? size * 0.85 : size;
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Rect, Circle, Path, G } from "react-native-svg";
import { getIntegrityToken, verifyIntegrityToken } from "./utils/integrity";
import { haptics, showAlert } from "./utils/platform";
import { requestLocationPermission, getCurrentPosition } from "./utils/location";

// Bootstrap Fork Icon - tines down with teal pea
function ForkIcon({ size = 24, color = "#FB923C", rotation = "0deg" }) {
  const width = size * (6 / 20);
  const height = size;
  return (
    <Svg width={width} height={height} viewBox="2.5 0 6 20" style={{ transform: [{ rotate: rotation }] }}>
      {/* Fork rotated 180° so tines point down, scaled narrower at tines */}
      <G transform="rotate(180, 5.5, 8) translate(5.5, 0) scale(0.8, 1) translate(-5.5, 0)">
        <Path
          d="M4.25 0a.25.25 0 0 1 .25.25v5.122a.128.128 0 0 0 .256.006l.233-5.14A.25.25 0 0 1 5.24 0h.522a.25.25 0 0 1 .25.238l.233 5.14a.128.128 0 0 0 .256-.006V.25A.25.25 0 0 1 6.75 0h.29a.5.5 0 0 1 .498.458l.423 5.07a1.69 1.69 0 0 1-1.059 1.711l-.053.022a.92.92 0 0 0-.58.884L6.47 15a.971.971 0 1 1-1.942 0l.202-6.855a.92.92 0 0 0-.58-.884l-.053-.022a1.69 1.69 0 0 1-1.059-1.712L3.462.458A.5.5 0 0 1 3.96 0z"
          fill={color}
        />
      </G>
      {/* Teal pea below fork */}
      <Circle cx="5.5" cy="18" r="1.5" fill="#2DD4BF" />
    </Svg>
  );
}

// ==============================
// CONFIG
// ==============================

// Backend API URL from environment variables
// For local development, add to .env file
// For EAS Build, use: eas secret:create --scope project --name EXPO_PUBLIC_BACKEND_URL --value your_url
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

// Theme colors - "Fork it" energy (Orange + Teal + Cream)
const THEME = {
  accent: "#FB923C",        // Bright orange - primary accent
  accentLight: "#FDBA74",   // Lighter orange for gradients
  accentDark: "#EA580C",    // Deeper orange for contrast
  pop: "#2DD4BF",           // Punchy teal - secondary pop color
  success: "#2DD4BF",       // Teal for success states
  cream: "#FEF3E2",         // Warm cream for highlights
  muted: "#A1A1AA",         // Zinc for muted elements
  background: ["#0D0D0D", "#1A1410", "#0D0D0D"], // Warm dark gradient
};

const FORKING_LINES = [
  "Picking for you…",
  "One sec…",
  "Finding food…",
  "Consulting the vibes…",
  "Rolling the dinner dice…",
  "Cross-referencing cravings…",
  "Selecting your destiny…",
  "Spearing the perfect spot…",
  "Pronging through possibilities…",
  "Overthinking is over…",
  "Almost there…",
];

const SUCCESS_LINES = [
  "There. Done. Go eat.",
  "Picked. Now go.",
  "That's the one.",
  "Decision made.",
  "Done. Stop scrolling. Go.",
  "No more debates. Just go.",
];

const FAIL_LINES = [
  "Nothing? Lower your standards.",
  "Zero results. Widen the radius.",
  "Your filters said no to everything.",
  "Too picky. Loosen up.",
];

const PICKY_EATER_OPTIONS = [
  { id: "beef", emoji: "🐄", label: "Beef", keywords: "burger" },
  { id: "chicken", emoji: "🐔", label: "Chicken", keywords: "chicken" },
  { id: "pork", emoji: "🐷", label: "Pork", keywords: "BBQ" },
  { id: "fish", emoji: "🐟", label: "Fish", keywords: "seafood" },
  { id: "veggie", emoji: "🌱", label: "Veggie", keywords: "vegetarian" },
  { id: "glutenfree", emoji: "🌾", label: "No Gluten", keywords: "gluten free" },
  { id: "pizza", emoji: "🍕", label: "Pizza", keywords: "pizza" },
  { id: "pasta", emoji: "🍝", label: "Pasta", keywords: "italian" },
];

const CHAIN_KEYWORDS = [
  "mcdonald",
  "burger king",
  "wendy",
  "taco bell",
  "kfc",
  "popeyes",
  "chick-fil-a",
  "chickfila",
  "subway",
  "domino",
  "pizza hut",
  "papa john",
  "starbucks",
  "dunkin",
  "panera",
  "chipotle",
  "five guys",
  "applebee",
  "chili",
  "olive garden",
  "outback",
  "buffalo wild wings",
  "arbys",
  "sonic",
  "hardee",
  "carl's jr",
  "jersey mike",
  "jimmy john",
  "qdoba",
  "whataburger",
];

const SIGNATURE_DISH_RULES = [
  { match: ["mcdonald"], dish: "Big Mac" },
  { match: ["chick-fil-a", "chickfila"], dish: "Chick-fil-A Chicken Sandwich" },
  { match: ["taco bell"], dish: "Crunchwrap Supreme" },
  { match: ["chipotle"], dish: "Chicken Burrito Bowl" },
  { match: ["wendy"], dish: "Baconator" },
  { match: ["popeyes"], dish: "Spicy Chicken Sandwich" },
  { match: ["kfc"], dish: "Original Recipe Fried Chicken" },
  { match: ["starbucks"], dish: "Caramel Macchiato" },
];

// ==============================
// HELPERS
// ==============================

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

function looksLikeChain(name) {
  const n = normalize(name);
  return CHAIN_KEYWORDS.some((k) => n.includes(k));
}

function pickRandom(arr) {
  if (!arr?.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function dollars(priceLevel) {
  if (!priceLevel || priceLevel < 1) return "Price —";
  return "$".repeat(priceLevel);
}

function getSignatureDish(restaurantName) {
  const n = normalize(restaurantName);
  for (const rule of SIGNATURE_DISH_RULES) {
    if (rule.match.some((m) => n.includes(normalize(m)))) return rule.dish;
  }
  return "Signature dish";
}

function buildRecipeLinks(restaurantName, dishName) {
  // If dishName is empty (unknown signature dish), just search restaurant name
  const searchTerm = dishName ? `${restaurantName} ${dishName}` : restaurantName;
  const q = encodeURIComponent(`${searchTerm} copycat recipe`);
  const qDish = encodeURIComponent(`${dishName || restaurantName} copycat recipe`);
  return [
    { label: "YouTube", icon: "logo-youtube", url: `https://www.youtube.com/results?search_query=${q}` },
    { label: "Google", icon: "search", url: `https://www.google.com/search?q=${q}` },
    { label: "Allrecipes", icon: "book", url: `https://www.allrecipes.com/search?q=${qDish}` },
  ];
}

function openMapsSearchByText(name) {
  const q = encodeURIComponent(name);
  const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
  Linking.openURL(url).catch(() => showAlert("Error", "Could not open maps."));
}

function callPhone(phoneNumber) {
  if (!phoneNumber) return;
  Linking.openURL(`tel:${phoneNumber}`).catch(() => showAlert("Error", "Could not start a call."));
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getPlaceDetails(placeId) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/places-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ placeId }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.status !== "OK") return null;
    return data.result;
  } catch (error) {
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ==============================
// UI COMPONENTS
// ==============================

function Chip({ active, label, icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}>
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? "#FFFFFF" : "rgba(255,255,255,0.90)"}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextIdle]}>{label}</Text>
    </TouchableOpacity>
  );
}

function GlassCard({ title, icon, children, accent }) {
  return (
    <View style={[styles.cardOuter, accent && styles.cardOuterAccent]}>
      <View style={[styles.card, accent && styles.cardAccent]}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            {icon ? <Ionicons name={icon} size={18} color={accent ? THEME.accent : "rgba(255,255,255,0.92)"} /> : null}
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
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.9}>
      <LinearGradient
        colors={disabled ? ["rgba(255,255,255,0.26)", "rgba(255,255,255,0.18)"] : [THEME.accent, THEME.accentDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.primaryBtn, disabled ? { opacity: 0.7 } : null]}
      >
        <Animated.View style={{ transform: [{ rotate: spinDeg }, { translateY: bounceY }], marginRight: 10 }}>
          <Ionicons name="restaurant" size={18} color="#FFFFFF" />
        </Animated.View>

        <Text style={styles.primaryText}>{label}</Text>
        {loading ? <ActivityIndicator color="#FFFFFF" style={{ marginLeft: 10 }} /> : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function GhostButton({ label, icon, onPress, disabled }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85} style={[styles.ghostBtn, disabled ? { opacity: 0.5 } : null]}>
      {icon ? <Ionicons name={icon} size={16} color={THEME.pop} style={{ marginRight: 8 }} /> : null}
      <Text style={[styles.ghostText, { color: THEME.pop }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Toast({ text, kind }) {
  if (!text) return null;
  // Skip success toasts entirely
  if (kind === "success") return null;
  const icon = kind === "warn" ? "alert-circle" : "information-circle";
  const iconColor = kind === "warn" ? THEME.accent : THEME.accent;
  const borderColor = kind === "warn" ? "rgba(251,146,60,0.5)" : "rgba(251,146,60,0.4)";
  return (
    <View style={styles.toastWrap}>
      <View style={[styles.toast, { borderColor }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
        <Text style={styles.toastText}>{text}</Text>
      </View>
    </View>
  );
}

function PickyEaterWheel({ selectedOption, onSelectOption }) {
  const WHEEL_SIZE = 280;
  const CENTER_SIZE = 70;

  return (
    <View style={pickyStyles.wheelContainer}>
      {/* Static wheel - tap to select */}
      <View
        style={[
          pickyStyles.wheel,
          {
            width: WHEEL_SIZE,
            height: WHEEL_SIZE,
          },
        ]}
      >
        {PICKY_EATER_OPTIONS.map((option, index) => {
          const angle = (index * 360) / 8 - 90; // Start from top
          const radians = (angle * Math.PI) / 180;
          const radius = WHEEL_SIZE / 2 - 50;
          const x = Math.cos(radians) * radius;
          const y = Math.sin(radians) * radius;
          const isSelected = selectedOption?.id === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => onSelectOption(option)}
              activeOpacity={0.7}
              style={[
                pickyStyles.wheelOption,
                {
                  transform: [
                    { translateX: x },
                    { translateY: y },
                  ],
                },
                isSelected && pickyStyles.wheelOptionSelected,
              ]}
            >
              <Text style={[pickyStyles.wheelEmoji, isSelected && pickyStyles.wheelEmojiSelected]}>{option.emoji}</Text>
              <Text style={[pickyStyles.wheelLabel, isSelected && pickyStyles.wheelLabelSelected]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Center label */}
        <View style={[pickyStyles.centerLabel, { width: CENTER_SIZE, height: CENTER_SIZE }]}>
          <Text style={pickyStyles.centerLabelText}>TAP TO</Text>
          <Text style={pickyStyles.centerLabelText}>PICK</Text>
        </View>
      </View>
    </View>
  );
}

const pickyStyles = StyleSheet.create({
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  wheel: {
    borderRadius: 999,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wheelOption: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    padding: 8,
    borderRadius: 12,
  },
  wheelOptionSelected: {
    backgroundColor: 'rgba(251,146,60,0.3)',
    borderWidth: 2,
    borderColor: '#FB923C',
  },
  wheelEmoji: {
    fontSize: 28,
  },
  wheelEmojiSelected: {
    fontSize: 32,
  },
  wheelLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'center',
  },
  wheelLabelSelected: {
    color: 'white',
    fontWeight: '900',
  },
  centerLabel: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  centerLabelText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '900',
  },
});

// ==============================
// APP
// ==============================

export default function App() {
  // Load Montserrat Bold font
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
  });

  // Location
  const [hasLocationPerm, setHasLocationPerm] = useState(false);
  const [coords, setCoords] = useState(null);

  // Filters
  const [radiusMiles, setRadiusMiles] = useState(3);
  const [openNow, setOpenNow] = useState(true);
  const [maxPrice, setMaxPrice] = useState(2);
  const [minRating, setMinRating] = useState(4.0);
  const [cuisineKeyword, setCuisineKeyword] = useState("");
  const [hiddenGems, setHiddenGems] = useState(true);

  // Data
  const [loading, setLoading] = useState(false);
  const [poolCount, setPoolCount] = useState(0);

  // Recently shown tracking (avoid repeats)
  const [recentlyShown, setRecentlyShown] = useState([]);

  // Slot-style reveal state
  const [slotText, setSlotText] = useState("");
  const [picked, setPicked] = useState(null);
  const [pickedDetails, setPickedDetails] = useState(null);

  // Playful status
  const [statusLine, setStatusLine] = useState("Hungry? Just pick already.");
  const [forkingLine, setForkingLine] = useState("");
  const [toast, setToast] = useState({ text: "", kind: "info" });
  const [showInfo, setShowInfo] = useState(false);
  const [infoScrollRatio, setInfoScrollRatio] = useState(0);
  const [infoScrollVisible, setInfoScrollVisible] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Picky Eater Mode
  const [pickyEaterMode, setPickyEaterMode] = useState(false);
  const [selectedPickyOption, setSelectedPickyOption] = useState(null);

  // Animations
  const spin = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const spinDeg = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const bounceY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
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

  function showToast(text, kind = "info", ms = 1700) {
    setToast({ text, kind });
    setTimeout(() => setToast({ text: "", kind: "info" }), ms);
  }

  // Picky Eater selection handler
  function handlePickySelect(option) {
    setSelectedPickyOption(option);
    setCuisineKeyword(option.keywords.split(",")[0].trim());
    haptics.selectionAsync();
    showToast(`${option.emoji} ${option.label} selected!`, "success", 1200);
  }

  const radiusMeters = useMemo(() => Math.round(clamp(radiusMiles, 1, 15) * 1609.34), [radiusMiles]);

  useEffect(() => {
    (async () => {
      // On web, skip auto-requesting location on mount — browsers block
      // non-user-initiated geolocation requests. Location will be requested
      // when the user taps "Fork It" instead.
      if (Platform.OS === 'web') return;

      try {
        // Request location permissions
        const { status } = await requestLocationPermission();
        const ok = status === "granted";
        setHasLocationPerm(ok);
        if (!ok) {
          showToast("Location permission needed to fork properly 😅", "warn", 2200);
          return;
        }
        const loc = await getCurrentPosition();
        setCoords(loc.coords);
        AsyncStorage.setItem('lastLocation', JSON.stringify({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, timestamp: Date.now() }));
        showToast("Ready. Let's pick something.", "success", 1800);

        // Perform Play Integrity check on app launch
        const integrityToken = await getIntegrityToken();
        if (integrityToken && BACKEND_URL) {
          // Verify token with backend (silent - don't block user)
          await verifyIntegrityToken(integrityToken, BACKEND_URL);
        }
      } catch (e) {
        showAlert("Location error", String(e?.message || e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function forkIt() {
    if (!BACKEND_URL) {
      showAlert("Configuration Error", "Backend URL not configured. Please check your .env file.");
      return;
    }

    // Re-request location if we don't have it
    let currentCoords = coords;
    if (!hasLocationPerm || !currentCoords) {
      try {
        const { status } = await requestLocationPermission();
        if (status !== "granted") {
          showAlert("Location needed", "Please enable location permissions in your phone's Settings to use ForkIt.");
          return;
        }
        setHasLocationPerm(true);
        const loc = await getCurrentPosition();
        currentCoords = loc.coords;
        setCoords(currentCoords);
        AsyncStorage.setItem('lastLocation', JSON.stringify({ latitude: currentCoords.latitude, longitude: currentCoords.longitude, timestamp: Date.now() }));
        showToast("Location acquired! Forking now...", "success", 1200);
      } catch (e) {
        showAlert("Location error", "Could not get your location. Please check that location services are enabled.");
        return;
      }
    }

    if (loading) return;

    setLoading(true);
    setPicked(null);
    setPickedDetails(null);
    setSlotText("");

    const line = pickRandom(FORKING_LINES);
    setStatusLine("Picking…");
    setForkingLine(line);
    
    try {
      animateForking();
      await haptics.selectionAsync();

      // Defensive check for valid coordinates
      if (!currentCoords || typeof currentCoords.latitude !== 'number' || typeof currentCoords.longitude !== 'number') {
        showAlert("Location error", "Could not get valid coordinates. Please try again.");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = currentCoords;

      // Get integrity token for this request
      const integrityToken = await getIntegrityToken();

      // Make request to backend, excluding recently shown restaurants
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
          excludedPlaceIds: recentlyShown, // Exclude recently shown to increase variety
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Places error: ${data.status}${data.error ? ` — ${data.error}` : ""}`);
      }

      let results = Array.isArray(data.results) ? data.results : [];

      // Additional client-side filter for hidden gems
      // (Backend already handles opennow, maxPrice, minRating)
      results = results.filter((r) => {
        const chainOk = hiddenGems ? !looksLikeChain(r.name) : true;
        return chainOk;
      });

      setPoolCount(results.length);

      if (!results.length) {
        await haptics.notificationAsync(haptics.NotificationFeedbackType.Warning);
        setStatusLine("Nothing matched. Try again.");
        setForkingLine("");
        showToast(pickRandom(FAIL_LINES), "warn", 2200);
        return;
      }

      // Slot-machine reveal (quick cycling) with occasional fork emoji
      const cycles = Math.min(16, Math.max(10, results.length));
      const forkEmojis = ["🍴", "🥄", "🔱", "⚡"];
      for (let i = 0; i < cycles; i++) {
        const peek = i % 3 === 0 
          ? forkEmojis[i % 4]
          : results[i % results.length]?.name || "Forking…";
        setSlotText(peek);
        await haptics.selectionAsync();
        await sleep(45 + i * 6);
      }

      const chosen = pickRandom(results);

      // tiny dramatic pause
      await sleep(250);

      setPicked(chosen);
      setSlotText("");
      setFiltersExpanded(false);
      setStatusLine(pickRandom(SUCCESS_LINES));
      setForkingLine("");
      await haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
      showToast("Forking complete. Bon appétit! 🍴", "success", 1600);

      // Track this restaurant to avoid showing it again soon
      // Keep last 10 places to provide good variety
      setRecentlyShown(prev => {
        const updated = [chosen.place_id, ...prev];
        return updated.slice(0, 10); // Keep only last 10
      });

      // Scroll to top to show result
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);

      if (chosen.place_id) {
        const details = await getPlaceDetails(chosen.place_id);
        setPickedDetails(details);
      }
    } catch (e) {
      showAlert("Error", String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const placeName = pickedDetails?.name || picked?.name;
  const signatureDish = placeName ? getSignatureDish(placeName) : null;
  const recipeLinks = useMemo(() => {
    if (!placeName || !signatureDish) return [];
    // Pass empty string for unknown signature dish to avoid "copycat copycat" in search
    const dish = signatureDish === "Signature dish" ? "" : signatureDish;
    return buildRecipeLinks(placeName, dish);
  }, [placeName, signatureDish]);

  const rating = pickedDetails?.rating ?? picked?.rating ?? null;
  const price = pickedDetails?.price_level ?? picked?.price_level ?? null;
  const vicinity = pickedDetails?.vicinity ?? picked?.vicinity ?? "";

  // Wait for fonts to load
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0D" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={THEME.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={THEME.background} style={{ flex: 1 }}>
        <Toast text={toast.text} kind={toast.kind} />

        <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.container}
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
              <Text style={styles.title}>Fork<Text style={styles.titleIt}>It</Text></Text>
              <View style={{ marginLeft: -5, marginTop: -6 }}>
                <ForkIcon size={44} color={THEME.accent} rotation="0deg" />
              </View>
            </View>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroLine}>
              {statusLine} <Text style={styles.heroBold}>✨</Text>
            </Text>

            <PrimaryButton
              label={loading ? "Picking…" : "Just Fork It"}
              onPress={forkIt}
              disabled={loading}
              loading={loading}
              spinDeg={spinDeg}
              bounceY={bounceY}
            />

            {!!forkingLine && loading ? <Text style={styles.forkingLine}>{forkingLine}</Text> : null}

            {!!slotText && loading ? (

<View style={styles.slotBox}>
                <Text style={styles.slotLabel}>Picking...</Text>
                <Text style={styles.slotText} numberOfLines={1}>
                  {slotText}
                </Text>
              </View>
            ) : null}

            {/* Picky Eater Mode - hidden for now, to revisit later */}
            {false && (
              <>
                <TouchableOpacity
                  onPress={() => {
                    const newMode = !pickyEaterMode;
                    setPickyEaterMode(newMode);
                    if (newMode) {
                      setFiltersExpanded(false);
                      setCuisineKeyword("");
                      setSelectedPickyOption(null);
                      setHiddenGems(false);
                    }
                  }}
                  activeOpacity={0.85}
                  style={[styles.filtersToggle, pickyEaterMode && styles.pickyEaterToggleActive]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 18, marginRight: 8 }}>🎯</Text>
                    <Text style={styles.filtersToggleText}>Picky Eater Mode</Text>
                  </View>
                  <View style={[styles.modeIndicator, pickyEaterMode && styles.modeIndicatorActive]}>
                    <Text style={styles.modeIndicatorText}>{pickyEaterMode ? "ON" : "OFF"}</Text>
                  </View>
                </TouchableOpacity>
                {pickyEaterMode && (
                  <View style={styles.pickyEaterSection}>
                    <Text style={styles.pickyEaterTitle}>What can you eat today?</Text>
                    <PickyEaterWheel
                      selectedOption={selectedPickyOption}
                      onSelectOption={handlePickySelect}
                    />
                    {selectedPickyOption && (
                      <Text style={styles.pickyEaterHint}>
                        {selectedPickyOption.emoji} {selectedPickyOption.label} selected! Now tap ForkIt!
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}

            {/* Collapsible Filters */}
            <TouchableOpacity
              onPress={() => setFiltersExpanded(!filtersExpanded)}
              activeOpacity={0.85}
              style={styles.filtersToggle}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="options" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.filtersToggleText}>Filters</Text>
                {!filtersExpanded && poolCount > 0 && (
                  <Text style={styles.filterCount}>{poolCount} found</Text>
                )}
              </View>
              <Ionicons
                name={filtersExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>

            {filtersExpanded && (
              <View style={styles.filtersContent}>
                <Text style={styles.label}>How far?</Text>
                <View style={styles.row}>
                  {[1, 3, 5, 10, 15].map((m) => (
                    <Chip key={m} label={`${m} mi`} icon="navigate" active={radiusMiles === m} onPress={() => setRadiusMiles(m)} />
                  ))}
                </View>

                <Text style={styles.label}>Max damage</Text>
                <View style={styles.row}>
                  {[
                    { v: 1, t: "$" },
                    { v: 2, t: "$$" },
                    { v: 3, t: "$$$" },
                    { v: 4, t: "$$$$" },
                  ].map((p) => (
                    <Chip key={p.v} label={p.t} icon="pricetag" active={maxPrice === p.v} onPress={() => setMaxPrice(p.v)} />
                  ))}
                </View>

                <Text style={styles.label}>At least this good</Text>
                <View style={styles.row}>
                  {[3.5, 4.0, 4.3, 4.5].map((r) => (
                    <Chip key={r} label={`${r}+`} icon="star" active={minRating === r} onPress={() => setMinRating(r)} />
                  ))}
                </View>

                {!pickyEaterMode && (
                  <>
                    <Text style={styles.label}>Cuisine keyword (optional)</Text>
                    <View style={styles.inputWrap}>
                      <Ionicons name="search" size={16} color="rgba(255,255,255,0.7)" />
                      <TextInput
                        value={cuisineKeyword}
                        onChangeText={setCuisineKeyword}
                        placeholder="ramen, tacos, thai…"
                        placeholderTextColor="rgba(255,255,255,0.45)"
                        style={styles.input}
                      />
                    </View>
                  </>
                )}

                {pickyEaterMode && selectedPickyOption && (
                  <View style={styles.pickyEaterActiveFilter}>
                    <Text style={styles.label}>Active filter from wheel:</Text>
                    <View style={styles.activeFilterPill}>
                      <Text style={styles.activeFilterEmoji}>{selectedPickyOption.emoji}</Text>
                      <Text style={styles.activeFilterText}>{selectedPickyOption.label}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Open now</Text>
                  <Chip label={openNow ? "ON" : "OFF"} icon="time" active={openNow} onPress={() => setOpenNow((v) => !v)} />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Skip the chains</Text>
                  <Chip
                    label={hiddenGems ? "ON" : "OFF"}
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
                        showToast("History cleared! All restaurants available again.", "success", 1600);
                      }}
                      activeOpacity={0.85}
                      style={styles.clearBtn}
                    >
                      <Ionicons name="refresh" size={12} color="rgba(255,255,255,0.95)" style={{ marginRight: 6 }} />
                      <Text style={styles.clearBtnText}>Clear History</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Result - Moved to top */}
          {picked ? (
            <GlassCard title="You're going here" icon="restaurant" accent>
              <>
                <Text style={styles.placeName}>{placeName}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Ionicons name="star" size={12} color={THEME.pop} />
                    <Text style={styles.metaText}>{rating ? String(rating) : "—"}</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Ionicons name="cash" size={12} color={THEME.success} />
                    <Text style={styles.metaText}>{dollars(price)}</Text>
                  </View>
                  <View style={[styles.metaPill, { minWidth: 120, maxWidth: 140 }]}>
                    <Ionicons name="location" size={12} color={THEME.accent} />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {vicinity ? vicinity.substring(0, 12) + "…" : "Nearby"}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <GhostButton label="Let's Go" icon="map" onPress={() => openMapsSearchByText(placeName)} />
                  <GhostButton
                    label="Website"
                    icon="globe"
                    onPress={() => Linking.openURL(pickedDetails?.website)}
                    disabled={!pickedDetails?.website}
                  />
                  <GhostButton
                    label="Call"
                    icon="call"
                    onPress={() => callPhone(pickedDetails?.formatted_phone_number)}
                    disabled={!pickedDetails?.formatted_phone_number}
                  />
                </View>

                <View style={styles.divider} />

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Ionicons name="home" size={16} color={THEME.pop} />
                  <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 8 }]}>
                    Don't want to leave after all?
                  </Text>
                </View>

                <Text style={styles.muted}>
                  {signatureDish === "Signature dish"
                    ? "Copycat recipes. Close enough."
                    : `Try making: ${signatureDish}`}
                </Text>

                <View style={{ height: 10 }} />
                {recipeLinks.map((l) => (
                  <TouchableOpacity
                    key={l.url}
                    onPress={() => Linking.openURL(l.url)}
                    activeOpacity={0.85}
                    style={styles.linkRow}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name={l.icon} size={16} color={THEME.pop} />
                      <Text style={styles.linkText}>{l.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="rgba(45,212,191,0.7)" />
                  </TouchableOpacity>
                ))}
              </>
            </GlassCard>
          ) : null}

          <View style={styles.footerRow}>
            <Text style={styles.footer}>
              Life's too short to debate dinner.
            </Text>
            <TouchableOpacity onPress={() => setShowInfo(true)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="information-circle-outline" size={18} color="rgba(255,255,255,0.35)" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {showInfo && (
          <View style={styles.infoOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowInfo(false)} />
            <View style={styles.infoCard}>
              <TouchableOpacity style={styles.infoClose} onPress={() => setShowInfo(false)}>
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>

              <View style={{ flexDirection: "row", maxHeight: SCREEN_HEIGHT * 0.65 }}>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
                onContentSizeChange={(w, h) => setInfoScrollVisible(h > SCREEN_HEIGHT * 0.65)}
                onScroll={({ nativeEvent }) => {
                  const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
                  const maxScroll = contentSize.height - layoutMeasurement.height;
                  setInfoScrollRatio(maxScroll > 0 ? contentOffset.y / maxScroll : 0);
                }}
                scrollEventThrottle={16}
              >
                <Text style={[styles.infoHeading, { marginTop: 0 }]}>How ForkIt Works</Text>
                <Text style={styles.infoText}>
                  ForkIt uses Google Maps to find restaurants near you based on your filters, then picks one at random - so you never have to debate dinner again.
                </Text>

                <Text style={styles.infoHeading}>Powered by Google Places</Text>
                <Text style={styles.infoText}>
                  Restaurant names, ratings, prices, and hours all come from Google's Places API. We don't make this stuff up.
                </Text>

                <Text style={styles.infoHeading}>Filters & Search</Text>
                <Text style={styles.infoText}>
                  Use cuisine keywords to narrow results (e.g. "pizza", "seafood"). Pick quick-tap filters for common cravings. ForkIt also remembers what it already showed you during your session and won't repeat them - resets when you close the app.
                </Text>

                <Text style={styles.infoHeading}>Skip the Chains</Text>
                <Text style={styles.infoText}>
                  When this is on, ForkIt filters out common chain restaurants so you're more likely to discover local spots. Turn it off if you're cool with the usual suspects.
                </Text>

                <Text style={styles.infoHeading}>Limitations</Text>
                <Text style={styles.infoText}>
                  Results depend on what Google has listed in your area. Some spots may be missing, have outdated hours, or inaccurate info. Ratings and prices come straight from Google. The more specific your filters, the fewer results you'll get.
                </Text>

                <Text style={styles.infoHeading}>Your Location</Text>
                <Text style={styles.infoText}>
                  Your location is used only to find nearby spots. It's never stored or shared. Period.
                </Text>

                <Text style={[styles.infoHeading, { color: THEME.pop }]}>Coming Soon</Text>
                <Text style={styles.infoText}>
                  {"\u2022"} Restricted eater mode - dietary filters for allergies, preferences, and restrictions{"\n"}
                  {"\u2022"} "Never show this again" - permanently block places you don't want to see{"\n"}
                  {"\u2022"} Copycat recipe optimization - better recipe matches for your picked spot{"\n"}
                  {"\u2022"} More to come - we're just getting started
                </Text>
              </ScrollView>
              {infoScrollVisible && (
                <View style={styles.scrollTrack}>
                  <View style={[styles.scrollThumb, { top: `${infoScrollRatio * 70}%` }]} />
                </View>
              )}
              </View>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

// ==============================
// STYLES
// ==============================

const styles = StyleSheet.create({
  container: { padding: scale(14), paddingTop: scale(30), paddingBottom: scale(20) },

  header: { alignItems: "center", marginBottom: scale(10), marginTop: scale(16) },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  itBox: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.accent, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 2 },
  itText: { color: "#000", fontSize: scale(28), fontFamily: "Montserrat_700Bold" },
  logoBubble: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(16),
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: { color: "#FB923C", fontSize: scale(40), fontFamily: "Montserrat_700Bold", letterSpacing: 0.2, lineHeight: scale(46) },
  titleIt: { color: "#2DD4BF" },
  subtitle: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 },

  toastWrap: { position: "absolute", top: "45%", left: 0, right: 0, zIndex: 999, alignItems: "center" },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.40)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  toastText: { color: "rgba(255,255,255,0.92)", fontWeight: "900" },

  hero: {
    padding: scale(12),
    borderRadius: 18,
    marginBottom: scale(10),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroLine: { color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 18, marginBottom: 12 },
  heroBold: { color: "white", fontWeight: "900" },

  primaryBtn: {
    borderRadius: 14,
    paddingVertical: scale(12),
    paddingHorizontal: scale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },

  forkingLine: {
    marginTop: 10,
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "900",
  },
  hint: { marginTop: 10, color: "rgba(255,255,255,0.55)", fontSize: 12 },

  filtersToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  filtersToggleText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 8,
  },
  filterCount: {
    color: THEME.pop,
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 10,
  },
  filtersContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
  },

  slotBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  slotLabel: { color: "rgba(255,255,255,0.60)", fontSize: 12, fontWeight: "800" },
  slotText: { marginTop: 6, color: "rgba(255,255,255,0.92)", fontSize: 14, fontWeight: "950" },

  cardOuter: {
    borderRadius: 18,
    marginBottom: scale(10),
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardOuterAccent: {
    shadowColor: "#FB923C",
    shadowOpacity: 0.4,
  },
  card: {
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(251,146,60,0.15)",
    overflow: "hidden",
  },
  cardContent: {
    backgroundColor: "rgba(13,13,13,0.85)",
    borderRadius: 14,
    padding: scale(14),
  },
  cardAccent: {
    borderColor: "rgba(251,146,60,0.3)",
    backgroundColor: "rgba(251,146,60,0.1)",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "900" },

  label: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 10, marginBottom: 6 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipIdle: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.18)" },
  chipActive: { backgroundColor: "rgba(251,146,60,0.9)", borderColor: "#FB923C" },
  chipText: { fontSize: 12, fontWeight: "900" },
  chipTextIdle: { color: "rgba(255,255,255,0.88)" },
  chipTextActive: { color: "#FFFFFF" },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(0,0,0,0.20)",
  },
  input: { color: "white", flex: 1, fontWeight: "800" },

  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  toggleLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "900" },

  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },
  clearBtnText: { color: "rgba(255,255,255,0.90)", fontSize: 11, fontWeight: "900" },

  emptyState: { 
    alignItems: 'center', 
    paddingVertical: 20,
    gap: 12,
  },
  empty: { color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 18, textAlign: 'center' },

  placeName: { color: "white", fontSize: scale(20), fontWeight: "950", marginTop: 2, marginBottom: scale(8) },

  metaRow: { flexDirection: "row", flexWrap: "nowrap", gap: scale(6), marginBottom: scale(10) },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    flexShrink: 1,
  },
  metaText: { color: "rgba(255,255,255,0.88)", fontWeight: "700", fontSize: 11 },

  actionRow: { flexDirection: "row", gap: scale(8), flexWrap: "wrap" },
  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(10),
    paddingHorizontal: scale(10),
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2DD4BF",
    backgroundColor: "transparent",
    flexGrow: 1,
  },
  ghostText: { color: "rgba(255,255,255,0.95)", fontWeight: "900" },

  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.14)", marginVertical: scale(10) },

  sectionTitle: { color: "white", fontSize: 14, fontWeight: "950", marginBottom: 6 },
  muted: { color: "rgba(255,255,255,0.70)", fontSize: 13, lineHeight: 18 },

  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: scale(10),
    paddingHorizontal: scale(10),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.25)",
    backgroundColor: "rgba(45,212,191,0.06)",
    marginBottom: scale(8),
  },
  linkText: { color: "rgba(255,255,255,0.92)", fontWeight: "950", marginLeft: 10 },

  footer: { marginTop: 4, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 16, flex: 1 },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 20, marginTop: 4, marginBottom: 8 },
  infoOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  infoCard: { backgroundColor: "rgba(26,20,16,0.95)", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 24, marginHorizontal: 24, maxWidth: 380, width: "90%" },
  infoClose: { position: "absolute", top: 12, right: 12, zIndex: 1 },
  infoHeading: { color: "#FB923C", fontSize: 15, fontWeight: "900", marginTop: 14, marginBottom: 4 },
  infoText: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600", lineHeight: 19 },
  scrollTrack: { width: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2, marginLeft: 8, marginTop: 30 },
  scrollThumb: { position: "absolute", width: 4, height: "30%", backgroundColor: "rgba(45,212,191,0.5)", borderRadius: 2 },

  // Picky Eater Mode styles
  pickyEaterToggleActive: {
    borderColor: "rgba(251,146,60,0.5)",
    backgroundColor: "rgba(251,146,60,0.15)",
  },
  modeIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  modeIndicatorActive: {
    backgroundColor: "rgba(251,146,60,0.8)",
  },
  modeIndicatorText: {
    color: "white",
    fontSize: 11,
    fontWeight: "900",
  },
  pickyEaterSection: {
    marginTop: 16,
    alignItems: "center",
  },
  pickyEaterTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  pickyEaterHint: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  pickyEaterActiveFilter: {
    marginTop: 10,
  },
  activeFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(251,146,60,0.2)",
    borderWidth: 1,
    borderColor: "rgba(251,146,60,0.4)",
    alignSelf: "flex-start",
  },
  activeFilterEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  activeFilterText: {
    color: "white",
    fontSize: 14,
    fontWeight: "800",
  },
});