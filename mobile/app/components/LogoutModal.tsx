// @ts-nocheck
import React from "react";
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import styles from "../styles/components_joinmodal";
const LOGOUT_ICON = require("../../assets/images/marque/MARQUE_whitelogo.png");

const LogoutModal = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.modalBox}>
          <View style={styles.iconContainer}>
            <Image source={LOGOUT_ICON} style={styles.iconImage} />
          </View>

          <Text style={styles.title}>Logged Out</Text>
          <Text style={styles.desc}>You are ready to log out.</Text>
          <Text style={styles.desc}>Choose an action below.</Text>

          <View style={buttonStyles.buttonRow}>
            <TouchableOpacity
              style={[buttonStyles.button, buttonStyles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={buttonStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttonStyles.button, buttonStyles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={buttonStyles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default LogoutModal;

const buttonStyles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#0a0f51",
  },
  confirmButton: {
    backgroundColor: "#fecb20",
  },
  cancelText: {
    color: "white",
    fontSize: 16,
    fontFamily: "DMSans-Bold"
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "DMSans-Bold"
  },
});