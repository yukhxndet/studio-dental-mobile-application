import React, { useEffect } from "react";
import { View, Text, SafeAreaView, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { globalStyles } from "../../styles/global";
import { useRoute } from "@react-navigation/native";

export default function SignUpScreenSuccess() {
  const navigation = useNavigation();
  const route = useRoute();
  const { name, profilePic } = route.params;

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSignUpSuccess();
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  const handleSignUpSuccess = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  return (
    <View className="flex-1 bg-white pt-8">
      <SafeAreaView className="flex">
        <View className="flex-row justify-center">
          <Image
            className="mx-3 w-36 h-36"
            source={require("../../assets/images/logofont.jpg")}
          />
        </View>
      </SafeAreaView>

      <View className="form px-5 pt-20 ">
        <View className="items-center">
          <View className="items-center">
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.image} />
            ) : (
              <View
                style={globalStyles.bgAppColor}
                className="w-60 h-60 rounded-full justify-center items-center"
              >
                <MaterialIcons name="person" size={200} color={"white"} />
              </View>
            )}
          </View>

          <Text
            style={globalStyles.textBold}
            className="text-2xl text-center mt-5"
          >
            ลงทะเบียนสำเร็จ, คุณ{name}
          </Text>
          <Text
            style={globalStyles.text}
            className="color-gray-400 text-center"
          >
            คุณสามารถเริ่มใช้งานแอพพลิเคชั่นได้เลย
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  form: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 48,
  },
  textCenter: {
    textAlign: "center",
  },
  subText: {
    color: "#808080",
    textAlign: "center",
    marginBottom: 7,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 240, // Adjust as needed
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: 9999,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  button: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
  },
  buttonTextBlack: {
    color: "black",
  },
  skipButton: {
    borderColor: "#CCCCCC", // Adjust as needed
    borderWidth: 1,
  },
});
