import React from "react";
import { TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native";

const ArrowBackComponent = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex">
          <View className="flex-row justify-start">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2 ml-4">
              <MaterialIcons
                name='arrow-back-ios'
                size={24}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
  );
}

export default ArrowBackComponent;
