import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback, 
  Pressable, 
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { globalStyles } from "../styles/global";
import apiService from "../apiService";

import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import moment from "moment";
import "moment/locale/th";

moment.locale("th");

export default function QueueOfferModal({
  visible,
  onClose,
  queueData,
  userID,
  onAccept,
}) {
  const navigation = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [isExpired, setIsExpired] = useState(false);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const showToast = (type, text1, text2) => {
    Toast.show({
      type,
      text1,
      text2,
      position: "bottom",
      visibilityTime: 4000,
    });
  };

  const handleBackdropPress = () => {
    if (isProcessing) return; 
    onClose(); 
  };

  useEffect(() => {
    if (!visible || !queueData) return;

    let remaining = 600; 

    if (queueData.expiresAt) {
      const now = moment();
      const expiryTime = moment(queueData.expiresAt);
      remaining = Math.max(expiryTime.diff(now, "seconds"), 0);
    } else if (queueData.offerSentAt) {
      const sentAt = moment(queueData.offerSentAt);
      const now = moment();
      const elapsed = now.diff(sentAt, "seconds");
      remaining = Math.max(600 - elapsed, 0);
    }

    setCountdown(remaining);

    if (remaining <= 0) {
      setIsExpired(true);
      showToast(
        "error",
        "หมดเวลาแล้ว",
        "ข้อเสนอนี้หมดอายุแล้ว กรุณารอข้อเสนอถัดไป"
      );
      setTimeout(() => {
        onClose();
      }, 2000);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          showToast(
            "error",
            "หมดเวลาแล้ว",
            "ข้อเสนอนี้หมดอายุแล้ว กรุณารอข้อเสนอถัดไป"
          );
          setTimeout(() => {
            onClose();
          }, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, queueData]);

  const handleAccept = async () => {
    if (isExpired) {
      showToast("error", "หมดเวลาแล้ว", "ไม่สามารถรับคิวนี้ได้แล้ว");
      return;
    }

    setIsProcessing(true);
    try {
      await apiService.post(
        `/api/queue-offers/${queueData.queueOfferId}/respond`,
        {
          offerIndex: queueData.offerIndex,
          action: "accept",
          userID: userID,
        }
      );

      showToast(
        "success",
        "ยอมรับคิวสำเร็จ",
        "ระบบได้ล็อกเวลานัดไว้ชั่วคราว กรุณายืนยันภายใน 5 นาที"
      );
      handleConfirmMove();
    } catch (error) {
      showToast(
        "error",
        "เกิดข้อผิดพลาด",
        error.response?.data?.message || "ไม่สามารถรับคิวได้"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmMove = async () => {
    try {
      await apiService.post(
        `/api/queue-offers/${queueData.queueOfferId}/confirm-move`,
        {
          offerIndex: queueData.offerIndex,
          userID: userID,
        }
      );

      showToast("success", "ย้ายคิวสำเร็จ", "เวลานัดของคุณได้รับการอัปเดตแล้ว");
      onAccept();
      onClose();
    } catch (error) {
      showToast("error", "เกิดข้อผิดพลาด", "ไม่สามารถย้ายคิวได้");
    }
  };

  const handleDecline = async () => {
    if (isExpired) {
      onClose();
      return;
    }

    try {
      await apiService.post(
        `/api/queue-offers/${queueData.queueOfferId}/respond`,
        {
          offerIndex: queueData.offerIndex,
          action: "decline",
          userID: userID,
        }
      );
      onClose();
    } catch (error) {
      console.error("Error declining offer:", error);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleBackdropPress} // ✅ เพิ่มนี้สำหรับ Android back button
    >
      {/* ✅ Backdrop ที่สามารถแตะได้ */}
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View className="flex-1 justify-center items-center bg-black/50">
          {/* ✅ ป้องกันการปิด modal เมื่อแตะที่ content */}
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View>
              {!queueData || !queueData.originalSlot ? (
                <View className="bg-white p-6 rounded-xl">
                  <Text style={globalStyles.text}>กำลังโหลดข้อมูลคิว...</Text>
                </View>
              ) : (
                <View
                  className="bg-white m-4 p-6 rounded-2xl"
                  style={globalStyles.boxShadow}
                >
                  {/* ✅ แสดง icon ตามสถานะ */}
                  <View className="items-center mb-4">
                    <MaterialIcons
                      name={isExpired ? "timer-off" : "schedule"}
                      size={48}
                      color={isExpired ? "#EF4444" : "#4CAF50"}
                    />
                    <Text
                      className="text-xl mt-2"
                      style={globalStyles.textBold}
                    >
                      {isExpired ? "⏰ หมดเวลาแล้ว" : "🎯 เวลาว่างพิเศษ!"}
                    </Text>
                  </View>

                  {/* ✅ แสดงข้อความตามสถานะ */}
                  {isExpired ? (
                    <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <Text
                        className="text-center text-red-600"
                        style={globalStyles.textBold}
                      >
                        ❌ ข้อเสนอนี้หมดอายุแล้ว
                      </Text>
                      <Text
                        className="text-center text-red-500 text-sm mt-1"
                        style={globalStyles.text}
                      >
                        กรุณารอข้อเสนอถัดไป
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text
                        className="text-center mb-4"
                        style={globalStyles.text}
                      >
                        {queueData?.originalSlot?.time &&
                          `มีเวลาว่างตอน ${queueData.originalSlot.time} น.\n`}
                        {queueData?.originalSlot?.date && (
                          <Text style={globalStyles.text}>
                            วันที่{" "}
                            {moment(queueData.originalSlot.date).format(
                              "D MMMM YYYY"
                            )}
                          </Text>
                        )}
                        {"\n"}คุณต้องการขยับเวลานัดให้เร็วขึ้นหรือไม่?
                      </Text>

                      {/* ✅ Countdown Timer */}
                      <View
                        className={`rounded-lg p-3 mb-4 ${
                          countdown <= 60
                            ? "bg-red-50 border border-red-200"
                            : "bg-amber-50 border border-amber-200"
                        }`}
                      >
                        <Text
                          className={`text-center text-sm ${
                            countdown <= 60 ? "text-red-600" : "text-amber-700"
                          }`}
                          style={globalStyles.textBold}
                        >
                          ⏰ เหลือเวลา {formatTime(countdown)} นาที
                        </Text>
                      </View>
                    </>
                  )}

                  {/* ✅ ปุ่มต่างๆ */}
                  <View className="flex-row space-x-3">
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-lg ${
                        isExpired ? "bg-gray-300" : "bg-gray-400"
                      }`}
                      onPress={handleDecline}
                      disabled={isProcessing}
                    >
                      <Text
                        className="text-white text-center"
                        style={globalStyles.textBold}
                      >
                        {isExpired ? "ปิด" : "ไม่เอา"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-lg ${
                        isExpired || isProcessing
                          ? "bg-gray-300"
                          : "bg-green-500"
                      }`}
                      onPress={handleAccept}
                      disabled={isProcessing || isExpired}
                    >
                      <Text
                        className={`text-center ${
                          isExpired ? "text-gray-500" : "text-white"
                        }`}
                        style={globalStyles.textBold}
                      >
                        {isExpired
                          ? "หมดเวลาแล้ว"
                          : isProcessing
                          ? "กำลังดำเนินการ..."
                          : "รับคิว! 🚀"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
