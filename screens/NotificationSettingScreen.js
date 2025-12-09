import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { globalStyles } from "../styles/global";
import {
  getNotificationPreference,
  setNotificationPreference,
} from "../utils/settingUtils";
import ArrowBackComponent from "../components/ArrowBackComponent";

export default function NotificationSettingsScreen() {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    getNotificationPreference().then(setIsEnabled);
  }, []);

  const toggleSwitch = async () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    await setNotificationPreference(newValue);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white pt-8">
        <ArrowBackComponent />

        <View className="px-5 space-y-4">
          <Text style={globalStyles.textBold} className="text-2xl text-center">
            การตั้งค่าการแจ้งเตือน
          </Text>
          <Text style={globalStyles.text} className=" text-gray-400 mb-5">
            เลือกว่าจะให้เราแจ้งเตือนคุณเกี่ยวกับการนัดหมายและข่าวสารผ่านทางแอปพลิเคชันหรือไม่
            คุณสามารถเปลี่ยนแปลงการตั้งค่านี้ได้ตลอดเวลา
          </Text>

          <View className="flex-row justify-between items-center p-4 bg-neutral-50 rounded-lg border border-gray-200">
            <View className="flex-1 pr-2">
              <Text style={globalStyles.textBold} className="text-base mb-1">
                เปิดการแจ้งเตือน
              </Text>
              <Text style={globalStyles.text} className="text-sm text-gray-500">
                หากเปิดไว้ คุณจะได้รับการแจ้งเตือนเกี่ยวกับนัดหมาย การยืนยัน
                และข้อมูลสำคัญอื่น ๆ
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#ccc", true: "#1D364A" }}
              thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
