//@ts-nocheck
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../../config";
import NotificationCardEvent from "../components/Card_NotificationEvent";
import NotificationCardOrg from "../components/Card_NotificationOrg";
import Header from "../components/Header_Normal";
import styles from "../styles/components_bookmark";

const NotificationsScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentObjectId, setStudentObjectId] = useState(null);

  useEffect(() => {
    loadUserIdAndNotifications();
  }, []);

  const loadUserIdAndNotifications = async () => {
    try {
      const storedObjectId = await AsyncStorage.getItem("student_number");
      console.log("AsyncStorage 'student_id':", storedObjectId);
      if (storedObjectId) {
        setStudentObjectId(storedObjectId);
        fetchNotifications(storedObjectId);
      } else {
        setLoading(false);
        Alert.alert("Error", "User ID not found. Cannot load notifications.");
      }
    } catch (error) {
      console.error("Error loading user ID:", error);
      setLoading(false);
    }
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffInSeconds = Math.floor((now - created) / 1000);
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    return created.toLocaleDateString();
  };

  const calculateTimeStatus = (eventDate, notificationTitle = "") => {
    const now = new Date();
    const eventTime = new Date(eventDate);
    const diffInMs = eventTime - now;
    const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.ceil(diffInHours / 24);

    if (diffInMs < 0) return "This event has concluded";

    if (notificationTitle.toLowerCase().includes("new event")) {
      if (diffInDays > 1) return `New exciting event: ${diffInDays} days from now`;
      if (diffInDays === 1) return `New exciting event: 1 day from now`;
      if (diffInHours > 0) return `New exciting event: ${diffInHours} hours from now`;
      return `New exciting event: Starting soon!`;
    }

    if (diffInHours <= 0) return "Starting now!";
    if (diffInHours <= 24) return `Starts in ${diffInHours} more hour${diffInHours > 1 ? "s" : ""}`;
    return `Starts in ${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
  };

  const fetchNotifications = async (studentObjectId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/notifications/${studentObjectId}`);
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      Alert.alert("Error", "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(`${BASE_URL}/api/notifications/read/${notificationId}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleRoleAction = async (notificationId, action) => {
    const studentNumberForAction = await AsyncStorage.getItem("student_number");
    if (!studentNumberForAction) {
      Alert.alert("Error", "Student Number is missing for action.");
      return;
    }
    try {
      const endpoint = `${BASE_URL}/api/notifications/${action}`;
      await axios.post(endpoint, {
        notification_id: notificationId,
        user_id: studentNumberForAction
      });
      Alert.alert("Success", `Invite ${action}ed.`);
      loadUserIdAndNotifications();
    } catch (error) {
      const errorMessage = error.response?.data?.message || `Failed to ${action} invite.`;
      Alert.alert("Error", errorMessage);
    }
  };

  const handleClearRead = async () => {
    Alert.alert(
      "Clear History",
      "Delete all read notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const studentNumber = await AsyncStorage.getItem("student_number");
              if (!studentNumber) return;
              await axios.delete(`${BASE_URL}/api/notifications/read/${studentNumber}`);
              setNotifications(prev => prev.filter(n => !n.is_read));
            } catch (err) {
              console.error("Error clearing notifications:", err);
              Alert.alert("Error", "Failed to clear notifications");
            }
          }
        }
      ]
    );
  };

  const renderNotificationCard = (notification) => {
    const orgName = notification.organization_id?.org_name || "Unknown Organization";
    const orgLogo = notification.organization_id?.pfp ? { uri: notification.organization_id.pfp } : null;
    const key = notification._id;
    const timeAgo = formatRelativeTime(notification.createdAt);

    if (notification.type === "event" && notification.event_id) {
      const eventData = notification.event_id;
      const eventImage = eventData?.event_image ? { uri: eventData.event_image } : null;
      const timeStatus = calculateTimeStatus(eventData.start_time || eventData.event_date, notification.title);
      const showConfirmation = notification.title.includes("Confirmation") || notification.title.includes("Registered") || notification.title.includes("Confirmed");
      return (
        <TouchableOpacity
          key={key}
          onPress={() => {
            handleMarkAsRead(notification._id);
            if (notification.type === "event" && notification.event_id) {
              // router.push to event details
              router.push({
                pathname: "/tab_container/EventDetails_Unified",
                params: { eventId: eventData._id }
              });
            }
          }}
          style={{ opacity: notification.is_read ? 0.7 : 1 }}
        >
          <NotificationCardEvent
            eventImage={eventImage}
            eventName={eventData?.event_name || notification.title}
            orgLogo={orgLogo}
            orgName={orgName}
            timeStatus={timeStatus}
            message={notification.message}
            timeAgo={timeAgo}
            showConfirmation={showConfirmation}
          />
        </TouchableOpacity>
      );
    }

    if (["invite", "role_change", "announcement"].includes(notification.type)) {
      const showRoleActions = notification.type === "invite" && (notification.status === "pending" || notification.status === "info" || !notification.status);
      return (
        <TouchableOpacity
          key={key}
          // Disabled as per user request: "ONLY event card should be clickable"
          disabled={true}
          style={{ opacity: notification.is_read ? 0.5 : 1 }}
        >
          <NotificationCardOrg
            orgLogo={orgLogo}
            orgName={orgName}
            message={notification.message}
            showRoleActions={showRoleActions}
            onAcceptRole={() => handleRoleAction(notification._id, "accept")}
            onDenyRole={() => handleRoleAction(notification._id, "decline")}
            timeAgo={timeAgo}
            status={notification.status}
            role={notification.role}
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#0A0F51" />
          <Text style={styles.backText}>Notifications</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#0A0F51" style={{ marginTop: 50 }} />
        ) : notifications.length === 0 ? (
          <Text style={localStyles.emptyText}>You're all caught up! No new notifications.</Text>
        ) : (
          <>
            {unreadNotifications.length > 0 && (
              <>
                <Text style={localStyles.heading}>Recent Activity</Text>
                {unreadNotifications.map(renderNotificationCard)}
              </>
            )}

            {readNotifications.length > 0 && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 }}>
                  <Text style={[localStyles.heading, { marginBottom: 0, marginTop: 0 }]}>Past Activity</Text>
                  <TouchableOpacity onPress={handleClearRead}>
                    <Ionicons name="trash-outline" size={20} color="#FF4444" />
                  </TouchableOpacity>
                </View>
                {readNotifications.map(renderNotificationCard)}
              </>
            )}
          </>
        )}

        <View style={{ height: 130 }} />
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  heading: {
    fontSize: 20,
    fontFamily: "DMSans-Bold",
    color: "#0A0F51",
    marginBottom: 15,
    marginTop: 10
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
    fontFamily: "DMSans-Regular"
  }
});

export default NotificationsScreen;