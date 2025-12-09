import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Notification permission granted.");
    getFCMToken();
  }
};

export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    if (token) {
      console.log("FCM Token:", token);
      await AsyncStorage.setItem("pushToken", token);
    } else {
      console.log("No FCM token received");
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};

export const setupNotificationListener = () => {
  messaging().onMessage(async (remoteMessage) => {
    console.log("FCM Notification Received (Foreground):", remoteMessage);
    Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
  });

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("FCM Notification Received (Background):", remoteMessage);
  });
};
