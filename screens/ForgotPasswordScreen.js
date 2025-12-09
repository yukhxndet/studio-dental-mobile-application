import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "../styles/global";
import ArrowBackComponent from "../components/ArrowBackComponent";
import NextButton from "../components/NextButtonComponent";
import { sendOtpToEmail } from "../apiService";
import Toast from "react-native-toast-message";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidEmail = (text) => {
    const reg = /\S+@\S+\.\S+/;
    return reg.test(text);
  };

  const handleRequestOtp = async () => {
    setAttemptedSubmit(true);

    if (!isValidEmail(email)) return;

    setIsSubmitting(true); // 🔒 ปิดปุ่ม

    try {
      const response = await sendOtpToEmail(email);
      if (response.status === "ok") {
        navigation.navigate("OTPVerify", {
          email,
          refCode: response.otpRefCode, // <--- เพิ่มตรงนี้
        });
      } else {
        Toast.show({
          type: "error",
          text1: "เกิดข้อผิดพลาด",
          text2: response.message || "ไม่สามารถส่ง OTP ได้",
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "เกิดข้อผิดพลาด",
        text2: "ไม่สามารถส่ง OTP ได้",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white pt-8">
        <ArrowBackComponent />

        <View className="form space-y-2 px-5">
          <Text style={globalStyles.textBold} className="text-2xl text-center">
            ลืมรหัสผ่านใช่ไหม?
          </Text>
          <Text
            style={globalStyles.text}
            className="color-gray-400 text-center mb-7"
          >
            กรอกอีเมลของคุณเพื่อรับรหัส OTP สำหรับตั้งรหัสผ่านใหม่
          </Text>

          <View className="mb-5">
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 bg-neutral-50 rounded-lg mb-1"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#878787"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {attemptedSubmit && !isValidEmail(email) && (
              <Text
                style={globalStyles.text}
                className=" text-right text-xs text-red-400"
              >
                กรุณากรอกอีเมลให้ถูกต้อง
              </Text>
            )}
          </View>

          <NextButton
            onPress={handleRequestOtp}
            disabled={isSubmitting || !isValidEmail(email)}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
