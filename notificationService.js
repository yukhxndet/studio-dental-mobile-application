import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "./apiService"; // Import API Service



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  // ขอสิทธิ์สำหรับการแจ้งเตือน
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }

  // รับ Expo Push Token
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Push token:", token);

  // บันทึก token ลง Backend
  try {
    await apiService.post("/api/save-token", { token });
    await AsyncStorage.setItem("pushToken", token);
  } catch (error) {
    console.error("Error saving push token:", error);
  }
};
