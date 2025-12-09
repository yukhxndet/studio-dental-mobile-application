import React from "react";
import { View, Text, Pressable, Modal } from "react-native";

export default function ProcessingCancelModal({
  visible,
  isCancelling,
  cancelMessage,
  onClose,
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
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 12,
            width: 280,
            alignItems: "center",
          }}
        >
          <Text
            style={globalStyles.textBold}
            className="text-center text-lg mb-2"
          >
            {cancelMessage}
          </Text>
          {isCancelling && (
            <Text
              style={globalStyles.textLight}
              className="text-sm text-gray-500 mt-2"
            >
              กรุณารอสักครู่...
            </Text>
          )}
          {!isCancelling && (
            <Pressable
              onPress={onClose}
              style={{
                marginTop: 12,
                paddingVertical: 8,
                paddingHorizontal: 24,
                backgroundColor: "#1D364A",
                borderRadius: 8,
              }}
            >
              <Text style={globalStyles.text} className="text-white">
                ปิด
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
