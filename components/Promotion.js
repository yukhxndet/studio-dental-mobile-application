import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { globalStyles } from "../styles/global";
import { fetchContentList } from "../apiService";
import { useNavigation } from "@react-navigation/native";

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchContentList("promotion");

        const promotionData = res?.data?.data || [];

        const activePromotions = promotionData.filter((item) => item.isActive);

        setPromotions(activePromotions);
      } catch (err) {
        console.error("Error fetching promotions:", err);
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View
        style={{ height: 160, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#018DF9" />
      </View>
    );
  }

  if (!promotions.length) {
    return (
      <View className="px-4 mt-8 pb-4">
        <Text className="text-xl text-gray-500" style={globalStyles.textBold}>
          โปรโมชั่นและสิทธิพิเศษ
        </Text>
        <View className="mt-4 p-4 border rounded-lg border-gray-200 bg-gray-50">
          <Text className="text-gray-500" style={globalStyles.textLight}>
            ไม่พบโปรโมชั่นที่กำลังใช้งานอยู่ในขณะนี้ 😥
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View className="flex-row justify-between items-center px-4">
        <Text className="text-xl text-gray-500" style={globalStyles.textBold}>
          โปรโมชั่นและสิทธิพิเศษ
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        style={{ paddingTop: 16, paddingBottom: 16 }}
      >
        {promotions.map((item) => (
          <TouchableOpacity
            key={item._id}
            onPress={() =>
              navigation.navigate("ContentDetail", { contentId: item._id })
            }
            style={{ marginRight: 20 }}
          >
            <View
              style={[
                {
                  backgroundColor: "#fff",
                  borderRadius: 8,
                  width: 280,
                  height: 140,
                  overflow: "hidden",
                },
                globalStyles.boxShadow,
              ]}
            >
              <Image
                style={{ width: 280, height: 140, borderRadius: 8 }}
                source={{ uri: item.coverImg }}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}
