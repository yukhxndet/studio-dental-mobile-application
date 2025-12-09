import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { globalStyles } from "../styles/global";
import ArrowBackComponent from "../components/ArrowBackComponent";
import { changePassword } from "../apiService";
import Toast from "react-native-toast-message"; // import Toast
import { useNavigation } from "@react-navigation/native"; // import navigation

export default function PasswordSecurityScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigation = useNavigation(); // เรียกใช้ navigation

  const showToast = (type, text1) => {
    Toast.show({
      type: type,
      text1: text1,
      textStyle: globalStyles.text, // ใช้ฟอนต์จาก globalStyles
      position: "top",
      visibilityTime: 2000,
    });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("error", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("error", "รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      showToast("success", "เปลี่ยนรหัสผ่านสำเร็จ");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigation.navigate("Profile");
      }, 2000);
    } catch (error) {
      if (
        error.response &&
        error.response.status === 401 &&
        error.response.data.message === "Current password is incorrect"
      ) {
        showToast("error", "รหัสผ่านปัจจุบันไม่ถูกต้อง");
      } else {
        showToast("error", "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white pt-8">
        <ArrowBackComponent />

        <ScrollView className="px-5">
          <Text
            style={globalStyles.textBold}
            className="text-2xl text-center mt-1"
          >
            รหัสผ่านและความปลอดภัย
          </Text>
          <Text
            style={globalStyles.text}
            className="text-center text-gray-400 mb-6 mt-3"
          >
            เพื่อความปลอดภัย กรุณาเลือกรหัสผ่านที่คาดเดาได้ยาก
            และไม่ควรใช้ซ้ำกับบริการอื่น
          </Text>

          {/* รหัสผ่านปัจจุบัน */}
          <View className="mb-5">
            <Text style={globalStyles.textBold} className="mb-2">
              รหัสผ่านปัจจุบัน
            </Text>
            <TextInput
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="กรอกรหัสผ่านปัจจุบัน"
              placeholderTextColor="#878787"
              className="p-3 bg-neutral-50 rounded-lg"
              style={[globalStyles.text, globalStyles.borderTextInput]}
            />
          </View>

          {/* รหัสผ่านใหม่ */}
          <View className="mb-5">
            <Text style={globalStyles.textBold} className="mb-2">
              รหัสผ่านใหม่
            </Text>
            <TextInput
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="กรอกรหัสผ่านใหม่"
              placeholderTextColor="#878787"
              className="p-3 bg-neutral-50 rounded-lg"
              style={[globalStyles.text, globalStyles.borderTextInput]}
            />
          </View>

          {/* ยืนยันรหัสผ่านใหม่ */}
          <View className="mb-6">
            <Text style={globalStyles.textBold} className="mb-2">
              ยืนยันรหัสผ่านใหม่
            </Text>
            <TextInput
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              placeholderTextColor="#878787"
              className="p-3 bg-neutral-50 rounded-lg"
              style={[globalStyles.text, globalStyles.borderTextInput]}
            />
          </View>

          {/* ปุ่มบันทึก */}
          <TouchableOpacity
            onPress={handleChangePassword}
            className="py-3 rounded-lg mb-6"
            style={globalStyles.bgAppColor}
          >
            <Text
              className="text-white text-center"
              style={globalStyles.textBold}
            >
              เปลี่ยนรหัสผ่าน
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}
