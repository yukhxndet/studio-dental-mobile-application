import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "../../styles/global";
import ArrowBackComponent from "../../components/ArrowBackComponent";
import NextButton from "../../components/NextButtonComponent";
import { sendOtpToVeryfy } from "../../apiService";
import apiService from "../../apiService"; // ใช้ axios instance

export default function SignUpScreenEmail({ route }) {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (text) => {
    const reg = /\S+@\S+\.\S+/;
    return reg.test(text);
  };

  const isNextButtonDisabled = !isValidEmail(email) || isDuplicate || isLoading;

  const checkEmailDuplicate = async (emailText) => {
    if (!isValidEmail(emailText)) {
      setIsDuplicate(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.post("/check-email", { email: emailText });
      setIsDuplicate(res.data.exists);
    } catch (error) {
      console.error("Error checking email:", error);
      setIsDuplicate(false); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isValidEmail(email)) {
        checkEmailDuplicate(email);
      } else {
        setIsDuplicate(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [email]);

  const handleSubmit = async () => {
    setAttemptedSubmit(true);

    if (isNextButtonDisabled) return;

    try {
      const response = await sendOtpToVeryfy(email);
      if (response.success) {
        navigation.navigate("SignUpOTP", {
          email,
          otpRefCode: response.otpRefCode,
          expiresIn: response.expiresIn,
          ...(route?.params || {}),
        });
      } else {
        alert(response.message || "ส่งอีเมล OTP ไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("เกิดข้อผิดพลาดในการส่ง OTP");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white pt-8">
        <ArrowBackComponent />

        <View className="form space-y-2 px-5 ">
          <Text style={globalStyles.textBold} className="text-2xl text-center">
            อีเมลคุณคืออะไร?
          </Text>
          <Text
            style={globalStyles.text}
            className="color-gray-400 text-center mb-7"
          >
            กรอกอีเมลที่สามารถติดต่อได้
          </Text>

          <View className="mb-5">
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 bg-neutral-50 rounded-lg mb-1"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#878787"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {isLoading && <ActivityIndicator size="small" color="#888" />}
            {attemptedSubmit && !isValidEmail(email) && (
              <Text
                style={globalStyles.text}
                className=" text-right text-xs text-red-400"
              >
                กรุณากรอกอีเมลให้ถูกต้อง
              </Text>
            )}
            {isDuplicate && (
              <Text
                style={globalStyles.text}
                className="text-red-500 text-xs mt-1"
              >
                อีเมลนี้ถูกใช้ไปแล้ว กรุณาใช้อีเมลอื่น
              </Text>
            )}

            <Text
              className="text-gray-300 text-xs mt-2"
              style={globalStyles.text}
            >
              คุณจะได้รับอีเมลแจ้งเตือนจากเรา และสามารถยกเลิกได้ภายหลัง
            </Text>
          </View>

          <NextButton onPress={handleSubmit} disabled={isNextButtonDisabled} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
