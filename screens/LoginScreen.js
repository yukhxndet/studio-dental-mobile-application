import {
  View,
  Text,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  BackHandler,
} from "react-native";
import React, { useState, useEffect } from "react";
import { globalStyles } from "../styles/global";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../apiService";
import messaging from "@react-native-firebase/messaging";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { googleAuth } from "../apiService";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { fetchUserData, getUserDataByToken } from "../apiService";

export default function LoginScreen({ props }) {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [])
  );
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fcmToken, setFcmToken] = useState(""); 

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "996926274418-6gu08k9s6sbmb71b871matg4m8emclni.apps.googleusercontent.com", 
      offlineAccess: true,
    });
    console.log("useEffect LoginScreen.js");

    const getFcmToken = async () => {
      try {
        const token = await messaging().getToken(); 
        console.log("FCM Token received in LoginScreen:", token);
        setFcmToken(token); 
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "เกิดข้อผิดพลาด",
          text2: "ไม่สามารถรับ FCM Token ได้",
          position: "top",
          visibilityTime: 3000,
          textStyle: globalStyles.text,
        });
      }
    };

    getFcmToken(); // Call function to fetch the FCM token
  }, []);

  const handleSubmit = async () => {
    if (!fcmToken) {
      return Toast.show({
        type: "error",
        text1: "โปรดลองใหม่",
        text2: "ระบบยังไม่ได้รับ FCM Token",
        position: "top",
        visibilityTime: 3000,
        textStyle: globalStyles.text,
      });
    }

    try {
      const response = await loginUser({
        email,
        password,
        fcmToken,
        platform: "android",
      });
      if (response.data.status === "ok") {
        const token = response.data.token;
        await AsyncStorage.setItem("token", token);

      
        const userDataResponse = await getUserDataByToken();

        navigation.reset({
          index: 0,
          routes: [
            {
              name: "WelcomeScreen",
              params: {
                user: userDataResponse.data.user || userDataResponse.data.data,
              },
            },
          ],
        });
      } else {
        Toast.show({
          type: "error",
          text1: "เกิดข้อผิดพลาด",
          text2: response.data.message || "ไม่สามารถเข้าสู่ระบบได้",
          position: "top",
          visibilityTime: 3000,
          textStyle: globalStyles.text,
        });
      }
    } catch (error) {
      const errData = error?.response?.data;
      const errMsg =
        errData?.data || errData?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";

      Toast.show({
        type: "error",
        text1: errMsg,
        position: "top",
        visibilityTime: 3000,
        textStyle: globalStyles.text,
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      const { name, email, photo } = userInfo.user || userInfo.data.user;

      try {
        const response = await googleAuth({
          name,
          email,
          photo,
          idToken,
          fcmToken,
          platform: Platform.OS,
        });

        const data = response.data;

        if (data.need_register) {
          navigation.navigate("AddProfileDetails", {
            name: data.name,
            email: data.email,
            photo: data.photo,
          });
        } else if (data.token) {
          await AsyncStorage.setItem("token", data.token);

        
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "WelcomeScreen",
                params: { user: data.user }, 
              },
            ],
          });
        } else {
          Toast.show({
            type: "error",
            text1: "เกิดข้อผิดพลาด",
            text2: "ไม่สามารถเข้าสู่ระบบได้",
            position: "top",
            visibilityTime: 3000,
            textStyle: globalStyles.text,
          });
        }
      } catch (error) {
        const errorMessage =
          error?.response?.data?.error || "ไม่สามารถเข้าสู่ระบบด้วย Google ได้";
        Toast.show({
          type: "error",
          text1: "เกิดข้อผิดพลาด",
          text2: errorMessage,
          position: "top",
          visibilityTime: 3000,
          textStyle: globalStyles.text,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "เกิดข้อผิดพลาด",
        text2: "ไม่สามารถเข้าสู่ระบบด้วย Google ได้",
        position: "top",
        visibilityTime: 3000,
        textStyle: globalStyles.text,
      });
    }
  };

  return (
    <ScrollView className=" bg-white">
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex">
          <View className="flex-row justify-center pt-44">
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: 100, height: 100 }}
            />
          </View>
        </SafeAreaView>
        <View className="form space-y-2 px-5 pt-8">
          <TextInput
            style={[globalStyles.text, globalStyles.borderTextInput]}
            className="p-3 bg-neutral-50 rounded-lg mb-1"
            placeholder="เบอร์โทรศัพท์ หรือ อีเมล"
            placeholderTextColor="#878787"
            onChange={(e) => setEmail(e.nativeEvent.text)}
            autoCorrect={false} 
            spellCheck={false} 
          />
          <TextInput
            style={[globalStyles.text, globalStyles.borderTextInput]}
            className="p-3 bg-neutral-50 rounded-lg mb-2"
            secureTextEntry
            placeholder="รหัสผ่าน"
            placeholderTextColor="#878787"
            onChange={(e) => setPassword(e.nativeEvent.text)}
          />
          <TouchableOpacity
            className="flex items-end mb-5"
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={[globalStyles.text, globalStyles.textAppColor]}>
              ลืมรหัสผ่าน?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleSubmit();
            }}
            style={[globalStyles.bgAppColor]}
            className="py-3 rounded-lg"
          >
            <Text
              className="text-white text-center"
              style={[globalStyles.textBold]}
            >
              เข้าสู่ระบบ
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center py-2">
          <Text
            style={[globalStyles.text]}
            className="z-10 absolute py-8 mt-2  bg-white px-2"
          >
            หรือ
          </Text>
          <View className="border-b border-gray-200 flex-1 mt-11 mx-6"></View>
        </View>

        <View className="form space-y-2 px-5 pt-8">
          <TouchableOpacity
            style={globalStyles.btnOutlineLogin}
            className="py-3 rounded-lg flex-row justify-center"
            onPress={handleGoogleLogin}
          >
            <Image
              className="mx-3 w-5 h-5 mb-1"
              source={require("../assets/images/google.png")}
            />
            <Text
              className="text-black text-center"
              style={[globalStyles.text]}
            >
              เข้าสู่ระบบด้วย Google
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-20 mb-5">
          <Text style={globalStyles.text} className="text-black mr-1">
            ยังไม่มีบัญชีใช่หรือไม่?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUpName")}>
            <Text style={[globalStyles.textAppColor, globalStyles.text]}>
              ลงทะเบียนใหม่
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
