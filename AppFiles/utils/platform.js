import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';

// Haptics wrapper — no-op on web
export const haptics = {
  selectionAsync: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
  },
  notificationAsync: async (type) => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(type);
    }
  },
  NotificationFeedbackType: Haptics.NotificationFeedbackType,
};

// Alert wrapper — window.alert on web, native Alert on mobile
export const showAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    if (buttons?.length) {
      const choice = window.confirm(message ? `${title}\n\n${message}` : title);
      const btn = choice ? buttons[buttons.length - 1] : buttons[0];
      if (btn?.onPress) btn.onPress();
    } else {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
