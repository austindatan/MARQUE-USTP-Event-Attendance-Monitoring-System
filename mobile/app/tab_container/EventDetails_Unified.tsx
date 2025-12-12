// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/page_eventdetails";
import { BASE_URL, CLOUD_NAME } from "../../config";
import axios from "axios";
import FeedbackComments from "../components/FeedbackComments";

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
  const fetchStudentId = async () => {
    try {
      const studentNumber = await AsyncStorage.getItem("student_number");
      if (!studentNumber) return null;
      const res = await fetch(`${BASE_URL}/api/student/id/${studentNumber}`);
      if (!res.ok) return null;
      const data = await res.json();
      setUserId(data._id);
    } catch (e) { console.error("Error fetching user ID:", e); }
  };

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(true);

  const [photoProofStatus, setPhotoProofStatus] = useState(null);
  const [attendanceLogId, setAttendanceLogId] = useState(null);

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
      if (!actionToAdd) await axios.delete(`${BASE_URL}/api/bookmarks/${student_number}/${eventId}`);
      else await axios.post(`${BASE_URL}/api/bookmarks/${student_number}`, { event_id: eventId });
      setIsBookmarked(actionToAdd);
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to ${actionToAdd ? 'add' : 'remove'} bookmark.`;
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
        setPhotoProofStatus(log.photoproof_status);
        setAttendanceLogId(log._id);
      } else {
        setPhotoProofStatus(null);
        setAttendanceLogId(null);
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
      const res = await fetch(`${BASE_URL}/api/followed-orgs/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, organizationId: orgId }),
      });
      if (!res.ok) setIsFollowing(isFollowing);
    } catch (err) { setIsFollowing(isFollowing); }
  };

  /** ================= FEEDBACK ================= */
  const checkFeedbackStatus = async () => {
    if (!eventId || !userId) return;
    try {
      const localStatus = await AsyncStorage.getItem(`feedback_status_${eventId}`);
      if (localStatus === 'submitted') { setHasSubmittedFeedback(true); return; }
    } catch (err) { console.error(err); }
    try {
      const res = await fetch(`${BASE_URL}/api/feedback/status/${eventId}/${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      const submitted = data.hasSubmitted || false;
      setHasSubmittedFeedback(submitted);
      if (submitted) await AsyncStorage.setItem(`feedback_status_${eventId}`, 'submitted');
    } catch (err) { console.error(err); }
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

    if (photoProofStatus === 'verified') {
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
      checkFeedbackStatus();
      checkBookmarkStatus();
      fetchPhotoProofStatus(eventId);
      fetchStudentId();
      if (eventStatus === 'concluded') {
        fetchFeedbackComments();
      }
    } else setLoading(false);
  }, [eventId, fetchPhotoProofStatus, eventStatus]));

  useEffect(() => {
    if (eventData?.organization_id?._id && userId) checkFollowStatus(eventData.organization_id._id);
  }, [eventData, userId]);

  const handleBack = () => router.back();

  // 💡 CRITICAL FIX: Render a loading screen if eventData is null
  if (loading || !eventData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0A0F51" />
        <Text style={{ marginTop: 10, color: '#0A0F51' }}>Loading Event Details...</Text>
      </View>
    );
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

            {/* Upload Photoproof Button */}
            {renderPhotoProofButton()}
          </View>
        )}

        {/* ================= CONCLUDED + FEEDBACK ================= */}
        {eventStatus === 'concluded' && (
          <View style={styles.infoColumn}>
            {/* Show concluded message */}
            <View style={[styles.infoBox, { marginBottom: 10 }]}>
              <Text style={styles.infoText}>This event has <Text style={{ fontFamily: 'DMSans-Bold' }}>concluded</Text>.</Text>
            </View>

            {/* Only show attendance and feedback if user attended */}
            {attendanceLogId ? (
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
                  <View style={[styles.infoBox, { backgroundColor: "#e8e8e8", opacity: 0.6 }]} pointerEvents="none">
                    <Text style={[styles.infoText, { color: "gray" }]}>✓ You already submitted feedback. Thank you!</Text>
                  </View>
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
        <Text style={styles.sectionTitle}>About Event</Text>
        <Text style={styles.aboutText}>{eventData.description || eventData.event_description}</Text>

        {/* ================= ORGANIZER ================= */}
        <TouchableOpacity
          onPress={() => {
            if (eventData.organization_id?._id) {
              console.log('[EventDetails] Navigating to ProfileSTU with orgId:', eventData.organization_id._id);
              router.push({
                pathname: "../tab_container_organization/ProfileSTU",
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
    </View>
  );
};

export default EventDetails_Unified;