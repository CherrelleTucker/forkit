import React from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ForkItWidget } from './ForkItWidget';

const BACKEND_URL = 'https://forkit-backend.vercel.app';

async function getLocation() {
  // Try expo-location directly (works if permission already granted)
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getLastKnownPositionAsync();
      if (loc) return loc.coords;
      const freshLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      return freshLoc.coords;
    }
  } catch (_) {
    // Fall through to cached location
  }

  // Fall back to cached location from main app
  try {
    const cached = await AsyncStorage.getItem('lastLocation');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Use if less than 1 hour old
      if (Date.now() - parsed.timestamp < 3600000) {
        return { latitude: parsed.latitude, longitude: parsed.longitude };
      }
    }
  } catch (_) {
    // No cached location available
  }

  return null;
}

async function fetchRestaurant(latitude, longitude) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${BACKEND_URL}/api/places-nearby`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude,
        longitude,
        radius: 8047, // ~5 miles
        opennow: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const pick = data.results[Math.floor(Math.random() * data.results.length)];
      return {
        name: pick.name,
        rating: pick.rating ? pick.rating.toString() : null,
      };
    }
    return null;
  } catch (_) {
    clearTimeout(timeout);
    return undefined; // indicates error vs no results
  }
}

export async function widgetTaskHandler(props) {
  const { widgetAction, clickAction } = props.widgetInfo;

  // Widget added or resized — show idle state
  if (widgetAction === 'WIDGET_ADDED' || widgetAction === 'WIDGET_RESIZED' || widgetAction === 'WIDGET_UPDATE') {
    props.renderWidget(<ForkItWidget status="idle" />);
    return;
  }

  // Button pressed
  if (widgetAction === 'WIDGET_CLICK' && clickAction === 'FORK_IT') {
    // Show loading
    props.renderWidget(<ForkItWidget status="loading" />);

    const location = await getLocation();

    if (!location) {
      props.renderWidget(
        <ForkItWidget
          status="result"
          restaurantName="Open ForkIt first"
          restaurantRating="Need location access"
        />
      );
      return;
    }

    const result = await fetchRestaurant(location.latitude, location.longitude);

    if (result === undefined) {
      // Network error
      props.renderWidget(
        <ForkItWidget
          status="result"
          restaurantName="Connection error"
          restaurantRating="Try again"
        />
      );
    } else if (result === null) {
      // No results
      props.renderWidget(
        <ForkItWidget
          status="result"
          restaurantName="Nothing nearby"
          restaurantRating="Try again later"
        />
      );
    } else {
      props.renderWidget(
        <ForkItWidget
          status="result"
          restaurantName={result.name}
          restaurantRating={result.rating}
        />
      );
    }
  }
}
