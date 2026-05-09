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
  ActivityIndicator,
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
import { apiFetch, apiFetchForm } from "../../utils/apiFetch";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";
import NotificationBadge from "../components/NotificationBadge";
import joinModalStyles from "../styles/components_joinmodal";

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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarSuccessVisible, setAvatarSuccessVisible] = useState(false);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);
  const [emailUpdating, setEmailUpdating] = useState(false);
  const [emailSuccessVisible, setEmailSuccessVisible] = useState(false);
  const [emailErrorVisible, setEmailErrorVisible] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");

  const toggleMenu = () => setMenuVisible((prev) => !prev);

  const loadStudentNumber = async () => {
    const sn = await AsyncStorage.getItem("student_number");
    setStudentNumber(sn);
  };

  const loadProfile = async () => {
    if (!studentNumber) return;
    try {
      const data = await apiFetch(`/api/student/profile/${studentNumber}`);
      setProfile(data);
    } catch (err) {
      console.log("Error loading profile:", err);
    }
  };

  const loadAttendance = async () => {
    if (!studentNumber) return;
    try {
      const data = await apiFetch(`/api/student/profile/${studentNumber}/attendance?limit=10`);
      setAttendance(data.records || []);
    } catch (err) {
      console.log("Error loading attendance:", err);
    }
  };

  const uploadAvatar = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setSessionExpiredVisible(true);
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert("Allow access to your photos to change your avatar.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images,
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

      setAvatarUploading(true);
      await apiFetchForm(
        "POST",
        `/api/student/profile/${studentNumber}/upload-photo`,
        form
      );

      setAvatarSuccessVisible(true);
      loadProfile();
    } catch (err) {
      console.log("Upload error:", err);
      if (err?.message?.toLowerCase?.().includes("unauthorized")) {
        setSessionExpiredVisible(true);
        return;
      }
      alert("Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
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
      setEmailUpdating(true);
      await apiFetch(`/api/student/profile/${studentNumber}/email`, {
        method: "PUT",
        body: JSON.stringify({ email: trimmedEmail }),
      });

      setIsEmailModalVisible(false);
      setEmailSuccessVisible(true);
      setIsEmailModalVisible(false);
      loadProfile(); // Reload the profile data
    } catch (err) {
      const errorMessage = err?.message || "Failed to update email.";
      console.log("Email update error:", errorMessage);
      if (errorMessage.toLowerCase().includes("unauthorized")) {
        setSessionExpiredVisible(true);
        return;
      }
      setEmailErrorMessage(errorMessage);
      setEmailErrorVisible(true);
    } finally {
      setEmailUpdating(false);
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
      await apiFetch(`/api/auth/logout`, { method: "POST" });
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

      {/* Email edit modal (same design) */}
      <Modal
        visible={isEmailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEmailModalVisible(false)}
      >
        <TouchableOpacity
          style={joinModalStyles.overlay}
          onPress={() => setIsEmailModalVisible(false)}
          activeOpacity={1}
        >
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image
                source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
                style={joinModalStyles.iconImage}
              />
            </View>

            <Text style={joinModalStyles.title}>
              {profile.email ? "Edit Email" : "Add Email"}
            </Text>

            <View style={{ width: "100%", marginTop: 10 }}>
              <TextInput
                style={{
                  height: 44,
                  borderColor: "#ddd",
                  borderWidth: 1,
                  borderRadius: 10,
                  width: "100%",
                  paddingHorizontal: 12,
                  backgroundColor: "#f9f9f9",
                  fontFamily: "DMSans-Regular",
                }}
                placeholder="Enter your email address"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={tempEmail}
                onChangeText={setTempEmail}
              />
            </View>

            <View style={{ flexDirection: "row", marginTop: 18, width: "100%" }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#0a0f51",
                  paddingVertical: 12,
                  borderRadius: 25,
                  alignItems: "center",
                  marginRight: 6,
                }}
                onPress={() => setIsEmailModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#fecb20",
                  paddingVertical: 12,
                  borderRadius: 25,
                  alignItems: "center",
                  marginLeft: 6,
                }}
                onPress={handleUpdateEmail}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Email updating (blocks interaction) */}
      <Modal visible={emailUpdating} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={joinModalStyles.overlay}>
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image
                source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
                style={joinModalStyles.iconImage}
              />
            </View>
            <Text style={joinModalStyles.title}>Updating</Text>
            <Text style={joinModalStyles.desc}>Saving your email address…</Text>
            <View style={{ marginTop: 18 }}>
              <ActivityIndicator size="large" color="#0A0F51" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Email success */}
      <Modal
        visible={emailSuccessVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEmailSuccessVisible(false)}
      >
        <TouchableOpacity
          style={joinModalStyles.overlay}
          onPress={() => setEmailSuccessVisible(false)}
          activeOpacity={1}
        >
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image
                source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
                style={joinModalStyles.iconImage}
              />
            </View>
            <Text style={joinModalStyles.title}>Email Updated</Text>
            <Text style={joinModalStyles.desc}>Your email has been saved.</Text>
            <View style={{ marginTop: 20, width: "100%" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#fecb20",
                  paddingVertical: 12,
                  borderRadius: 25,
                  alignItems: "center",
                }}
                onPress={() => setEmailSuccessVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Email error */}
      <Modal
        visible={emailErrorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEmailErrorVisible(false)}
      >
        <TouchableOpacity
          style={joinModalStyles.overlay}
          onPress={() => setEmailErrorVisible(false)}
          activeOpacity={1}
        >
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image
                source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
                style={joinModalStyles.iconImage}
              />
            </View>
            <Text style={joinModalStyles.title}>Update Failed</Text>
            <Text style={joinModalStyles.desc}>{emailErrorMessage || "Failed to update email."}</Text>
            <View style={{ marginTop: 20, width: "100%" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#0a0f51",
                  paddingVertical: 12,
                  borderRadius: 25,
                  alignItems: "center",
                }}
                onPress={() => setEmailErrorVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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

      {/* Avatar upload loading (blocks interaction) */}
      <Modal visible={avatarUploading} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={joinModalStyles.overlay}>
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image source={require("../../assets/images/marque/MARQUE_whitelogo.png")} style={joinModalStyles.iconImage} />
            </View>
            <Text style={joinModalStyles.title}>Uploading</Text>
            <Text style={joinModalStyles.desc}>Please wait while we update your avatar.</Text>
            <View style={{ marginTop: 18 }}>
              <ActivityIndicator size="large" color="#0A0F51" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Avatar upload success (same design as logout modal) */}
      <Modal
        visible={avatarSuccessVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarSuccessVisible(false)}
      >
        <TouchableOpacity
          style={joinModalStyles.overlay}
          onPress={() => setAvatarSuccessVisible(false)}
          activeOpacity={1}
        >
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image source={require("../../assets/images/marque/MARQUE_whitelogo.png")} style={joinModalStyles.iconImage} />
            </View>

            <Text style={joinModalStyles.title}>Avatar Changed</Text>
            <Text style={joinModalStyles.desc}>Your new avatar has been saved.</Text>

            <View style={{ marginTop: 20, width: "100%" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#fecb20",
                  paddingVertical: 12,
                  borderRadius: 25,
                  alignItems: "center",
                }}
                onPress={() => setAvatarSuccessVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Session expired (same design) */}
      <Modal
        visible={sessionExpiredVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSessionExpiredVisible(false)}
      >
        <TouchableOpacity
          style={joinModalStyles.overlay}
          onPress={() => setSessionExpiredVisible(false)}
          activeOpacity={1}
        >
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image
                source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
                style={joinModalStyles.iconImage}
              />
            </View>

            <Text style={joinModalStyles.title}>Session Expired</Text>
            <Text style={joinModalStyles.desc}>Please log in again to continue.</Text>

            <View style={{ marginTop: 20, width: "100%" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#0a0f51",
                  paddingVertical: 12,
                  borderRadius: 25,
                  alignItems: "center",
                }}
                onPress={async () => {
                  setSessionExpiredVisible(false);
                  await AsyncStorage.clear();
                  router.replace("/login");
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>
                  Go to Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ProfilePage;