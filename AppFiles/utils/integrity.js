// ForkIt - Play Integrity Helper
// Handles Google Play Integrity token generation for app authenticity verification

import { Platform } from 'react-native';
import * as AppIntegrity from 'expo-app-integrity';

// Cache the integrity token for the session
let cachedToken = null;
let tokenTimestamp = null;
const TOKEN_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Get a Play Integrity token for the current app session
 * On Android, this uses Google Play Integrity API
 * On iOS, this would use App Attest (not implemented in MVP)
 *
 * @returns {Promise<string|null>} The integrity token, or null if unavailable
 */
export async function getIntegrityToken() {
  try {
    // Only support Android for now
    if (Platform.OS !== 'android') {
      console.log('Play Integrity only available on Android');
      return null;
    }

    // Return cached token if still valid
    if (cachedToken && tokenTimestamp) {
      const age = Date.now() - tokenTimestamp;
      if (age < TOKEN_CACHE_DURATION) {
        console.log('Using cached integrity token');
        return cachedToken;
      }
    }

    // Generate a nonce (number used once)
    // In production, this should be a server-generated challenge
    const nonce = generateNonce();

    console.log('Requesting Play Integrity token...');

    // Request integrity token from Play Integrity API
    const token = await AppIntegrity.requestIntegrityToken(nonce);

    if (token) {
      // Cache the token
      cachedToken = token;
      tokenTimestamp = Date.now();
      console.log('Play Integrity token obtained successfully');
      return token;
    } else {
      console.warn('Play Integrity token request returned null');
      return null;
    }
  } catch (error) {
    // Don't block the user if integrity check fails
    // Just log the error for monitoring
    console.warn('Play Integrity check failed:', error.message);
    return null;
  }
}

/**
 * Clear the cached integrity token
 * Call this when you want to force a fresh token request
 */
export function clearIntegrityToken() {
  cachedToken = null;
  tokenTimestamp = null;
  console.log('Integrity token cache cleared');
}

/**
 * Verify an integrity token with the backend
 *
 * @param {string} token - The integrity token to verify
 * @param {string} backendUrl - The backend API URL
 * @returns {Promise<object>} Verification result
 */
export async function verifyIntegrityToken(token, backendUrl) {
  try {
    if (!token) {
      return { verified: false, error: 'No token provided' };
    }

    const response = await fetch(`${backendUrl}/api/verify-integrity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      console.error('Integrity verification failed:', response.status);
      return { verified: false, error: 'Verification request failed' };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error verifying integrity token:', error);
    return { verified: false, error: error.message };
  }
}

/**
 * Generate a nonce for integrity token requests
 * In production, this should come from your backend server
 *
 * @returns {string} A nonce string
 */
function generateNonce() {
  // Simple nonce: timestamp + random string
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Check if Play Integrity is available on this device
 *
 * @returns {boolean} True if available
 */
export function isIntegrityAvailable() {
  return Platform.OS === 'android' && !!AppIntegrity;
}
