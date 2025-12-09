import React from "react";
import { View, Text } from "react-native";
import { globalStyles } from "../styles/global";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message"; // เพิ่ม import


const renderTextLine = (text, index) =>
  text ? (
    <Text
      key={index}
      style={[
        globalStyles.text,
        {
          color: "#333",
          textAlign: "left",
          fontSize: 14,
          marginTop: 4,
        },
      ]}
    >
      {text}
    </Text>
  ) : null;

const baseStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  backgroundColor: "#fff", // สีพื้นหลังขาว
  padding: 12,
  borderRadius: 12,
  marginTop: 40,
  marginHorizontal: 20,
  elevation: 5,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
};

const iconStyle = {
  marginRight: 10,
  marginTop: 2,
};

export const toastConfig = {
  error: ({ text1, text2, text3, text4, text5 }) => (
    <View
      style={[baseStyle, { borderLeftWidth: 6, borderLeftColor: "#ff4d4d" }]}
    >
      <MaterialIcons
        name="error-outline"
        size={24}
        color="#ff4d4d"
        style={iconStyle}
      />
      <View style={{ flex: 1 }}>
        <Text style={[globalStyles.textBold, { color: "#111", fontSize: 16 }]}>
          {text1}
        </Text>
        {[text2, text3, text4, text5].map(renderTextLine)}
      </View>
    </View>
  ),

  success: ({ text1, text2, text3, text4, text5 }) => (
    <View
      style={[baseStyle, { borderLeftWidth: 6, borderLeftColor: "#4BB543" }]}
    >
      <MaterialIcons
        name="check-circle"
        size={24}
        color="#4BB543"
        style={iconStyle}
      />
      <View style={{ flex: 1 }}>
        <Text style={[globalStyles.textBold, { color: "#111", fontSize: 16 }]}>
          {text1}
        </Text>
        {[text2, text3, text4, text5].map(renderTextLine)}
      </View>
    </View>
  ),
};
