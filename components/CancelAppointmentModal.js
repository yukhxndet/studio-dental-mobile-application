import React from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CancelAppointmentModal({
  visible,
  onClose,
  onConfirm,
  globalStyles,
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 20,
            width: "100%",
            maxWidth: 320,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons name="close-outline" size={48} color="#d9534f" />
          <Text
            style={[
              globalStyles.textBold,
              {
                fontSize: 18,
                marginTop: 15,
                marginBottom: 10,
                textAlign: "center",
              },
            ]}
          >
            คุณต้องการยกเลิกการนัดหมายจริงหรือไม่?
          </Text>
          <Text
            style={[
              globalStyles.text,
              { textAlign: "center", marginBottom: 20 },
            ]}
          >
            หากคุณยกเลิก คุณจะต้องทำการจองใหม่ในภายหลัง
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#aaa",
                marginRight: 10,
                alignItems: "center",
              }}
            >
              <Text style={[globalStyles.text]}>ไม่ยกเลิก</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: "#d9534f",
                alignItems: "center",
              }}
            >
              <Text style={[globalStyles.textBold, { color: "white" }]}>
                ยืนยันยกเลิก
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
