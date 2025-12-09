
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderComponent"; 
import { globalStyles } from "../styles/global";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "../utils/dateUtils";

const SortButton = ({ onPress, title, isActive }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.sortButton,
      isActive ? styles.sortButtonActive : styles.sortButtonInactive,
    ]}
  >
    <Text
      style={[
        globalStyles.text,
        isActive ? styles.sortTextActive : styles.sortTextInactive,
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const TreatmentHistoryDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { appointments, userData } = route.params; // รับข้อมูลที่ส่งมา

  const [sortOption, setSortOption] = useState("date_desc"); // ค่าเริ่มต้น: วันที่ล่าสุดก่อน

  const sortedAppointments = useMemo(() => {
    const sorted = [...appointments];
    switch (sortOption) {
      case "date_asc":
        return sorted.sort(
          (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
        );
      case "price_desc":
        return sorted.sort((a, b) => b.totalPrice - a.totalPrice);
      case "price_asc":
        return sorted.sort((a, b) => a.totalPrice - b.totalPrice);
      case "date_desc":
      default:
        return sorted.sort(
          (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
        );
    }
  }, [appointments, sortOption]);

  const HistoryCard = ({ item }) => (
    <View
      style={[
        globalStyles.boxShadowSm,
        globalStyles.card,
        styles.cardContainer,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[globalStyles.textBold, styles.treatmentName]}>
          {item.treatmentID?.name || "ไม่ระบุการรักษา"}
        </Text>
        <Text style={[globalStyles.textBold, styles.treatmentPrice]}>
          {(item.actualPrice !== undefined &&
          item.actualPrice !== null &&
          !isNaN(Number(item.actualPrice))
            ? Number(item.actualPrice)
            : Number(item.totalPrice)
          ).toLocaleString()}{" "}
          ฿
        </Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={[globalStyles.text, styles.detailText]}>
            {formatDate(item.dateTime)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={[globalStyles.text, styles.detailText]}>
            {item.dateTime
              ? (() => {
                  const d = new Date(item.dateTime);
                  return (
                    d.toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) + " น."
                  );
                })()
              : "ไม่ระบุ"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <Text style={[globalStyles.text, styles.detailText]}>
            ทพ.{" "}
            {item.dentistID?.name
              ? item.dentistID?.name.split(" ").slice(1).join(" ")
              : "ไม่ระบุ"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={[globalStyles.text, styles.detailText]}>
            ห้อง {item.room || "ไม่ระบุ"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Header title="ประวัติการรักษาทั้งหมด" showBackButton={true} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Sort Controls */}
        <View style={styles.sortContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SortButton
              title="ล่าสุดก่อน"
              onPress={() => setSortOption("date_desc")}
              isActive={sortOption === "date_desc"}
            />
            <SortButton
              title="เก่าสุดก่อน"
              onPress={() => setSortOption("date_asc")}
              isActive={sortOption === "date_asc"}
            />
            <SortButton
              title="ราคาสูงสุด"
              onPress={() => setSortOption("price_desc")}
              isActive={sortOption === "price_desc"}
            />
            <SortButton
              title="ราคาต่ำสุด"
              onPress={() => setSortOption("price_asc")}
              isActive={sortOption === "price_asc"}
            />
          </ScrollView>
        </View>

        {/* Treatment List */}
        {sortedAppointments.map((item) => (
          <HistoryCard key={item._id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  sortButtonActive: {
    backgroundColor: "#1D364A",
    borderColor: "#1D364A",
  },
  sortButtonInactive: {
    backgroundColor: "white",
    borderColor: "#E5E7EB",
  },
  sortTextActive: {
    color: "white",
  },
  sortTextInactive: {
    color: "#4B5563",
  },
  cardContainer: {
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
    marginBottom: 12,
  },
  treatmentName: {
    fontSize: 16,
    color: "#111827",
  },
  treatmentPrice: {
    fontSize: 18,
    color: "#10B981", 
  },
  cardBody: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: 8,
    color: "#4B5563",
  },
});

export default TreatmentHistoryDetailScreen;
