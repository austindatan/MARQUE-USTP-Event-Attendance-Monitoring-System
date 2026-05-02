// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header_Profile";
import EventCardSL from "../components/Card_EventAttendance";
import Card_Blank from "../components/Card_BlankProfile";
import EmptyCard from "../components/Card_Empty";
import Skeleton_Profile from "../components/Skeleton_Profile";
import SidebarMenu from "../components/SidebarMenu";
import LogoutModal from "../components/LogoutModal";
import styles from "../styles/effects_profile";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { BASE_URL } from "../../config";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";
import NotificationBadge from "../components/NotificationBadge";

const ProfilePage = () => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const hasUnread = useUnreadNotifications();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentNumber, setStudentNumber] = useState(null);
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [tempEmail, setTempEmail] = useState('');

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const toggleMenu = () => setMenuVisible((prev) => !prev);

  const loadStudentNumber = async () => {
    const sn = await AsyncStorage.getItem("student_number");
    setStudentNumber(sn);
  };

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

  const loadAttendance = async () => {
    if (!studentNumber) return;
    try {
      const res = await axios.get(
        `${BASE_URL}/api/student/profile/${studentNumber}/attendance?limit=10`
      );
      setAttendance(res.data.records || []);
    } catch (err) {
      console.log("Error loading attendance:", err);
    }
  };

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
      console.log("Upload error:", err);
      alert("Failed to upload avatar");
    }
  };

  const handleUpdateEmail = async () => {
    if (!studentNumber) return;

    const trimmedEmail = tempEmail.trim();

    // Basic client-side validation
    if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      await axios.put(
        `${BASE_URL}/api/student/profile/${studentNumber}/email`,
        { email: trimmedEmail }
      );

      alert("Email updated successfully!");
      setIsEmailModalVisible(false);
      loadProfile(); // Reload the profile data
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update email.";
      console.log("❌ Email update error:", errorMessage);
      alert(errorMessage);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (studentNumber) {
      await Promise.all([loadProfile(), loadAttendance()]);
    }
    setRefreshing(false);
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

  useEffect(() => {
    if (profile) {
      setTempEmail(profile.email || '');
    }
  }, [profile]);

  if (loading || !profile) {
    return <Skeleton_Profile />;
  }

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

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

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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

          {/* 🚨 MODIFIED: Email Row with Edit Button */}
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.value}>
                {profile.email || 'No email set'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setTempEmail(profile.email || ''); // Set current value before opening
                  setIsEmailModalVisible(true);
                }}
                style={{ marginLeft: 10 }}
              >
                <Ionicons
                  name={profile.email ? "pencil" : "add-circle-outline"}
                  size={20}
                  color="#0A0F51"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Attendance Summary</Text>

        <View style={styles.attendanceCard}>
          <View style={styles.cardContainer}>
            {attendance.length > 0 ? (
              <>
                {attendance.map((log) => {
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
                      organization={log.event?.organization_id?.org_name || "Unknown Org"}
                      orgLogo={{ uri: log.event?.organization_id?.pfp || null }}
                      dateDay={day.toString()}
                      dateMonth={month.toUpperCase()}
                      onPress={() => router.push({ pathname: "/tab_container/EventDetails_Unified", params: { eventId: log.event?.id } })}
                    />
                  );
                })}
                {/* Add blank cards if not divisible by 3 */}
                {attendance.length % 3 !== 0 && (
                  Array.from({ length: 3 - (attendance.length % 3) }).map((_, index) => (
                    <Card_Blank key={`blank-${index}`} />
                  ))
                )}
              </>
            ) : (
              <Text style={{ color: "#fff", padding: 10, fontFamily: "DMSans-Medium" }}>
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

          <TouchableOpacity style={styles.settingItem}
            onPress={() => router.push("/tab_container/Notifications")}>
            <View style={{ position: 'relative' }}>
              <Ionicons name="notifications" size={20} color="#0A0F51" />
              <NotificationBadge show={hasUnread} size={8} top={-2} right={-2} />
            </View>
            <Text style={styles.settingLabel}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="red" />
            <Text style={[styles.settingLabel, { color: "red" }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* 🚨 NEW: Email Edit Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={isEmailModalVisible}
        onRequestClose={() => setIsEmailModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {profile.email ? 'Edit Email' : 'Add Email'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={tempEmail}
              onChangeText={setTempEmail}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setIsEmailModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonSave]}
                onPress={handleUpdateEmail}
              >
                <Text style={styles.textStyle}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <SidebarMenu isVisible={menuVisible} onClose={toggleMenu} />
      </Modal>

      <LogoutModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
      />
    </View>
  );
};

export default ProfilePage;