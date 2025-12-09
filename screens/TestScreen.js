import React, { useRef, useEffect } from "react";
import { View, Animated, ScrollView, Text } from "react-native";
import UpcomingAppointments from "../components/UpcomingAppointments";
import { globalStyles } from "../styles/global";

export default function TestScreen({ navigation }) {
  const blinkingOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkingOpacity, {
          toValue: 0.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(blinkingOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // MOCK DATA
  const mockAppointments = [
    {
      dateTime: new Date(), // วันนี้
      treatmentID: "cleaning",
      totalPrice: 800,
      dentist: { name: "หมอปุ๊กปิ๊ก" },
      room: "A1",
      status: "booked",
    },
  ];

  const mockTreatmentNames = {
    cleaning: "ขูดหินปูน + ตรวจฟัน",
  };

  const mockGlobalStyles = {
    text: { fontSize: 14 },
    textBold: { fontSize: 14, fontWeight: "bold" },
    textLight: { fontSize: 12 },
    cardXL: { backgroundColor: "#fff", borderRadius: 16 },
    boxShadow: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    bgAppColor: { backgroundColor: "#0ea5e9" },
  };

  // MOCK FUNCTIONS
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const renderDelayForRoom = (room) => {
    if (room === "A1") return 10; // ทดสอบดีเลย์ 10 นาที
    return 0;
  };

  const calculateAdjustedTime = (dateTime, delayMinutes) => {
    const adjusted = new Date(dateTime.getTime() + delayMinutes * 60000);
    return adjusted.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateTime) => {
    return dateTime.toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (dateTime) => {
    return dateTime.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStatus = (status) => {
    switch (status) {
      case "booked":
        return (
          <View>
            <Text style={{ color: "#198754" }}>ยืนยันแล้ว</Text>
          </View>
        );
      case "cancelled":
        return (
          <View>
            <Text style={{ color: "#dc3545" }}>ยกเลิก</Text>
          </View>
        );
      default:
        return (
          <View>
            <Text>ไม่ทราบสถานะ</Text>
          </View>
        );
    }
  };

  return (
    <ScrollView className="p-5 bg-gray-100">
      <UpcomingAppointments
        upcomingAppointments={mockAppointments}
        blinkingOpacity={blinkingOpacity}
        isToday={isToday}
        renderDelayForRoom={renderDelayForRoom}
        calculateAdjustedTime={calculateAdjustedTime}
        treatmentNames={mockTreatmentNames}
        navigation={navigation}
        isCancelling={false}
        openConfirmCancelModal={(app) => console.log("ยกเลิก:", app)}
        handleRescheduleAppointment={(app) => console.log("เลื่อน:", app)}
        globalStyles={mockGlobalStyles}
        formatDate={formatDate}
        formatTime={formatTime}
        renderStatus={renderStatus}
      />
    </ScrollView>
  );
}
