// EditProfileModal.tsx
// @ts-nocheck
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Image,
} from "react-native";

// Reuse the same styles as ScannerModal / JoinModal
import styles from "../styles/components_joinmodal";

// Replace with your desired icon for profile update success
const EDIT_ICON = require("../../assets/images/marque/MARQUE_whitelogo.png");

const EditProfileModal = ({ visible, onClose, title, message }) => {
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
            <Image 
              source={EDIT_ICON}
              style={styles.iconImage}
            />
          </View>

          {/* Default title if none provided */}
          <Text style={styles.title}>{title || "Profile Updated"}</Text>

          {/* Default message if none provided */}
          <Text style={styles.desc}>
            {message || "Your organization profile has been successfully updated."}
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default EditProfileModal;