// settingsUtils.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export const setNotificationPreference = async (enabled) => {
  try {
    await AsyncStorage.setItem("notificationsEnabled", JSON.stringify(enabled));
  } catch (e) {
    console.error("Failed to save setting:", e);
  }
};

export const getNotificationPreference = async () => {
  try {
    const value = await AsyncStorage.getItem("notificationsEnabled");
    return value !== null ? JSON.parse(value) : true; // true by default
  } catch (e) {
    console.error("Failed to fetch setting:", e);
    return true;
  }
};
