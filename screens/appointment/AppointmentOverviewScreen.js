import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import React, { useState, useEffect } from "react";
import { globalStyles } from "../../styles/global";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Header from "../../components/HeaderComponent";
import NextButton from "../../components/NextButtonComponent";
import { createAppointment } from "../../apiService";
import formatDateToThai from "../../utils/formatDateToThai";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { fetchDentistByID, fetchDentistScheduleByID } from "../../apiService"; // ฟังก์ชันสำหรับดึงข้อมูล
import apiService from "../../apiService";

export default function AppointmentOverviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    selectedTreatment,
    selectedDate,
    selectedTime,
    userID,
    isRescheduling = false,
    originalAppointmentId = null,
    originalAppointment = null,
  } = route.params || {};

  const [dentistName, setDentistName] = useState("ไม่ทราบชื่อทันตแพทย์");

  const [room, setRoom] = useState("ไม่พบข้อมูลห้อง");

  useEffect(() => {
    if (
      selectedTreatment &&
      selectedTreatment.length > 0 &&
      selectedTreatment[0]?.dentistID
    ) {
      const dentistID = selectedTreatment[0].dentistID;

      fetchDentistByID(dentistID)
        .then((response) => {
          console.log("Full dentist response:", response);
          const dentist = response;
          if (dentist && dentist.name) {
            setDentistName(dentist.name);
          } else {
            console.warn("ไม่พบชื่อทันตแพทย์ใน response");
            setDentistName("ไม่ทราบชื่อทันตแพทย์");
          }
        })
        .catch((error) => console.error("Error fetching dentist:", error));

      if (selectedDate) {
        console.log(`[Overview] Received selectedDate: ${selectedDate}`);

        fetchDentistScheduleByID(dentistID)
          .then((response) => {
            const schedules = response.data?.[0]?.workingDays;
            if (Array.isArray(schedules)) {
              const selectedDay = schedules.find((day) => {
              
                const localDateFromDB = new Date(day.date).toLocaleDateString(
                  "en-CA"
                );

              
                return localDateFromDB === selectedDate;
              });

              if (selectedDay) {
                setRoom(selectedDay.room);
                console.log(
                  `[Overview] ✅ Found schedule for local date ${selectedDate}, Room: ${selectedDay.room}`
                );
              } else {
                setRoom("ไม่พบข้อมูลห้องสำหรับวันที่เลือก");
                console.error(
                  `[Overview] ❌ Could not find schedule for local date: ${selectedDate}`
                );
                const availableLocalDates = schedules.map((d) =>
                  new Date(d.date).toLocaleDateString("en-CA")
                );
                console.log(
                  "[Overview] Available local dates in DB:",
                  availableLocalDates
                );
              }
            } else {
              setRoom("ไม่พบข้อมูล workingDays");
            }
          })
          .catch((error) =>
            console.error("Error fetching dentist schedule:", error)
          );
      }
    } else {
      console.warn("ไม่พบ dentistID ใน selectedTreatment[0]");
    }
  }, [selectedTreatment, selectedDate]);

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckBoxPress = () => {
    setIsChecked((prev) => !prev);
  };

  const totalPrice = Array.isArray(selectedTreatment)
    ? selectedTreatment.reduce((sum, treatment) => {
        return sum + (treatment.price || 0);
      }, 0)
    : 0;

  const handleNextPress = async () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !userID ||
      !selectedTreatment ||
      selectedTreatment.length === 0
    ) {
      console.error("Missing required parameters for creating appointment.");
      return;
    }

    const cleanedTime = selectedTime.replace(/[^0-9:]/g, "");
    const localDate = new Date(`${selectedDate}T${cleanedTime}:00`);
    const dateTime = localDate;
    const dentistID = selectedTreatment[0].dentistID;
    const duration = Array.isArray(selectedTreatment)
      ? selectedTreatment.reduce(
          (sum, treatment) => sum + (treatment.duration || 0),
          0
        )
      : 0;
    const totalPrice = Array.isArray(selectedTreatment)
      ? selectedTreatment.reduce(
          (sum, treatment) => sum + (treatment.price || 0),
          0
        )
      : 0;
    const appointmentData = {
      userID,
      treatmentID: selectedTreatment.map((treatment) => treatment._id),
      dentistID,
      room,
      dateTime,
      totalPrice,
      duration,
    };

    try {
      if (isRescheduling && originalAppointmentId) {
        const payload = {
          userId: userID,
          newDateTime: dateTime.toISOString(),
          newDentistID: dentistID,
          newRoom: room,
        };

        const response = await apiService.put(
          `/api/appointments/reschedule/${originalAppointmentId}`,
          payload
        );

        if (response.status === 200) {
          navigation.navigate("AppointmentSuccess"); 
        } else {
          alert("เกิดข้อผิดพลาดในการเลื่อนนัดหมาย");
        }
      } else {
        const appointmentData = {
          userID,
          treatmentID: selectedTreatment.map((treatment) => treatment._id),
          dentistID,
          room,
          dateTime,
          totalPrice,
          duration,
        };

        const response = await createAppointment(appointmentData);
        if (response.status === 201) {
          navigation.navigate("AppointmentSuccess");
        } else {
          console.error("Failed to create appointment:", response.data);
        }
      }
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert("เกิดข้อผิดพลาด โปรดลองใหม่อีกครั้ง");
    }
  };
  const headerTitle = isRescheduling ? "เลื่อนการนัดหมาย" : "การนัดหมายใหม่";

  return (
    <View className="flex-1">
      <Header title={headerTitle} />
      <ScrollView className="bg-white">
        <View className="px-4 ">
          <View className="mt-6 flex-row">
            <Entypo name="text-document" size={24} color="black" />
            <Text
              className="text-xl text-gray-500 ml-1"
              style={globalStyles.textBold}
            >
              ภาพรวมการรักษา
            </Text>
          </View>
          <View className="mt-8 ">
            <Text className="text-sm text-gray-400" style={globalStyles.text}>
              ตรวจสอบความถูกต้องการนัดหมายของคุณ
            </Text>
          </View>
          <View className="mt-2 space-y-5 pb-8">
            <View className="flex-col">
              <Text className="text-sm text-gray-400" style={globalStyles.text}>
                วันที่
              </Text>
              <View
                className="justify-between flex-row px-3 py-2 mt-2"
                style={[globalStyles.card, globalStyles.boxShadowSm]}
              >
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={24} color="black" />
                  <Text className="ml-1" style={[globalStyles.text]}>
                    {selectedDate ? formatDateToThai(selectedDate) : "N/A"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("AppointmentTime")}
                  className="items-center flex-row"
                >
                  <Ionicons name="pencil-outline" size={16} color="#018DF9" />
                  <Text
                    className="text-xs ml-1"
                    style={[globalStyles.text, { color: "#018DF9" }]}
                  >
                    แก้ไข
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-col">
              <Text className="text-sm text-gray-400" style={globalStyles.text}>
                เวลา
              </Text>
              <View
                className="justify-between flex-row px-3 py-2 mt-2"
                style={[globalStyles.card, globalStyles.boxShadowSm]}
              >
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={24} color="black" />
                  <Text className="ml-1" style={[globalStyles.text]}>
                    {selectedTime || "N/A"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("AppointmentTime")}
                  className="items-center flex-row"
                >
                  <Ionicons name="pencil-outline" size={16} color="#018DF9" />
                  <Text
                    className="text-xs ml-1"
                    style={[globalStyles.text, { color: "#018DF9" }]}
                  >
                    แก้ไข
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-col">
              <Text className="text-sm text-gray-400" style={globalStyles.text}>
                รายการรักษา
              </Text>
              <View className="mt-2 space-y-2">
                {Array.isArray(selectedTreatment) &&
                  selectedTreatment.map((treatment, index) => (
                    <View
                      key={index}
                      className="justify-between flex-row px-3 py-2 mt-2"
                      style={[globalStyles.card, globalStyles.boxShadowSm]}
                    >
                      <View className="flex-row items-center">
                        <Image
                          style={{ height: 24, width: 24 }}
                          source={require("../../assets/images/medical.png")}
                        />
                        <Text className="ml-1" style={[globalStyles.text]}>
                          {treatment.name}{" "}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("AppointmentStack")}
                        className="items-center flex-row"
                      >
                        <Ionicons
                          name="pencil-outline"
                          size={16}
                          color="#018DF9"
                        />
                        <Text
                          className="text-xs ml-1"
                          style={[globalStyles.text, { color: "#018DF9" }]}
                        >
                          แก้ไข
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            </View>
            <View className="flex-col">
              <Text className="text-sm text-gray-400" style={globalStyles.text}>
                ทันตแพทย์
              </Text>
              <View
                className="justify-between flex-row px-3 py-2 mt-2"
                style={[globalStyles.card, globalStyles.boxShadowSm]}
              >
                <View className="flex-row items-center">
                  <FontAwesome6 name="user-doctor" size={24} color="black" />
                  <Text className="ml-1" style={[globalStyles.text]}>
                    {dentistName}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-col">
              <Text className="text-sm text-gray-400" style={globalStyles.text}>
                ห้อง
              </Text>
              <View
                className="justify-between flex-row px-3 py-2 mt-2"
                style={[globalStyles.card, globalStyles.boxShadowSm]}
              >
                <View className="flex-row items-center">
                  <MaterialIcons name="meeting-room" size={24} color="black" />
                  <Text className="ml-1" style={[globalStyles.text]}>
                    {room}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <View
        style={{ backgroundColor: "#F4FAFF" }}
        className="justify-end px-4 pt-4 pb-8"
      >
        <View className="mb-2">
          <Text style={[globalStyles.text, { color: "#018DF9" }]}>
            {/* ✅ เพิ่มการแสดงข้อความว่าเป็นราคาประมาณ */}
            {selectedTreatment && selectedTreatment[0]?.priceType === "range"
              ? "ยอดชำระประมาณ"
              : "ยอดชำระครั้งต่อไป"}
          </Text>
          <Text
            className="text-xl"
            style={[globalStyles.textBold, { color: "#018DF9" }]}
          >
            {totalPrice.toLocaleString()} บาท
            {selectedTreatment &&
              selectedTreatment[0]?.priceType === "range" && (
                <Text style={{ fontSize: 14 }}> (ประมาณ)</Text>
              )}
          </Text>

          {/* ✅ เพิ่มข้อความแจ้งเตือนสำหรับราคาประมาณ */}
          {selectedTreatment && selectedTreatment[0]?.priceType === "range" && (
            <Text
              style={[globalStyles.text, { color: "#f59e0b", fontSize: 12 }]}
            >
              * ราคาสุดท้ายอาจแตกต่างจากประมาณการ
              ขึ้นอยู่กับความยากง่ายของการรักษา
            </Text>
          )}

          {/* เดิม - checkbox และ NextButton */}
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleCheckBoxPress}>
              <View
                className="mr-2 my-4 justify-center items-center"
                style={[
                  styles.checkBox,
                  {
                    backgroundColor: isChecked ? "#86D6DD" : "transparent",
                    borderWidth: isChecked ? 0 : 2,
                  },
                ]}
              >
                {isChecked && (
                  <Ionicons
                    color={"white"}
                    size={16}
                    name="checkmark-outline"
                  />
                )}
              </View>
            </TouchableOpacity>
            <Text
              className="text-xs mt-3 mr-8"
              style={[globalStyles.text, { color: "black" }]}
            >
              ฉันได้อ่านและยอมรับข้อกำหนดแล้วหรือฉันได้อ่านและยอมรับนโยบายความเป็นส่วนตัวแล้ว
            </Text>
          </View>
        </View>
        <NextButton onPress={handleNextPress} disabled={!isChecked} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  checkBox: {
    width: 20,
    height: 20,
    borderColor: "#C7C7C7",
    backgroundColor: "#FCFCFC",
    borderRadius: 2.5,
  },
});
