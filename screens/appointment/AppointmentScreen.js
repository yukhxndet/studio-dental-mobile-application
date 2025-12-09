import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { globalStyles } from "../../styles/global";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Header from "../../components/HeaderComponent";
import NextButton from "../../components/NextButtonComponent";
import {
  fetchTreatments,
  fetchUserData,
  fetchDentistsForTreatment,
} from "../../apiService";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function AppointmentScreen() {
  const navigation = useNavigation();
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [userID, setUserID] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setSelectedTreatment(null); 

      const fetchInitialData = async () => {
        try {
          const [treatmentsRes, userRes] = await Promise.all([
            fetchTreatments(),
            fetchUserData(),
          ]);

          const allTreatments = treatmentsRes.data;
          const userData = userRes.data.data;

          setUserID(userData._id);

          const hasTreatmentPlan =
            userData.treatmentPlans && userData.treatmentPlans.length > 0;

          const filteredTreatments = hasTreatmentPlan
            ? allTreatments 
            : allTreatments.filter((t) => t.name !== "ปรับเครื่องมือ"); 

          setTreatments(filteredTreatments);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchInitialData();

      return () => {
        setSelectedTreatment(null);
      };
    }, [])
  );

  const isTreatmentSelected = (treatmentName) =>
    selectedTreatment?.name === treatmentName;

  const pickTreatment = async (treatment) => {
    if (selectedTreatment?.name === treatment.name) {
      setSelectedTreatment(null);
    } else {
      if (treatment.name === "ปรับเครื่องมือ") {
        setSelectedTreatment({
          ...treatment,
          dentistIDs: [], 
        });
        return;
      }
      try {
        const response = await fetchDentistsForTreatment(treatment._id);
        const dentists = response.data;

        if (dentists.length > 0) {
          const dentistIDs = dentists.map((dentist) => dentist._id);
          setSelectedTreatment({
            ...treatment,
            dentistIDs: dentistIDs,
          });
        } else {
          console.error("No dentist found for the selected treatment.");
        }
      } catch (error) {
        console.error("Error fetching dentists:", error);
      }
    }
  };

  const handleNextPress = () => {
    if (!selectedTreatment) return;

    if (selectedTreatment.name === "ปรับเครื่องมือ") {
      navigation.navigate("Appointment3M", {
        treatment: selectedTreatment,
        userID,
      });
      return;
    }

    const dentistIDs = selectedTreatment.dentistIDs || [];
    if (dentistIDs.length === 0) {
      alert("ไม่พบทันตแพทย์สำหรับการรักษาที่เลือก");
      return;
    }

    navigation.navigate("AppointmentTime", {
      selectedTreatment: [selectedTreatment],
      dentistIDs,
      userID,
      isRescheduling: false,
      originalAppointmentId: null,
    });
  };

  return (
    <View className="flex-1">
      <Header title="การนัดหมายใหม่" />
      <ScrollView className="bg-white">
        <View className="px-4">
          <View className="mt-6 flex-row">
            <Image
              style={{ height: 28, width: 28 }}
              source={require("../../assets/images/medical.png")}
            />
            <Text
              className="text-xl text-gray-500 ml-1"
              style={globalStyles.textBold}
            >
              รายการรักษา
            </Text>
          </View>
          <View className="mt-8">
            <Text className="text-sm text-gray-400" style={globalStyles.text}>
              เลือกรายการรักษาที่คุณต้องการรักษา
            </Text>
          </View>
          <View className="mt-2">
            {treatments.map((treatment, index) => (
              <TouchableOpacity
                onPress={() => pickTreatment(treatment)}
                key={index}
                style={[
                  globalStyles.borderTextInput,
                  {
                    backgroundColor: isTreatmentSelected(treatment.name)
                      ? "#F4FAFF"
                      : "transparent",
                    borderColor: isTreatmentSelected(treatment.name)
                      ? "#EDF6FF"
                      : "#d1d5db",
                  },
                ]}
                className="p-3 mb-3 flex-row justify-between items-center rounded-lg"
              >
                <View className="flex-row">
                  <View
                    className="mr-2 justify-center items-center"
                    style={[
                      styles.checkBox,
                      {
                        backgroundColor: isTreatmentSelected(treatment.name)
                          ? "#86D6DD"
                          : "transparent",
                        borderWidth: isTreatmentSelected(treatment.name)
                          ? 0
                          : 2,
                      },
                    ]}
                  >
                    {isTreatmentSelected(treatment.name) && (
                      <Ionicons color={"white"} name="checkmark-outline" />
                    )}
                  </View>
                  <Text style={globalStyles.text}>{treatment.name}</Text>
                </View>

                {/* ✅ แสดงราคาแบบประมาณ */}
                <View className="items-end">
                  {treatment.priceType === "range" ? (
                    <View className="items-end">
                      <Text
                        style={[
                          globalStyles.text,
                          {
                            color: isTreatmentSelected(treatment.name)
                              ? "#018DF9"
                              : "#6b7280",
                          },
                        ]}
                      >
                        {treatment.price.toLocaleString()} -{" "}
                        {treatment.maxPrice.toLocaleString()}฿
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        globalStyles.text,
                        {
                          color: isTreatmentSelected(treatment.name)
                            ? "#018DF9"
                            : "#6b7280",
                        },
                      ]}
                    >
                      {treatment.price.toLocaleString()}฿
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <View className="justify-end px-4 pb-8 bg-white">
        <NextButton onPress={handleNextPress} disabled={!selectedTreatment} />
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
