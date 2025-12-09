import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { globalStyles } from "../../styles/global";
import { useNavigation } from "@react-navigation/native";
import ArrowBackComponent from "../../components/ArrowBackComponent";
import NextButton from "../../components/NextButtonComponent";
import axios from "axios"; // เพิ่ม axios สำหรับเรียก API
import apiService from "../../apiService"; // นำเข้า service ที่ใช้ baseURL

export default function SignUpScreenTel({ route }) {
  const navigation = useNavigation();
  const [tel, setTel] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  

  const isNextButtonDisabled = !tel.trim() || tel.length !== 10 || isDuplicate;

  const checkPhoneNumber = async (phone) => {
    if (phone.length !== 10) {
      setIsDuplicate(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.post("/check-phone", { tel: phone });
      setIsDuplicate(res.data.exists);
    } catch (error) {
      console.error("Error checking phone number:", error);
      setIsDuplicate(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tel.length === 10) {
        checkPhoneNumber(tel);
      } else {
        setIsDuplicate(false);
      }
    }, 500); 

    return () => clearTimeout(timeout);
  }, [tel]);

  const handleSubmit = () => {
    navigation.navigate("SignUpEmail", { ...route.params, tel });
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white pt-8">
        <ArrowBackComponent />

        <View className="form space-y-2 px-5">
          <Text style={globalStyles.textBold} className="text-2xl text-center">
            เบอร์โทรศัพท์ของคุณคืออะไร?
          </Text>
          <Text
            style={globalStyles.text}
            className="color-gray-400 text-center mb-7"
          >
            กรอกเบอร์โทรศัพท์ที่สามารถติดต่อได้
          </Text>
          <View className="mb-5">
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 bg-neutral-50 rounded-lg mb-1"
              placeholder="เบอร์โทรศัพท์"
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#878787"
              value={tel}
              onChangeText={setTel}
            />

            {isLoading && <ActivityIndicator size="small" color="#888" />}
            {isDuplicate && (
              <Text className="text-red-500 mt-1" style={globalStyles.text}>
                เบอร์โทรนี้ถูกใช้แล้ว กรุณาใช้เบอร์อื่น
              </Text>
            )}
            <Text
              className="text-gray-300 text-xs mt-2"
              style={globalStyles.text}
            >
              เจ้าหน้าที่จะได้ติดต่อคุณได้สะดวก และใช้เบอร์นี้เข้าสู่ระบบได้
            </Text>
          </View>

          <NextButton onPress={handleSubmit} disabled={isNextButtonDisabled} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
