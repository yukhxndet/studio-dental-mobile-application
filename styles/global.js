import { StyleSheet, Animated } from "react-native";

export const globalStyles = StyleSheet.create({
  text: {
    fontFamily: "Kanit_400Regular",
  },

  textBold: {
    fontFamily: "Kanit_600SemiBold",
  },

  textLight: {
    fontFamily: "Kanit_300Light",
  },

  borderTextInput: {
    borderColor: "#eaeaea",
    borderWidth: 1,
  },

  textAppColor: {
    color: "#1D364A",
  },

  bgAppColor: {
    backgroundColor: "#1D364A",
  },

  btnOutlineLogin: {
    borderWidth: 1.5,
    borderColor: "#eaeaea",
  },

  bgOptional: {
    backgroundColor: "#86D6DD",
  },

  boxShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,

    elevation: 9,
  },

  boxShadowSm: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 8,
    width: "100%",
  },

  cardXL: {
    backgroundColor: "white",
    borderRadius: 24,
    width: "100%",
  },
});

export const createBlinkingAnimation = () => {
  const opacity = new Animated.Value(1); // Initial value for opacity: 1
  Animated.loop(
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0, // Fade out
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1, // Fade in
        duration: 750,
        useNativeDriver: true,
      }),
    ])
  ).start();
  return opacity;
};

export const localeConfig = {
  locales: {
    th: {
      monthNames: [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กฤกฏาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ],
      monthNamesShort: [
        "ม.ค.",
        "ก.พ.",
        "มี.ค",
        "เม.ย",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ],
      dayNames: [
        "อาทิตย์",
        "จันทร์",
        "อังคาร",
        "พุธ",
        "พฤหัสบดี",
        "ศุกร์",
        "เสาร์",
      ],
      dayNamesShort: ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."],
      today: "วันนี้",
    },
  },
  defaultLocale: "th",
};

Object.assign(localeConfig.locales, localeConfig.locales);
localeConfig.defaultLocale = localeConfig.defaultLocale;
