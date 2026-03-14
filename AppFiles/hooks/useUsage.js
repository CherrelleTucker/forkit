// useUsage — Fork usage tracking, Pro subscription, and paywall logic.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import Purchases from 'react-native-purchases';

import {
  FREE_SOLO_FORKS,
  FREE_GROUP_FORKS,
  PRO_PRICE_LABEL,
  RC_APPLE_KEY,
  RC_GOOGLE_KEY,
  RC_ENTITLEMENT_ID,
  TOAST_LONG,
  TOAST_DEFAULT,
} from '../constants/config';
import { STORAGE_KEYS } from '../constants/storage';
import { safeStore } from '../utils/helpers';
import { showAlert } from '../utils/platform';

/**
 * Hook that manages fork usage quotas, Pro subscription status, and paywall.
 * @param {object} opts
 * @param {(text: string, kind: string, ms: number) => void} opts.showToast - Toast function
 * @returns {object} Usage state and functions
 */
export default function useUsage({ showToast }) {
  const [forkUsage, setForkUsage] = useState({ solo: 0, group: 0, month: 0, year: 0 });
  const [isProActive, setIsProActive] = useState(false);
  const rcInitialized = useRef(false);

  // Load persisted usage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.FORK_USAGE);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed) setForkUsage(parsed);
        }
      } catch (_) {
        // Non-critical
      }
    })();
  }, []);

  // Initialize RevenueCat and listen for subscription changes
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    // Skip RevenueCat on simulator — native store isn't available
    if (__DEV__ && Platform.OS === 'ios') return undefined;
    let listener;
    const initRC = async () => {
      try {
        const apiKey = Platform.OS === 'ios' ? RC_APPLE_KEY : RC_GOOGLE_KEY;
        if (!apiKey) return; // No key available (local dev) — skip IAP
        await Purchases.configure({ apiKey });
        rcInitialized.current = true;
        const customerInfo = await Purchases.getCustomerInfo();
        setIsProActive(typeof customerInfo.entitlements.active[RC_ENTITLEMENT_ID] !== 'undefined');
        listener = Purchases.addCustomerInfoUpdateListener((info) => {
          setIsProActive(typeof info.entitlements.active[RC_ENTITLEMENT_ID] !== 'undefined');
        });
      } catch (_) {
        // RevenueCat init failure is non-critical — free tier still works
      }
    };
    initRC();
    return () => listener?.remove();
  }, []);

  // Re-check pro status when app returns to foreground
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active' && rcInitialized.current) {
        try {
          const info = await Purchases.getCustomerInfo();
          setIsProActive(typeof info.entitlements.active[RC_ENTITLEMENT_ID] !== 'undefined');
        } catch (_) {
          // Non-critical — keep existing pro status
        }
      }
    });
    return () => sub.remove();
  }, []);

  function isPro() {
    return isProActive;
  }

  /**
   * Get the current month's usage, auto-resetting if the month has changed.
   * @returns {{solo: number, group: number, month: number, year: number}}
   */
  function getCurrentUsage() {
    const now = new Date();
    if (forkUsage.month === now.getUTCMonth() && forkUsage.year === now.getUTCFullYear()) {
      return forkUsage;
    }
    // New month — reset
    const reset = { solo: 0, group: 0, month: now.getUTCMonth(), year: now.getUTCFullYear() };
    setForkUsage(reset);
    safeStore(STORAGE_KEYS.FORK_USAGE, reset);
    return reset;
  }

  /**
   * Increment the fork usage counter and persist it.
   * @param {'solo' | 'group'} type - which counter to increment
   */
  function incrementUsage(type) {
    const now = new Date();
    const current = getCurrentUsage();
    const updated = { ...current, month: now.getUTCMonth(), year: now.getUTCFullYear() };
    updated[type === 'solo' ? 'solo' : 'group'] += 1;
    setForkUsage(updated);
    safeStore(STORAGE_KEYS.FORK_USAGE, updated);
  }

  /**
   * Check if the user has quota for the given fork type. Shows paywall if not.
   * @param {'solo' | 'group'} type - which quota to check
   * @returns {boolean} true if allowed
   */
  function checkQuota(type) {
    if (isPro()) return true;
    const usage = getCurrentUsage();
    const limit = type === 'solo' ? FREE_SOLO_FORKS : FREE_GROUP_FORKS;
    const count = type === 'solo' ? usage.solo : usage.group;
    if (count < limit) return true;
    showPaywall(type);
    return false;
  }

  /**
   * Show the upgrade paywall dialog.
   * @param {'solo' | 'group'} type - which limit was hit
   */
  async function showPaywall(type) {
    if (Platform.OS === 'web') return;
    try {
      const offerings = await Purchases.getOfferings();
      const monthly = offerings.current?.monthly;
      if (!monthly) {
        showAlert('Oops', 'Unable to load subscription info. Please try again later.');
        return;
      }
      const price = monthly.product.priceString || PRO_PRICE_LABEL;
      const terms = `Auto-renews until canceled. Cancel anytime in your device's subscription settings.\n\nBy subscribing you agree to our Terms of Use and Privacy Policy, available in the info menu.`;
      const message =
        type === 'solo'
          ? `You've explored a lot this month!\n\nGo Pro for ${price}/month — unlimited searches with as many re-rolls as you want.\n\nFree searches reset on the 1st.\n\n${terms}`
          : `You've used your free Fork Around session this month.\n\nGo Pro for ${price}/month — unlimited group sessions.\n\nFree sessions reset on the 1st.\n\n${terms}`;
      showAlert('Upgrade to ForkIt! Pro', message, [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Restore Purchase',
          onPress: async () => {
            try {
              const info = await Purchases.restorePurchases();
              if (typeof info.entitlements.active[RC_ENTITLEMENT_ID] !== 'undefined') {
                showToast('Pro restored! Welcome back.', 'success', TOAST_LONG);
              } else {
                showToast('No active subscription found.', 'warn', TOAST_DEFAULT);
              }
            } catch (_) {
              showToast('Restore failed. Please try again.', 'warn', TOAST_DEFAULT);
            }
          },
        },
        {
          text: 'Go Pro',
          onPress: async () => {
            try {
              const { customerInfo } = await Purchases.purchasePackage(monthly);
              if (typeof customerInfo.entitlements.active[RC_ENTITLEMENT_ID] !== 'undefined') {
                // Reset usage so user isn't penalized if they cancel later this month
                const now = new Date();
                const reset = {
                  solo: 0,
                  group: 0,
                  month: now.getUTCMonth(),
                  year: now.getUTCFullYear(),
                };
                setForkUsage(reset);
                safeStore(STORAGE_KEYS.FORK_USAGE, reset);
                showToast('Welcome to Pro! Unlimited forks unlocked.', 'success', TOAST_LONG);
              }
            } catch (e) {
              if (e?.userCancelled !== true) {
                showToast('Purchase failed. Please try again.', 'warn', TOAST_DEFAULT);
              }
            }
          },
        },
      ]);
    } catch (_) {
      showAlert('Oops', 'Unable to load subscription info. Please try again later.');
    }
  }

  return {
    forkUsage,
    isProActive,
    isPro,
    getCurrentUsage,
    incrementUsage,
    checkQuota,
    showPaywall,
  };
}
