import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { globalStyles } from "../../styles/global";
import ArrowBackComponent from "../../components/ArrowBackComponent";

export default function SignUpScreenPassword({ route }) {
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [recheckPassword, setRecheckPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [recheckPasswordTouched, setRecheckPasswordTouched] = useState(false);

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === recheckPassword;
  const isNextButtonDisabled = !isPasswordValid || !doPasswordsMatch;

  const handleCheckPassword = (text) => {
    setPassword(text);
    if (!passwordTouched) setPasswordTouched(true);
  };

  const handleCheckRecheckPassword = (text) => {
    setRecheckPassword(text);
    if (!recheckPasswordTouched) setRecheckPasswordTouched(true);
  };

  const handleNextButtonPress = () => {
    if (isPasswordValid && doPasswordsMatch) {
      navigation.navigate('SignUpProfile', { ...route.params, password });
    }
  };



  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
      <View className="flex-1 bg-white pt-8">
      <ArrowBackComponent/>

        <View className="form space-y-2 px-5 ">
          <Text style={globalStyles.textBold} className="text-2xl text-center">สร้างรหัสผ่าน</Text>
          <Text style={globalStyles.text} className="color-gray-400 text-center mb-7">
            สร้างรหัสผ่านด้วยตัวอักษรหรือตัวเลขอย่างน้อย 8 ตัว
          </Text>
          <View className='mb-5'>
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 bg-neutral-50 rounded-lg mb-1"
              placeholder='รหัสผ่าน'
              secureTextEntry={true} 
              value={password}
              onChangeText={(text) => handleCheckPassword(text)}
              placeholderTextColor='#878787'
              
            />

          </View>
          <View className='mb-5'>
            <TextInput
              style={[globalStyles.text, globalStyles.borderTextInput]}
              className="p-3 bg-neutral-50 rounded-lg mb-1"
              placeholder='ยืนยันรหัสผ่าน'
              secureTextEntry={true}
              value={recheckPassword}
              onChangeText={(text) => handleCheckRecheckPassword(text)}
              placeholderTextColor='#878787'
            />
            {(passwordTouched && recheckPasswordTouched && !doPasswordsMatch) && (
              <Text style={globalStyles.text} className="text-right text-xs text-red-400">
                รหัสผ่านไม่ตรงกัน
              </Text>
            )}
          </View>


          <TouchableOpacity
            onPress={handleNextButtonPress}
            disabled={isNextButtonDisabled}
            style={[globalStyles.bgAppColor, isNextButtonDisabled ? {opacity: 0.5} : {}]} 
            className="py-3 rounded-lg"
          >
  <Text
    className="text-white text-center"
    style={[globalStyles.textBold]}
  >
    ถัดไป
  </Text>
</TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 8,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  textCenter: {
    textAlign: 'center',
  },
  subText: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#808080',
  },
  marginTop: {
    marginTop: 15,
  },
  errorText: {
    color: 'red',
    textAlign: 'right',
    fontSize: 14,
    marginTop: 5,
  },
  nextButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC', 
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});