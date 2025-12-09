// ContentDetail.js
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { fetchContentById } from "../apiService";
import { globalStyles } from "../styles/global";
import Header from "../components/HeaderComponent";
import moment from "moment";
import "moment/locale/th";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const ContentDetail = ({ route, navigation }) => {
  const { contentId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchContentById(contentId);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching content:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [contentId]);

  const ContentText = ({ text, style }) => {
    if (!text) return null;
    const textLines = text.split("\n");
    return (
      <View>
        {textLines.map((line, index) => (
          <Text
            key={index}
            style={[style, { marginBottom: line.trim() === "" ? 8 : 0 }]}
          >
            {line.trim() === "" ? " " : line}
          </Text>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <Header title="รายละเอียด" />
        <View className="flex-1 justify-center items-center">
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
          <Text style={[globalStyles.text, { marginTop: 16, color: "#666" }]}>
            กำลังโหลดข้อมูล...
          </Text>
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 bg-white">
        <Header title="รายละเอียด" />
        <View className="flex-1 justify-center items-center px-4">
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
          <Text
            style={[
              globalStyles.textBold,
              { fontSize: 20, marginTop: 16, color: "#374151" },
            ]}
          >
            ไม่พบข้อมูล
          </Text>
          <Text
            style={[
              globalStyles.text,
              { marginTop: 8, color: "#6B7280", textAlign: "center" },
            ]}
          >
            ขออภัย เนื้อหาที่คุณกำลังมองหาไม่พบ หรือได้ถูกลบออกไปแล้ว
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[
              globalStyles.bgAppColor,
              {
                marginTop: 24,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              },
            ]}
          >
            <Text style={[globalStyles.textBold, { color: "white" }]}>
              กลับไปหน้าก่อน
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return "";
    const start = moment(startDate);
    const end = endDate ? moment(endDate) : null;

    if (end && !start.isSame(end, "day")) {
      return `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`;
    }
    return start.format("D MMM YYYY");
  };

  const getContentTypeInfo = (contentType) => {
    switch (contentType) {
      case "promotion":
        return {
          title: "โปรโมชั่น",
          icon: "local-offer",
          color: "#10B981",
          bgColor: "#ECFDF5",
        };
      case "article":
        return {
          title: "บทความ",
          icon: "article",
          color: "#3B82F6",
          bgColor: "#EFF6FF",
        };
      case "news":
        return {
          title: "ข่าวสาร",
          icon: "newspaper",
          color: "#F59E0B",
          bgColor: "#FFFBEB",
        };
      default:
        return {
          title: "เนื้อหา",
          icon: "description",
          color: "#6B7280",
          bgColor: "#F9FAFB",
        };
    }
  };

  const contentTypeInfo = getContentTypeInfo(data.contentType);
  const dateRange = formatDateRange(data.startDate, data.endDate);

  return (
    <View className="flex-1 bg-white">
      <Header title={contentTypeInfo.title} />

      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Cover Image */}
          <View
            style={{
              paddingHorizontal: 20,
              marginTop: 20,
              marginBottom: 12,
            }}
          >
            <Image
              source={{ uri: data.coverImg }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 16,
              }}
              resizeMode="cover"
            />
            {/* Badge */}
            <View
              style={{
                position: "absolute",
                top: 12,
                left: 32,
                backgroundColor: contentTypeInfo.bgColor,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <MaterialIcons
                name={contentTypeInfo.icon}
                size={16}
                color={contentTypeInfo.color}
              />
              <Text
                style={[
                  globalStyles.textBold,
                  {
                    fontSize: 12,
                    marginLeft: 4,
                    color: contentTypeInfo.color,
                  },
                ]}
              >
                {contentTypeInfo.title}
              </Text>
            </View>
          </View>

          {/* Content Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
            <Text
              style={[
                globalStyles.textBold,
                {
                  fontSize: 24,
                  color: "#1F2937",
                  lineHeight: 32,
                  marginBottom: 12,
                },
              ]}
            >
              {data.title}
            </Text>

            {/* Date Range */}
            {dateRange && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text
                  style={[
                    globalStyles.text,
                    {
                      marginLeft: 6,
                      fontSize: 14,
                      color: "#6B7280",
                    },
                  ]}
                >
                  {dateRange}
                </Text>
              </View>
            )}

            {/* Description */}
            <ContentText
              text={data.content}
              style={[
                globalStyles.text,
                {
                  fontSize: 16,
                  color: "#4B5563",
                  lineHeight: 24,
                  marginBottom: 24,
                },
              ]}
            />
          </View>
        </ScrollView>

        {/* ✅ Footer ติดล่างหน้าจอเสมอ */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: "#F8FAFC",
              borderRadius: 12,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="visibility" size={20} color="#64748B" />
              <Text
                style={[
                  globalStyles.text,
                  { fontSize: 14, marginLeft: 8, color: "#64748B" },
                ]}
              >
                เผยแพร่เมื่อ {moment(data.createdAt).fromNow()}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: data.isActive ? "#10B981" : "#EF4444",
                  marginRight: 6,
                }}
              />
              <Text
                style={[globalStyles.text, { fontSize: 14, color: "#64748B" }]}
              >
                {data.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ContentDetail;
