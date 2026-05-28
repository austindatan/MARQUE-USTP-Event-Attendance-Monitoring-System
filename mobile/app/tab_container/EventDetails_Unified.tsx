// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/page_eventdetails";
import { BASE_URL, CLOUD_NAME } from "../../config";
import axios from "axios";
import FeedbackComments from "../components/FeedbackComments";
import Skeleton_EventDetails from "../components/Skeleton_EventDetails";
import { apiFetch } from "../../utils/apiFetch";
import joinModalStyles from "../styles/components_joinmodal";
import {
  addGateStatusListener,
  getSocket,
  removeGateStatusListener,
  subscribeToEvent,
  unsubscribeFromEvent,
} from "../../utils/socket";

const fixCloudinaryUrl = (url, cloudName) => {
  if (!url || url.startsWith("http")) return url;
  const path = url.replace(/ /g, "%20");
  if (path.includes(cloudName)) return `https://${path}`;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${path}`;
};

const determineEventStatus = (eventData) => {
  // CRITICAL: This is already protected, but the code calling it needs to be protected too.
  if (!eventData || !eventData.event_date) return 'unknown';
  const now = new Date();
  const eventDate = new Date(eventData.event_date);
  const startTime = eventData.start_time ? new Date(eventData.start_time) : null;
  const endTime = eventData.end_time ? new Date(eventData.end_time) : null;
  const requiresManualAttendance = eventData.requiresManualAttendance;

  if (eventData.status === "Cancelled") return "cancelled";
  if (now < eventDate) return 'upcoming';
  else if (endTime && now > endTime) return 'concluded';
  else if (now >= eventDate) return requiresManualAttendance ? 'no-attendance' : 'ongoing';
  return 'concluded';
};

const EventDetails_Unified = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawEventId = params.eventId;
  const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;
  const STICKY_HEADER_HEIGHT = 90;

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [eventStatus, setEventStatus] = useState('loading');
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [userId, setUserId] = useState(null);
  const [feedbackComments, setFeedbackComments] = useState([]);
  const [feedbackSubmittedModalVisible, setFeedbackSubmittedModalVisible] = useState(false);
  const fetchStudentId = async () => {
    try {
      const studentNumber = await AsyncStorage.getItem("student_number");
      if (!studentNumber) return null;
      const res = await fetch(`${BASE_URL}/api/student/id/${studentNumber}`);
      if (!res.ok) return null;
      const data = await res.json();
      setUserId(data._id);
      return data._id;
    } catch (e) { console.error("Error fetching user ID:", e); return null; }
  };

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(true);

  const [photoProofStatus, setPhotoProofStatus] = useState(null);
  const [attendanceLogId, setAttendanceLogId] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);

  /** ================= BOOKMARKS ================= */
  const checkBookmarkStatus = async () => {
    if (!eventId) return;
    setBookmarkLoading(true);
    const student_number = await AsyncStorage.getItem("student_number");
    if (!student_number) { setBookmarkLoading(false); return; }
    try {
      const res = await axios.get(`${BASE_URL}/api/bookmarks/check/${student_number}/${eventId}`);
      setIsBookmarked(res.data.isBookmarked);
    } catch (err) { console.error("Error checking bookmark status:", err.message); }
    finally { setBookmarkLoading(false); }
  };

  const handleBookmarkToggle = async () => {
    if (bookmarkLoading || !eventId) return;
    const actionToAdd = !isBookmarked;
    setBookmarkLoading(true);
    const student_number = await AsyncStorage.getItem("student_number");
    if (!student_number) { Alert.alert("Error", "Student login info not found."); setBookmarkLoading(false); return; }
    try {
      if (!actionToAdd) {
        await apiFetch(`/api/bookmarks/${student_number}/${eventId}`, { method: "DELETE" });
      } else {
        await apiFetch(`/api/bookmarks/${student_number}`, {
          method: "POST",
          body: JSON.stringify({ event_id: eventId }),
        });
      }
      setIsBookmarked(actionToAdd);
    } catch (err) {
      const errorMessage = err?.message || `Failed to ${actionToAdd ? 'add' : 'remove'} bookmark.`;
      console.error(`Bookmark Toggle Error: ${errorMessage}`, err);
      Alert.alert("Action Failed", errorMessage);
      checkBookmarkStatus();
    } finally { setBookmarkLoading(false); }
  };

  /** ================= FETCH EVENT ================= */
  const fetchEventDetails = async (id) => {
    if (!id) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/events/event/${id}`);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      const eventObj = data.event || data;
      if (!eventObj) { Alert.alert("Error", "Event data not found."); return; }

      if (eventObj.event_image) eventObj.event_image = fixCloudinaryUrl(eventObj.event_image, CLOUD_NAME);
      if (eventObj.organization_id?.pfp) eventObj.organization_id.pfp = fixCloudinaryUrl(eventObj.organization_id.pfp, CLOUD_NAME);
      if (Array.isArray(eventObj.event_images)) eventObj.event_images = eventObj.event_images.map(img => fixCloudinaryUrl(img, CLOUD_NAME));

      if (eventObj.event_name && eventObj.event_name.includes("NoAttendance")) eventObj.requiresManualAttendance = true;
      else eventObj.requiresManualAttendance = false;

      setEventData(eventObj);
      setEventStatus(determineEventStatus(eventObj));
    } catch (error) {
      console.error("Error fetching event details:", error);
      Alert.alert("Network Error", `Failed to load event details. Error: ${error.message}`);
      // If event fetch fails, ensure eventData is null and loading is false
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  /** ================= NEW: PHOTO PROOF STATUS ================= */
  const fetchPhotoProofStatus = useCallback(async (eId) => {
    try {
      // Read correct AsyncStorage keys
      const token = await AsyncStorage.getItem('token'); // matches login
      const student_number = await AsyncStorage.getItem('student_number'); // user ID for API

      if (!token || !student_number) {
        console.log("User session data missing. Cannot fetch photo proof status.");
        setPhotoProofStatus(null);
        setAttendanceLogId(null);
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/api/attendance/log/${eId}/${student_number}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const log = response.data.log;

      if (log) {
        // Only set photo proof status if a photo was actually uploaded.
        // Mongoose defaults photoproof_status to 'pending', so we must check the URL.
        setPhotoProofStatus(log.photoproof_url ? log.photoproof_status : null);
        setAttendanceLogId(log._id);
        setAttendanceStatus(log.status);
      } else {
        setPhotoProofStatus(null);
        setAttendanceLogId(null);
        setAttendanceStatus(null);
      }

    } catch (error) {
      console.error("Error fetching photo proof status:", error.response?.data || error.message);
      setPhotoProofStatus(null);
      setAttendanceLogId(null);
    }
  }, []);



  /** ================= NAVIGATION HANDLER ================= */
  /** ================= NAVIGATION HANDLER ================= */
  const handleUploadPhotoproof = async () => {
    try {
      // 1. Get student number from AsyncStorage
      const student_number = await AsyncStorage.getItem("student_number");
      if (!student_number) {
        Alert.alert("Error", "Student login info not found.");
        return;
      }

      // 2. Prepare payload for backend
      const payload = {
        event_id: eventId,
        student_number
        // attendanceLogId is optional; backend will create log if missing
      };

      // 3. Optional: check if attendanceLogId already exists
      if (attendanceLogId) payload.attendanceLogId = attendanceLogId;

      // 4. Navigate to Photo_Proof screen and pass required info
      router.push({
        pathname: "tab_container/Photo_Proof",
        params: {
          eventId,
          payload // send eventId + student_number + optional attendanceLogId
        }
      });
    } catch (err) {
      console.error("UPLOAD PHOTO HANDLER ERROR:", err);
      Alert.alert("Error", "Failed to prepare photo upload. Please try again.");
    }
  };


  /** ================= FOLLOW ================= */
  const checkFollowStatus = async (orgId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/followed-orgs/${userId}/ids`);
      if (!res.ok) return;
      const ids = await res.json();
      setIsFollowing(ids.includes(orgId));
    } catch (err) { console.error("Error checking follow:", err); }
  };

  const handleFollowToggle = async () => {
    if (!eventData?.organization_id?._id || !userId) return;
    const orgId = eventData.organization_id._id;
    const action = isFollowing ? "unfollow" : "follow";
    try {
      setIsFollowing(!isFollowing);
      await apiFetch(`/api/followed-orgs/${action}`, {
        method: "POST",
        body: JSON.stringify({ userId, organizationId: orgId }),
      });
    } catch (err) { setIsFollowing(isFollowing); }
  };

  /** ================= FEEDBACK ================= */
  const checkFeedbackStatus = async () => {
    if (!eventId) return;
    // 1. Check local cache first for instant UI
    try {
      const localStatus = await AsyncStorage.getItem(`feedback_status_${eventId}`);
      if (localStatus === 'submitted') { setHasSubmittedFeedback(true); return; }
    } catch (err) { console.error(err); }
    // 2. Hit the correct backend endpoint: /api/feedback/check/:eventId (auth required)
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${BASE_URL}/api/feedback/check/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const submitted = data.hasSubmitted || false;
      setHasSubmittedFeedback(submitted);
      if (submitted) await AsyncStorage.setItem(`feedback_status_${eventId}`, 'submitted');
    } catch (err) { console.error('Error checking feedback status:', err); }
  };

  /** ================= FETCH FEEDBACK COMMENTS ================= */
  const fetchFeedbackComments = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/feedback/comments/${eventId}`);
      if (!res.ok) return;
      const data = await res.json();
      setFeedbackComments(data.feedbacks || []);
    } catch (err) {
      console.error("Error fetching feedback comments:", err);
    }
  };

  /** ================= BUTTON RENDER LOGIC ================= */
  const renderPhotoProofButton = () => {
    let buttonText = "Upload Photoproof";
    let buttonStyle = [styles.photoproofButton, { backgroundColor: '#0A0F51' }];
    let isDisabled = false;

    if (attendanceStatus !== 'Present') {
      buttonText = "Scan QR Code to Upload Photoproof";
      buttonStyle = [styles.photoproofButton, { backgroundColor: '#9e9e9e' }]; // Grayed out
      isDisabled = true;
    } else if (photoProofStatus === 'verified') {
      buttonText = "Your Photo has been verified/accepted.";
      buttonStyle = [styles.photoproofButton, { backgroundColor: '#4CAF50' }];
      isDisabled = true;
    } else if (photoProofStatus === 'pending') {
      buttonText = "Photo Proof Pending Verification";
      buttonStyle = [styles.photoproofButton, { backgroundColor: '#FFC107' }];
      isDisabled = true;
    } else if (photoProofStatus === 'rejected') {
      buttonText = "Re-upload Photoproof (Rejected)";
      buttonStyle = [styles.photoproofButton, { backgroundColor: '#F44336' }];
      isDisabled = false;
    }

    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={handleUploadPhotoproof}
        disabled={isDisabled}
      >
        <Text style={styles.photoproofButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    );
  };


  /** ================= FOCUS EFFECT ================= */
  useFocusEffect(useCallback(() => {
    if (eventId) {
      fetchEventDetails(eventId);
      checkBookmarkStatus();
      fetchPhotoProofStatus(eventId);
      fetchStudentId();
      // Always check feedback status fresh on focus (uses JWT token, not userId)
      checkFeedbackStatus();
    } else {
      setLoading(false);
    }
  }, [eventId, fetchPhotoProofStatus]));

  // ── Real-time gate status via WebSocket ─────────────────────────────
  useEffect(() => {
    if (!eventId) return;
    getSocket();
    subscribeToEvent(eventId);

    const handleGateStatus = (payload) => {
      if (payload.eventId?.toString() !== eventId?.toString()) return;
      console.log('[Socket] gate:status received (student):', payload);

      // Rebuild a minimal event shape so determineEventStatus works
      setEventData(prev => {
        if (!prev) return prev;
        const updated = { ...prev, status: payload.status };
        const newStatus = determineEventStatus(updated);
        setEventStatus(newStatus);
        return updated;
      });
    };

    addGateStatusListener(handleGateStatus);

    return () => {
      removeGateStatusListener(handleGateStatus);
      unsubscribeFromEvent(eventId);
    };
  }, [eventId]);

  useEffect(() => {
    if (eventStatus === 'concluded') {
      fetchFeedbackComments();
    }
  }, [eventStatus]);

  useEffect(() => {
    if (eventData?.organization_id?._id && userId) checkFollowStatus(eventData.organization_id._id);
  }, [eventData, userId]);

  const handleBack = () => router.back();

  // 💡 CRITICAL FIX: Render a loading screen if eventData is null
  if (loading || !eventData) {
    return <Skeleton_EventDetails />;
  }

  // --- SAFE DATA CALCULATIONS START HERE ---
  const eventDateObj = eventData.event_date ? new Date(eventData.event_date) : null;
  const endDateObj = eventData.end_date ? new Date(eventData.end_date) : null;

  let eventDate = "Date N/A";
  if (eventDateObj) {
    if (endDateObj && eventDateObj.toDateString() !== endDateObj.toDateString()) {
      // Multi-day event: show date range
      const startDay = eventDateObj.getDate();
      const endDay = endDateObj.getDate();
      const startMonth = eventDateObj.toLocaleDateString("en-US", { month: "long" });
      const endMonth = endDateObj.toLocaleDateString("en-US", { month: "long" });
      const year = eventDateObj.getFullYear();

      if (startMonth === endMonth) {
        // Same month: "December 2-3, 2025"
        eventDate = `${startMonth} ${startDay}-${endDay}, ${year}`;
      } else {
        // Different months: "December 30 - January 2, 2025"
        eventDate = `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
      }
    } else {
      // Single day event
      eventDate = eventDateObj.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    }
  }

  const eventDay = eventDateObj
    ? eventDateObj.toLocaleDateString("en-US", { weekday: "long" })
    : "";
  const startTime = eventData.start_time
    ? new Date(eventData.start_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    : null;
  const endTime = eventData.end_time
    ? new Date(eventData.end_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    : null;
  let eventTimeFull = "Time N/A";
  if (eventDay && startTime && endTime) eventTimeFull = `${eventDay}, ${startTime} - ${endTime}`;
  else if (eventDay && startTime) eventTimeFull = `${eventDay}, ${startTime}`;
  else if (eventDay) eventTimeFull = eventDay;

  const eventImageSource = (eventStatus === 'concluded' && eventData.event_images?.[0])
    ? { uri: eventData.event_images[0] }
    : { uri: eventData.event_image };

  const organizerPfpSource = eventData.organization_id?.pfp
    ? { uri: eventData.organization_id.pfp }
    : require("../../assets/images/profile_pic.png");

  // --- SAFE DATA CALCULATIONS END HERE ---

  return (
    <View style={styles.container}>
      {/* ================= STICKY NAV ================= */}
      <View style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}>
        <LinearGradient
          colors={["rgba(45, 45, 45, 0.4)", "rgba(0, 0, 0, 0.2)", "rgba(255,255,255,0.1)"]}
          locations={[0, 0.7, 1]}
          style={styles.gradientOverlay}
        />
        <View style={styles.navRowContent}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" style={{ flexShrink: 0 }} />
            <Text
              style={[styles.navText, { color: "#fff", flex: 1 }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {eventData.title || eventData.event_name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bookmarkBtn, { flexShrink: 0 }]}
            onPress={handleBookmarkToggle}
            disabled={bookmarkLoading}
          >
            <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground source={eventImageSource} style={[styles.headerImageBackground, eventStatus !== 'upcoming' && styles.headerImageBackgroundCon, { paddingTop: STICKY_HEADER_HEIGHT }]} />

        <Text style={styles.eventTitle} numberOfLines={2} ellipsizeMode="tail">{eventData.title || eventData.event_name}</Text>

        {/* ================= CANCELLED ================= */}
        {eventStatus === "cancelled" && (
          <View style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", zIndex: 999
          }}>
            <Text style={{ color: "#fff", fontSize: 28, fontFamily: "DMSans-Bold", textAlign: "center", paddingHorizontal: 20 }}>
              This Event Has Been Cancelled
            </Text>
          </View>
        )}

        {/* ================= ONGOING (combined NoAttendance + Ongoing) ================= */}
        {(eventStatus === "ongoing" || eventStatus === "no-attendance") && (
          <View style={styles.infoColumn}>
            {/* Status Text */}
            <View style={[styles.infoBox, { marginBottom: 10 }]}>
              <Text style={styles.infoText}>
                This event is <Text style={{ fontFamily: 'DMSans-Bold' }}>ongoing</Text>.
              </Text>
            </View>

            {/* Upload Photoproof Button (handles pending/verified/rejected statuses) */}
            {renderPhotoProofButton()}

            {/* Check if attendance is already recorded via QR scan or other means */}
            {attendanceStatus === "Present" && (
              <View style={[styles.infoBox, { backgroundColor: '#E8F5E9', marginTop: 10 }]}>
                <Text style={[styles.infoText, { color: '#2E7D32' }]}>✓ Your attendance has been recorded.</Text>
              </View>
            )}
          </View>
        )}

        {/* ================= CONCLUDED + FEEDBACK ================= */}
        {eventStatus === 'concluded' && (
          <View style={styles.infoColumn}>
            {/* Show concluded message */}
            <View style={[styles.infoBox, { marginBottom: 10 }]}>
              <Text style={styles.infoText}>This event has <Text style={{ fontFamily: 'DMSans-Bold' }}>concluded</Text>.</Text>
            </View>

            {/* Only show attendance and feedback if user attended and was verified/present */}
            {(attendanceStatus === "Present" || photoProofStatus === "verified") ? (
              <>
                {/* Attendance recorded message */}
                <View style={[styles.infoBox, { marginBottom: 10, backgroundColor: '#E8F5E9' }]}>
                  <Text style={[styles.infoText, { color: '#2E7D32' }]}>✓ Your attendance has been recorded. Thank you!</Text>
                </View>

                {/* Feedback survey */}
                {!hasSubmittedFeedback ? (
                  <TouchableOpacity style={styles.infoBox} onPress={() => router.push(`/tab_container/EventDetails_ZFeedback?eventId=${eventData._id}`)}>
                    <Text style={styles.infoText}>Please answer the feedback survey.</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.infoBox, { backgroundColor: "#e8e8e8", opacity: 0.85 }]}
                    onPress={() => setFeedbackSubmittedModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.infoText, { color: "gray" }]}>✓ You already submitted feedback. Thank you!</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : null}
          </View>
        )}

        {/* ================= EVENT INFO ================= */}
        <View style={styles.infoRow}>
          <View style={styles.iconBox}><Ionicons name="calendar" size={20} color="#0A0F51" /></View>
          <View><Text style={styles.infoPrimary}>{eventDate}</Text><Text style={styles.infoSecondary}>{eventTimeFull}</Text></View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.iconBox}><Ionicons name="location" size={20} color="#0A0F51" /></View>
          <View>
            <Text style={styles.infoPrimary}>{eventData.venue || eventData.location}</Text>
            <Text style={styles.infoSecondary}>{eventData.venue_details || eventData.location_details}</Text>
          </View>
        </View>
        {eventData.is_mandatory && (
          <View style={styles.infoRow}>
            <View style={styles.iconBox}><Ionicons name="alert-circle" size={20} color="#0A0F51" /></View>
            <View>
              <Text style={styles.infoPrimary}>Mandatory Attendance</Text>
              <Text style={styles.infoSecondary}>Attendance is required for this event.</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>About Event</Text>
        <Text style={styles.aboutText}>{eventData.description || eventData.event_description}</Text>

        <TouchableOpacity
          onPress={() => {
            if (eventData.organization_id?._id) {
              console.log('[EventDetails] Navigating to ProfileSTU with orgId:', eventData.organization_id._id);
              router.push({
                pathname: "../tab_container/ProfileSTU",
                params: { orgId: eventData.organization_id._id }
              });
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.organizerCard}>
            <View style={styles.organizerLeft}>
              <Image source={organizerPfpSource} style={styles.organizerLogo} />
              <View style={{ flex: 1 }}>
                <Text style={styles.organizerName} numberOfLines={1} ellipsizeMode="tail">{eventData.organization_id?.org_name}</Text>
                <Text style={styles.organizerLabel}>Organizers</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.followButton, isFollowing && { backgroundColor: "#ccc" }]} onPress={handleFollowToggle}>
              <Text style={[styles.followText, isFollowing && { color: "#000" }]}>{isFollowing ? "Following" : "Follow"}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <Text style={styles.organizerDesc}>{eventData.organization_id?.org_description || eventData.organization_id?.description || "No description provided."}</Text>

        {/* ================= FEEDBACK COMMENTS (Concluded Events Only) ================= */}
        {eventStatus === 'concluded' && feedbackComments.length > 0 && (
          <FeedbackComments comments={feedbackComments} />
        )}
      </ScrollView>

      {/* Feedback already submitted (same MARQUE modal design) */}
      <Modal
        visible={feedbackSubmittedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackSubmittedModalVisible(false)}
      >
        <TouchableOpacity
          style={joinModalStyles.overlay}
          onPress={() => setFeedbackSubmittedModalVisible(false)}
          activeOpacity={1}
        >
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image
                source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
                style={joinModalStyles.iconImage}
              />
            </View>
            <Text style={joinModalStyles.title}>Feedback Submitted</Text>
            <Text style={joinModalStyles.desc}>You already submitted feedback for this event. Thank you!</Text>

            <View style={{ marginTop: 20, width: "100%" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#fecb20",
                  paddingVertical: 12,
                  borderRadius: 25,
                  alignItems: "center",
                }}
                onPress={() => setFeedbackSubmittedModalVisible(false)}
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
    </View>
  );
};

export default EventDetails_Unified;