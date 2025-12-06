// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/page_eventdetails"; // Assuming this styles file is consistent
import { BASE_URL, CLOUD_NAME } from "../../config";

// --- Helper Functions ---

const fixCloudinaryUrl = (url, cloudName) => {
  if (!url || url.startsWith("http")) {
    return url;
  }
  const path = url.replace(/ /g, "%20");
  if (path.includes(cloudName)) {
    return `https://${path}`;
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/${path}`;
};

// Placeholder/Mock function for event status determination
// In a real app, you'd likely get this status from the backend
const determineEventStatus = (eventData) => {
  if (!eventData || !eventData.event_date) return 'unknown';

  const now = new Date();
  const eventDate = new Date(eventData.event_date);
  const startTime = eventData.start_time ? new Date(eventData.start_time) : null;
  const endTime = eventData.end_time ? new Date(eventData.end_time) : null;

  // For simplicity, let's assume `EventDetails_NoAttendance` is for Ongoing events 
  // that require manual attendance photo upload.
  const requiresManualAttendance = eventData.requiresManualAttendance; // Hypothetical field

  // Status calculation logic:
  if (now < eventDate) {
    return 'upcoming';
  } else if (endTime && now > endTime) {
    return 'concluded';
  } else if (now >= eventDate) {
    // If it's ongoing: check for manual attendance requirement
    return requiresManualAttendance ? 'no-attendance' : 'ongoing';
  }
  
  return 'concluded'; // Default fallback
};


// --- Unified Component ---

const EventDetails_Unified = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const rawEventId = params.eventId;
  const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

  const STICKY_HEADER_HEIGHT = 90;

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [eventStatus, setEventStatus] = useState('loading'); // 'upcoming', 'ongoing', 'no-attendance', 'concluded'
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [userId, setUserId] = useState("692402df4600376c2cea56eb"); // Mock User ID

  const handleBack = () => router.back();
  const handleRegister = () => Alert.alert("Register", "Navigating to registration form...");


  // --- Fetching Logic ---

  const fetchEventDetails = async (id) => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/events/event/${id}`);

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      const eventObj = data.event || data;

      if (!eventObj) {
        Alert.alert("Error", "Event data not found in response.");
        return;
      }

      // Fix Cloudinary URLs
      if (eventObj.event_image) {
        eventObj.event_image = fixCloudinaryUrl(eventObj.event_image, CLOUD_NAME);
      }
      if (eventObj.organization_id?.pfp) {
        eventObj.organization_id.pfp = fixCloudinaryUrl(eventObj.organization_id.pfp, CLOUD_NAME);
      }
      if (Array.isArray(eventObj.event_images)) {
        eventObj.event_images = eventObj.event_images.map(img => fixCloudinaryUrl(img, CLOUD_NAME));
      }
      
      // Add mock field for testing 'no-attendance' state logic. 
      // Replace with real logic if needed.
      if (eventObj.event_name && eventObj.event_name.includes("NoAttendance")) {
         eventObj.requiresManualAttendance = true;
      } else {
         eventObj.requiresManualAttendance = false;
      }

      setEventData(eventObj);
      setEventStatus(determineEventStatus(eventObj));

    } catch (error) {
      console.error("Error fetching event details:", error);
      Alert.alert("Network Error", `Failed to load event details. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  // --- Follow Logic ---

  const checkFollowStatus = async (orgId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/followed-orgs/${userId}/ids`);
      if (!res.ok) return;

      const ids = await res.json();
      setIsFollowing(ids.includes(orgId));
    } catch (err) {
      console.error("Error checking follow:", err);
    }
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

      if (!res.ok) {
        setIsFollowing(isFollowing); // Revert state on failure
        Alert.alert("Error", `Failed to ${action} organization.`);
      }
    } catch (err) {
      setIsFollowing(isFollowing); // Revert state on failure
    }
  };


  // --- Feedback Logic (for Concluded state) ---

  const checkFeedbackStatus = async () => {
    if (!eventId || !userId) return;
    try {
        // Check local storage first (faster)
        const localStatus = await AsyncStorage.getItem(`feedback_status_${eventId}`);
        if (localStatus === 'submitted') {
            setHasSubmittedFeedback(true);
            return;
        }
    } catch (err) {
        console.error("Error checking local feedback status:", err);
    }
    
    // Check API
    try {
      const res = await fetch(`${BASE_URL}/api/feedback/status/${eventId}/${userId}`);
      if (!res.ok) return;

      const data = await res.json();
      const submitted = data.hasSubmitted || false;
      setHasSubmittedFeedback(submitted);

      if (submitted) {
          await AsyncStorage.setItem(`feedback_status_${eventId}`, 'submitted');
      }
    } catch (err) {
      console.error("Error checking feedback:", err);
    }
  };


  // --- Effects ---

  // Use useFocusEffect for Concluded state feedback check
  useFocusEffect(
    useCallback(() => {
      if (eventId) {
        fetchEventDetails(eventId);
        checkFeedbackStatus();
      } else {
        setLoading(false);
      }
    }, [eventId])
  );


  useEffect(() => {
    if (eventData?.organization_id?._id && userId) {
      checkFollowStatus(eventData.organization_id._id);
    }
  }, [eventData, userId]);


  // --- Pre-render checks ---

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0A0F51" />
        <Text style={{ marginTop: 10 }}>Loading Event Details...</Text>
      </View>
    );
  }

  if (!eventData) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center' }}>Could not load event details for ID: {eventId}</Text>
      </View>
    );
  }


  // --- Date/Time Formatting ---
  
  const eventDateObj = eventData.event_date
    ? new Date(eventData.event_date)
    : null;

  const eventDate = eventDateObj
    ? eventDateObj.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date N/A";

  const eventDay = eventDateObj
    ? eventDateObj.toLocaleDateString("en-US", { weekday: "long" })
    : "";

  const startTime = eventData.start_time
    ? new Date(eventData.start_time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  const endTime = eventData.end_time
    ? new Date(eventData.end_time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  let eventTimeFull = "Time N/A";

  if (eventDay && startTime && endTime) {
    eventTimeFull = `${eventDay}, ${startTime} - ${endTime}`;
  } else if (eventDay && startTime) {
    eventTimeFull = `${eventDay}, ${startTime}`;
  } else if (eventDay) {
    eventTimeFull = eventDay;
  }
  
  const eventImageSource = (eventStatus === 'concluded' && eventData.event_images?.[0]) 
    ? { uri: eventData.event_images[0] } 
    : { uri: eventData.event_image };
    
  const organizerPfpSource = eventData.organization_id?.pfp
    ? { uri: eventData.organization_id.pfp }
    : require("../../assets/images/profile_pic.png");


  // --- Conditional UI based on Status ---
  
  const renderStatusSpecificContent = () => {
    switch (eventStatus) {
      case 'upcoming':
        return null; // Upcoming uses the default layout
        
      case 'ongoing':
        return (
          <View style={styles.infoColumn}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>This event is currently **ongoing**. Please proceed to the venue.</Text>
            </View>
          </View>
        );
        
      case 'no-attendance':
        return (
          <View style={styles.infoColumn}>
            <TouchableOpacity style={styles.infoBoxAttendance} onPress={() => router.push({
              pathname: "tab_container/Photo_Proof",
              params: { eventId }
            })}>
              <Text style={styles.infoTextAtt}>
                Upload a photo of yourself at the event for verification. Make sure your face and surroundings of the venue are visible.
              </Text>
              <Ionicons name="image" size={60} color="#fff" />
            </TouchableOpacity>
          </View>
        );
        
      case 'concluded':
        return (
          <View style={styles.infoColumn}>
            {eventData.attendanceRecorded && (
              <View style={[styles.infoBox, { marginBottom: 10 }]}>
                <Text style={styles.infoText}>Your attendance has been recorded. Thank you!</Text>
              </View>
            )}

            <View style={[styles.infoBox, { marginBottom: 10 }]}>
              <Text style={styles.infoText}>This event has **concluded**.</Text>
            </View>

            {!hasSubmittedFeedback ? (
              <TouchableOpacity
                style={styles.infoBox}
                onPress={() => router.push(`/tab_container/EventDetails_ZFeedback?eventId=${eventData._id}`)}
              >
                <Text style={styles.infoText}>Please answer the feedback survey.</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.infoBox, { backgroundColor: "#e8e8e8" }]}>
                <Text style={[styles.infoText, { color: "gray" }]}>
                  You already submitted feedback. Thank you!
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };
  
  const renderBottomButton = () => {
    if (eventStatus === 'upcoming') {
      return (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerText}>REGISTER NOW</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };


  // --- Main Render ---

  return (
    <View style={styles.container}>
      <View style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}>
        <LinearGradient
          colors={["rgba(45, 45, 45, 0.4)", "rgba(0, 0, 0, 0.2)", "rgba(255,255,255,0.1)"]}
          locations={[0, 0.7, 1]}
          style={styles.gradientOverlay}
        />

        <View style={styles.navRowContent}>
          <TouchableOpacity 
             style={{ flexDirection: "row", alignItems: "center" }} 
             onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={[styles.navText, { color: "#fff" }]}>
              {eventData.title || eventData.event_name}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bookmarkBtn}>
            <Ionicons name="bookmark-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={eventImageSource}
          // Using a conditional style based on the original files.
          // EventDetails_Incoming used 'headerImageBackground', others used 'headerImageBackgroundCon'
          style={[
            styles.headerImageBackground, 
            eventStatus !== 'upcoming' && styles.headerImageBackgroundCon,
            { paddingTop: STICKY_HEADER_HEIGHT }
          ]}
        />

        <Text style={styles.eventTitle} numberOfLines={2} ellipsizeMode="tail">
          {eventData.title || eventData.event_name || eventData.event_title}
        </Text>

        {renderStatusSpecificContent()}
        
        {/* INFO ROW: DATE/TIME */}
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar" size={20} color="#0A0F51" />
          </View>

          <View>
            <Text style={styles.infoPrimary}>{eventDate}</Text>
            <Text style={styles.infoSecondary}>{eventTimeFull}</Text>
          </View>
        </View>

        {/* INFO ROW: LOCATION */}
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="location" size={20} color="#0A0F51" />
          </View>

          <View>
            <Text style={styles.infoPrimary}>{eventData.venue || eventData.location}</Text>
            <Text style={styles.infoSecondary}>{eventData.venue_details || eventData.location_details}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About Event</Text>

        <Text style={styles.aboutText}>
          {eventData.description || eventData.event_description}
        </Text>

        {/* ORGANIZER CARD */}
        <View style={styles.organizerCard}>
          <View style={styles.organizerLeft}>
            <Image
              source={organizerPfpSource}
              style={styles.organizerLogo}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.organizerName} numberOfLines={1} ellipsizeMode="tail">
                {eventData.organization_id?.org_name}
              </Text>
              <Text style={styles.organizerLabel}>Organizers</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.followButton, isFollowing && { backgroundColor: "#ccc" }]}
            onPress={handleFollowToggle}
          >
            <Text style={[styles.followText, isFollowing && { color: "#000" }]}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.organizerDesc}>
          {eventData.organization_id?.org_description || eventData.organization_id?.description || "No description provided."}
        </Text> 

        <View style={{ height: 80 }} />
      </ScrollView>

      {renderBottomButton()}
    </View>
  );
};

export default EventDetails_Unified;