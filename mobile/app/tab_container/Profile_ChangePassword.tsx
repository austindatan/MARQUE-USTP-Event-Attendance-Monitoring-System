// @ts-nocheck
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import Header from "../components/Header_Normal";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/effects_profile";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config";

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

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const getStrengthLabel = (score) => {
    switch (score) {
      case 0:
      case 1:
        return { text: "Weak", color: "#FF4D4D" };
      case 2:
        return { text: "Fair", color: "#FFB84D" };
      case 3:
        return { text: "Strong", color: "#4DA6FF" };
      case 4:
        return { text: "Very Strong", color: "#33CC66" };
      default:
        return { text: "Weak", color: "#FF4D4D" };
    }
  };

  const strengthScore = getPasswordStrength(newPass);
  const strength = getStrengthLabel(strengthScore);

  const isSaveDisabled = strengthScore < 2 || newPass !== confirmPass || !currentPass;

  const handleChangePassword = async () => {
    if (isSaveDisabled) {
      setModalTitle("Weak Password");
      setModalMessage("New password must be at least FAIR or higher.");
      setModalVisible(true);
      return;
    }

    try {
      const res = await axios.put(
        `${BASE_URL}/api/student/profile/${studentNumber}/change-password`,
        {
          current_password: currentPass,
          new_password: newPass,
        }
      );

      setModalTitle("Success");
      setModalMessage(res.data.message);
      setModalVisible(true);

      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");

      setTimeout(() => router.back(), 2000);
    } catch (err) {
      console.log("❌ Change password error:", err);
      const msg = err.response?.data?.message || "Failed to change password. Try again.";

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

            {newPass.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <View
                  style={{
                    height: 8,
                    borderRadius: 8,
                    backgroundColor: "#ddd",
                    overflow: "hidden",
                    marginBottom: 4,
                  }}
                >
                  <View
                    style={{
                      width: `${(strengthScore / 4) * 100}%`,
                      height: "100%",
                      backgroundColor: strength.color,
                    }}
                  />
                </View>

                <Text style={{ color: strength.color, fontWeight: "600" }}>
                  {strength.text}
                </Text>
              </View>
            )}
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