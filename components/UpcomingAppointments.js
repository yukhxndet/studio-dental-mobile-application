import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import TodayDelayHint from "./TodayDelayHint";

export default function UpcomingAppointments({
  upcomingAppointments,
  blinkingOpacity,
  isToday,
  renderDelayForRoom,
  calculateAdjustedTime,
  navigation,
  isCancelling,
  openConfirmCancelModal,
  handleRescheduleAppointment,
  globalStyles,
  formatDate, 
  formatTime, 
  renderStatus, 
  delayData, 
}) {
  return (
    <View
      style={[globalStyles.cardXL, globalStyles.boxShadow]}
      className="p-5 mb-5"
    >
      <View className="flex-row">
        <Ionicons name="calendar-outline" size={24} />
        <Text
          className="ml-2 text-xl text-gray-500"
          style={globalStyles.textBold}
        >
          การนัดหมายที่กำลังจะเกิดขึ้น
        </Text>
      </View>
      {upcomingAppointments.length > 0 ? (
        upcomingAppointments.map((appointment, index) => (
          <View key={index}>
            <TodayDelayHint
              appointment={appointment}
              delayData={delayData}
              blinkingOpacity={blinkingOpacity}
              calculateAdjustedTime={calculateAdjustedTime}
              globalStyles={globalStyles}
            />

            {/* ใช้ formatDate และ formatTime แทนการ split string */}
            <View className="mt-3">
              <Text
                style={globalStyles.textBold}
                className="text-xl text-sky-400"
              >
                {formatDate(appointment.dateTime)}
              </Text>
              <Text
                style={globalStyles.textLight}
                className="text-xs text-black"
              >
                เวลา {formatTime(appointment.dateTime)} น.
              </Text>
            </View>

            <View className="mt-3">
              <Text
                style={globalStyles.textBold}
                className="text-sm text-gray-400"
              >
                รายการรักษา
              </Text>
              <Text
                style={globalStyles.textLight}
                className="text-xs text-black"
              >
                {appointment.treatmentID?.name || "ไม่ระบุการรักษา"}
              </Text>
            </View>

            <View className="mt-3">
              <Text
                style={globalStyles.textBold}
                className="text-sm text-gray-400"
              >
                ยอดชำระครั้งถัดไป
              </Text>
              <View className="flex-row items-center">
                <Text
                  style={globalStyles.textLight}
                  className="text-xs text-black"
                >
                  <Text>{appointment.totalPrice.toLocaleString()} ฿</Text>
                </Text>
                {/* ✅ เพิ่มการแสดงว่าเป็นราคาประมาณ */}
                {!appointment.isPriceConfirmed && (
                  <Text
                    style={[globalStyles.textLight]}
                    className="text-xs ml-2 text-gray-400"
                  >
                    (โดยประมาณ ขึ้นอยู่กับความยากง่ายของการรักษา)
                  </Text>
                )}
              </View>
            </View>

            <View className="mt-3">
              <Text
                style={globalStyles.textBold}
                className="text-sm text-gray-400"
              >
                ทันตแพทย์
              </Text>
              <Text
                style={globalStyles.textLight}
                className="text-xs text-black"
              >
                {appointment.dentistID?.name || "ไม่ระบุทันตแพทย์"}
              </Text>
            </View>

            <View className="mt-3">
              <Text
                style={globalStyles.textBold}
                className="text-sm text-gray-400"
              >
                ห้อง
              </Text>
              <Text
                style={globalStyles.textLight}
                className="text-xs text-black"
              >
                {appointment.room}
              </Text>
            </View>

            <View className="mt-3 items-end">
              <Text
                style={globalStyles.textBold}
                className="text-sm text-gray-400"
              >
                สถานะ
              </Text>
              {/* ใช้ renderStatus function ที่ส่งมาจาก parent */}
              {renderStatus(appointment.status)}
            </View>

            <View className="flex-row space-x-4 mt-4 mb-4">
              {/* อนุมัติแล้ว: มีทั้งเลื่อนและยกเลิก */}
              {appointment.status === "อนุมัติแล้ว" && (
                <>
                  <View className="flex-1">
                    <TouchableOpacity
                      onPress={() => handleRescheduleAppointment(appointment)}
                      style={{ backgroundColor: "#ffc107" }}
                      className="py-3 rounded-lg mr-2"
                    >
                      <Text
                        className="text-white text-center"
                        style={globalStyles.textBold}
                      >
                        เลื่อนการนัดหมาย
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-1">
                    <TouchableOpacity
                      disabled={isCancelling}
                      onPress={() => openConfirmCancelModal(appointment)}
                      style={{
                        backgroundColor: isCancelling ? "#aaa" : "#dc3545",
                      }}
                      className="py-3 rounded-lg"
                    >
                      <Text
                        className="text-white text-center"
                        style={globalStyles.textBold}
                      >
                        ยกเลิกการนัดหมาย
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* กำลังพิจารณา: มีเฉพาะปุ่มยกเลิก */}
              {appointment.status === "กำลังพิจารณา" && (
                <View className="flex-1">
                  <TouchableOpacity
                    disabled={isCancelling}
                    onPress={() => openConfirmCancelModal(appointment)}
                    style={{
                      backgroundColor: isCancelling ? "#aaa" : "#dc3545",
                    }}
                    className="py-3 rounded-lg"
                  >
                    <Text
                      className="text-white text-center"
                      style={globalStyles.textBold}
                    >
                      ยกเลิกการนัดหมาย
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* กำลังรอคิว/ถึงคิวแล้ว: มีเฉพาะปุ่มยกเลิก */}
              {["กำลังรอคิว", "ถึงคิวแล้ว"].includes(appointment.status) && (
                <View className="flex-1">
                  <TouchableOpacity
                    disabled={isCancelling}
                    onPress={() => openConfirmCancelModal(appointment)}
                    style={{
                      backgroundColor: isCancelling ? "#aaa" : "#dc3545",
                    }}
                    className="py-3 rounded-lg"
                  >
                    <Text
                      className="text-white text-center"
                      style={globalStyles.textBold}
                    >
                      ยกเลิกการนัดหมาย
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* คุณอาจมี logic ปุ่มอื่นสำหรับสถานะอื่นๆ ถ้าต้องการ */}
            </View>
          </View>
        ))
      ) : (
        <>
          <Text
            style={globalStyles.textBold}
            className="text-xl text-sky-400 mt-3"
          >
            คุณไม่มีการนัดหมาย
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Appointment")}
            style={globalStyles.bgAppColor}
            className="py-3 mt-3 rounded-lg"
          >
            <Text
              className="text-white text-center"
              style={globalStyles.textBold}
            >
              เพิ่มการนัดหมาย
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
