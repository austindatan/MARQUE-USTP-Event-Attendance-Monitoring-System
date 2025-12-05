import React from "react";
import { StyleSheet, TouchableOpacity, View, GestureResponderEvent } from "react-native";

interface Props {
  onPress?: (event: GestureResponderEvent) => void;
}

const AddActivityButton: React.FC<Props> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
      <View style={styles.innerCircle} />

      <View style={styles.plusHorizontal} />
      <View style={styles.plusVertical} />
    </TouchableOpacity>
  );
};

const plusSize = 23;
const plusThickness = 4;

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

  plusHorizontal: {
    position: "absolute",
    width: plusSize,
    height: plusThickness,
    backgroundColor: "#0a0f51",
    borderRadius: plusThickness / 2,
  },

  plusVertical: {
    position: "absolute",
    width: plusThickness,
    height: plusSize,
    backgroundColor: "#0a0f51",
    borderRadius: plusThickness / 2,
  },
});

export default AddActivityButton;
