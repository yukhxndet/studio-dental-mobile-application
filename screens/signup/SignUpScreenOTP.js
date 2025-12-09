import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "../../styles/global";
import ArrowBackComponent from "../../components/ArrowBackComponent";
import NextButton from "../../components/NextButtonComponent";
import axios from "axios";
import { verifyOtp } from "../../apiService"; // ปรับ path ให้ตรงกับโครงสร้างโปรเจกต์ของคุณ

export default function SignUpScreenOTP({ route }) {
  const navigation = useNavigation();
  const { email, otpRefCode, expiresIn = 300, ...restParams } = route.params;

  const [otp, setOTP] = useState("");
  const [timeLeft, setTimeLeft] = useState(expiresIn); // นับถอยหลัง

  const isNextButtonDisabled = !otp.trim();

  const handleVerify = async () => {
    try {
      const res = await verifyOtp(email, otp);

      if (res.status === "ok") {
        navigation.navigate("SignUpReferral", { email, ...restParams });
      } else {
        Alert.alert("รหัส OTP ไม่ถูกต้อง");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("เกิดข้อผิดพลาดในการตรวจสอบ OTP");
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View className="flex-1 bg-white pt-8">
        <ArrowBackComponent />

        <View className="form space-y-2 px-5 ">
          <Text style={globalStyles.textBold} className="text-2xl text-center">
            ป้อนรหัสยืนยัน
          </Text>
          <Text
            style={globalStyles.text}
            className="color-gray-400 text-center mb-7"
          >
            เราส่งรหัสยืนยันไปที่ {email}
          </Text>

          <Text
            style={globalStyles.text}
            className="text-center text-sm text-gray-500"
          >
            รหัสอ้างอิง: <Text style={globalStyles.textBold}>{otpRefCode}</Text>
          </Text>

          <Text
            style={globalStyles.textLight}
            className="text-center text-xs text-red-400 mb-4"
          >
            รหัสจะหมดอายุใน {formatTime(timeLeft)} นาที
          </Text>

          <View className="mb-5">
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 bg-neutral-50 rounded-lg mb-1"
              placeholder="รหัสผ่าน OTP"
              placeholderTextColor="#878787"
              keyboardType="numeric"
              maxLength={6}
              onChangeText={(text) => setOTP(text)}
            />
          </View>

          <NextButton onPress={handleVerify} disabled={isNextButtonDisabled} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
