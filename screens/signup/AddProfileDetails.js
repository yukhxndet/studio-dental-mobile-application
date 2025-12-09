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
  Image,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { globalStyles } from "../../styles/global";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ArrowBackComponent from "../../components/ArrowBackComponent";
import NextButton from "../../components/NextButtonComponent";
import { checkUserExists, createUser } from "../../apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import apiService from "../../apiService";
import { ActivityIndicator } from "react-native";

export default function AddProfileDetails({ route }) {
  const navigation = useNavigation();
  const { name, email, photo } = route.params || {};
  console.log("Received photo URL:", photo);

  const [birthDate, setBirthDate] = useState(new Date());
  const [birthDateLabel, setBirthDateLabel] = useState("");
  const [gender, setGender] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [tel, setTel] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showPicker, setShowPicker] = useState(false);

  const toggleDatePicker = () => setShowPicker(!showPicker);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tel.length === 10) {
        checkPhoneNumber(tel);
      } else {
        setIsDuplicate(false);
      }
    }, 500); // รอ 0.5 วิหลังพิมพ์

    return () => clearTimeout(timeout);
  }, [tel]);

  const onDateChange = ({ type }, selectedDate) => {
    if (type === "set") {
      const currentDate = selectedDate;
      setBirthDate(currentDate);

      if (Platform.OS === "android") {
        toggleDatePicker();
        updateDateLabel(currentDate);
      }
    } else {
      toggleDatePicker();
    }
  };

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
  const updateDateLabel = (date) => {
    const formatted = date.toLocaleString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const age = calculateAge(date);
    setBirthDateLabel(`${formatted} (${age} ปี)`);
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const ageInMilliseconds = today - birthdate;
    const ageDate = new Date(ageInMilliseconds);
    return ageDate.getUTCFullYear() - 1970;
  };

  const confirmIOSDate = () => {
    updateDateLabel(birthDate);
    toggleDatePicker();
  };

  const isFormValid =
    birthDateLabel && gender && tel.trim().length === 10 && !isDuplicate;

  const handleSubmit = async () => {
    const userData = {
      name,
      email,
      photo,
      birthDay: birthDate.toISOString(),
      gender,
      tel,
      signupMethod: "google", // เพิ่มบอกว่าเป็นการสมัครด้วย Google
      password: "", // ส่งว่างไว้เพื่อไม่ให้ backend พัง
      referralCode: referralCode.trim() || null, // เพิ่มบรรทัดนี้
    };

    console.log("Final user data to save:", userData);

    try {
      const response = await createUser(userData);

      if (response.status === 200 || response.status === 201) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

        console.log("User created:", response.data);
        navigation.navigate("SignUpSuccess", {
          name: name,
          profilePic: photo,
        });
      } else {
        console.error("Unexpected response:", response);
        Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถสร้างบัญชีได้");
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };
  return (
    <ScrollView className=" bg-white">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-white pt-8 mb-4">
          <ArrowBackComponent />
          <View className="items-center mt-4">
            {photo ? (
              <Image
                source={{ uri: photo }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
                resizeMode="cover"
              />
            ) : (
              <Text>ไม่พบรูปภาพ</Text>
            )}

            <Text style={globalStyles.textBold} className="text-lg">
              ชื่อ: {name}
            </Text>
            <Text style={globalStyles.text} className="text-lg mb-4">
              อีเมล: {email}
            </Text>
            <Text
              style={globalStyles.text}
              className="text-sm text-gray-500 mb-2 px-6 text-center"
            >
              เราขอข้อมูลเพิ่มเติมเพื่อให้สามารถจัดการนัดหมายและดูแลคุณได้อย่างเหมาะสม
            </Text>
          </View>
          <View className="form space-y-2 px-5">
            {/* วันเกิด */}
            <Text
              style={globalStyles.textBold}
              className="text-2xl text-center"
            >
              เพิ่มข้อมูลโปรไฟล์
            </Text>

            {/* วันเกิด */}
            <Text style={globalStyles.text} className="text-base mb-1 mt-5">
              วันเกิด
            </Text>
            {!showPicker && (
              <Pressable onPress={toggleDatePicker}>
                <TextInput
                  style={[globalStyles.text, globalStyles.borderTextInput]}
                  className="p-3 bg-neutral-50 rounded-lg mb-1"
                  placeholder="วันเกิด"
                  value={birthDateLabel}
                  editable={false}
                  placeholderTextColor="#878787"
                />
              </Pressable>
            )}
            {showPicker && (
              <DateTimePicker
                mode="date"
                display="spinner"
                value={birthDate}
                onChange={onDateChange}
                style={styles.datePicker}
                maximumDate={new Date()}
                minimumDate={new Date(1924, 0, 1)}
              />
            )}
            {showPicker && Platform.OS === "ios" && (
              <View className="flex-row justify-around my-2">
                <TouchableOpacity onPress={toggleDatePicker}>
                  <Text style={globalStyles.text} className="text-gray-400">
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

            {/* เพศ */}
            <Text style={globalStyles.text} className="text-base mt-4 mb-1">
              เพศ
            </Text>
            <View
              style={[globalStyles.card, globalStyles.boxShadow]}
              className="mb-4"
            >
              {["เพศชาย", "เพศหญิง", "เพศอื่นๆ"].map((g, i) => (
                <View
                  key={g}
                  className="flex-row justify-between p-3 items-center border-gray-100"
                  style={{ borderBottomWidth: i < 2 ? 1 : 0 }}
                >
                  <Text style={globalStyles.text}>{g}</Text>
                  <TouchableOpacity
                    onPress={() => setGender(g)}
                    className="w-5 h-5 border-gray-400 rounded-full justify-center items-center"
                    style={globalStyles.borderTextInput}
                  >
                    {gender === g && (
                      <View
                        className="w-3 h-3 rounded-full"
                        style={globalStyles.bgAppColor}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* เบอร์โทร */}
            <Text style={globalStyles.text} className="text-base mb-1">
              เบอร์โทรศัพท์
            </Text>
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 bg-neutral-50 rounded-lg mb-1"
              placeholder="เบอร์โทรศัพท์"
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#878787"
              onChangeText={(text) => setTel(text)}
            />
            {isLoading && <ActivityIndicator size="small" color="#888" />}
            {isDuplicate && (
              <Text
                className="text-red-500 text-xs mt-1"
                style={globalStyles.text}
              >
                เบอร์โทรนี้ถูกใช้แล้ว กรุณาใช้เบอร์อื่น
              </Text>
            )}
            <Text
              className="text-gray-300 text-xs mt-2"
              style={globalStyles.text}
            >
              เจ้าหน้าที่จะได้ติดต่อคุณได้สะดวก และใช้เบอร์นี้เข้าสู่ระบบได้
            </Text>

            <Text style={globalStyles.text} className="text-base mt-4 mb-1">
              รหัสแนะนำเพื่อน (ถ้ามี)
            </Text>
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 bg-neutral-50 rounded-lg mb-1"
              placeholder="เช่น ABC123"
              placeholderTextColor="#878787"
              value={referralCode}
              onChangeText={setReferralCode}
            />
            <Text
              className="text-gray-400 text-sm mb-2"
              style={globalStyles.textLight}
            >
              กรอกรหัสของเพื่อนเพื่อรับสิทธิพิเศษ หรือส่งต่อความสุขให้กัน 🎁
            </Text>

            {/* ปุ่มถัดไป */}
            <NextButton onPress={handleSubmit} disabled={!isFormValid} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  datePicker: {
    height: 200,
    marginTop: -10,
  },
});
