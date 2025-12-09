import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Pressable,
} from "react-native";
import { globalStyles, createBlinkingAnimation } from "../styles/global";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderComponent";
import {
  fetchUserData,
  fetchAppointments,
  fetchTreatmentById,
  fetchDelayForToday,
} from "../apiService";
import { formatDate, formatTime } from "../utils/dateUtils";
import { format } from "date-fns";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import apiService from "../apiService"; // ปรับ path ตามที่อยู่จริง
import UpcomingAppointments from "../components/UpcomingAppointments";
import TreatmentHistory from "../components/TreatmentHistory";
import CancelAppointmentModal from "../components/CancelAppointmentModal";
import ProcessingCancelModal from "../components/ProcessingCancelModal";
import { useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TreatmentScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]); // เพิ่ม state สำหรับการนัดหมายที่กำลังจะเกิดขึ้น
  const [hasAppointments, setHasAppointments] = useState(false);
  const [delayData, setDelayData] = useState([]); // เก็บดีเลย์แยกตามห้อง
  const [blinkingOpacity, setBlinkingOpacity] = useState(new Animated.Value(1));
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false); // เพิ่มสถานะ Modal
  const [isCancelling, setIsCancelling] = useState(false); // ป้องกันกดยกเลิกซ้ำ
  const [cancelMessage, setCancelMessage] = useState(""); // ข้อความแจ้งเตือน
  const [confirmCancelModalVisible, setConfirmCancelModalVisible] =
    useState(false);
  const [processingCancelModalVisible, setProcessingCancelModalVisible] =
    useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
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

  useEffect(() => {
    const checkFCMToken = async () => {
      const user = await fetchUserData();
      console.log("User FCM Token:", user.data.data.fcmToken);
    };
    checkFCMToken();
  }, []);

  const openConfirmCancelModal = (appointment) => {
    setAppointmentToCancel(appointment);
    setConfirmCancelModalVisible(true);
  };

  const onConfirmCancel = async () => {
    setConfirmCancelModalVisible(false);
    setProcessingCancelModalVisible(true);
    setIsCancelling(true);
    setCancelMessage("กำลังยกเลิกการนัดหมาย...");

    try {
      const payload = { userId: userData._id };
      const res = await apiService.post(
        `/api/appointments/cancel/${appointmentToCancel._id}`,
        payload
      );
      setUpcomingAppointments((prev) =>
        prev.filter((item) => item._id !== appointmentToCancel._id)
      );
      setCancelMessage("ยกเลิกการนัดหมายสำเร็จแล้ว");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setCancelMessage("เกิดข้อผิดพลาดในการยกเลิก โปรดลองใหม่อีกครั้ง");
    } finally {
      setIsCancelling(false);
      setTimeout(() => {
        setProcessingCancelModalVisible(false);
        setAppointmentToCancel(null);
      }, 2000);
    }
  };

  const calculateAdjustedTime = (dateTime, delayMinutes) => {
    const appointmentTime = new Date(dateTime);
    const adjustedTime = new Date(
      appointmentTime.getTime() + delayMinutes * 60000
    ); 
    return format(adjustedTime, "HH:mm น."); // แสดงผลในรูปแบบ HH:mm น.
  };

  useEffect(() => {
    const opacity = createBlinkingAnimation();
    setBlinkingOpacity(opacity);
  }, []);


  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function fetchAllData() {
        setLoading(true);
        try {
          const userResponse = await fetchUserData();
          const user = userResponse.data.data;
          if (!isActive) return;
          setUserData(user);

          const appsRes = await fetchAppointments(user._id);
          const allAppointments = appsRes.data || [];
          if (!isActive) return;

          const now = new Date();

          const futureAppointments = allAppointments
            .filter(
              (a) =>
                [
                  "กำลังพิจารณา",
                  "อนุมัติแล้ว",
                  "กำลังรอคิว",
                  "ถึงคิวแล้ว",
                ].includes(a.status) && new Date(a.dateTime) > now
            )
            .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

          const historyAppointments = allAppointments.filter(
            (a) => a.status === "เคลียร์แล้ว"
          );

          if (isActive) {
            setUpcomingAppointments(futureAppointments);
            setAppointments(historyAppointments);
            setHasAppointments(historyAppointments.length > 0);
          }
        } catch (error) {
          console.error("Error loading data in TreatmentScreen:", error);
        } finally {
          if (isActive) setLoading(false);
        }
      }

      fetchAllData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  useEffect(() => {
    async function fetchTodayDelay() {
      try {
        const res = await apiService.get("/api/delay/today");
        setDelayData(res.data.roomDelays || []);
      } catch (err) {
        setDelayData([]);
      }
    }
    fetchTodayDelay();
    const interval = setInterval(fetchTodayDelay, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const sendNotification = async (appointmentId, message, userId) => {
    try {
      const response = await axios.post(
        "http://localhost:5001/api/notifications",
        {
          appointmentId,
          message,
          userId, 
        }
      );
      console.log("Notification sent:", response.data);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleRescheduleAppointment = async (appointment) => {
    try {
      console.log("Reschedule appointment:", appointment);


      const dentistId = appointment.dentistID?._id || appointment.dentistID;
      const treatmentId =
        appointment.treatmentID?._id || appointment.treatmentID;

      if (!dentistId || !treatmentId) {
        alert("ข้อมูลการนัดหมายไม่สมบูรณ์ ไม่สามารถเลื่อนนัดได้");
        return;
      }

      const response = await apiService.get(
        `/api/appointments/reschedule/${appointment._id}`
      );
      const appointmentData = response.data.appointment;

      navigation.navigate("Appointment", {
        screen: "AppointmentTime",
        params: {
          selectedTreatment: [
            {
              _id: treatmentId,
              name: appointment.treatmentID.name,
              duration: appointment.duration,
              price: appointment.totalPrice,
            },
          ],
          dentistIDs: [dentistId],
          userID: userData._id,
          isRescheduling: true,
          originalAppointmentId: appointment._id,
          originalAppointment: appointmentData,
        },
      });
    } catch (error) {
      console.error("Error fetching appointment data for reschedule:", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล โปรดลองใหม่อีกครั้ง");
    }
  };

  const handleCancelAppointment = async (appointment) => {
    if (isCancelling) return; 

    setIsCancelling(true);
    setCancelMessage("กำลังยกเลิกการนัดหมาย...");
    setModalVisible(true);

    try {
      const payload = {
        userId: userData._id,
      };

      const res = await apiService.post(
        `/api/appointments/cancel/${appointment._id}`,
        payload
      );

      setUpcomingAppointments((prev) =>
        prev.filter((item) => item._id !== appointment._id)
      );

      setCancelMessage("ยกเลิกการนัดหมายสำเร็จแล้ว");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setCancelMessage("เกิดข้อผิดพลาดในการยกเลิก โปรดลองใหม่อีกครั้ง");
    } finally {
      setTimeout(() => {
        setModalVisible(false);
        setIsCancelling(false);
      }, 2000); 
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const response = await axios.patch(
        `http://localhost:5001/api/appointments/${appointmentId}`,
        {
          status, 
        }
      );
      console.log("Appointment status updated:", response.data);
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const renderDelayForRoom = (room) => {
    const roomDelay = delayData.find((d) => d.room === room);
    return roomDelay ? `${Math.floor(roomDelay.totalDelay)}` : "ไม่มีดีเลย์";
  };

  const isToday = (date) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const appointmentDate = new Date(date).setHours(0, 0, 0, 0);
    return today === appointmentDate;
  };

  const renderStatus = (status) => {
    switch (status) {
      case "อนุมัติแล้ว":
        return (
          <View
            style={{ backgroundColor: "#D1E7DD" }}
            className="flex-row rounded-lg items-center p-1"
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={12}
              color="#198754"
            />
            <Text
              className="ml-1"
              style={[globalStyles.text, { color: "#198754" }]}
            >
              อนุมัติแล้ว
            </Text>
          </View>
        );
      case "กำลังพิจารณา":
      case "กำลังรอคิว":
        return (
          <View
            style={{ backgroundColor: "#fff3cd" }}
            className="flex-row rounded-lg items-center p-1"
          >
            <MaterialIcons name="pending-actions" size={12} color="#856404" />
            <Text
              className="ml-1"
              style={[globalStyles.text, { color: "#856404" }]}
            >
              {status}
            </Text>
          </View>
        );
      case "ถึงคิวแล้ว":
        return (
          <View
            style={{ backgroundColor: "#f3e3ff" }}
            className="flex-row rounded-lg items-center p-1"
          >
            <Ionicons name="arrow-forward-circle" size={12} color="#9b51e0" />
            <Text
              className="ml-1"
              style={[globalStyles.text, { color: "#9b51e0" }]}
            >
              ถึงคิวแล้ว
            </Text>
          </View>
        );
      case "กำลังรักษา":
        return (
          <View
            style={{ backgroundColor: "#deebff" }}
            className="flex-row rounded-lg items-center p-1"
          >
            <MaterialIcons name="medical-services" size={12} color="#2779e2" />
            <Text
              className="ml-1"
              style={[globalStyles.text, { color: "#2779e2" }]}
            >
              กำลังรักษา
            </Text>
          </View>
        );
      case "รักษาเสร็จแล้ว":
        return (
          <View
            style={{ backgroundColor: "#d0ebff" }}
            className="flex-row rounded-lg items-center p-1"
          >
            <MaterialIcons name="done-all" size={12} color="#0088cc" />
            <Text
              className="ml-1"
              style={[globalStyles.text, { color: "#0088cc" }]}
            >
              รักษาเสร็จแล้ว
            </Text>
          </View>
        );
      case "ไม่อนุมัติ":
        return (
          <View
            style={{ backgroundColor: "#f8d7da" }}
            className="flex-row rounded-lg items-center p-1"
          >
            <MaterialIcons name="cancel" size={12} color="#721c24" />
            <Text
              className="ml-1"
              style={[globalStyles.text, { color: "#721c24" }]}
            >
              ไม่อนุมัติ
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

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
    <View className="flex-1">
      <Header title="ติดตามการรักษา" />
      <ScrollView className="bg-white">
        <View className="px-4">
          <View
            style={{ marginTop: 10 }}
            className="justify-center items-center"
          >
            <UpcomingAppointments
              upcomingAppointments={upcomingAppointments}
              blinkingOpacity={blinkingOpacity}
              isToday={isToday}
              renderDelayForRoom={renderDelayForRoom}
              calculateAdjustedTime={calculateAdjustedTime}
              navigation={navigation}
              isCancelling={isCancelling}
              openConfirmCancelModal={openConfirmCancelModal}
              handleRescheduleAppointment={handleRescheduleAppointment}
              globalStyles={globalStyles}
              formatDate={formatDate} // เพิ่ม
              formatTime={formatTime} // เพิ่ม
              renderStatus={renderStatus} // เพิ่ม
              delayData={delayData}
            />
          </View>
          <TreatmentHistory
            appointments={appointments}
            userData={userData}
            globalStyles={globalStyles}
            formatDate={formatDate}
          />
        </View>
      </ScrollView>
      <CancelAppointmentModal
        visible={confirmCancelModalVisible}
        onClose={() => setConfirmCancelModalVisible(false)}
        onConfirm={onConfirmCancel}
        globalStyles={globalStyles}
      />
      <ProcessingCancelModal
        visible={processingCancelModalVisible}
        isCancelling={isCancelling}
        cancelMessage={cancelMessage}
        onClose={() => setProcessingCancelModalVisible(false)}
        globalStyles={globalStyles}
      />
    </View>
  );
}
