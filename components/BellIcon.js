import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { fetchNotifications } from "../apiService";

export default function BellIcon({ userId }) {
  const [hasUnread, setHasUnread] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const res = await fetchNotifications(userId);
        const unread = res.data.some((n) => n.isRead === false);
        setHasUnread(unread);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    getNotifications();
    const interval = setInterval(getNotifications, 15000); // ตรวจสอบทุก 15 วินาที
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <TouchableOpacity onPress={() => navigation.navigate("Notification")}>
      <Ionicons name="notifications-outline" size={28} color="white" />
      {hasUnread && (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 10,
            height: 10,
            backgroundColor: "red",
            borderRadius: 5,
          }}
        />
      )}
    </TouchableOpacity>
  );
}
