// ForkIt — UsageHint component

import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { FREE_SOLO_FORKS, FREE_GROUP_FORKS, FREE_FORKS_NUDGE_THRESHOLD } from '../constants/config';
import { THEME } from '../constants/theme';

/**
 * Displays a soft Pro nudge or hard paywall based on usage.
 * No countdown — users should feel abundant, not rationed.
 * @param {object} props - Component props
 * @param {string} props.mode - 'solo' or 'group'
 * @param {{solo: number, group: number}} props.usage - current usage counts
 * @param {Function} props.onPaywall - callback to show paywall
 * @returns {JSX.Element|null}
 */
function UsageHint({ mode, usage, onPaywall }) {
  if (mode === 'solo') {
    if (usage.solo >= FREE_SOLO_FORKS) {
      return (
        <TouchableOpacity
          onPress={() => onPaywall('solo')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Pro for unlimited searches"
        >
          <Text style={styles.usageHintAccent}>Upgrade to Pro for unlimited searches</Text>
        </TouchableOpacity>
      );
    }
    if (usage.solo >= FREE_FORKS_NUDGE_THRESHOLD) {
      return (
        <TouchableOpacity
          onPress={() => onPaywall('solo')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go Pro for unlimited searches"
        >
          <Text style={styles.usageHint}>Enjoying ForkIt? Go Pro for unlimited searches</Text>
        </TouchableOpacity>
      );
    }
  } else {
    if (usage.group >= FREE_GROUP_FORKS) {
      return (
        <TouchableOpacity
          onPress={() => onPaywall('group')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Pro for unlimited hosting, joining is always free"
        >
          <Text style={styles.usageHintAccent}>
            Upgrade to Pro for unlimited hosting — joining is always free
          </Text>
        </TouchableOpacity>
      );
    }
  }
  return null;
}

const styles = StyleSheet.create({
  usageHint: {
    color: THEME.textDimmed,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  usageHintAccent: {
    color: THEME.accent,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
});

export { UsageHint };
export default UsageHint;
