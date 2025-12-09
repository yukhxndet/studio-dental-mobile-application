import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import ArrowBackComponent from "../../components/ArrowBackComponent";
import { globalStyles } from "../../styles/global";
import { signupUser } from "../../apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreenProfile({ route }) {
  const navigation = useNavigation();
  const [profilePic, setProfilePic] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // สถานะการอัปโหลด

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true); // ตั้งค่าสถานะการอัปโหลดเป็น true
    const formData = new FormData();
    formData.append("name", route.params.name);
    formData.append("birthDay", route.params.birthDay);
    formData.append("gender", route.params.gender);
    formData.append("tel", route.params.tel);
    formData.append("email", route.params.email);
    formData.append("referralCode", route.params.referralCode || "");
    formData.append("password", route.params.password);
    if (profilePic) {
      formData.append("profilePic", {
        uri: profilePic,
        name: "profilePic.jpg",
        type: "image/jpeg",
      });
    }

    try {
      const response = await signupUser(formData);
      if (response.data.token) {
        await storeToken(response.data.token);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "SignUpSuccess",
              params: { name: route.params.name, profilePic },
            },
          ],
        });
      } else {
        alert("Signup failed. Please try again.");
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("The email address is already in use by another account.");
      } else {
        console.error(error);
        alert("An error occurred during sign up.");
      }
    } finally {
      setIsUploading(false); // ตั้งค่าสถานะการอัปโหลดเป็น false เมื่อเสร็จสิ้น
    }
  };

  const storeToken = async (token) => {
    try {
      await AsyncStorage.setItem("token", token);
    } catch (error) {
      console.error("Error saving the token", error);
    }
  };

  const handleSkip = async () => {
    handleSubmit(false);
  };

  return (
    <View className="flex-1 bg-white pt-8">
      <ArrowBackComponent />
      <View className="form space-y-2 px-5 ">
        <Text style={globalStyles.textBold} className="text-2xl text-center">
          เพิ่มรูปโปรไฟล์ของคุณ
        </Text>
        <Text
          style={globalStyles.text}
          className="color-gray-400 text-center mb-7"
        >
          เลือกรูปโปรไฟล์
        </Text>
        <View className=" mb-48 items-center">
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.image} />
          ) : (
            <View
              style={globalStyles.bgAppColor}
              className="w-60 h-60 rounded-full justify-center items-center"
            >
              <MaterialIcons name="person" size={200} color={"white"} />
            </View>
          )}
        </View>
      </View>
      <View className="flex-1 justify-end form space-y-2 px-5 mb-5">
        {profilePic ? (
          <TouchableOpacity
            onPress={handleSubmit}
            style={[globalStyles.bgAppColor]}
            className="py-3 rounded-lg"
            disabled={isUploading} // ปิดการใช้งานปุ่มเมื่อกำลังอัปโหลด
          >
            {isUploading ? ( // แสดงสถานะการอัปโหลด
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text
                  className="text-white text-center"
                  style={[globalStyles.textBold]}
                >
                  กำลังอัปโหลดรูปภาพ
                </Text>
              </>
            ) : (
              <Text
                className="text-white text-center"
                style={[globalStyles.textBold]}
              >
                ถัดไป
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[globalStyles.bgAppColor]}
            className="py-3 rounded-lg"
            onPress={pickImage}
          >
            <Text
              className="text-white text-center"
              style={[globalStyles.textBold]}
            >
              เพิ่มรูปโปรไฟล์
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSkip}
          style={globalStyles.borderTextInput}
          className="py-3 border-gray-200 rounded-lg"
          disabled={isUploading} // ปิดการใช้งานปุ่มข้ามขณะกำลังอัปโหลด
        >
          <Text
            className="text-black text-center"
            style={[globalStyles.textBold, isUploading && { color: "#CCCCCC" }]} // เปลี่ยนสีปุ่มเมื่อ disable
          >
            ข้าม
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  form: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 48,
  },
  textCenter: {
    textAlign: "center",
  },
  subText: {
    color: "#808080",
    textAlign: "center",
    marginBottom: 7,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 240, // Adjust as needed
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: 9999,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  button: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
  },
  buttonTextBlack: {
    color: "black",
  },
  skipButton: {
    borderColor: "#CCCCCC", // Adjust as needed
    borderWidth: 1,
  },
});
