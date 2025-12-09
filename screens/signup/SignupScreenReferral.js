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
import { globalStyles } from "../../styles/global";
import ArrowBackComponent from "../../components/ArrowBackComponent";
import NextButton from "../../components/NextButtonComponent";

export default function SignupScreenReferral({ route }) {
  const navigation = useNavigation();
  const { email, ...restParams } = route.params;

  const [referralCode, setReferralCode] = useState("");
  const isNextButtonDisabled = false; // สามารถข้ามได้เสมอ

  const handleNext = () => {
    navigation.navigate("SignUpPassword", {
      email,
      referralCode: referralCode.trim() || null,
      ...restParams,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white pt-8">
        <ArrowBackComponent />

        <View className="form space-y-2 px-5">
          <Text style={globalStyles.textBold} className="text-2xl text-center">
            เพื่อนแนะนำคุณมาหรือเปล่า?
          </Text>
          <Text
            style={globalStyles.text}
            className="color-gray-400 text-center mb-7"
          >
            ถ้าคุณมีรหัสแนะนำจากเพื่อน อย่าลืมใส่ที่นี่ เพื่อรับสิทธิพิเศษ!
          </Text>
          <View className="mb-5">
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 bg-neutral-50 rounded-lg mb-1"
              placeholder="รหัสแนะนำ (ถ้ามี)"
              placeholderTextColor="#878787"
              onChangeText={(text) => setReferralCode(text)}
              autoCapitalize="none"
            />
          </View>

          <NextButton onPress={handleNext} disabled={isNextButtonDisabled} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
