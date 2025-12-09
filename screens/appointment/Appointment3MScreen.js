import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import React from "react";
import { globalStyles } from "../../styles/global";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import Header from "../../components/HeaderComponent";
import NextButton from "../../components/NextButtonComponent";
import { fetchRubberColors } from "../../apiService";
import { useEffect } from "react";
import apiService, { fetchUserData } from "../../apiService";
import { useRoute } from "@react-navigation/native";

export default function Appointment3MScreen() {
  const navigation = useNavigation();
  const route = useRoute(); 

  const [searchText, setSearchText] = useState("");

  const [rubberColors, setRubberColors] = useState([]); 
  const [selectedRubberColor, setSelectedRubberColor] = useState(null);
  const [userAssignedDentistId, setUserAssignedDentistId] = useState(null);
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userRes = await fetchUserData();
        const plans = userRes.data.data.treatmentPlans || [];

        console.log("treatmentPlans:", plans);

        const plan = plans.find(
          (p) =>
            p.assignedDentistId &&
            (p.type?.includes("จัดฟัน") || p.type?.includes("ปรับเครื่องมือ"))
        );

        if (plan) {
          setUserAssignedDentistId(plan.assignedDentistId);
        } else {
          console.warn("❌ ไม่พบ treatment plan ที่ตรงกับเงื่อนไข");
          setUserAssignedDentistId(null); 
        }
      } catch (error) {
        console.error("โหลดข้อมูลผู้ใช้ล้มเหลว", error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    fetchRubberColors()
      .then((res) => setRubberColors(res.data))
      .catch(() => setRubberColors([]));
  }, []);

  const handleCardPress = (color) => {
    setSelectedRubberColor(color);
    setSelectedCard(color._id); 
  };
  const handleNext = () => {
    console.log("selectedRubberColor", selectedRubberColor);
    console.log("route.params?.treatment", route.params?.treatment);
    console.log("userAssignedDentistId", userAssignedDentistId);

    if (
      !selectedRubberColor ||
      !route.params?.treatment ||
      !userAssignedDentistId
    ) {
      console.log("เงื่อนไขไม่ผ่าน ไม่สามารถไปต่อได้");
      return;
    }

    navigation.navigate("AppointmentTime", {
      selectedTreatment: [
        { ...route.params.treatment, rubberColor: selectedRubberColor },
      ],
      dentistIDs: [userAssignedDentistId],
      userID: route.params.userID,
    });
  };

  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <View className="flex-1">
      <Header title="การนัดหมายใหม่" />

      <ScrollView className="bg-white">
        <View className="px-4">
          <View className=" mt-6 flex-row">
            <Image
              style={{ height: 28, width: 28 }}
              source={require("../../assets/images/bracket.png")}
            />
            <Text
              className="text-xl text-gray-600 ml-1"
              style={globalStyles.textBold}
            >
              สียาง (3M Gemini)
            </Text>
          </View>

          <View className="mt-8">
            <Text className=" text-sm text-gray-400" style={globalStyles.text}>
              เลือกสียางที่คุณต้องการสวมใส่
            </Text>
          </View>

          <View
            style={{ borderWidth: 1 }}
            className="py-1 mt-2 px-4 border-gray-400 rounded-lg flex-1 flex-row justify-center items-center"
          >
            <MaterialIcons
              name="search"
              size={20}
              color={"#9ca3af"}
              className="p-3"
            />
            <TextInput
              style={[globalStyles.text]}
              className="flex-1 ml-1"
              placeholder="ค้นหา"
              placeholderTextColor={"#878787"}
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />
          </View>

          <View style={{ marginTop: 8 }}>
            {rubberColors
              .filter(
                (colorObj) =>
                  colorObj.label
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                  colorObj.desc.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((colorObj) => (
                <TouchableOpacity
                  key={colorObj._id}
                  onPress={() => handleCardPress(colorObj)}
                  disabled={colorObj.stock <= 0}
                  className="p-3 mb-3 items-center rounded-lg"
                >
                  <View
                    style={[
                      globalStyles.cardXL,
                      globalStyles.boxShadow,
                      {
                        backgroundColor:
                          selectedCard === colorObj._id ? "#86D6DD" : "white",
                      },
                    ]}
                    className="p-5 flex-row"
                  >
                    <View>
                      <Image
                        style={{ width: 80, height: 80 }}
                        source={{ uri: colorObj.imgUrl }}
                      />
                    </View>
                    <View className="flex-col ml-8">
                      <Text
                        className=" text-base"
                        style={[
                          globalStyles.text,
                          {
                            color:
                              selectedCard === colorObj._id ? "white" : "black",
                          },
                        ]}
                      >
                        {colorObj.label}
                      </Text>
                      <View className="flex-row">
                        <Text
                          className="text-sm text-gray-400"
                          style={globalStyles.text}
                        >
                          คำอธิบาย{" "}
                        </Text>
                        <Text
                          className="ml-1"
                          style={[
                            globalStyles.text,
                            {
                              color:
                                selectedCard === colorObj._id
                                  ? "white"
                                  : "black",
                            },
                          ]}
                        >
                          สี{colorObj.desc}
                        </Text>
                      </View>

                      <View className="flex-row mt-3">
                        <Text
                          className="text-sm text-gray-400"
                          style={[globalStyles.text]}
                        >
                          สถานะ{" "}
                        </Text>
                        <View
                          className="ml-1 px-1"
                          style={[
                            globalStyles.text,
                            {
                              backgroundColor:
                                colorObj.stock > 0 ? "#D1E7DD" : "#F8D7DA",
                              borderRadius: 8,
                              marginTop: -4,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              globalStyles.text,
                              {
                                color:
                                  colorObj.stock > 0 ? "#198754" : "#DC3545",
                                padding: 4,
                              },
                            ]}
                          >
                            {colorObj.stock > 0 ? "มีสินค้า" : "สินค้าหมด"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </ScrollView>

      <View className="justify-end bg-white px-4 pb-8">
        <NextButton onPress={handleNext} disabled={selectedCard === null} />
      </View>
    </View>
  );
}
