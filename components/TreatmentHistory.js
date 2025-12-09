import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native"; 

export default function TreatmentHistory({
  appointments,
  userData,
  globalStyles,
  formatDate,
}) {
  const navigation = useNavigation(); 
  const handleViewAllPress = () => {
    navigation.navigate("TreatmentHistoryDetail", {
      appointments: appointments, 
      userData: userData,
    });
  };

  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
    .slice(0, 5);
  return (
    <View className="my-8 ">
      <View className="flex-row justify-between items-center">
        <Text className="text-xl text-gray-500" style={globalStyles.textBold}>
          ประวัติการรักษา
        </Text>
        <TouchableOpacity onPress={handleViewAllPress}>
          <Text style={[globalStyles.text, { color: "#3B82F6" }]}>
            ดูทั้งหมด
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center">
        <Text className="text-gray-500 mr-1" style={globalStyles.textBold}>
          ยอดเงินจัดฟันคงเหลือทั้งหมด
        </Text>
        <Text style={globalStyles.textLight} className="text-black">
          {userData.treatmentPlans && userData.treatmentPlans.length > 0
            ? `${
                userData.treatmentPlans[0].remainingBalance.toLocaleString(
                  "th-TH"
                ) ?? "0"
              } บาท`
            : "ไม่มีแผนการรักษา"}
        </Text>
      </View>

      {appointments.length > 0 ? (
        <>
          <View className="flex-row justify-between mb-4 items-center mt-4">
            <Text style={globalStyles.text} className="text-gray-400">
              รายการรักษา
            </Text>
            <Text style={globalStyles.text} className="text-gray-400">
              วันที่รักษา
            </Text>
            <Text style={globalStyles.text} className="text-gray-400">
              ค่าใช้จ่าย
            </Text>
          </View>
          {recentAppointments.map((appointment) => (
            <View key={appointment._id}>
              <View
                style={[globalStyles.boxShadowSm, globalStyles.card]}
                className="flex-1 flex-row py-3 px-2 mb-2 justify-between items-center"
              >
                <Text style={globalStyles.text} className="text-black">
                  {appointment.treatmentID?.name || "ไม่ระบุการรักษา"}
                </Text>
                <Text style={globalStyles.text} className="text-black">
                  {formatDate(appointment.dateTime)}
                </Text>
                <Text style={globalStyles.text} className="text-black">
                  {appointment.totalPrice.toLocaleString()} ฿
                </Text>
              </View>
            </View>
          ))}
        </>
      ) : (
        <>
          <View className="flex-row justify-between mb-4 items-center mt-4">
            <Text style={globalStyles.text} className="text-gray-400">
              รายการรักษา
            </Text>
            <Text style={globalStyles.text} className="text-gray-400">
              วันที่รักษา
            </Text>
            <Text style={globalStyles.text} className="text-gray-400">
              ค่าใช้จ่าย
            </Text>
          </View>
          <Text
            style={globalStyles.textBold}
            className="text-xl text-gray-400 mt-6 text-center"
          >
            คุณยังไม่มีประวัติการรักษา
          </Text>
        </>
      )}
    </View>
  );
}
