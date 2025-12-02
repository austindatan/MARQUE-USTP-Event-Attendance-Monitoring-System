// ScannerButton.tsx
import React from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";

interface ScannerButtonProps {
  onPress?: () => void; // Add optional onPress prop
}

const ScannerButton: React.FC<ScannerButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
      {/* Plus icon as image */}
      <Image
        source={require("../../assets/images/marque/ScannerButton.png")}
        style={styles.plusImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 110,
    right: 25,
    zIndex: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0a0f51",
  },

  plusImage: {
    width: 30,  // adjust to fit your design
    height: 30, // adjust to fit your design
  },
});

export default ScannerButton;