// @ts-nocheck
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import Header from "../components/Header_Normal";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/effects_profile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "../../utils/apiFetch";

import PasswordChangeModal from "../components/Profile_ChangePasswordModal";

const ChangePasswordPage = () => {
  const router = useRouter();

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [studentNumber, setStudentNumber] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const sn = await AsyncStorage.getItem("student_number");
      setStudentNumber(sn);
    };
    loadData();
  }, []);

  const isSaveDisabled = !currentPass || !newPass || newPass !== confirmPass;

  const handleChangePassword = async () => {
    if (isSaveDisabled) {
      setModalTitle("Incomplete Details");
      setModalMessage("Please fill out all fields and make sure passwords match.");
      setModalVisible(true);
      return;
    }

    try {
      const data = await apiFetch(`/api/student/profile/${studentNumber}/change-password`, {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPass,
          new_password: newPass,
        }),
      });

      setModalTitle("Success");
      setModalMessage(data?.message || "Password updated.");
      setModalVisible(true);

      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");

      setTimeout(() => router.back(), 2000);
    } catch (err) {
      console.log("Change password error:", err);
      const msg = err?.message || "Failed to change password. Try again.";

      setModalTitle("Error");
      setModalMessage(msg);
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.containerCh}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Change Password</Text>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.labelCh}>Current Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Enter current password"
              placeholderTextColor="#999"
              value={currentPass}
              onChangeText={setCurrentPass}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.labelCh}>New Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Enter new password"
              placeholderTextColor="#999"
              value={newPass}
              onChangeText={setNewPass}
            />
          </View>

          <View style={styles.inputGroup2}>
            <Text style={styles.label2}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Re-enter new password"
              placeholderTextColor="#999"
              value={confirmPass}
              onChangeText={setConfirmPass}
            />
            {confirmPass.length > 0 && newPass !== confirmPass && (
              <Text style={{ color: "red", marginTop: 5 }}>Passwords do not match.</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            {
              backgroundColor: isSaveDisabled ? "#b5b5b5" : "#0A0F51",
            },
          ]}
          onPress={handleChangePassword}
          disabled={isSaveDisabled}
        >
          <Text style={styles.saveBtnText}>Save Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#0A0F51" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      <PasswordChangeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </View>
  );
};

export default ChangePasswordPage;