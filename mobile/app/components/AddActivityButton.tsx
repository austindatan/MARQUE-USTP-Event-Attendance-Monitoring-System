// AddActivityButton.tsx
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const AddActivityButton = () => {
  return (
    <TouchableOpacity style={styles.floatingButton}>
      {/* Inner outlined circle */}
      <View style={styles.innerCircle} />

      {/* Plus icon using two Views */}
      <View style={styles.plusHorizontal} />
      <View style={styles.plusVertical} />
    </TouchableOpacity>
  );
};

const plusSize = 23; // size of the plus
const plusThickness = 4; // thickness of the lines

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 25,
    zIndex: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#0a0f51",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },

  innerCircle: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: "#0a0f51",
  },

  // Horizontal part of plus
  plusHorizontal: {
    position: "absolute",
    width: plusSize,
    height: plusThickness,
    backgroundColor: "#0a0f51",
    borderRadius: plusThickness / 2, // makes the ends rounded
  },

  // Vertical part of plus
  plusVertical: {
    position: "absolute",
    width: plusThickness,
    height: plusSize,
    backgroundColor: "#0a0f51",
    borderRadius: plusThickness / 2, // rounded ends
  },
});

export default AddActivityButton;