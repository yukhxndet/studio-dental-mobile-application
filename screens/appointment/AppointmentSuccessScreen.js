import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "../../styles/global";

export default function AppointmentSuccessScreen() {
  const navigation = useNavigation();


  const handleAppointmentSuccess = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  return (
   
      <View className="flex-1 w-full bg-white pt-8 px-4 justify-center items-center">
          <View className="flex-col justify-center items-center">
          <Image className="mx-3 w-24 h-24 mb-8" source={require('../../assets/images/logo.png')}/>

          <Text style={[globalStyles.textBold,globalStyles.textAppColor]} className="text-center text-3xl">
          การนัดหมายของคุณ{"\n"}สำเร็จแล้ว!
          </Text>

          <Text style={[globalStyles.textBold,globalStyles.textAppColor]} className="text-center text-xl">โปรดรอเจ้าหน้าที่ทำการยืนยันการนัด</Text>

          <Text Text style={[globalStyles.text]} className="text-center my-4 text-gray-400">เรากำลังรอคอยการมาของคุณ{"\n"}ขอบคุณที่ใช้บริการ Studio Dental{"\n"}รบกวนมาก่อนเวลานัดประมาณ 15 นาที{"\n"}ขอบคุณค่ะ</Text>
          </View>

          <TouchableOpacity  onPress={handleAppointmentSuccess}  style={[globalStyles.bgAppColor]} className="py-3 w-full rounded-lg">
                <Text className="text-white text-center" style={[globalStyles.textBold]}>
                    ออกจากหน้านี้
                </Text>
            </TouchableOpacity>

        
      </View>

      
  );
}
