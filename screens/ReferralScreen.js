import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import Header from "../components/HeaderComponent";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { globalStyles } from "../styles/global";
import { fetchUserData } from "../apiService";
import Toast from "react-native-toast-message";

export default function ReferralScreen() {
  const [referralCode, setReferralCode] = useState("");
  const [userName, setUserName] = useState("");
  const [referralBonus, setReferralBonus] = useState(0); // 👈 เพิ่ม state

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await fetchUserData();
        const user = response.data.data;
        setReferralCode(user.referralCode);
        setUserName(user.name);
        setReferralBonus(user.referralBonus || 0); // 👈 ดึงค่า bonus ด้วย
      } catch (error) {
        console.error("Error loading user data: ", error);
      }
    };

    getUserData();
  }, []);

  const copyToClipboard = () => {
    Clipboard.setString(referralCode);
    Toast.show({
      type: "success",
      text1: "คัดลอกโค้ดเรียบร้อยแล้ว",
      text2: "โค้ดแนะนำพร้อมใช้ แชร์ให้เพื่อนของคุณได้เลย!",
    });
  };

  const shareReferral = async () => {
    try {
      const message = `🦷 ${userName} แนะนำคลินิก Studio Dental ให้คุณ! ใช้โค้ด ${referralCode} เพื่อรับสิทธิพิเศษจากการนัดครั้งแรกเลย ✨`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถแชร์ได้");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Header title="แนะนำเพื่อน" />
      <ScrollView className="px-4 mt-4">
        <View
          style={[globalStyles.cardXL, globalStyles.boxShadow]}
          className="p-6 mb-8 items-center"
        >
          <Image
            source={require("../assets/images/refer.png")}
            style={{ width: 260, height: 300, marginBottom: 0 }}
            resizeMode="scale"
          />

          <Text className="text-xl mb-2" style={globalStyles.textBold}>
            แชร์โค้ดแนะนำของคุณ
          </Text>

          <Text
            className="text-center text-gray-500 mb-4"
            style={globalStyles.text}
          >
            แชร์โค้ดแนะนำกับเพื่อนของคุณ เพื่อรับสิทธิพิเศษในการใช้บริการ
          </Text>

          <View className="bg-gray-100 px-5 py-3 rounded-lg mb-2 w-full items-center">
            <Text
              className="text-xl text-[#1D364A]"
              style={globalStyles.textBold}
            >
              {referralCode || "-"}
            </Text>
          </View>

          {/* แสดงโบนัส */}
          <Text className="mb-4 text-gray-700" style={globalStyles.text}>
            โบนัสที่คุณได้รับจากการแนะนำ{" "}
            <Text style={globalStyles.textBold}>{referralBonus} บาท</Text>
          </Text>

          <TouchableOpacity
            onPress={copyToClipboard}
            className="bg-[#1D364A] w-full py-3 rounded-lg mb-3"
          >
            <Text
              className="text-white text-center"
              style={globalStyles.textBold}
            >
              คัดลอกโค้ด
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={shareReferral}
            className="border border-[#1D364A] w-full py-3 rounded-lg"
          >
            <Text
              className="text-[#1D364A] text-center"
              style={globalStyles.textBold}
            >
              แชร์ให้เพื่อน
            </Text>
          </TouchableOpacity>

          <View className="mt-6 w-full">
            <Text className="text-lg mb-2" style={globalStyles.textBold}>
              วิธีรับโบนัส
            </Text>
            <View className="space-y-2">
              <Text style={globalStyles.text} className="text-gray-600">
                1. แชร์โค้ดของคุณให้เพื่อน
              </Text>
              <Text style={globalStyles.text} className="text-gray-600">
                2. เพื่อนสมัครและนัดหมายครั้งแรก
              </Text>
              <Text style={globalStyles.text} className="text-gray-600">
                3. รับโบนัสเมื่อเพื่อนใช้บริการเสร็จ
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
