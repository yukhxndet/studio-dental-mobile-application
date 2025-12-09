import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { globalStyles } from "../styles/global";
import { fetchUserData, updateUserProfile } from "../apiService";
import { useNavigation } from "@react-navigation/native";
import ArrowBackComponent from "../components/ArrowBackComponent";
import NextButton from "../components/NextButtonComponent";
import Toast from "react-native-toast-message";

export default function EditProfileScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tel, setTel] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetchUserData();
        const user = res.data.data;

        const [first = "", last = ""] = (user.name || "").split(" ");
        setFirstName(first);
        setLastName(last);
        setTel(user.tel || "");
      } catch (error) {
        console.log("Error loading user data:", error);
      }
    };
    getData();
  }, []);

  const handleSave = async () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      await updateUserProfile({ name: fullName, tel });

      Toast.show({
        type: "success",
        text1: "บันทึกสำเร็จ",
        text2: "ข้อมูลของคุณถูกอัปเดตเรียบร้อยแล้ว",
      });

      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "เกิดข้อผิดพลาด",
        text2: "ไม่สามารถบันทึกข้อมูลได้ โปรดลองใหม่",
      });
    }
  };

  const isButtonDisabled = !firstName.trim() || !lastName.trim() || !tel.trim();

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white pt-8">
        <ArrowBackComponent />

        <View className="form space-y-2 px-5">
          <Text style={globalStyles.textBold} className="text-2xl text-center">
            แก้ไขข้อมูลส่วนตัว
          </Text>
          <Text
            style={globalStyles.text}
            className="text-center mb-7 text-gray-400"
          >
            อัปเดตชื่อและเบอร์โทรศัพท์ของคุณ
          </Text>

          {/* ชื่อ - นามสกุล */}
          <View className="flex-row gap-x-5 mb-5">
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 flex-1 bg-neutral-50 rounded-lg mb-1"
              placeholder="ชื่อ"
              placeholderTextColor="#878787"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 flex-1 bg-neutral-50 rounded-lg mb-1"
              placeholder="นามสกุล"
              placeholderTextColor="#878787"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* เบอร์โทร */}
          <View className="mb-5">
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 bg-neutral-50 rounded-lg mb-1"
              placeholder="เบอร์โทรศัพท์"
              placeholderTextColor="#878787"
              keyboardType="numeric"
              maxLength={10}
              value={tel}
              onChangeText={setTel}
            />
            <Text
              className="text-gray-300 text-xs mt-2"
              style={globalStyles.text}
            >
              คุณจะได้รับ SMS การแจ้งเตือนจากเราและสามารถเลือกไม่รับได้ตลอดเวลา
            </Text>
          </View>

          {/* ปุ่มบันทึก */}
          <NextButton
            title="บันทึก"
            onPress={handleSave}
            disabled={isButtonDisabled}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
