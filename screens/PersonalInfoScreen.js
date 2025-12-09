import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { fetchUserData } from "../apiService"; // ปรับ path ให้ตรงกับของคุณ
import Header from "../components/HeaderComponent";
import { globalStyles } from "../styles/global";
import dayjs from "dayjs";
import "dayjs/locale/th";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale("th");

export default function PersonalInfoScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  const formatThaiDateWithAge = (birthDateStr) => {
    if (!birthDateStr) {
      return <Text>ไม่พบข้อมูล</Text>;
    }

    const birthDate = dayjs(birthDateStr);
    const now = dayjs();

    const years = now.diff(birthDate, "year");
    const months = now.diff(birthDate.add(years, "year"), "month");
    const days = now.diff(
      birthDate.add(years, "year").add(months, "month"),
      "day"
    );

    const buddhistYear = birthDate.year() + 543;
    const formattedDate = birthDate.format(`D MMMM ${buddhistYear}`);

    return (
      <Text style={globalStyles.textLight} className="text-black mt-1">
        <Text>{formattedDate} (อายุ </Text>
        <Text style={globalStyles.text}>{years}</Text>
        <Text> ปี </Text>
        <Text style={globalStyles.text}>{months}</Text>
        <Text> เดือน </Text>
        <Text style={globalStyles.text}>{days}</Text>
        <Text> วัน)</Text>
      </Text>
    );
  };

  const formatThaiDateTime = (dateStr) => {
    if (!dateStr) return "ไม่พบข้อมูล";

    const date = dayjs(dateStr);
    const buddhistYear = date.year() + 543;

    return `${date.format(`D MMMM ${buddhistYear}`)} เวลา ${date.format(
      "HH:mm"
    )}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchUserData();
        setUserData(response.data.data);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้:", error);
      }
    };

    loadData();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <Header title="ข้อมูลส่วนตัว" />
      <ScrollView className="px-4">
        <View className="items-center mt-4">
          <View
            style={[globalStyles.cardXL, globalStyles.boxShadow]}
            className="w-full p-5"
          >
            {/* รูปโปรไฟล์ */}
            <View className="items-center">
              {userData?.profilePic ? (
                <Image
                  source={{ uri: userData.profilePic }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                />
              ) : (
                <View
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: "#ccc",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    color="#1D364A"
                    name="person"
                    size={40}
                    color="#fff"
                  />
                </View>
              )}
            </View>

            {/* ชื่อ - นามสกุล */}
            <View className="mt-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-2">
                  <Ionicons color="#1D364A" name="person-circle" size={18} />
                  <Text style={globalStyles.textBold} className="text-gray-400">
                    ชื่อ - นามสกุล
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("EditProfile")}
                >
                  <MaterialIcons name="edit" size={22} color="#555" />
                </TouchableOpacity>
              </View>
              <Text style={globalStyles.textLight} className="text-black mt-1">
                {userData?.name ?? "ไม่พบข้อมูล"}
              </Text>
            </View>

            {/* เบอร์โทร */}
            <View className="mt-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-2">
                  <Ionicons color="#1D364A" name="call" size={18} />
                  <Text style={globalStyles.textBold} className="text-gray-400">
                    เบอร์โทรศัพท์
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("EditProfile")}
                >
                  <MaterialIcons name="edit" size={22} color="#555" />
                </TouchableOpacity>
              </View>
              <Text style={globalStyles.textLight} className="text-black mt-1">
                {userData?.tel ?? "ไม่พบข้อมูล"}
              </Text>
            </View>

            {/* เพศ */}
            <View className="mt-4">
              <View className="flex-row items-center space-x-2">
                <Ionicons color="#1D364A" name="male-female" size={18} />
                <Text style={globalStyles.textBold} className="text-gray-400">
                  เพศ
                </Text>
              </View>
              <Text style={globalStyles.textLight} className="text-black mt-1">
                {userData?.gender ?? "ไม่พบข้อมูล"}
              </Text>
            </View>

            {/* วันเกิด */}
            <View className="mt-4">
              <View className="flex-row items-center space-x-2">
                <Ionicons color="#1D364A" name="gift" size={18} />
                <Text style={globalStyles.textBold} className="text-gray-400">
                  วันเกิด (อายุ)
                </Text>
              </View>
              <Text style={globalStyles.textLight} className="text-black mt-1">
                {formatThaiDateWithAge(userData?.birthDay)}
              </Text>
            </View>

            {/* อีเมล */}
            <View className="mt-4">
              <View className="flex-row items-center space-x-2">
                <MaterialIcons name="email" size={18} />
                <Text style={globalStyles.textBold} className="text-gray-400">
                  อีเมล
                </Text>
              </View>
              <Text style={globalStyles.textLight} className="text-black mt-1">
                {userData?.email ?? "ไม่พบข้อมูล"}
              </Text>
            </View>

            {/* วันที่สร้างบัญชี */}
            <View className="mt-4">
              <View className="flex-row items-center space-x-2">
                <Ionicons color="#1D364A" name="calendar" size={18} />
                <Text style={globalStyles.textBold} className="text-gray-400">
                  วันที่สร้างบัญชี
                </Text>
              </View>
              <Text style={globalStyles.textLight} className="text-black mt-1">
                {formatThaiDateTime(userData?.createdAt)} น.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
