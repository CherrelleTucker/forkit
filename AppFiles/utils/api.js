// api.js — Backend API calls and push token registration

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { BACKEND_URL, DETAILS_TIMEOUT, HTTP_TOO_MANY_REQUESTS } from '../constants/config';

/**
 * Fetch address autocomplete suggestions from the backend.
 * @param {string} input - Search query text
 * @param {{latitude: number, longitude: number}|null} coords - User's current location for bias
 * @returns {Promise<{suggestions: Array, error: string|null}>} Suggestions and optional error
 */
export async function fetchAddressSuggestions(input, coords) {
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

/**
 * Fetch detailed info for a place by ID.
 * @param {string} placeId - Google Places place_id
 * @returns {Promise<object|null>} Place details or null on failure
 */
export async function getPlaceDetails(placeId) {
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

/**
 * Request notification permissions and get the Expo push token.
 * @returns {Promise<string|null>} Push token string or null if unavailable
 */
export async function getExpoPushToken() {
  if (Platform.OS === 'web') return null;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('group-session', {
      name: 'Fork Around Sessions',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250], // eslint-disable-line no-magic-numbers -- notification vibration config
    });
  }
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: '0abe90d5-587c-4918-ad8b-7d472c687ace',
  });
  return tokenData.data;
}
