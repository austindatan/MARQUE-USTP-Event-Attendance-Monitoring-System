// @ts-nocheck
import React from "react";
import { Modal, View, Text, Pressable, Image, } from "react-native";
import styles from "../styles/components_joinmodal";

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

          <Text style={styles.title}>{title || "Profile Updated"}</Text>

          <Text style={styles.desc}>
            {message || "Your organization profile has been successfully updated."}
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default EditProfileModal;