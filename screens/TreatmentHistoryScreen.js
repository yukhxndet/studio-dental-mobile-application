import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { fetchAppointments, fetchTreatmentById } from "../apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TreatmentHistoryScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userData } = route.params;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [treatments, setTreatments] = useState({});
  const [sortBy, setSortBy] = useState("date_desc"); // date_desc, date_asc, price_desc, price_asc
  const [filterStatus, setFilterStatus] = useState("all"); // all, completed, cancelled

  useEffect(() => {
    fetchTreatmentHistory();
  }, []);

  const fetchTreatmentHistory = async () => {
    try {
      setLoading(true);
      const userID = await AsyncStorage.getItem("userID");

      if (!userID) {
        Alert.alert("Error", "ไม่พบข้อมูลผู้ใช้");
        return;
      }

      const response = await fetchAppointments(userID);
      const appointmentData = response.data.appointments || [];

      const treatmentPromises = appointmentData.map(async (appointment) => {
        if (appointment.treatmentID && !treatments[appointment.treatmentID]) {
          try {
            const treatmentResponse = await fetchTreatmentById(
              appointment.treatmentID
            );
            return {
              id: appointment.treatmentID,
              data: treatmentResponse.data,
            };
          } catch (error) {
            console.error("Error fetching treatment:", error);
            return null;
          }
        }
        return null;
      });

      const treatmentResults = await Promise.all(treatmentPromises);
      const treatmentMap = {};

      treatmentResults.forEach((result) => {
        if (result) {
          treatmentMap[result.id] = result.data;
        }
      });

      setTreatments(treatmentMap);
      setAppointments(appointmentData);
    } catch (error) {
      console.error("Error fetching treatment history:", error);
      Alert.alert("Error", "ไม่สามารถโหลดประวัติการรักษาได้");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTreatmentHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "ไม่ระบุ";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "ไม่ระบุ";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "ไม่ระบุ";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "ไม่ระบุ";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "เคลียร์แล้ว":
        return "#10B981";
      case "อนุมัติแล้ว":
        return "#3B82F6";
      case "กำลังพิจารณา":
        return "#F59E0B";
      case "ยกเลิก":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "เคลียร์แล้ว":
        return "เสร็จสิ้น";
      case "อนุมัติแล้ว":
        return "อนุมัติแล้ว";
      case "กำลังพิจารณา":
        return "รอพิจารณา";
      case "ยกเลิก":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const sortAppointments = (appointments) => {
    const sorted = [...appointments];
    switch (sortBy) {
      case "date_desc":
        return sorted.sort(
          (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
        );
      case "date_asc":
        return sorted.sort(
          (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
        );
      case "price_desc":
        return sorted.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
      case "price_asc":
        return sorted.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
      default:
        return sorted;
    }
  };

  const filterAppointments = (appointments) => {
    switch (filterStatus) {
      case "completed":
        return appointments.filter((apt) => apt.status === "เคลียร์แล้ว");
      case "cancelled":
        return appointments.filter((apt) => apt.status === "ยกเลิก");
      default:
        return appointments;
    }
  };

  const filteredAndSortedAppointments = sortAppointments(
    filterAppointments(appointments)
  );

  const getTotalAmount = () => {
    return appointments
      .filter((apt) => apt.status === "เคลียร์แล้ว")
      .reduce((sum, apt) => sum + (apt.totalPrice || 0), 0);
  };

  const openAppointmentDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const AppointmentCard = ({ appointment, onPress }) => {
    const treatment = treatments[appointment.treatmentID];
    const statusColor = getStatusColor(appointment.status);

    return (
      <TouchableOpacity
        style={[styles.appointmentCard, { borderLeftColor: statusColor }]}
        onPress={() => onPress(appointment)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.treatmentInfo}>
            <Text style={styles.treatmentName}>
              {treatment?.name || "ไม่ระบุการรักษา"}
            </Text>
            <Text style={styles.appointmentDate}>
              {formatDate(appointment.dateTime)}
            </Text>
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.priceText}>
              ฿{(appointment.totalPrice || 0).toLocaleString()}
            </Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.statusText}>
                {getStatusText(appointment.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.timeText}>
            เวลา: {formatTime(appointment.dateTime)} น.
          </Text>
          <Text style={styles.roomText}>
            ห้อง: {appointment.room || "ไม่ระบุ"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const AppointmentDetailModal = () => {
    if (!selectedAppointment) return null;

    const treatment = treatments[selectedAppointment.treatmentID];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>รายละเอียดการรักษา</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>ข้อมูลการรักษา</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>รายการรักษา:</Text>
                  <Text style={styles.detailValue}>
                    {treatment?.name || "ไม่ระบุ"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>วันที่:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedAppointment.dateTime)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>เวลา:</Text>
                  <Text style={styles.detailValue}>
                    {formatTime(selectedAppointment.dateTime)} น.
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ห้อง:</Text>
                  <Text style={styles.detailValue}>
                    {selectedAppointment.room || "ไม่ระบุ"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ระยะเวลา:</Text>
                  <Text style={styles.detailValue}>
                    {selectedAppointment.duration || "ไม่ระบุ"} นาที
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>สถานะ:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(
                          selectedAppointment.status
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(selectedAppointment.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>ข้อมูลราคา</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ราคาการรักษา:</Text>
                  <Text style={[styles.detailValue, styles.priceHighlight]}>
                    ฿{(selectedAppointment.totalPrice || 0).toLocaleString()}
                  </Text>
                </View>
                {selectedAppointment.actualPrice && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ราคาจริง:</Text>
                    <Text style={[styles.detailValue, styles.priceHighlight]}>
                      ฿{selectedAppointment.actualPrice.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              {selectedAppointment.priceNotes && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>หมายเหตุ</Text>
                  <Text style={styles.notesText}>
                    {selectedAppointment.priceNotes}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const FilterSortBar = () => (
    <View style={styles.filterSortBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === "all" && styles.activeFilter,
          ]}
          onPress={() => setFilterStatus("all")}
        >
          <Text
            style={[
              styles.filterText,
              filterStatus === "all" && styles.activeFilterText,
            ]}
          >
            ทั้งหมด
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === "completed" && styles.activeFilter,
          ]}
          onPress={() => setFilterStatus("completed")}
        >
          <Text
            style={[
              styles.filterText,
              filterStatus === "completed" && styles.activeFilterText,
            ]}
          >
            เสร็จสิ้น
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filterStatus === "cancelled" && styles.activeFilter,
          ]}
          onPress={() => setFilterStatus("cancelled")}
        >
          <Text
            style={[
              styles.filterText,
              filterStatus === "cancelled" && styles.activeFilterText,
            ]}
          >
            ยกเลิก
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => {
          const sortOptions = [
            "date_desc",
            "date_asc",
            "price_desc",
            "price_asc",
          ];
          const currentIndex = sortOptions.indexOf(sortBy);
          const nextIndex = (currentIndex + 1) % sortOptions.length;
          setSortBy(sortOptions[nextIndex]);
        }}
      >
        <Icon name="sort" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>กำลังโหลดประวัติการรักษา...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ประวัติการรักษา</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>การรักษาทั้งหมด</Text>
            <Text style={styles.summaryValue}>{appointments.length} ครั้ง</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>เสร็จสิ้นแล้ว</Text>
            <Text style={styles.summaryValue}>
              {
                appointments.filter((apt) => apt.status === "เคลียร์แล้ว")
                  .length
              }{" "}
              ครั้ง
            </Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>ยอดเงินรวม</Text>
            <Text style={styles.summaryValueHighlight}>
              ฿{getTotalAmount().toLocaleString()}
            </Text>
          </View>
          {userData.treatmentPlans && userData.treatmentPlans.length > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>ยอดคงเหลือ</Text>
              <Text style={styles.summaryValueHighlight}>
                ฿{userData.treatmentPlans[0].remainingBalance.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter & Sort */}
      <FilterSortBar />

      {/* Appointments List */}
      <ScrollView
        style={styles.appointmentsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAndSortedAppointments.length > 0 ? (
          filteredAndSortedAppointments.map((appointment, index) => (
            <AppointmentCard
              key={`${appointment._id}-${index}`}
              appointment={appointment}
              onPress={openAppointmentDetail}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="event-busy" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>ไม่มีประวัติการรักษา</Text>
            <Text style={styles.emptyStateSubtext}>
              เมื่อมีการรักษาแล้ว ประวัติจะแสดงที่นี่
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <AppointmentDetailModal />
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerRight: {
    width: 40,
  },
  summaryCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  filterSortBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeFilter: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
  },
  activeFilterText: {
    color: "#fff",
  },
  sortButton: {
    marginLeft: "auto",
    padding: 8,
  },
  appointmentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  treatmentInfo: {
    flex: 1,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: "#666",
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  roomText: {
    fontSize: 12,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  detailSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  priceHighlight: {
    color: "#007AFF",
    fontWeight: "600",
  },
  notesText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
};

export default TreatmentHistoryScreen;
