import { View, Text, ScrollView, Animated } from "react-native";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { globalStyles } from "../../styles/global";
import Header from "../../components/HeaderComponent";
import TimeSlots from "../../components/TimeSlotsComponent";
import CustomCalendar from "../../components/CalendarComponent";
import NextButton from "../../components/NextButtonComponent";
import {
  fetchDentistSchedule,
  fetchAppointmentsForDate,
  fetchDentistByID,
} from "../../apiService";


const processSchedules = (schedulesData, allDentistIDs) => {
  const availability = {};

  schedulesData.forEach((res, index) => {
    const dentistID = allDentistIDs[index];
    const schedule = res?.data?.[0]; 

    if (schedule && Array.isArray(schedule.workingDays)) {
      schedule.workingDays.forEach((day) => {
     
        const localDateStr = new Date(day.date).toLocaleDateString("en-CA");

        if (!availability[localDateStr]) {
          availability[localDateStr] = [];
        }

        const existingEntry = availability[localDateStr].find(
          (e) => e.dentistID === dentistID
        );
        if (!existingEntry) {
          availability[localDateStr].push({
            dentistID: dentistID,
            availableTimes: day.availableTimes,
            room: day.room,
          });
        }
      });
    }
  });

  console.log(
    "LOG: Processed Availability for Calendar (Local Time):",
    availability
  );
  return availability;
};

const calculateTotalSlots = (selectedTreatment) => {
  const maxDuration = Math.max(
    ...selectedTreatment.map((treatment) => treatment.duration)
  );
  return maxDuration / 30; 
};

const colorPalette = ["#FF7792", "#82CA9D", "#8884D8", "#F7C873", "#F9844A"];

