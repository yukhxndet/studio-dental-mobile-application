import React from "react";
import { View, Text, Image, SafeAreaView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { globalStyles } from "../styles/global";

export default function AccountScreen() {
  const route = useRoute();
  const { name, email, photo } = route.params || {};

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text style={globalStyles.textBold} className="text-xl mb-5">
        ข้อมูลผู้ใช้ (Google)
      </Text>

      {photo && (
        <Image
          source={{ uri: photo }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginBottom: 20,
          }}
        />
      )}

      <Text style={globalStyles.text} className="text-lg mb-2">
        ชื่อ: {name || "-"}
      </Text>
      <Text style={globalStyles.text} className="text-lg">
        อีเมล: {email || "-"}
      </Text>
    </SafeAreaView>
  );
}
