import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { globalStyles } from "../../styles/global";
import { useNavigation } from "@react-navigation/native";
import ArrowBackComponent from "../../components/ArrowBackComponent";
import NextButton from "../../components/NextButtonComponent";

export default function SignUpScreenGender({ route }) {
  const navigation = useNavigation();
  const [sex, setSex] = useState("");
  const [isNextButtonDisabled, setNextButtonDisabled] = useState(true);

  const handleGenderSelection = (gender) => {
    setSex(gender);
    setNextButtonDisabled(false);
  };

  const birthDay = new Date(route.params.birthDay); // convert ISO string back to Date

  // Use 'sex' instead of 'gender' since 'gender' is not defined in this scope
  const handleSubmit = () => {
    navigation.navigate("SignUpTel", { ...route.params, gender: sex });
  };

  return (
    <TouchableWithoutFeedback
      className="bg-white"
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View className="flex-1 pt-8 bg-white">
        <ArrowBackComponent />

        <View className="form space-y-2 px-5 ">
          <Text style={globalStyles.textBold} className="text-2xl text-center">
            คุณเพศอะไร?
          </Text>
          <Text
            style={globalStyles.text}
            className="color-gray-400 text-center mb-7"
          >
            เลือกเพศของคุณ
          </Text>
          <View className="flex-row  mb-5">
            <View
              style={[globalStyles.card, globalStyles.boxShadow]}
              className="flex-col flex-1 justify-evenly mt-2"
            >
              {["เพศชาย", "เพศหญิง", "เพศอื่นๆ"].map((gender, index) => (
                <TouchableOpacity
                  key={gender}
                  onPress={() => handleGenderSelection(gender)}
                  style={{
                    borderBottomWidth: index < 2 ? 1 : 0,
                  }}
                  className="flex-row  justify-between p-3 items-start border-gray-100 "
                >
                  <Text style={globalStyles.text}>{gender}</Text>
                  <View
                    style={globalStyles.borderTextInput}
                    className="w-5 h-5 border-gray-400 rounded-full justify-center items-center"
                  >
                    {sex === gender && (
                      <View
                        style={globalStyles.bgAppColor}
                        className="w-3 h-3 rounded-full"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <NextButton onPress={handleSubmit} disabled={!sex} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
