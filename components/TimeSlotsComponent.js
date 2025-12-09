import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { globalStyles } from "../styles/global";

const TimeSlots = ({ timeSlots, selectedDate, handleTimeSlotPress, selectedCard }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      style={{ paddingTop: 8, paddingBottom: 16 }}
    >
      {timeSlots.map((slot, index) => (
        <TouchableOpacity
          className="mb-6"
          key={index}
          onPress={() => handleTimeSlotPress(slot.time, index)}
          disabled={slot.disabled}
        >
          <View
            style={[
              {
                paddingVertical: 16,
                paddingHorizontal: 36,
                backgroundColor: slot.disabled
                  ? "#FAFAFA"
                  : selectedCard === index
                    ? "#86D6DD"
                    : "white",
                borderRadius: 8,
                marginRight: 28,
              },
              globalStyles.boxShadow,
            ]}
          >
            <Text
              style={[
                globalStyles.text,
                {
                  color: slot.disabled
                    ? "#C7C7C7"
                    : selectedCard === index
                      ? "white"
                      : "#1EBBEE",
                },
              ]}
            >
              {slot.time}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default TimeSlots;
