import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  Platform,
  StyleSheet,
} from "react-native";
import React from "react";
import { globalStyles } from "../../styles/global";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import ArrowBackComponent from "../../components/ArrowBackComponent";
import NextButton from "../../components/NextButtonComponent";

export default function SignUpScreenAge({ route }) {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [dateOfBirth, setDateOfBirth] = useState("");
  console.log("dateOfBirth:", dateOfBirth);

  const [showPicker, setShowPicker] = useState(false);
  const [isNextButtonDisabled, setNextButtonDisabled] = useState(true);
  const toggleDatePicker = () => {
    setShowPicker(!showPicker);
  };
  const onChange = ({ type }, selectedDate) => {
    if (type == "set") {
      const currentDate = selectedDate;
      setDate(currentDate);

      if (Platform.OS === "android") {
        toggleDatePicker();
        const formattedDate = `${currentDate.toLocaleString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`;
        const age = calculateAge(currentDate);
        setDateOfBirth(`${formattedDate} (${age} ปี)`);
        setNextButtonDisabled(false); // ✅ เพิ่มบรรทัดนี้
      }
    } else {
      toggleDatePicker();
    }
  };

  const confirmIOSDate = () => {
    const formattedDate = `${date.toLocaleString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
    const age = calculateAge(date);
    setDateOfBirth(`${formattedDate} (${age} ปี)`);
    toggleDatePicker();
    setNextButtonDisabled(false);
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    const ageInMilliseconds = today - birthDate;
    const ageDate = new Date(ageInMilliseconds);
    const calculatedAge = ageDate.getUTCFullYear() - 1970;
    return calculatedAge;
  };

  const handleSubmit = () => {
    const isoDate = date.toISOString();
    navigation.navigate("SignUpGender", { ...route.params, birthDay: isoDate });
  };

  // Adjusted the NextButton's onPress to handleSubmit

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
            วันเกิดของคุณวันที่เท่าไหร่?
          </Text>
          <Text
            style={globalStyles.text}
            className="color-gray-400 text-center mb-7"
          >
            เลือกวันที่คุณเกิด
          </Text>
          <View className="mb-5">
            {!showPicker && (
              <Pressable onPress={toggleDatePicker}>
                <TextInput
                  style={[globalStyles.text, globalStyles.borderTextInput]}
                  className="p-3 bg-neutral-50 rounded-lg mb-1"
                  placeholder="วันเกิด"
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholderTextColor="#878787"
                  editable={false}
                  onPressIn={toggleDatePicker}
                />
              </Pressable>
            )}
            {showPicker && (
              <DateTimePicker
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"} // ✅ แก้ตรงนี้
                value={date}
                onChange={onChange}
                style={styles.datePicker}
                maximumDate={new Date()}
                minimumDate={new Date(1924, 0, 1)}
              />
            )}

            {showPicker && Platform.OS === "ios" && (
              <View className="flex-row justify-around my-2">
                <TouchableOpacity onPress={toggleDatePicker}>
                  <Text className="text-gray-400" style={globalStyles.text}>
                    ยกเลิก
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmIOSDate}>
                  <Text style={[globalStyles.text, globalStyles.textAppColor]}>
                    ยืนยัน
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <NextButton onPress={handleSubmit} disabled={isNextButtonDisabled} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  datePicker: {
    height: 200,
    marginTop: -10,
  },
});
