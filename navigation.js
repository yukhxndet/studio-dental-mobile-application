import { View, Platform } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";

import TreatmentScreen from "./screens/TreatmentScreen";
import ChatBotScreen from "./screens/ChatBotScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import OTPVerifyScreen from "./screens/OTPVerifyScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import ContentDetail from "./screens/ContentDetail";
import TreatmentHistoryDetailScreen from "./screens/TreatmentHistoryDetailScreen"; // ✅ 1. Import หน้าใหม่

// SignUp Screens
import SignUpScreenName from "./screens/signup/SignUpScreenName";
import SignUpScreenAge from "./screens/signup/SignUpScreenAge";
import SignUpScreenGender from "./screens/signup/SignUpScreenGender";
import SignUpScreenTel from "./screens/signup/SignUpScreenTel";
import SignUpScreenEmail from "./screens/signup/SignUpScreenEmail";
import SignUpScreenPassword from "./screens/signup/SignUpScreenPassword";
import SignUpScreenProfile from "./screens/signup/SignUpScreenProfile";
import SignUpScreenSuccess from "./screens/signup/SignUpScreenSuccess";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Appointment Screens
import AppointmentScreen from "./screens/appointment/AppointmentScreen";
import AppointmentTimeScreen from "./screens/appointment/AppointmentTimeScreen";
import AppointmentOverviewScreen from "./screens/appointment/AppointmentOverviewScreen";
import AppointmentSuccessScreen from "./screens/appointment/AppointmentSuccessScreen";
import Appointment3MScreen from "./screens/appointment/Appointment3MScreen";

import AccountScreen from "./screens/Account";
import AddProfileDetails from "./screens/signup/AddProfileDetails";
import SignUpScreenOTP from "./screens/signup/SignUpScreenOTP";
import NotificationScreen from "./screens/NotificationScreen";
import NotificationSettingsScreen from "./screens/NotificationSettingScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import PasswordSecurityScreen from "./screens/PasswordSecurityScreen";
import TreatmentPlanScreen from "./screens/TreatmentPlanScreen";
import PersonalInfoScreen from "./screens/PersonalInfoScreen";
import ReferralScreen from "./screens/ReferralScreen";
import SignupScreenReferral from "./screens/signup/SignupScreenReferral";
import TestScreen from "./screens/TestScreen";
import WelcomeScreen from "./screens/WelcomeScreen"; // <-- import หน้าใหม่

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const screenOption = {
  headerShown: false,
  tabBarShowLabel: false,
};

const HomeTab = () => {
  return (
    <Tab.Navigator screenOptions={screenOption}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="items-center justify-center">
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color="#1D364A"
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Treatment"
        component={TreatmentScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="items-center justify-center">
              <Ionicons
                name={focused ? "calendar" : "calendar-outline"}
                size={24}
                color="#1D364A"
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Appointment"
        component={AppointmentStack}
        options={{
          tabBarIcon: () => (
            <View
              style={{
                top: Platform.OS === "ios" ? -10 : -20,
                width: Platform.OS === "ios" ? 50 : 60,
                height: Platform.OS === "ios" ? 50 : 60,
                borderRadius: Platform.OS === "ios" ? 25 : 30,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#1D364A",
              }}
            >
              <Ionicons name="add" size={24} color="white" />
            </View>
          ),
          tabBarStyle: { display: "none" },
        }}
      />
      <Tab.Screen
        name="ChatBot"
        component={ChatBotScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="items-center justify-center">
              <Ionicons
                name={focused ? "chatbox" : "chatbox-outline"}
                size={24}
                color="#1D364A"
              />
            </View>
          ),
          tabBarStyle: { display: "none" },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="items-center justify-center">
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color="#1D364A"
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppointmentStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AppointmentStack"
        component={AppointmentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Appointment3M"
        component={Appointment3MScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppointmentTime"
        component={AppointmentTimeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppointmentOverviewScreen"
        component={AppointmentOverviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppointmentSuccess"
        component={AppointmentSuccessScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default function Navigation(props) {
  const login = props.login ? "Home" : "Login";
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={login}>
        <Stack.Screen
          name="Login"
          options={{ headerShown: false }}
          component={LoginScreen}
        />
        <Stack.Screen
          name="WelcomeScreen"
          options={{ headerShown: false }}
          component={WelcomeScreen}
        />

        <Stack.Screen
          name="TreatmentHistoryDetail"
          component={TreatmentHistoryDetailScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AddProfileDetails"
          options={{ headerShown: false }}
          component={AddProfileDetails}
        />
        <Stack.Screen
          name="OTPVerify"
          options={{ headerShown: false }}
          component={OTPVerifyScreen}
        />
        <Stack.Screen
          name="ResetPassword"
          options={{ headerShown: false }}
          component={ResetPasswordScreen}
        />
        <Stack.Screen
          name="Notification"
          options={{ headerShown: false }}
          component={NotificationScreen}
        />
        <Stack.Screen
          name="ForgotPassword"
          options={{ headerShown: false }}
          component={ForgotPasswordScreen}
        />
        <Stack.Screen
          name="Account"
          options={{ headerShown: false }}
          component={AccountScreen}
        />
        <Stack.Screen
          name="NotificationSettings"
          options={{ headerShown: false }}
          component={NotificationSettingsScreen}
        />

        <Stack.Screen
          name="Referral"
          options={{ headerShown: false }}
          component={ReferralScreen}
        />

        <Stack.Screen
          name="TreatmentPlan"
          options={{ headerShown: false }}
          component={TreatmentPlanScreen}
        />

        <Stack.Screen
          name="PersonalInfo"
          options={{ headerShown: false }}
          component={PersonalInfoScreen}
        />

        <Stack.Screen
          name="PasswordSecurity"
          options={{ headerShown: false }}
          component={PasswordSecurityScreen}
        />

        <Stack.Screen
          name="Test"
          options={{ headerShown: false }}
          component={TestScreen}
        />

        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="SignUpName"
          options={{ headerShown: false }}
          component={SignUpScreenName}
        />
        <Stack.Screen
          name="SignUpAge"
          options={{ headerShown: false }}
          component={SignUpScreenAge}
        />
        <Stack.Screen
          name="SignUpGender"
          options={{ headerShown: false }}
          component={SignUpScreenGender}
        />
        <Stack.Screen
          name="SignUpTel"
          options={{ headerShown: false }}
          component={SignUpScreenTel}
        />
        <Stack.Screen
          name="SignUpEmail"
          options={{ headerShown: false }}
          component={SignUpScreenEmail}
        />
        <Stack.Screen
          name="SignUpOTP"
          options={{ headerShown: false }}
          component={SignUpScreenOTP}
        />
        <Stack.Screen
          name="SignUpReferral"
          options={{ headerShown: false }}
          component={SignupScreenReferral}
        />
        <Stack.Screen
          name="SignUpPassword"
          options={{ headerShown: false }}
          component={SignUpScreenPassword}
        />
        <Stack.Screen
          name="SignUpProfile"
          options={{ headerShown: false }}
          component={SignUpScreenProfile}
        />
        <Stack.Screen
          name="SignUpSuccess"
          options={{ headerShown: false }}
          component={SignUpScreenSuccess}
        />
        <Stack.Screen
          name="Home"
          component={HomeTab}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContentDetail"
          component={ContentDetail}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
