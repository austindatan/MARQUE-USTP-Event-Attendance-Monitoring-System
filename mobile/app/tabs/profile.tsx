// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header_Profile";
import EventCardSL from "../components/Card_EventAttendance";
import SidebarMenu from "../components/SidebarMenu";
import LogoutModal from "../components/LogoutModal"; // import modal
import styles from "../styles/effects_profile";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { BASE_URL } from "../../config";

const ProfilePage = () => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  // states
  const [loading, setLoading] = useState(true);
  const [studentNumber, setStudentNumber] = useState(null);
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);

  // logout modal state
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const toggleMenu = () => setMenuVisible((prev) => !prev);

  // fetch logged in user
  const loadStudentNumber = async () => {
    const sn = await AsyncStorage.getItem("student_number");
    setStudentNumber(sn);
  };

  // fetch profile
  const loadProfile = async () => {
    if (!studentNumber) return;
    try {
      const res = await axios.get(
        `${BASE_URL}/api/student/profile/${studentNumber}`
      );
      setProfile(res.data);
    } catch (err) {
      console.log("Error loading profile:", err);
    }
  };

  // fetch attendance logs
  const loadAttendance = async () => {
    if (!studentNumber) return;
    try {
      const res = await axios.get(
        `${BASE_URL}/api/student/profile/${studentNumber}/attendance?limit=10`
      );
      setAttendance(res.data.records || []);
    } catch (err) {
      console.log("❌ Error loading attendance:", err);
    }
  };

  // upload profile image
  const uploadAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert("Allow access to your photos to change your avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled) return;

      const image = result.assets[0];
      const form = new FormData();
      form.append("profile_image", {
        uri: image.uri,
        name: "profile.png",
        type: "image/png",
      });

      await axios.post(
        `${BASE_URL}/api/student/profile/${studentNumber}/upload-photo`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Avatar updated!");
      loadProfile();
    } catch (err) {
      console.log("❌ Upload error:", err);
      alert("Failed to upload avatar");
    }
  };

  useEffect(() => {
    loadStudentNumber();
  }, []);

  useEffect(() => {
    if (studentNumber) {
      loadProfile();
      loadAttendance();
      setLoading(false);
    }
  }, [studentNumber]);

  if (loading || !profile) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading profile...</Text>
      </View>
    );
  }

  // show logout modal instead of automatic logout
  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  // called when user presses OK on logout modal
  const confirmLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`);
      await AsyncStorage.clear();
      setLogoutModalVisible(false);
      router.replace("/login");
    } catch (err) {
      console.log("Logout error:", err);
      setLogoutModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header onMenuPress={toggleMenu} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: profile?.profile_image }}
            style={styles.profileImage}
          />

          <Text style={styles.name}>
            {profile.firstname} {profile.lastname}
          </Text>

          <Text style={styles.department}>{profile.college_name}</Text>
          <Text style={styles.course}>{profile.department_name}</Text>
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.row}>
            <Text style={styles.label}>Student ID</Text>
            <Text style={styles.value}>{profile.student_number}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profile.email}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Attendance Summary</Text>

        <View style={styles.attendanceCard}>
          <View style={styles.cardContainer}>
            {attendance.length > 0 ? (
              attendance.map((log) => {
                const date = new Date(log.event?.date);
                const day = date.getDate();
                const month = date.toLocaleString("en-US", { month: "short" });

                const eventImageSource =
                  log.event?.images?.length > 0
                    ? { uri: log.event.images[0] }
                    : { uri: "placeholder-image-uri" };

                return (
                  <EventCardSL
                    key={log.attendance_log_id}
                    image={eventImageSource}
                    title={log.event?.name || log.event?.event_name || "No Title"}
                    dateDay={day.toString()}
                    dateMonth={month.toUpperCase()}
                  />
                );
              })
            ) : (
              <Text style={{ color: "#000", padding: 10 }}>
                No attendance logs found.
              </Text>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.settingsBlock}>
          <TouchableOpacity style={styles.settingItem} onPress={uploadAvatar}>
            <Ionicons name="create" size={20} color="#0A0F51" />
            <Text style={styles.settingLabel}>Change Avatar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/tab_container/Profile_ChangePassword")}
          >
            <Ionicons name="lock-closed" size={20} color="#0A0F51" />
            <Text style={styles.settingLabel}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications" size={20} color="#0A0F51" />
            <Text style={styles.settingLabel}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="red" />
            <Text style={[styles.settingLabel, { color: "red" }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* SIDE MENU */}
      <Modal
        animationType="fade"
        transparent
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <SidebarMenu isVisible={menuVisible} onClose={toggleMenu} />
      </Modal>

      {/* LOGOUT MODAL */}
      <LogoutModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout} // OK button triggers confirmLogout
      />
    </View>
  );
};

export default ProfilePage;