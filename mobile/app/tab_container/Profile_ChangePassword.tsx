// @ts-nocheck
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, } from "react-native";
import Header from "../components/Header_Normal";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/effects_profile"

const ChangePasswordPage = ({ navigation }) => {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

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
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={18} color="#0A0F51" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

export default ChangePasswordPage;
