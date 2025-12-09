import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Modal,
  Pressable,
} from "react-native";
import React from "react";
import { globalStyles } from "../styles/global";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserData, fetchDentistByID } from "../apiService"; // ปรับ path ให้ตรง
import { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [assignedDentistName, setAssignedDentistName] = useState("");

  const [modalVisible, setModalVisible] = useState(false); // เพิ่มสถานะ Modal

  useFocusEffect(
    useCallback(() => {
      async function getData() {
        try {
          const response = await fetchUserData();
          const user = response.data.data;
          setUserData(user);

          if (user.treatmentPlans && user.treatmentPlans.length > 0) {
            const dentistId = user.treatmentPlans[0].assignedDentistId;
            if (dentistId) {
              const dentist = await fetchDentistByID(dentistId);
              setAssignedDentistName(dentist.name);
            }
          }
        } catch (error) {
          console.error("Error fetching data: ", error);
        } finally {
          setIsLoading(false);
        }
      }

      getData();

      return () => {
      };
    }, [])
  );

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setModalVisible(false); // ปิด Modal ก่อน
    navigation.navigate("Login");
  };

  const animation = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center bg-white items-center">
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
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Header title="โปรไฟล์ของคุณ" />

      <ScrollView className="bg-white">
        <View className="px-4">
          <View className="justify-center mt-4 items-center">
            <View
              style={[globalStyles.cardXL, globalStyles.boxShadow]}
              className="p-5 mb-5"
            >
              <View className="justify-center items-center">
                {userData && userData.profilePic ? (
                  <Image
                    source={{ uri: userData.profilePic }}
                    style={{ width: 96, height: 96, borderRadius: 96 / 2 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 96 / 2,
                      backgroundColor: "#ccc",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="person" size={40} color="#fff" />
                  </View>
                )}
              </View>

              <View className=" mt-3">
                <Text style={globalStyles.textBold} className="text-gray-400">
                  ชื่อ - นามสกุล
                </Text>
                <Text style={globalStyles.textLight} className="text-black">
                  {userData?.name ?? "ไม่พบข้อมูล"}
                </Text>
              </View>

              <View className=" mt-3">
                <Text style={globalStyles.textBold} className="text-gray-400">
                  แผนการรักษา
                </Text>
                <Text>
                  <Text style={globalStyles.textLight} className="text-black">
                    {userData?.treatmentPlans?.[0]?.type ?? "ไม่มีแผนการรักษา"}
                  </Text>
                </Text>
              </View>

              {userData.treatmentPlans &&
                userData.treatmentPlans.length > 0 && (
                  <>
                    <View className=" mt-3">
                      <Text
                        style={globalStyles.textBold}
                        className="text-gray-400"
                      >
                        ยอดเงินจัดฟันคงเหลือ
                      </Text>
                      <Text
                        style={globalStyles.textLight}
                        className="text-black"
                      >
                        {userData.treatmentPlans[0]?.remainingBalance?.toLocaleString(
                          "th-TH"
                        ) ?? "0"}{" "}
                        บาท
                      </Text>
                    </View>

                    <View className=" mt-3">
                      <Text
                        style={globalStyles.textBold}
                        className="text-gray-400"
                      >
                        ทันตแพทย์ที่ดูแล
                      </Text>
                      <Text
                        style={globalStyles.textLight}
                        className="text-black"
                      >
                        {assignedDentistName || "กำลังโหลด..."}
                      </Text>
                    </View>
                  </>
                )}
            </View>
          </View>

          <View className="mt-8">
            <View className="flex-row items-center">
              <Text
                className=" text-xl text-gray-500"
                style={globalStyles.textBold}
              >
                ข้อมูลของคุณ
              </Text>
            </View>
            <View className="flex-row mt-2 mb-5">
              <View
                style={[globalStyles.card, globalStyles.boxShadow]}
                className="flex-col flex-1 justify-between mt-2"
              >
                <TouchableOpacity
                  onPress={() => navigation.navigate("PersonalInfo")}
                  className="flex-row  border-b-2  justify-between p-3 items-start border-gray-100 "
                >
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={24} />
                    <Text className="ml-2 " style={globalStyles.text}>
                      ข้อมูลส่วนตัว
                    </Text>
                  </View>

                  <View>
                    <MaterialIcons name="arrow-forward-ios" size={24} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("TreatmentPlan")}
                  className="flex-row  border-b-2  justify-between p-3 items-start border-gray-100 "
                >
                  <View className="flex-row items-center">
                    <Ionicons name="document-text-outline" size={24} />
                    <Text className="ml-2 " style={globalStyles.text}>
                      แผนการรักษา
                    </Text>
                  </View>

                  <View>
                    <MaterialIcons name="arrow-forward-ios" size={24} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("Referral")}
                  className="flex-row justify-between p-3 items-start border-gray-100"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="happy-outline" size={24} />
                    <Text className="ml-2" style={globalStyles.text}>
                      แนะนำเพื่อน
                    </Text>
                  </View>
                  <View>
                    <MaterialIcons name="arrow-forward-ios" size={24} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mt-8">
            <View className="flex-row items-center">
              <Text
                className=" text-xl text-gray-500"
                style={globalStyles.textBold}
              >
                การตั้งค่า
              </Text>
            </View>
            <View className="flex-row mt-2 mb-5">
              <View
                style={[globalStyles.card, globalStyles.boxShadow]}
                className="flex-col flex-1 justify-between mt-2"
              >
                <TouchableOpacity
                  onPress={() => navigation.navigate("EditProfile")}
                  className="flex-row  border-b-2  justify-between p-3 items-start border-gray-100 "
                >
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="account-edit-outline"
                      size={24}
                      color="black"
                    />
                    <Text className="ml-2 " style={globalStyles.text}>
                      แก้ไขข้อมูลส่วนตัว
                    </Text>
                  </View>

                  <View>
                    <MaterialIcons name="arrow-forward-ios" size={24} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("PasswordSecurity")}
                  className="flex-row border-b-2 justify-between p-3 items-start border-gray-100 "
                >
                  <View className="flex-row items-center">
                    <Ionicons name="lock-closed-outline" size={24} />
                    <Text className="ml-2 " style={globalStyles.text}>
                      รหัสผ่านและความปลอดภัย
                    </Text>
                  </View>

                  <View>
                    <MaterialIcons name="arrow-forward-ios" size={24} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("NotificationSettings")}
                  className="flex-row justify-between p-3 items-start border-gray-100"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="notifications-outline" size={24} />
                    <Text className="ml-2" style={globalStyles.text}>
                      การแจ้งเตือน
                    </Text>
                  </View>
                  <MaterialIcons name="arrow-forward-ios" size={24} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible(true)} // เปิด Modal
            style={[globalStyles.bgAppColor]}
            className="py-3 rounded-lg mb-8"
          >
            <Text
              className="text-white text-center"
              style={[globalStyles.textBold]}
            >
              ออกจากระบบ
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // กดปุ่ม back Android ปิด modal
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 20,
              width: "100%",
              maxWidth: 320,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Ionicons name="exit-outline" size={48} color="#d9534f" />
            <Text
              style={[
                globalStyles.textBold,
                {
                  fontSize: 18,
                  marginTop: 15,
                  marginBottom: 10,
                  textAlign: "center",
                },
              ]}
            >
              คุณต้องการออกจากระบบจริงหรือไม่?
            </Text>
            <Text
              style={[
                globalStyles.text,
                { textAlign: "center", marginBottom: 20 },
              ]}
            >
              การออกจากระบบจะทำให้คุณต้องล็อกอินใหม่ในครั้งถัดไป
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Pressable
                onPress={() => setModalVisible(false)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#aaa",
                  marginRight: 10,
                  alignItems: "center",
                }}
              >
                <Text style={[globalStyles.text]}>ยกเลิก</Text>
              </Pressable>

              <Pressable
                onPress={logout}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: "#d9534f",
                  alignItems: "center",
                }}
              >
                <Text style={[globalStyles.textBold, { color: "white" }]}>
                  ออกจากระบบ
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
