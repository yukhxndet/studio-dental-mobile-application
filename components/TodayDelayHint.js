import React from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// ฟังก์ชันช่วย
const STATUS_WATCH_DELAY = [
  "อนุมัติแล้ว",
  "ถึงคิวแล้ว",
  "กำลังรอคิว",
  "กำลังรักษา",
  "รักษาเสร็จแล้ว",
];

export default function TodayDelayHint({
  appointment,
  delayData,
  blinkingOpacity,
  calculateAdjustedTime,
  globalStyles,
}) {
  if (
    !appointment ||
    !STATUS_WATCH_DELAY.includes(appointment.status) ||
    // เช็ค date วันนี้
    !(
      new Date(appointment.dateTime).toDateString() ===
      new Date().toDateString()
    )
  ) {
    console.log("FAIL: Date or Status Check");
    return null;
  }

  // หา delay ของห้อง
  const roomDelayObj = delayData.find(
    (record) => record.room === appointment.room
  );
  const delayMinutes = roomDelayObj?.totalNetDelay 
    ? Math.round(roomDelayObj.totalNetDelay)
    : 0;

  console.log("Delay Data Received:", delayData);
  console.log(
    `Delay Minutes calculated for room ${appointment.room}: ${delayMinutes}`
  );
  if (delayMinutes === 0) return null;

  return (
    <View className="mt-3 space-y-1">
      <Animated.View
        style={{
          backgroundColor: "#fff3cd",
          opacity: blinkingOpacity,
        }}
        className="flex-row rounded-lg items-center p-2"
      >
        <Text
          className="ml-2 flex-1 text-center"
          style={[globalStyles.text, { color: "#856404" }]}
        >
          ตอนนี้ห้อง {appointment.room} มีดีเลย์ประมาณ{" "}
          <Text style={globalStyles.textBold}>{delayMinutes} นาที</Text>
        </Text>
      </Animated.View>
      <View className="flex-row items-center">
        <Text
          className="ml-1 text-xs text-gray-500"
          style={globalStyles.textLight}
        >
          แนะนำให้มาที่คลินิกเวลาประมาณ{" "}
          <Text style={globalStyles.textBold}>
            {calculateAdjustedTime(appointment.dateTime, delayMinutes)}
          </Text>{" "}
          จะได้ไม่ต้องรอนานค่ะ
        </Text>
      </View>
    </View>
  );
}