export default function AppointmentTimeScreen() {
  const route = useRoute();
  const { originalAppointment = null } = route.params || {};
  const navigation = useNavigation();

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [originalAppointmentId, setOriginalAppointmentId] = useState(null);
  const [selectedTreatment, setSelectedTreatment] = useState([]);
  const [dentistIDs, setDentistIDs] = useState([]);
  const [userID, setUserID] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availability, setAvailability] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);
  const animation = useRef(new Animated.Value(0)).current;
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  const [dentistInfoMap, setDentistInfoMap] = useState({});

  const treatmentNames = selectedTreatment.map((t) => t.name).join(", ");

  const [timeSlots, setTimeSlots] = useState([]);

  const getDentistColorMap = (dentistIDs) => {
    const colorMap = {};
    dentistIDs.forEach((id, index) => {
      colorMap[id] = colorPalette[index % colorPalette.length];
    });
    return colorMap;
  };


  useFocusEffect(
    useCallback(() => {
      const params = route.params || {};
      setIsRescheduling(params.isRescheduling || false);
      setOriginalAppointmentId(params.originalAppointmentId || null);
      setSelectedTreatment(params.selectedTreatment || []);
      setUserID(params.userID || null);
      setDentistIDs(params.dentistIDs || []);

      setSelectedDate("");
      setSelectedTime("");
      setSelectedCard(null);
      setAvailability({});
      setDentistInfoMap({});
      setTimeSlots([]);

      return () => {
      };
    }, [route.params])
  );

  useEffect(() => {
    const loadInitialData = async () => {
      if (dentistIDs.length === 0) {
        setIsLoadingAvailability(false);
        return;
      }

      setIsLoadingAvailability(true);
      try {
        const [allSchedulesData, dentistResponses] = await Promise.all([
          Promise.all(dentistIDs.map((id) => fetchDentistSchedule(id))),
          Promise.all(dentistIDs.map((id) => fetchDentistByID(id))),
        ]);

        const initialAvailability = processSchedules(
          allSchedulesData,
          dentistIDs
        );

        const infoMap = {};
        dentistResponses.forEach((dentist, index) => {
          if (dentist && !dentist.isDeleted) {
            infoMap[dentist._id] = {
              name: dentist.name || "ไม่ทราบชื่อ",
              color: colorPalette[index % colorPalette.length],
            };
          }
        });
        setDentistInfoMap(infoMap);

        const finalAvailability = await filterAvailableDates(
          initialAvailability,
          selectedTreatment,
          dentistIDs,
          userID 
        );

        setAvailability(finalAvailability); 
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลพื้นฐาน:", error);
        setAvailability({});
        setDentistInfoMap({});
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    loadInitialData();
  }, [dentistIDs]);


  useEffect(() => {
    const loadAndGenerateSlots = async () => {
      if (!selectedDate || Object.keys(availability).length === 0) {
        setTimeSlots([]);
        return;
      }

      setIsLoadingTimeSlots(true); 
      try {
        const allAppointmentsData = await Promise.all(
          dentistIDs.map((id) => fetchAppointmentsForDate(id, selectedDate))
        );
        const appointmentsForDate = allAppointmentsData.flat();

        const allAvailableEntriesForDate = availability[selectedDate] || [];

        const availableTimes = allAvailableEntriesForDate
          .filter((entry) => dentistIDs.includes(entry.dentistID)) 
          .flatMap((entry) => entry.availableTimes); 

        const maxDuration =
          selectedTreatment.length > 0
            ? Math.max(...selectedTreatment.map((t) => t.duration))
            : 0;

        const generatedSlots = generateTimeSlots(
          availableTimes,
          maxDuration,
          appointmentsForDate,
          selectedDate,
          userID
        );
        setTimeSlots(generatedSlots);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดนัดหมายและคำนวณเวลา:", error);
        setTimeSlots([]); 
      } finally {
        setIsLoadingTimeSlots(false); 
      }
    };

    loadAndGenerateSlots();
  }, [selectedDate, availability, selectedTreatment, userID, dentistIDs]); // ✅ เพิ่ม dentistIDs ใน dependency array ด้วย

  const handleBackPress = () => {
    if (isRescheduling) {
      navigation.goBack();
    } else {
      navigation.goBack();
    }
  };


  const generateTimeSlots = (
    availableTimes = [],
    duration,
    appointments = [],
    selectedDate = "",
    currentUserID
  ) => {
    const slots = [];
    const validTimeSet = new Set(
      availableTimes
        .filter((slot) => slot.status === "1") 
        .map((slot) => slot.time)
    );
    const totalSlotsNeeded = Math.ceil(duration / 30); 

    if (totalSlotsNeeded === 0) return [];

    for (let hour = 9; hour < 20; hour++) {
      for (let minute of [0, 30]) {
        const timeStr = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;

        let isAvailable = true;
        for (let j = 0; j < totalSlotsNeeded; j++) {
          const checkDate = new Date(`${selectedDate}T${timeStr}:00`);
          checkDate.setMinutes(checkDate.getMinutes() + j * 30);
          const checkTime = checkDate.toTimeString().slice(0, 5);

          if (!validTimeSet.has(checkTime)) {
            isAvailable = false;
            break;
          }

          const slotStart = new Date(checkDate);
          const slotEnd = new Date(slotStart.getTime() + 30 * 60000);

          const hasConflict = appointments.some((appt) => {
            if (String(appt.userID) === String(currentUserID)) {
              return false;
            }
            if (appt.status === "ยกเลิก") {
              return false;
            }

            const existStart = new Date(appt.dateTime);
            const existEnd = new Date(
              existStart.getTime() + (appt.duration || 0) * 60000
            );
            return existStart < slotEnd && existEnd > slotStart; 
          });

          if (hasConflict) {
            isAvailable = false;
            break;
          }
        }

        slots.push({ time: `${timeStr} น.`, disabled: !isAvailable });
      }
    }
    return slots;
  };



  const filterAvailableDates = async (
    availability,
    selectedTreatment,
    dentistIDs,
    currentUserID
  ) => {
    const finalAvailability = {};
    const maxDuration =
      selectedTreatment.length > 0
        ? Math.max(...selectedTreatment.map((t) => t.duration))
        : 0;

    for (const [date, entries] of Object.entries(availability)) {
      try {
        const allAppointmentsData = await Promise.all(
          dentistIDs.map((id) => fetchAppointmentsForDate(id, date))
        );
        const appointmentsForDate = allAppointmentsData.flat();

        const combinedTimes = entries
          .filter((entry) => dentistIDs.includes(entry.dentistID))
          .flatMap((entry) => entry.availableTimes || []);

        const filteredSlots = generateTimeSlots(
          combinedTimes,
          maxDuration,
          appointmentsForDate,
          date,
          currentUserID
        );

        const actuallyAvailableSlots = filteredSlots.filter(
          (slot) => !slot.disabled
        );

        if (actuallyAvailableSlots.length > 0) {
          finalAvailability[date] = entries; 
        }
      } catch (error) {
        console.error(`Error checking availability for date ${date}:`, error);
      }
    }

    return finalAvailability;
  };

  const formatDateToThaiISO = (mongoDate) => {
    const date = new Date(mongoDate);
    return date.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
  };

  const dentistColorMap = getDentistColorMap(dentistIDs); 

  const handleTimeSlotPress = (time, index) => {
    const totalSlots = calculateTotalSlots(selectedTreatment); 
    const selectedTimeIndex = timeSlots.findIndex((slot) => slot.time === time);

    const availableSlots = timeSlots
      .slice(selectedTimeIndex, selectedTimeIndex + totalSlots)
      .every((slot) => !slot.disabled);

    if (availableSlots) {
      setSelectedTime(time);
      setSelectedCard(index);
    } else {
      alert("เวลาที่เลือกไม่เพียงพอสำหรับรายการรักษา");
    }
  };

  const handleNextPress = async () => {
    if (selectedTreatment.length > 0 && selectedDate && selectedTime) {
      const totalSlots = calculateTotalSlots(selectedTreatment);
      const start = new Date(
        `${selectedDate}T${selectedTime.replace(" น.", "")}:00`
      );
      const end = new Date(start.getTime() + totalSlots * 30 * 60000);

      const timeRange = {
        startTime: selectedTime.replace(" น.", ""),
        endTime: `${end.getHours().toString().padStart(2, "0")}:${end
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
      };

      const cleanedTime = selectedTime.replace(" น.", "");
      let matchedDentistID = null;
      let room = "";

      const matchingEntry = (availability[selectedDate] || []).find((entry) => {
        const isCorrectDentist = dentistIDs.includes(entry.dentistID);
        const hasTimeSlot = entry.availableTimes.some(
          (slot) => slot.time === cleanedTime
        );
        return isCorrectDentist && hasTimeSlot;
      });

      if (matchingEntry) {
        matchedDentistID = matchingEntry.dentistID;
        room = matchingEntry.room || "";
      }

      if (!matchedDentistID) {
        alert("ไม่สามารถหาข้อมูลทันตแพทย์สำหรับเวลานี้ได้ โปรดลองอีกครั้ง");
        return;
      }

      const dentistName =
        dentistInfoMap[matchedDentistID]?.name || "ไม่ทราบชื่อ";

      const treatmentWithDentistInfo = selectedTreatment.map((treatment) => ({
        ...treatment,
        dentistID: matchedDentistID,
        dentistName,
      }));

      navigation.navigate("AppointmentOverviewScreen", {
        selectedTreatment: treatmentWithDentistInfo,
        selectedDate,
        selectedTime,
        dentistIDs,
        userID,
        dentistName,
        room, 
        isRescheduling,
        originalAppointmentId,
        originalAppointment,
      });
    } else {
      alert("กรุณาเลือกวันและเวลาให้ครบถ้วนก่อนดำเนินการต่อ");
    }
  };

  const headerTitle = isRescheduling ? "เลื่อนการนัดหมาย" : "การนัดหมายใหม่";

  const isNextButtonDisabled = !selectedDate || !selectedTime;

  return (
    <View className="flex-1">
      <Header title={headerTitle} onBackPress={handleBackPress} />
      {isLoadingAvailability ? (
        <View className="flex-1 justify-center items-center bg-white">
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
          <Text
            style={globalStyles.text}
            className="mt-4 px-8 text-base text-gray-600"
          >
            กำลังค้นหาวันและทันตแพทย์ที่พร้อมให้บริการตามรายการรักษาของคุณ...
          </Text>
        </View>
      ) : (
        <ScrollView className="bg-white">
          <View>
            <View className="mt-6 px-4 flex-row">
              <MaterialCommunityIcons
                name="calendar-clock-outline"
                size={24}
                color="black"
              />
              <Text
                className="text-xl text-gray-600 ml-1"
                style={globalStyles.textBold}
              >
                วันที่และเวลา
              </Text>
            </View>
            <View className="px-4 mt-8">
              <Text className="text-sm text-gray-400" style={globalStyles.text}>
                เลือกวันที่คุณสะดวก
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-xs" style={globalStyles.textLight}>
                  วันที่มีเวลาว่างอยู่
                </Text>
              </View>
              <View className="px-4 mt-2 flex-row flex-wrap">
                {Object.keys(dentistInfoMap).map((id) => (
                  <View key={id} className="flex-row items-center mr-4 mb-2">
                    <View
                      style={{
                        backgroundColor: dentistInfoMap[id]?.color || "#ccc",
                        height: 8,
                        width: 8,
                        borderRadius: 4,
                      }}
                    />
                    <Text
                      className="ml-2 text-xs"
                      style={globalStyles.textLight}
                    >
                      {dentistInfoMap[id]?.name || "ไม่ทราบชื่อทันตแพทย์"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="px-4 mt-8">
              <View className="flex-row">
                <View>
                  <Text
                    className="text-sm text-gray-400 mr-2"
                    style={globalStyles.text}
                  >
                    รายการรักษา
                  </Text>
                </View>
                <View>
                  <Text style={globalStyles.text}>
                    {selectedTreatment.length > 0
                      ? treatmentNames
                      : "No Treatment Selected"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="px-4 mt-2">
              <CustomCalendar
                selectedDate={selectedDate}
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  setSelectedTime("");
                  setSelectedCard(null);
                }}
                availability={availability} // <--- ส่ง state availability ไปตรงๆ
                dentistColorMap={getDentistColorMap(dentistIDs)}
              />
            </View>
            <View className="px-4 mt-6">
              <Text
                className="text-xl text-gray-600 mb-2"
                style={globalStyles.textBold}
              >
                เลือกเวลาที่คุณสะดวก
              </Text>
            </View>

            {selectedTreatment.length > 0 &&
              calculateTotalSlots(selectedTreatment) > 1 && (
                <View className="px-4 mt-2">
                  <Text
                    style={globalStyles.textLight}
                    className="text-xs text-red-500"
                  >
                    * การรักษาที่คุณเลือกต้องใช้เวลาต่อเนื่อง{" "}
                    {calculateTotalSlots(selectedTreatment) * 30} นาที
                    กรุณาเลือกช่วงเวลาที่ว่างติดกัน
                  </Text>
                </View>
              )}

            {selectedDate && isLoadingTimeSlots ? (
              <Text className="px-4 text-gray-400" style={globalStyles.text}>
                กำลังตรวจสอบเวลาว่าง...
              </Text>
            ) : selectedDate ? (
              <TimeSlots
                timeSlots={timeSlots}
                selectedDate={selectedDate}
                handleTimeSlotPress={handleTimeSlotPress}
                selectedCard={selectedCard}
              />
            ) : (
              <Text className="px-4 text-gray-400" style={globalStyles.text}>
                โปรดเลือกวันที่ก่อน
              </Text>
            )}
          </View>
        </ScrollView>
      )}
      <View className="justify-end px-4 pb-8 bg-white">
        <NextButton onPress={handleNextPress} disabled={isNextButtonDisabled} />
      </View>
    </View>
  );
}
