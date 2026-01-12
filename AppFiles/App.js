// ForkIt — Expo Snack single-file app (App.js)
// Dependencies to add in Snack:
// - expo-location
// - expo-linear-gradient
// - expo-haptics
// - @expo/vector-icons

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { getIntegrityToken, verifyIntegrityToken } from "./utils/integrity";

// ==============================
// CONFIG
// ==============================

// Backend API URL from environment variables
// For local development, add to .env file
// For EAS Build, use: eas secret:create --scope project --name EXPO_PUBLIC_BACKEND_URL --value your_url
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";

const FORKING_LINES = [
  "Forking the universe for answers…",
  "Consulting the vibes…",
  "Summoning a local gem…",
  "Rolling the dinner dice…",
  "Calculating maximum deliciousness…",
  "Loading: dopamine delivery…",
  "Cross-referencing cravings…",
  "Asking the fork spirits…",
  "Selecting your destiny…",
  "Deploying the Decision Hammer™…",
  "Sharpening the fork…",
  "Spearing the perfect spot…",
  "Tine-tuning your options…",
  "Pronging through possibilities…",
  "Fork in the road… choosing wisely…",
  "Stabbing at greatness…",
  "Four tines, infinite choices…",
  "Consulting the fork council…",
  "Fork calibration in progress…",
  "Prong power: ACTIVATED…",
];

const SUCCESS_LINES = [
  "Boom. Dinner decided.",
  "Fork yeah. Go eat.",
  "This one feels right. Trust me.",
  "Chosen by fate (and filters).",
  "Congrats, you're free now.",
  "Forking done. Get it.",
  "Forked and ready to roll.",
  "The fork has spoken.",
  "Consider yourself forked.",
  "Fork it. This is the one.",
  "Perfectly pronged. 🍴",
  "Tines aligned. Destiny found.",
];

const FAIL_LINES = [
  "Your filters are too powerful 😭",
  "Nothing survived the vibe check.",
  "No matches. The fork spirits demand broader radius.",
  "Forking failed. Loosen those filters.",
  "Can't fork with these settings, chief.",
  "The fork demands compromise.",
  "Zero prongs landed. Try again.",
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
  const q = encodeURIComponent(`${restaurantName} ${dishName} copycat recipe`);
  const qDish = encodeURIComponent(`${dishName} copycat recipe`);
  return [
    { label: "YouTube", icon: "logo-youtube", url: `https://www.youtube.com/results?search_query=${q}` },
    { label: "Google", icon: "search", url: `https://www.google.com/search?q=${q}` },
    { label: "Allrecipes", icon: "book", url: `https://www.allrecipes.com/search?q=${qDish}` },
  ];
}

function openMapsSearchByText(name) {
  const q = encodeURIComponent(name);
  const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
  Linking.openURL(url).catch(() => Alert.alert("Error", "Could not open maps."));
}

function callPhone(phoneNumber) {
  if (!phoneNumber) return;
  Linking.openURL(`tel:${phoneNumber}`).catch(() => Alert.alert("Error", "Could not start a call."));
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
      console.error('Place details request failed:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.status !== "OK") return null;
    return data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
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
          color={active ? "#0B0B0F" : "rgba(255,255,255,0.90)"}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextIdle]}>{label}</Text>
    </TouchableOpacity>
  );
}

