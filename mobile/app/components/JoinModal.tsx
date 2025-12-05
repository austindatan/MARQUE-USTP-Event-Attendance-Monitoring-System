// @ts-nocheck
import React from "react";
import { Modal, View, Text, Pressable, Image, } from "react-native";

import styles from "../styles/components_joinmodal";

const SPYGLASS_ICON = require("../../assets/images/marque/MARQUE_whitelogo.png");

const JoinModal = ({ visible, onClose }) => {
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
              source={SPYGLASS_ICON}
              style={styles.iconImage}
            />
          </View>

          <Text style={styles.title}>Join Request Sent</Text>
          <Text style={styles.desc}>
            Please wait for the organizer's approval.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default JoinModal;
