import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { globalStyles } from "../styles/global";
import { verifyOtp } from "../apiService";
import ArrowBackComponent from "../components/ArrowBackComponent";
import NextButton from "../components/NextButtonComponent";

export default function OTPVerifyScreen() {
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(300); // 5 นาที = 300 วินาที

  const navigation = useNavigation();
  const route = useRoute();
  const { email, refCode } = route.params;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerifyOtp = async () => {
    if (countdown <= 0) {
      Alert.alert("หมดเวลา", "รหัส OTP หมดอายุแล้ว กรุณาขอใหม่");
      return;
    }

    try {
      const response = await verifyOtp(email, otp);
      if (response.status === "ok") {
        navigation.navigate("ResetPassword", { email });
      } else {
        Alert.alert("รหัสไม่ถูกต้อง", "กรุณาลองใหม่");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถยืนยัน OTP ได้");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white pt-8">
        <ArrowBackComponent />

        <View className="form space-y-2 px-5">
          <Text style={globalStyles.textBold} className="text-2xl text-center">
            ยืนยันรหัส OTP
          </Text>
          <Text
            style={globalStyles.text}
            className="text-center color-gray-400 mb-7"
          >
            เราได้ส่งรหัส OTP ไปยังอีเมลของคุณ กรุณากรอกรหัส 6 หลัก
          </Text>

          <Text
            style={globalStyles.text}
            className="text-center mt-2 text-sm text-gray-500"
          >
            Ref code: <Text className="font-bold">{refCode}</Text>
          </Text>
          <Text
            style={globalStyles.text}
            className="text-center text-sm text-red-500"
          >
            รหัสหมดอายุใน {formatTime(countdown)}
          </Text>

          <TextInput
            style={[globalStyles.text, globalStyles.borderTextInput]}
            className="p-3 bg-neutral-50 rounded-lg mb-1 text-center"
            placeholder="กรอกรหัส OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            placeholderTextColor="#878787"
          />

          <NextButton onPress={handleVerifyOtp} disabled={otp.length !== 6} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
