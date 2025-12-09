import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { globalStyles } from "../styles/global";
import { resetPassword } from "../apiService";
import ArrowBackComponent from "../components/ArrowBackComponent";
import NextButton from "../components/NextButtonComponent";

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
    });
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      showToast(
        "error",
        "รหัสผ่านสั้นเกินไป",
        "กรุณาตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "รหัสผ่านไม่ตรงกัน", "กรุณายืนยันรหัสผ่านให้ตรงกัน");
      return;
    }

    try {
      const response = await resetPassword(email, newPassword);
      if (response.status === "ok") {
        showToast("success", "สำเร็จ", "ตั้งรหัสผ่านใหม่เรียบร้อย");
        setTimeout(() => navigation.navigate("Login"), 1500);
      } else {
        showToast(
          "error",
          "เกิดข้อผิดพลาด",
          response.message || "ไม่สามารถตั้งรหัสผ่านใหม่ได้"
        );
      }
    } catch (error) {
      console.error(error);
      showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถตั้งรหัสผ่านใหม่ได้");
    }
  };

  const isFormValid =
    newPassword.length >= 6 &&
    confirmPassword.length >= 6 &&
    newPassword === confirmPassword;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white pt-8">
        <ArrowBackComponent />

        <View className="form space-y-2 px-5">
          <Text style={globalStyles.textBold} className="text-2xl text-center">
            ตั้งรหัสผ่านใหม่
          </Text>
          <Text
            style={globalStyles.text}
            className="text-center color-gray-400 mb-7"
          >
            กรุณากำหนดรหัสผ่านใหม่ของคุณเพื่อใช้ในการเข้าสู่ระบบ
          </Text>

          <TextInput
            style={[globalStyles.text, globalStyles.borderTextInput]}
            className="p-3 bg-neutral-50 rounded-lg mb-1"
            placeholder="รหัสผ่านใหม่"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholderTextColor="#878787"
          />

          <TextInput
            style={[globalStyles.text, globalStyles.borderTextInput]}
            className="p-3 bg-neutral-50 rounded-lg"
            placeholder="ยืนยันรหัสผ่านใหม่"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#878787"
          />

          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <Text
              style={globalStyles.text}
              className="text-right text-xs text-red-400"
            >
              รหัสผ่านไม่ตรงกัน
            </Text>
          )}

          <NextButton onPress={handleResetPassword} disabled={!isFormValid} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
