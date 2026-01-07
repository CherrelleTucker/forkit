// ForkIt — Expo Snack Version
// READY TO PASTE INTO SNACK: https://snack.expo.dev
//
// Dependencies (Snack will auto-detect):
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

// ==============================
// CONFIG
// ==============================

// API KEY - Hardcoded for Snack testing
const GOOGLE_PLACES_API_KEY = "AIzaSyAbOJoEsfP1tFHsHrrq2V3U65eMVEFXaGE";

const PLACES_NEARBY_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

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
  const fields = [
    "name",
    "formatted_phone_number",
    "website",
    "url",
    "geometry",
    "rating",
    "price_level",
    "opening_hours",
    "vicinity",
  ].join(",");

  const url = `${PLACE_DETAILS_URL}?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(
    fields
  )}&key=${encodeURIComponent(GOOGLE_PLACES_API_KEY)}`;

  const data = await fetchJson(url);
  if (data.status !== "OK") return null;
  return data.result;
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

  // Slot-style reveal state
  const [slotText, setSlotText] = useState("");
  const [picked, setPicked] = useState(null);
  const [pickedDetails, setPickedDetails] = useState(null);

  // Playful status
  const [statusLine, setStatusLine] = useState("Can't decide? Fork it. Let the algorithm choose.");
  const [forkingLine, setForkingLine] = useState("");
  const [toast, setToast] = useState({ text: "", kind: "info" });

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

  const radiusMeters = useMemo(() => Math.round(clamp(radiusMiles, 1, 15) * 1609.34), [radiusMiles]);

  useEffect(() => {
    (async () => {
      try {
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
      } catch (e) {
        Alert.alert("Location error", String(e?.message || e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function forkIt() {
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY.includes("YOUR_API_KEY")) {
      Alert.alert("Missing API Key", "Please configure your Google Places API key in the .env file.");
      return;
    }
    if (!hasLocationPerm || !coords) {
      Alert.alert("Location needed", "Enable location permissions to use ForkIt.");
      return;
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

      const { latitude, longitude } = coords;
      const params = new URLSearchParams({
        key: GOOGLE_PLACES_API_KEY,
        location: `${latitude},${longitude}`,
        radius: String(radiusMeters),
        type: "restaurant",
      });

      if (openNow) params.set("opennow", "true");
      if (cuisineKeyword.trim()) params.set("keyword", cuisineKeyword.trim());

      const url = `${PLACES_NEARBY_URL}?${params.toString()}`;
      const data = await fetchJson(url);

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Places error: ${data.status}${data.error_message ? ` — ${data.error_message}` : ""}`);
      }

      let results = Array.isArray(data.results) ? data.results : [];

      // Apply filters client-side
      results = results.filter((r) => {
        const ratingOk = (r.rating ?? 0) >= minRating;
        const priceOk = r.price_level == null ? true : r.price_level <= maxPrice; // allow unknowns
        const chainOk = hiddenGems ? !looksLikeChain(r.name) : true;
        return ratingOk && priceOk && chainOk;
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
      setStatusLine(pickRandom(SUCCESS_LINES));
      setForkingLine("");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Forking complete. Bon appétit! 🍴", "success", 1600);

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

  function reroll() {
    forkIt();
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
              <Text style={styles.title}>ForkIt</Text>
              <Text style={styles.subtitle}>Fork indecision. Fork regret. Fork it all.</Text>
            </View>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroLine}>
              {statusLine} <Text style={styles.heroBold}>✨</Text>
            </Text>

            <PrimaryButton
              label={loading ? "Forking Hard…" : "Fork It Now"}
              onPress={forkIt}
              disabled={loading}
              loading={loading}
              spinDeg={spinDeg}
              bounceY={bounceY}
            />

            {!!forkingLine && loading ? <Text style={styles.forkingLine}>{forkingLine}</Text> : null}

            <Text style={styles.hint}>
              {poolCount ? `Last eligible pool: ${poolCount}` : "Tip: widen radius or lower rating if you get zero results."}
            </Text>

            {!!slotText && loading ? (
              <View style={styles.slotBox}>
                <Text style={styles.slotLabel}>Forking preview</Text>
                <Text style={styles.slotText} numberOfLines={1}>
                  {slotText}
                </Text>
              </View>
            ) : null}
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
                  <GhostButton label="Re-Fork" icon="refresh" onPress={reroll} />
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

          {/* Filters */}
          <GlassCard title="Filters" icon="options">
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
          </GlassCard>

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
  container: { padding: 16, paddingBottom: 48 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
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

  toastWrap: { position: "absolute", top: 10, left: 0, right: 0, zIndex: 999, alignItems: "center" },
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
});
