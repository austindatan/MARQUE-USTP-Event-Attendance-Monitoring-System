// @ts-nocheck
import React, { useEffect } from "react";
import { Modal, View, Text, Pressable, Image } from "react-native";
import styles from "../styles/components_joinmodal";

// Replace with your desired icon
const SUCCESS_ICON = require("../../assets/images/marque/MARQUE_whitelogo.png");

const PasswordChangeModal = ({ visible, onClose, title, message }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose(); // auto-close after 2 seconds
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.modalBox}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.iconContainer}>
            <Image source={SUCCESS_ICON} style={styles.iconImage} />
          </View>

          <Text style={styles.title}>{title || "Success!"}</Text>

          <Text style={styles.desc}>
            {message || "Your password has been changed successfully."}
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default PasswordChangeModal;