import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

// Haptics wrapper - no-op on web
export const haptics = {
  selectionAsync: async () => {
    if (Platform.OS === "web") return;
    return Haptics.selectionAsync();
  },
  notificationAsync: async (type) => {
    if (Platform.OS === "web") return;
    return Haptics.notificationAsync(type);
  },
  NotificationFeedbackType: Haptics.NotificationFeedbackType,
};

// Alert wrapper - use window.alert on web
export const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    const { Alert } = require("react-native");
    Alert.alert(title, message);
  }
};
