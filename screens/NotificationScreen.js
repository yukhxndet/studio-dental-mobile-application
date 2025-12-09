import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import {
  fetchNotificationsByUserId,
  markAllNotificationsAsRead,
} from "../apiService";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../styles/global";
import { Ionicons } from "@expo/vector-icons";
import QueueOfferModal from "../components/QueueOfferModal";
import { format, differenceInMinutes, differenceInSeconds } from "date-fns";
const ios = Platform.OS === "ios";

export default function NotificationScreen({ route, navigation }) {
  const userID = route.params?.userID;
  const [notifications, setNotifications] = useState([]);
  const [queueOfferModal, setQueueOfferModal] = useState({
    visible: false,
    data: null,
  });

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        if (userID) {
          await markAllNotificationsAsRead(userID);
          const response = await fetchNotificationsByUserId(userID);
          setNotifications(response.data);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadNotifications();
  }, [userID]);

  const handleNotificationPress = (notification) => {
    if (notification.metadata?.type === "queue_offer") {
      setQueueOfferModal({
        visible: true,
        data: {
          queueOfferId: notification.metadata.queueOfferId,
          offerIndex: notification.metadata.offerIndex,
          originalSlot: notification.metadata.originalSlot,
          offerSentAt:
            notification.metadata.offerSentAt || notification.createdAt,
          expiresAt:
            notification.metadata.expiresAt ||
            new Date(new Date(notification.createdAt).getTime() + 10 * 60000),
        },
      });
    }
  };

  const renderItem = ({ item }) => {
    let timeLeftText = null;
    if (item.metadata?.type === "queue_offer") {
      const now = new Date(); // ใช้ JavaScript Date object
      let expiryTime;

      if (item.metadata.expiresAt) {
        expiryTime = new Date(item.metadata.expiresAt);
      } else {
        expiryTime = new Date(new Date(item.createdAt).getTime() + 10 * 60000);
      }

      const minutesLeft = differenceInMinutes(expiryTime, now);

      const totalSecondsLeft = differenceInSeconds(expiryTime, now);
      const secondsLeft = totalSecondsLeft % 60;

      if (totalSecondsLeft > 0) {
        timeLeftText = `⏰ เหลือเวลา ${minutesLeft}:${String(
          Math.abs(secondsLeft) 
        ).padStart(2, "0")} นาที`;
      } else {
        timeLeftText = "❌ หมดเวลาแล้ว";
      }
    }

    return (
      <TouchableOpacity
        className="mb-4 rounded-xl bg-white px-4 py-3"
        style={[globalStyles.boxShadowSm]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <Text className="text-base text-sky-900" style={globalStyles.textBold}>
          {item.message}
        </Text>
        <Text
          className="text-xs text-gray-400 mt-1"
          style={globalStyles.textLight}
        >
          {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm")} น.
        </Text>

        {/* แสดง badge สำหรับ queue offer */}
        {item.metadata?.type === "queue_offer" && (
          <View className="mt-2 flex-row items-center justify-between">
            <Text
              style={globalStyles.textLight}
              className={`text-xs px-2 py-1 rounded ${
                timeLeftText?.includes("หมดเวลา")
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {timeLeftText?.includes("หมดเวลา")
                ? "❌ หมดเวลาแล้ว"
                : "⏳ เวลาว่างพิเศษ - แตะเพื่อตอบรับ"}
            </Text>
            {timeLeftText && !timeLeftText.includes("หมดเวลา") && (
              <Text
                style={globalStyles.textBold}
                className="text-xs text-amber-600"
              >
                {timeLeftText}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-4">
      <View className="flex-row items-center mb-4">
        <Ionicons name="notifications" size={24} color="#1D364A" />
        <Text
          className="ml-2 text-xl text-[#1D364A]"
          style={globalStyles.textBold}
        >
          การแจ้งเตือนของคุณ
        </Text>
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Ionicons
            name="checkmark-done-circle-outline"
            size={64}
            color="#ccc"
          />
          <Text
            style={globalStyles.text}
            className="mt-4 text-gray-400 text-base"
          >
            ไม่มีการแจ้งเตือนใหม่
          </Text>
        </View>
      )}

      <QueueOfferModal
        visible={queueOfferModal.visible}
        onClose={() => setQueueOfferModal({ visible: false, data: null })}
        queueData={queueOfferModal.data}
        userID={userID}
        onAccept={() => {
          navigation.navigate("Treatment"); // นำทางไปหน้า Treatment
        }}
      />
    </SafeAreaView>
  );
}
