import React from "react";
import { Calendar } from "react-native-calendars";

const CustomCalendar = ({
  selectedDate,
  onDayPress,
  availability = {},
  dentistColorMap = {},
}) => {
  console.log("Received Availability in Calendar:", availability); // เพิ่ม console.log เพื่อตรวจสอบ availability
  const markedDates = {};

  const disabledDates = {
    "2024-01-05": { disabled: true },
    "2024-01-15": { disabled: true },
  };

  Object.keys(availability).forEach((date) => {
    const dots = availability[date].map(({ dentistID }) => ({
      key: dentistID,
      color: dentistColorMap[dentistID] || "#FF7792",
    }));

    markedDates[date] = {
      dots: dots,
      marked: true,
    };
  });

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: "#86D6DD",
      disableTouchEvent: true,
    };
  }

  const today = new Date();
  const todayInBangkok = new Date(today.getTime() + 7 * 60 * 60 * 1000); // เพิ่ม 7 ชั่วโมง
  const formattedMinDate = todayInBangkok.toISOString().split("T")[0];

  return (
    <Calendar
      markingType={"multi-dot"}
      markedDates={markedDates}
      onDayPress={onDayPress}
      minDate={formattedMinDate}
      theme={{
        backgroundColor: "#fff",
        calendarBackground: "#fff",
        textSectionTitleColor: "#C7C7C7",
        selectedDayBackgroundColor: "#86D6DD",
        selectedDayTextColor: "#ffffff",
        todayTextColor: "#86D6DD",
        textDayFontFamily: "Kanit_400Regular",
        textDayHeaderFontFamily: "Kanit_400Regular",
        textMonthFontFamily: "Kanit_400Regular",
      }}
    />
  );
};

export default CustomCalendar;
