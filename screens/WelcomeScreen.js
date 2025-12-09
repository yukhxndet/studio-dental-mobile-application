// screens/WelcomeScreen.js

import React, { useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated, Easing } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { globalStyles } from "../styles/global";

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(20)).current; 
  const textOpacity = useRef(new Animated.Value(0)).current;
  const profileOpacity = useRef(new Animated.Value(0)).current;
  const profileTranslateY = useRef(new Animated.Value(20)).current; 

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1200, 
          easing: Easing.out(Easing.ease), 
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1200,
          delay: 200, 
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(500),

      Animated.parallel([
        Animated.timing(profileOpacity, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(profileTranslateY, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }, 4000); 

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View  style={styles.container}>
      {/* ส่วน Logo และชื่อคลินิก */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }],
          },
        ]}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <Animated.Text
          style={[
            globalStyles.textBold,
            styles.clinicName,
            { opacity: textOpacity },
          ]}
        >
          Studio Dental
        </Animated.Text>
      </Animated.View>

      {/* ส่วน Profile และข้อความต้อนรับ */}
      <Animated.View
        style={[
          styles.welcomeContainer,
          {
            opacity: profileOpacity,
            transform: [{ translateY: profileTranslateY }],
          },
        ]}
      >
        <Image
          source={
            user?.profilePic
              ? { uri: user.profilePic }
              : require("../assets/images/default-profile.png")
          }
          style={styles.profilePic}
        />
        <Text style={[globalStyles.text, styles.welcomeText]}>
          ยินดีต้อนรับ
        </Text>
        <Text style={[globalStyles.textBold, styles.userName]}>
          {user?.name || "ผู้ใช้งาน"}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center", 
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
  },
  clinicName: {
    fontSize: 24,
    marginTop: 16,
    color: "#1D364A",
  },
  welcomeContainer: {
    position: "absolute",
    bottom: "15%", 
    alignItems: "center",
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#86D6DD",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    color: "#555",
  },
  userName: {
    fontSize: 22,
    color: "#1D364A",
    marginTop: 4,
  },
});
