import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../styles/global";

const Header = ({ title, onBackPress }) => {
  const navigation = useNavigation();

  const ios = Platform.OS === "ios";
  const bottomPadding = ios ? "pb-8" : "pb-12";
  const heightH = Platform.OS === "ios" ? "" : "";

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  return (
    <View
      className={"w-full  " + bottomPadding + " " + heightH}
      style={globalStyles.bgAppColor}
    >
      <SafeAreaView className="z-20 w-full">
        <View className="flex-row justify-start">
          {/* ✅✅✅ แก้ไข onPress ให้เรียกใช้ฟังก์ชันใหม่ ✅✅✅ */}
          <TouchableOpacity onPress={handleBackPress} className="p-2 ml-4">
            <MaterialIcons name="arrow-back-ios" size={24} color={"white"} />
          </TouchableOpacity>
        </View>
        <Text
          className="px-4 text-xl text-center text-white"
          style={globalStyles.textBold}
        >
          {title}
        </Text>
      </SafeAreaView>
    </View>
  );
};

export default Header;
