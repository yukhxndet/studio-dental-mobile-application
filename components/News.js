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
import { fetchNews, fetchArticles } from "../apiService";
import { useNavigation } from "@react-navigation/native";

export default function News() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [newsRes, articlesRes] = await Promise.all([
          fetchNews(),
          fetchArticles(),
        ]);

        const newsData = newsRes?.data?.data || [];
        const articlesData = articlesRes?.data?.data || [];


        let merged = [...newsData, ...articlesData];
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const activeNews = merged.filter((item) => item.isActive);

        setNewsList(activeNews);
      } catch (err) {
        console.error("--- ❌ ERROR FETCHING NEWS/ARTICLES ---", err); // Log error ด้วย
        setNewsList([]);
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

  if (!newsList.length) return null;

  return (
    <>
      <View className="flex-row justify-between items-center px-4">
        <Text className="text-xl text-gray-500" style={globalStyles.textBold}>
          ข่าวสารและบทความ
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        style={{ paddingTop: 16, paddingBottom: 16 }}
      >
        {newsList.map((item) => (
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
