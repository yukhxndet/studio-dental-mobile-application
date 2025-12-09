import { View, Text, ScrollView, Image, Animated } from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react"; // เพิ่ม useCallback
import { globalStyles } from "../styles/global";
import Header from "../components/HeaderComponent";
import { fetchUserData, fetchDentistByID } from "../apiService";
import dayjs from "dayjs";
import "dayjs/locale/th"; // Import locale ภาษาไทย
import duration from "dayjs/plugin/duration";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet } from "react-native";
dayjs.locale("th");
dayjs.extend(duration);

const LoadingIndicator = () => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.loadingDot, { opacity: animation }]} />
    </View>
  );
};
export default function TreatmentPlanScreen() {
  const [userData, setUserData] = useState(null);
  const [assignedDentistName, setAssignedDentistName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);



  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const userResponse = await fetchUserData();
          if (userResponse && userResponse.data && userResponse.data.data) {
            const currentUserData = userResponse.data.data;
            setUserData(currentUserData);

            const dentistId =
              currentUserData?.treatmentPlans?.[0]?.assignedDentistId;

            if (dentistId) {
              const dentistResponse = await fetchDentistByID(dentistId);
              if (dentistResponse && dentistResponse.name) {
                setAssignedDentistName(dentistResponse.name);
              } else {
                setAssignedDentistName("ไม่พบข้อมูลทันตแพทย์");
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch treatment plan data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();

      return () => {};
    }, [])
  );

  const renderTreatmentContent = (type) => {
    if (type === "จัดฟันแบบรัดยาง") {
      const fullText = `การจัดฟันแบบรัดยางเป็นการจัดฟันที่ได้รับความนิยมมากที่สุด โดยอุปกรณ์จัดฟันประกอบด้วยแบร็คเกตจัดฟันที่ทำจากวัสดุโลหะที่มีคุณภาพใช้ติดด้านนอกของผิวฟัน ลวดสำหรับเป็นแนวในการเรียงฟันให้โค้งตามลวด มียางและเชนสีสันต่างๆ ให้เลือกใส่ได้ตามใจชอบ

การจัดฟันโลหะชนิดรัดยางจะต้องมีการเปลี่ยนยางทุกเดือนเนื่องจากยางหมดอายุการใช้งาน เราสามารถพบเห็นการจัดฟันแบบนี้ได้ในกลุ่มคนไข้ทั่วไปที่ต้องการสีสันของยางและไม่มีปัญหาในการที่คนอื่นสามารถมองเห็นการจัดฟันของตนได้`;

      const shortText =
        "การจัดฟันแบบรัดยางเป็นการจัดฟันที่ได้รับความนิยมมากที่สุด...";
      return (
        <View
          style={[globalStyles.boxShadow]}
          className="mt-4  bg-white rounded-2xl shadow p-4"
        >
          <Text
            style={globalStyles.textBold}
            className="text-lg text-[#1D364A] mb-2"
          >
            การจัดฟันโลหะชนิดรัดยาง (3M Gemini)
          </Text>
          <Text style={globalStyles.text} className="text-gray-700 leading-6">
            {isExpanded ? fullText : shortText}
          </Text>
          <Text
            onPress={() => setIsExpanded(!isExpanded)}
            style={globalStyles.textBold}
            className="text-[#1D364A] font-semibold"
          >
            {isExpanded ? "ย่อข้อความ" : "อ่านเพิ่มเติม"}
          </Text>
          <Text
            style={globalStyles.text}
            className="text-sm text-gray-800 font-semibold mb-1 mt-2"
          >
            ✅ ข้อดีของการจัดฟันแบบรัดยาง
          </Text>
          <Text style={globalStyles.text} className="text-gray-700">
            • เครื่องมือผิวมันวาว ลดคราบ{"\n"}• สนุกกับการเลือกสียาง{"\n"}•
            ราคาย่อมเยา เป็นที่นิยม
          </Text>
        </View>
      );
    }

    return (
      <Text
        style={globalStyles.text}
        className="text-gray-500 mt-4 text-center"
      >
        ไม่พบข้อมูลแผนการรักษาที่รองรับ
      </Text>
    );
  };

  const calculateDuration = (startDate) => {
    const start = dayjs(startDate);
    const now = dayjs();
    const diff = dayjs.duration(now.diff(start));
    return `${diff.years()} ปี ${diff.months()} เดือน ${diff.days()} วัน`;
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const treatment = userData?.treatmentPlans?.[0];

  return (
    <View className="flex-1 bg-white">
      <Header title="แผนการรักษา" />
      <ScrollView className="p-4">
        {treatment ? (
          <>
            {/* Card: Treatment Type */}
            <View
              className="bg-white rounded-2xl shadow p-4 mb-4"
              style={[globalStyles.boxShadow]}
            >
              <Text
                style={globalStyles.text}
                className="text-base text-gray-500 mb-1 font-medium"
              >
                ประเภทแผนการรักษา
              </Text>
              <Text
                style={globalStyles.textBold}
                className="text-lg text-[#1D364A]"
              >
                {treatment.type}
              </Text>
            </View>

            {renderTreatmentContent(treatment.type)}

            {/* Card: Start Date */}
            <View
              style={[globalStyles.boxShadow]}
              className="bg-white rounded-2xl shadow p-4 mt-5 mb-3"
            >
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="date-range" size={20} color="#1D364A" />
                <Text
                  style={globalStyles.text}
                  className="ml-2 text-gray-600 font-semibold"
                >
                  วันที่เริ่มจัดฟัน
                </Text>
              </View>
              <Text style={globalStyles.text} className="text-black">
                {dayjs(treatment.startDate).format("DD MMMM YYYY")}
              </Text>
            </View>

            {/* Card: Duration */}
            <View
              style={[globalStyles.boxShadow]}
              className="bg-white rounded-2xl shadow p-4 mb-3"
            >
              <View className="flex-row items-center mb-2">
                <FontAwesome5 name="clock" size={18} color="#1D364A" />
                <Text
                  style={globalStyles.text}
                  className="ml-2 text-gray-600 font-semibold"
                >
                  ระยะเวลาจัดฟันแล้ว
                </Text>
              </View>
              <Text style={globalStyles.text} className="text-black">
                {calculateDuration(treatment.startDate)}
              </Text>
            </View>

            {/* Card: Dentist */}
            <View
              style={[globalStyles.boxShadow]}
              className="bg-white rounded-2xl shadow p-4 mb-3"
            >
              <View className="flex-row items-center mb-2">
                <FontAwesome5 name="user-md" size={18} color="#1D364A" />
                <Text
                  style={globalStyles.text}
                  className="ml-2 text-gray-600 font-semibold"
                >
                  ทันตแพทย์ที่ดูแล
                </Text>
              </View>
              <Text style={globalStyles.text} className="text-black">
                {assignedDentistName || "กำลังโหลด..."}
              </Text>
            </View>

            {/* Card: Remaining Balance */}
            <View
              style={[globalStyles.boxShadow]}
              className="bg-white rounded-2xl shadow p-4 mb-10"
            >
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="payments" size={20} color="#1D364A" />
                <Text
                  style={globalStyles.text}
                  className="ml-2 text-gray-600 font-semibold"
                >
                  ยอดเงินคงเหลือ
                </Text>
              </View>
              <Text
                style={globalStyles.textBold}
                className="text-black text-base"
              >
                {treatment.remainingBalance?.toLocaleString("th-TH") ?? "0"} บาท
              </Text>
            </View>
          </>
        ) : (
          <Text
            style={globalStyles.text}
            className="text-gray-600 text-center text-lg mt-10"
          >
            คุณไม่มีแผนการรักษา
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6B7280", // สีเทา
  },
});
