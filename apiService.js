import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://172.20.10.3:5001";
const BASE_URL = "http://172.20.10.3:5001/api/forgot-password"; // เปลี่ยนเป็น URL จริง

const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiService.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API call error:", error.response || error.message);
    return Promise.reject(error); // ส่ง Error Object ที่มี response ต่อไป
  }
);

export const fetchUserData = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");
  // 💡 Endpoint: /userdata
  return apiService.get("/userdata");
};

export const getUserDataByToken = async () => {
  return fetchUserData();
};

export const loginUser = (userData) => {
  return apiService.post("/login", userData);
};
export const signupUser = (userData) => {
  return apiService.post("/signup", userData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const fetchTreatments = () => {
  return apiService.get("/get-treatments");
};

// export const fetchAvailableTimes = () => {
//   return apiService.get('/get-available-times');
// };

export const fetchAvailableTimes = (dentistID, date) => {
  return apiService.get("/get-available-times", {
    params: {
      dentistID: dentistID,
      date: date,
    },
  });
};

export const fetchAvailableTimeSlots = (treatmentID, selectedDate) => {
  return apiService.post("/available-timeslots", {
    treatmentID,
    selectedDate,
  });
};

export const createAppointment = (appointmentData) => {
  return apiService.post("/api/appointments", appointmentData);
};

export const fetchAppointments = async (userID) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    return apiService.post("/api/appointments/user", { userID, token });
  }
  throw new Error("No token found");
};

export const fetchTreatmentById = async (id) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    return apiService.get(`/api/treatment/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  throw new Error("No token found");
};

export const fetchAvailableRooms = (treatmentID) => {
  return apiService.get(`/get-available-rooms/${treatmentID}`);
};

export const fetchDentistSchedule = (dentistID) => {
  return apiService.get(`/get-dentist-schedule/${dentistID}`);
};

export const fetchDentistsForTreatment = (treatmentID) => {
  return apiService.get(`/get-dentists-for-treatment/${treatmentID}`);
};

export const fetchDentistByID = async (dentistID) => {
  const response = await apiService.get(`/get-dentist/${dentistID}`);
  return response.data; // คืนข้อมูลทันตแพทย์ (object) ตรงนี้
};

export const fetchDentistScheduleByID = (dentistID) => {
  return apiService.get(`/get-dentist-schedule/${dentistID}`);
};

export const fetchDelayForToday = () => {
  return apiService.get("/api/delay/today");
};

export const createUser = (userData) => {
  return apiService.post("/signup", userData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const googleAuth = (userData) => {
  return apiService.post("/api/auth/google", userData);
};



export const checkUserExists = (email) => {
  return apiService.post("/api/auth/check-email", { email });
};

export const sendOtpToEmail = async (email) => {
  const res = await fetch(`${BASE_URL}/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return await res.json();
};

export const sendOtpToVeryfy = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/send-verify`, { email });
    return response.data;
  } catch (error) {
    console.error("Send OTP for email verification failed:", error);
    return { status: "error", message: "เกิดข้อผิดพลาด" };
  }
};

export const verifyOtp = async (email, otp) => {
  const res = await fetch(`${BASE_URL}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return await res.json();
};

export const resetPassword = async (email, newPassword) => {
  const res = await fetch(`${BASE_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  });
  return await res.json();
};

export const fetchNotificationsByUserId = async (userId) => {
  return apiService.get(`/notifications/${userId}`);
};

export const fetchUnreadNotificationCount = (userId) => {
  return apiService.get(`/api/notifications/unread-count/${userId}`);
};

export const markAllNotificationsAsRead = async (userId) => {
  return apiService.put(`/notifications/mark-read/${userId}`);
};

export const checkSlotAvailable = async ({
  dentistID,
  date,
  startTime,
  duration,
}) => {
  const res = await apiService.post("/check-slot-available", {
    dentistID,
    date,
    startTime,
    duration,
  });
  return res.data;
};

export const fetchAppointmentsForDate = async (dentistID, selectedDate) => {
  const res = await apiService.get(`/get-appointments-for-date`, {
    params: {
      dentistID,
      date: selectedDate,
    },
  });
  return res.data;
};

export const updateUserProfile = async (data) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  return apiService.put("/update-profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changePassword = async (currentPassword, newPassword) => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");

  return apiService.put(
    "/api/user/change-password",
    { currentPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // ✅ สำคัญมาก
      },
    }
  );
};

export const getRescheduleAppointment = (appointmentId) => {
  return apiService.get(`/api/appointments/reschedule/${appointmentId}`);
};

export const rescheduleAppointment = (appointmentId, data) => {
  return apiService.put(`/api/appointments/reschedule/${appointmentId}`, data);
};

export const fetchRubberColors = () => apiService.get("/api/rubber-color");
export const updateRubberColorStock = (id, delta) =>
  apiService.put(`/api/rubber-color/${id}/stock`, { delta });
export const fetchTopRubberColorUsage = () =>
  apiService.get("/api/rubber-color/top-usage");

export const fetchContentList = (type) => {
  return apiService.get(`/api/content${type ? "?type=" + type : ""}`);
};
export const fetchContentById = (id) => {
  return apiService.get(`/api/content/${id}`);
};

export const fetchNews = () => apiService.get("/api/content?type=news");
export const fetchArticles = () => apiService.get("/api/content?type=article");

export default apiService;