function GlassCard({ title, icon, children }) {
  return (
    <View style={styles.cardOuter}>
      <LinearGradient colors={["rgba(255,255,255,0.13)", "rgba(255,255,255,0.06)"]} style={styles.card}>
        <View style={styles.cardHeader}>
          {icon ? <Ionicons name={icon} size={18} color="rgba(255,255,255,0.92)" /> : null}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {children}
      </LinearGradient>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled, loading, spinDeg, bounceY }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.9}>
      <LinearGradient
        colors={disabled ? ["rgba(255,255,255,0.26)", "rgba(255,255,255,0.18)"] : ["#FFFFFF", "#D9D9FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.primaryBtn, disabled ? { opacity: 0.7 } : null]}
      >
        <Animated.View style={{ transform: [{ rotate: spinDeg }, { translateY: bounceY }], marginRight: 10 }}>
          <Ionicons name="restaurant" size={18} color="#0B0B0F" />
        </Animated.View>

        <Text style={styles.primaryText}>{label}</Text>
        {loading ? <ActivityIndicator style={{ marginLeft: 10 }} /> : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function GhostButton({ label, icon, onPress, disabled }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85} style={[styles.ghostBtn, disabled ? { opacity: 0.5 } : null]}>
      {icon ? <Ionicons name={icon} size={16} color="rgba(255,255,255,0.95)" style={{ marginRight: 8 }} /> : null}
      <Text style={styles.ghostText}>{label}</Text>
    </TouchableOpacity>
  );
}

function Toast({ text, kind }) {
  if (!text) return null;
  const icon =
    kind === "success" ? "sparkles" : kind === "warn" ? "alert-circle" : "information-circle";
  return (
    <View style={styles.toastWrap}>
      <View style={styles.toast}>
        <Ionicons name={icon} size={16} color="rgba(255,255,255,0.95)" />
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
    backgroundColor: 'rgba(255,107,107,0.3)',
    borderWidth: 2,
    borderColor: '#FF6B6B',
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
  const [statusLine, setStatusLine] = useState("Can't decide? Fork it. Let the algorithm choose.");
  const [forkingLine, setForkingLine] = useState("");
  const [toast, setToast] = useState({ text: "", kind: "info" });
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
    Haptics.selectionAsync();
    showToast(`${option.emoji} ${option.label} selected!`, "success", 1200);
  }

  const radiusMeters = useMemo(() => Math.round(clamp(radiusMiles, 1, 15) * 1609.34), [radiusMiles]);

  useEffect(() => {
    (async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        const ok = status === "granted";
        setHasLocationPerm(ok);
        if (!ok) {
          showToast("Location permission needed to fork properly 😅", "warn", 2200);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords(loc.coords);
        showToast("Forking initialized. Ready to spear. 🍴", "success", 1800);

        // Perform Play Integrity check on app launch
        const integrityToken = await getIntegrityToken();
        if (integrityToken && BACKEND_URL) {
          // Verify token with backend (silent - don't block user)
          const verificationResult = await verifyIntegrityToken(integrityToken, BACKEND_URL);
          console.log('Play Integrity verification result:', verificationResult);
          // Don't block user based on result - just log for monitoring
        }
      } catch (e) {
        Alert.alert("Location error", String(e?.message || e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function forkIt() {
    if (!BACKEND_URL) {
      Alert.alert("Configuration Error", "Backend URL not configured. Please check your .env file.");
      return;
    }

    // Re-request location if we don't have it
    let currentCoords = coords;
    if (!hasLocationPerm || !currentCoords) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Location needed", "Please enable location permissions in your phone's Settings to use ForkIt.");
          return;
        }
        setHasLocationPerm(true);
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        currentCoords = loc.coords;
        setCoords(currentCoords);
        showToast("Location acquired! Forking now...", "success", 1200);
      } catch (e) {
        Alert.alert("Location error", "Could not get your location. Please check that location services are enabled.");
        return;
      }
    }

    if (loading) return;

    setLoading(true);
    setPicked(null);
    setPickedDetails(null);
    setSlotText("");

    const line = pickRandom(FORKING_LINES);
    setStatusLine("Okay okay… I got you. Forking now.");
    setForkingLine(line);
    showToast("Forking… 🍴", "info", 900);

    try {
      animateForking();
      await Haptics.selectionAsync();

      // Defensive check for valid coordinates
      if (!currentCoords || typeof currentCoords.latitude !== 'number' || typeof currentCoords.longitude !== 'number') {
        Alert.alert("Location error", "Could not get valid coordinates. Please try again.");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = currentCoords;

      // Get integrity token for this request
      const integrityToken = await getIntegrityToken();

      // Make request to backend, excluding recently shown restaurants
      console.log('ForkIt request:', { keyword: cuisineKeyword, radius: radiusMeters, minRating, maxPrice, openNow, hiddenGems, pickyEaterMode });

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
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setStatusLine("Your filters are ruthless 😭");
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
        await Haptics.selectionAsync();
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
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      Alert.alert("Error", String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const placeName = pickedDetails?.name || picked?.name;
  const signatureDish = placeName ? getSignatureDish(placeName) : null;
  const recipeLinks = useMemo(() => {
    if (!placeName || !signatureDish) return [];
    const dish = signatureDish === "Signature dish" ? "copycat" : signatureDish;
    return buildRecipeLinks(placeName, dish);
  }, [placeName, signatureDish]);

  const rating = pickedDetails?.rating ?? picked?.rating ?? null;
  const price = pickedDetails?.price_level ?? picked?.price_level ?? null;
  const vicinity = pickedDetails?.vicinity ?? picked?.vicinity ?? "";

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#0B0B0F", "#17163B", "#0B0B0F"]} style={{ flex: 1 }}>
        <Toast text={toast.text} kind={toast.kind} />

        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBubble}>
              <Ionicons name="nutrition" size={22} color="#0B0B0F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>ForkIt!</Text>
              <Text style={styles.subtitle}>Fork indecision. Fork regret. Fork it all.</Text>
            </View>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroLine}>
              {statusLine} <Text style={styles.heroBold}>✨</Text>
            </Text>

            <PrimaryButton
              label={loading ? "Forking Hard…" : "ForkIt! Now"}
              onPress={forkIt}
              disabled={loading}
              loading={loading}
              spinDeg={spinDeg}
              bounceY={bounceY}
            />

            {!!forkingLine && loading ? <Text style={styles.forkingLine}>{forkingLine}</Text> : null}

            <Text style={styles.hint}>
              {poolCount ? `Last eligible pool: ${poolCount}${recentlyShown.length > 0 ? ` (${recentlyShown.length} excluded to avoid repeats)` : ''}` : "Tip: widen radius or lower rating if you get zero results."}
            </Text>

            {!!slotText && loading ? (

<View style={styles.slotBox}>
                <Text style={styles.slotLabel}>Forking preview</Text>
                <Text style={styles.slotText} numberOfLines={1}>
                  {slotText}
                </Text>
              </View>
            ) : null}

            {/* Picky Eater Mode Toggle */}
            <TouchableOpacity
              onPress={() => {
                const newMode = !pickyEaterMode;
                setPickyEaterMode(newMode);
                if (newMode) {
                  // Turning ON picky eater mode
                  setFiltersExpanded(false);
                  setCuisineKeyword("");
                  setSelectedPickyOption(null);
                  setHiddenGems(false); // Chains are OK for picky eaters
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

            {/* Picky Eater Wheel */}
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

            {/* Collapsible Filters */}
            <TouchableOpacity
              onPress={() => setFiltersExpanded(!filtersExpanded)}
              activeOpacity={0.85}
              style={styles.filtersToggle}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="options" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={styles.filtersToggleText}>Filters</Text>
              </View>
              <Ionicons
                name={filtersExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>

            {filtersExpanded && (
              <View style={styles.filtersContent}>
                <Text style={styles.label}>Radius</Text>
                <View style={styles.row}>
                  {[1, 3, 5, 10, 15].map((m) => (
                    <Chip key={m} label={`${m} mi`} icon="navigate" active={radiusMiles === m} onPress={() => setRadiusMiles(m)} />
                  ))}
                </View>

                <Text style={styles.label}>Max price</Text>
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

                <Text style={styles.label}>Minimum rating</Text>
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
                  <Text style={styles.toggleLabel}>Hidden Gems</Text>
                  <Chip
                    label={hiddenGems ? "LOCAL" : "ANY"}
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
            <GlassCard title="Your pick" icon="restaurant">
              <>
                <Text style={styles.placeName}>{placeName}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Ionicons name="star" size={14} color="rgba(255,255,255,0.92)" />
                    <Text style={styles.metaText}>{rating ? String(rating) : "—"}</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Ionicons name="cash" size={14} color="rgba(255,255,255,0.92)" />
                    <Text style={styles.metaText}>{dollars(price)}</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Ionicons name="location" size={14} color="rgba(255,255,255,0.92)" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {vicinity || "Nearby"}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <GhostButton label="Maps" icon="map" onPress={() => openMapsSearchByText(placeName)} />
                  <GhostButton
                    label="Call"
                    icon="call"
                    onPress={() => callPhone(pickedDetails?.formatted_phone_number)}
                    disabled={!pickedDetails?.formatted_phone_number}
                  />
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>
                  <Ionicons name="home" size={16} color="rgba(255,255,255,0.9)" />{" "}
                  Dish it up at home (copycat edition)
                </Text>

                <Text style={styles.muted}>
                  {signatureDish === "Signature dish"
                    ? "Signature dish unknown — here are copycat searches for the vibe."
                    : `Signature dish: ${signatureDish}`}
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
                      <Ionicons name={l.icon} size={16} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.linkText}>{l.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.65)" />
                  </TouchableOpacity>
                ))}
              </>
            </GlassCard>
          ) : null}

          <Text style={styles.footer}>
            🍴 Fork responsibly. Tines may vary. Signature dishes detected via fork heuristics (v1).
          </Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ==============================
// STYLES
// ==============================

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 40, paddingBottom: 48 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14, marginTop: 24 },
  logoBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: { color: "white", fontSize: 34, fontWeight: "900", letterSpacing: 0.2, lineHeight: 34 },
  subtitle: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 },

  toastWrap: { position: "absolute", top: 50, left: 0, right: 0, zIndex: 999, alignItems: "center" },
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
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroLine: { color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: 18, marginBottom: 12 },
  heroBold: { color: "white", fontWeight: "900" },

  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#0B0B0F", fontWeight: "900", fontSize: 16 },

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
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
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
  chipActive: { backgroundColor: "rgba(255,255,255,0.95)", borderColor: "rgba(255,255,255,0.95)" },
  chipText: { fontSize: 12, fontWeight: "900" },
  chipTextIdle: { color: "rgba(255,255,255,0.88)" },
  chipTextActive: { color: "#0B0B0F" },

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

  placeName: { color: "white", fontSize: 22, fontWeight: "950", marginTop: 2, marginBottom: 10 },

  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    maxWidth: "100%",
  },
  metaText: { color: "rgba(255,255,255,0.88)", fontWeight: "900" },

  actionRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.06)",
    flexGrow: 1,
  },
  ghostText: { color: "rgba(255,255,255,0.95)", fontWeight: "900" },

  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.14)", marginVertical: 14 },

  sectionTitle: { color: "white", fontSize: 14, fontWeight: "950", marginBottom: 6 },
  muted: { color: "rgba(255,255,255,0.70)", fontSize: 13, lineHeight: 18 },

  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(0,0,0,0.18)",
    marginBottom: 10,
  },
  linkText: { color: "rgba(255,255,255,0.92)", fontWeight: "950", marginLeft: 10 },

  footer: { marginTop: 4, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 16 },

  // Picky Eater Mode styles
  pickyEaterToggleActive: {
    borderColor: "rgba(255,107,107,0.5)",
    backgroundColor: "rgba(255,107,107,0.15)",
  },
  modeIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  modeIndicatorActive: {
    backgroundColor: "rgba(255,107,107,0.8)",
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
    backgroundColor: "rgba(255,107,107,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.4)",
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