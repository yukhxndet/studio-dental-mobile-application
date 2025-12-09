import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../styles/global";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  fetchUserData,
  fetchAppointments,
  fetchTreatmentById,
  fetchUnreadNotificationCount,
} from "../apiService";
import { formatDate, formatTime } from "../utils/dateUtils";
import { useCallback } from "react";
import Promotions from "../components/Promotion";
import News from "../components/News";
import { Animated } from "react-native";
import { useEffect, useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ios = Platform.OS == "ios";
const bottomPadding = ios ? "pb-8" : "pb-12";
const marginTop = ios ? -48 : -36;
const heightH = ios ? "h-60" : "";

export default function HomeScreen() {
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
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
  );
  const upcomingAppointment = sortedAppointments[0];
  const hasMultipleAppointments = sortedAppointments.length > 1;

  const [hasAppointments, setHasAppointments] = useState(false);
  const [treatmentNames, setTreatmentNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);


  const loadData = useCallback(async () => {
    try {
      const response = await fetchUserData();
      const user = response.data.data;
      if (!user) return;
      setUserData(user);

      const appointmentsResponse = await fetchAppointments(user._id);
      const now = new Date();
      const allAppointments = appointmentsResponse.data || [];

      const futureAppointments = allAppointments.filter(
        (appointment) =>
          ["กำลังพิจารณา", "อนุมัติแล้ว", "กำลังรอคิว"].includes(
            appointment.status
          ) && new Date(appointment.dateTime) > now
      );

      setAppointments(futureAppointments);
      setHasAppointments(futureAppointments.length > 0);

   

      const unreadRes = await fetchUnreadNotificationCount(user._id);
      setUnreadCount(unreadRes.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching data in HomeScreen: ", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (isActive) {
        loadData();
      }

      return () => {
        isActive = false;
      };
    }, [loadData])
  );

  const firstName = userData?.name ? userData.name.split(" ")[0] : "Guest";

  if (loading) {
    return (
      <View className="flex-1 justify-center bg-white items-center">
        <Animated.View
          style={{
            transform: [
              {
                scale: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                }),
              },
            ],
          }}
        >
          <MaterialCommunityIcons
            name="tooth-outline"
            size={48}
            color="#1D364A"
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView className="bg-white">
      <View
        className={`w-full ${bottomPadding} ${heightH}`}
        style={globalStyles.bgAppColor}
      >
        <SafeAreaView className="z-20 w-full">
          <View className="flex-row justify-between items-center">
            <Image
              source={require("../assets/images/logoWhite.png")}
              style={{ width: 100, height: 100 }}
            />
            <TouchableOpacity
              className="p-4"
              onPress={() =>
                navigation.navigate("Notification", {
                  userID: userData?._id,
                })
              }
            >
              <View>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={"white"}
                />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      right: 2,
                      top: 2,
                      backgroundColor: "red",
                      borderRadius: 8,
                      width: 16,
                      height: 16,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
          <Text
            className="px-4 text-xl text-white"
            style={globalStyles.textBold}
          >
            ยินดีต้อนรับ, คุณ{firstName}
          </Text>
        </SafeAreaView>
      </View>

      <View
        style={{ marginTop: marginTop }}
        className="justify-center px-4 items-center"
      >
        <View
          style={[globalStyles.cardXL, globalStyles.boxShadow]}
          className="p-5 mb-5"
        >
          <View className="flex-row">
            <Ionicons name="calendar-outline" size={24} />
            <Text
              className="ml-2 text-xl text-gray-500"
              style={globalStyles.textBold}
            >
              การนัดหมายที่กำลังจะเกิดขึ้น
            </Text>
          </View>

          {hasAppointments ? (
            <>
              <View className="mt-3">
                <Text
                  style={globalStyles.textBold}
                  className="text-xl text-sky-400"
                >
                  {formatDate(upcomingAppointment.dateTime)}
                </Text>
                <Text
                  style={globalStyles.textLight}
                  className="text-xs text-black"
                >
                  เวลา {formatTime(upcomingAppointment.dateTime)} น.
                </Text>
              </View>

              <View className="mt-3">
                <Text
                  style={globalStyles.textBold}
                  className="text-sm text-gray-400"
                >
                  รายการรักษา
                </Text>
                <Text
                  style={globalStyles.textLight}
                  className="text-xs text-black"
                >
                  {upcomingAppointment?.treatmentID?.name || "ไม่ระบุ"}
                </Text>
              </View>

              <View className="mt-3">
                <Text
                  style={globalStyles.textBold}
                  className="text-sm text-gray-400"
                >
                  ยอดชำระครั้งถัดไป
                </Text>
                <View className="flex-row items-center">
                  <Text
                    style={globalStyles.textLight}
                    className="text-xs text-black"
                  >
                    {upcomingAppointment.totalPrice} ฿
                  </Text>
                  {/* ✅ เพิ่มการแสดงว่าเป็นราคาประมาณ */}
                  {!upcomingAppointment.isPriceConfirmed && (
                    <Text
                      style={[globalStyles.textLight]}
                      className="text-xs ml-2 text-gray-400"
                    >
                      (โดยประมาณ)
                    </Text>
                  )}
                </View>
              </View>

              {hasMultipleAppointments && (
                <Text
                  style={globalStyles.textLight}
                  className="mt-4 text-xs text-red-400"
                >
                  คุณมีการนัดหมายมากกว่า 1 รายการ คลิกเพื่อดูรายละเอียดเพิ่มเติม
                </Text>
              )}

              <TouchableOpacity
                onPress={() => navigation.navigate("Treatment")}
                style={globalStyles.bgAppColor}
                className="py-3 mt-3 rounded-lg"
              >
                <Text
                  className="text-white text-center"
                  style={globalStyles.textBold}
                >
                  ดูรายละเอียด
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text
                style={globalStyles.textBold}
                className="text-xl text-sky-400"
              >
                คุณไม่มีการนัดหมาย
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Appointment")}
                style={globalStyles.bgAppColor}
                className="py-3 mt-3 rounded-lg"
              >
                <Text
                  className="text-white text-center"
                  style={globalStyles.textBold}
                >
                  เพิ่มการนัดหมาย
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View className="mt-8">
        <Promotions />
      </View>

      <View className="mt-8 mb-8">
        <News />
      </View>
    </ScrollView>
  );
}
