import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import React from "react";
import { globalStyles } from "../../styles/global";
import { useNavigation } from "@react-navigation/native";
import ArrowBackComponent from "../../components/ArrowBackComponent";
import NextButton from "../../components/NextButtonComponent";
import { useState } from "react";
import axios from "axios";

export default function SignUpScreenName() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const isNextButtonDisabled = !firstName.trim() || !lastName.trim();

  function handleSubmit() {
    const fullName = `${firstName.trim()} ${lastName.trim()}`;


    const userData = {
      name: fullName,
 
    };

    navigation.navigate('SignUpAge', { name: fullName });
  }


  return (
    <TouchableWithoutFeedback className="bg-white" onPress={() => {Keyboard.dismiss();}}>
        <View className="flex-1 pt-8 bg-white">
        <ArrowBackComponent/>
        
      <View className="form space-y-2 px-5 ">
        <Text style={globalStyles.textBold} className="text-2xl text-center">คุณชื่ออะไร?</Text>
        <Text style={globalStyles.text} className="color-gray-400 text-center mb-7">กรอกชื่อและนามสกุลที่ใช้จริง</Text>
        <View className='flex-row gap-x-5 mb-5'>
        <TextInput
          style={[globalStyles.text, globalStyles.borderTextInput]}
          className="p-3 flex-1 bg-neutral-50 rounded-lg mb-1"
          placeholder="ชื่อ"
          placeholderTextColor="#878787"
          onChangeText={(text) => setFirstName(text)}
        />
        <TextInput
          style={[globalStyles.text, globalStyles.borderTextInput]}
          className="p-3 flex-1 bg-neutral-50 rounded-lg mb-1"
          placeholder="นามสกุล"
          placeholderTextColor="#878787"
          onChangeText={(text) => setLastName(text)}
        />
        
        </View>
        
        <NextButton onPress={handleSubmit} disabled={isNextButtonDisabled} />
         </View>
    </View>
    </TouchableWithoutFeedback>
  );
}
