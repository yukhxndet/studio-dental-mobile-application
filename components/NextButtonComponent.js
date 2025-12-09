import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const NextButton = ({ onPress, disabled }) => {
  return (
    <TouchableOpacity
    className="mt-2"
      style={[styles.button, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>ถัดไป</Text>
    </TouchableOpacity>
  );
};

{/* <TouchableOpacity   style={[globalStyles.bgAppColor]} className="py-3 mt-3 rounded-lg">
                <Text className="text-white text-center" style={[globalStyles.textBold]}></Text> */}
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1D364A',
    paddingVertical: 12,
    borderRadius: 8,
    
  },
  disabledButton: {
    backgroundColor: '#C7C7C7', 
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Kanit_600SemiBold'
  },
});

export default NextButton;
