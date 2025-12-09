import React, { useState, useEffect } from "react";
import { Alert, Text } from "react-native";
import { PermissionsAndroid } from "react-native";
import firebase from "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";
import {
  useFonts,
  Kanit_400Regular,
  Kanit_600SemiBold,
  Kanit_300Light,
} from "@expo-google-fonts/kanit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navigation from "./navigation";
import { apiService } from "./apiService";
import { StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native";
import Toast from "react-native-toast-message";
import { toastConfig } from "./components/toastConfig"; 
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";
// Firebase Configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

if (!firebase.apps.length) {
  console.log("Initializing Firebase");
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const App = () => {
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    if (Platform.OS === "android") {
      StatusBar.setBarStyle("dark-content"); 
      StatusBar.setBackgroundColor("transparent"); 
      StatusBar.setTranslucent(true); 
    } else {
      StatusBar.setBarStyle("dark-content"); 
      StatusBar.setBackgroundColor("transparent"); 
      StatusBar.setTranslucent(true);
    }
    console.log("useEffect started");
    requestPremissionAndroid();

    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("FCM Message:", remoteMessage);
      Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
    });

    const checkLoginStatus = async () => {
      const loginToken = await AsyncStorage.getItem("loginToken");
      console.log("Login Token:", loginToken);
      if (loginToken) {
        setInitialRoute("Home");
      } else {
        const fcmToken = await getFcmToken();
        console.log("Sending FCM Token to Login:", fcmToken); // Debug point
        navigation.navigate("Login", { fcmToken }); // ส่ง fcmToken ไปยังหน้า Login
      }
    };

    const getFcmToken = async () => {
      try {
        console.log("Getting FCM Token...");
        const fcmToken = await messaging().getToken();
        console.log("FCM Token:", fcmToken); // ตรวจสอบว่า fcmToken ถูกตั้งค่า
        return fcmToken;
      } catch (error) {
        console.error("Error getting FCM Token:", error);
      }
    };

    checkLoginStatus();
    return unsubscribe;
  }, []);

  // Request notification permission for Android
  const requestPremissionAndroid = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Notification Permission Granted");
      getFcmToken();
    } else {
      console.log("Notification Permission Denied");
      Alert.alert("Permission Denied");
    }
  };

  const [fontsLoaded] = useFonts({
    Kanit_400Regular,
    Kanit_600SemiBold,
    Kanit_300Light,
  });

  // if (!fontsLoaded) {
  //   console.log("Fonts are loading...");
  //   return <Text>Loading...</Text>;
  // }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navigation initialRoute={initialRoute} />
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
};

export default App;
