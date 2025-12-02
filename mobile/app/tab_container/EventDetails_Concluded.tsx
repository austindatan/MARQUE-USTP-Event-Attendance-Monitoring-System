// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ImageBackground, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/page_eventdetails";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { BASE_URL, CLOUD_NAME } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Event_Concluded = () => {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const STICKY_HEADER_HEIGHT = 90;

  const [event, setEvent] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userId, setUserId] = useState("692402df4600376c2cea56eb"); // TEMP STATIC USER ID
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);

  // 🔹 Fetch event + fix Cloudinary URLs
  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/events/event/${eventId}`);
      const data = await res.json();

      const eventObj = data.event || data;
      if (!eventObj) return;

      // EVENT IMAGE (single)
      if (eventObj.event_image && !eventObj.event_image.startsWith("http")) {
        const encoded = eventObj.event_image.replace(/ /g, "%20");
        eventObj.event_image = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${encoded}`;
      }

      // EVENT IMAGES (multiple)
      if (Array.isArray(eventObj.event_images)) {
        eventObj.event_images = eventObj.event_images.map((img) => {
          if (!img) return null;
          if (img.startsWith("http")) return img;
          return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${img.replace(/ /g, "%20")}`;
        });
      }

      // ORG PFP
      if (eventObj.organization_id?.pfp && !eventObj.organization_id.pfp.startsWith("http")) {
        eventObj.organization_id.pfp =
          `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${eventObj.organization_id.pfp.replace(/ /g, "%20")}`;
      }

      setEvent(eventObj);
    } catch (err) {
      console.error("Error fetching event:", err);
    }
  };

  // 🔹 Check feedback status
  const checkFeedbackStatus = async () => {
    if (!eventId || !userId) return;

    // 1. Check local storage for persistent status (instant update after navigating back)
    try {
        const localStatus = await AsyncStorage.getItem(`feedback_status_${eventId}`);
        if (localStatus === 'submitted') {
            setHasSubmittedFeedback(true);
            return; // Exit if found locally
        }
    } catch (err) {
        console.error("Error checking local feedback status:", err);
    }

    // 2. Fallback to API check
    try {
      const res = await fetch(`${BASE_URL}/api/feedback/status/${eventId}/${userId}`);

      if (!res.ok) return;

      const data = await res.json();
      const submitted = data.hasSubmitted || false;
      setHasSubmittedFeedback(submitted);

      // If API confirms, store it locally for faster subsequent loads
      if (submitted) {
          await AsyncStorage.setItem(`feedback_status_${eventId}`, 'submitted');
      }
      
    } catch (err) {
      console.error("Error checking feedback:", err);
    }
  };

  // 🔹 Follow status
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

  // 🔹 Toggle follow
  const handleFollowToggle = async () => {
    if (!event?.organization_id?._id) return;
    const orgId = event.organization_id._id;

    const action = isFollowing ? "unfollow" : "follow";

    try {
      setIsFollowing(!isFollowing); // optimistic UI

      const res = await fetch(`${BASE_URL}/api/followed-orgs/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, organizationId: orgId }),
      });

      if (!res.ok) {
        setIsFollowing(isFollowing); // revert if error
        Alert.alert("Error", `Failed to ${action} organization.`);
      }
    } catch (err) {
      setIsFollowing(isFollowing);
    }
  };

  // 🔹 Load data
  useFocusEffect(
    useCallback(() => {
      if (eventId) {
        fetchEventDetails();
        checkFeedbackStatus();
      }
    }, [eventId]) // Re-run only if eventId changes
  );

  // 🔹 Load follow status
  useEffect(() => {
    if (event?.organization_id?._id) {
      checkFollowStatus(event.organization_id._id);
    }
  }, [event]);

  if (!event) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading event details...</Text>
      </View>
    );
  }

  // DATE
  const eventDateObj = event.event_date ? new Date(event.event_date) : null;

  // Format: "30 December, 2025"
  const eventDateFormatted = eventDateObj
    ? eventDateObj.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date N/A";

  // Get weekday: "Wednesday"
  const eventDay = eventDateObj
    ? eventDateObj.toLocaleDateString("en-US", { weekday: "long" })
    : "";

  // TIME
  const startTime = event.start_time
    ? new Date(event.start_time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  const endTime = event.end_time
    ? new Date(event.end_time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  // FINAL TIME STRING
  let eventTimeFull = "Time N/A";

  if (eventDay && startTime && endTime) {
    eventTimeFull = `${eventDay}, ${startTime} - ${endTime}`;
  } else if (eventDay && startTime) {
    eventTimeFull = `${eventDay}, ${startTime}`;
  } else if (eventDay) {
    eventTimeFull = eventDay; // Always show day even without time
  }


  const eventImageSource = event.event_image
    ? { uri: event.event_image }
    : { uri: event.event_images?.[0] };

  const organizerPfpSource = event.organization_id?.pfp
    ? { uri: event.organization_id.pfp }
    : null;

  return (
    <View style={styles.container}>
      {/* TOP NAV */}
      <View style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}>
        <LinearGradient
          colors={["rgba(45,45,45,0.4)", "rgba(0,0,0,0.2)", "rgba(255,255,255,0.1)"]}
          style={styles.gradientOverlay}
        />
        <View style={styles.navRowContent}>
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={[styles.navText, { color: "#fff" }]}>{event.event_name}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bookmarkBtn}>
            <Ionicons name="bookmark-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={eventImageSource}
          style={[styles.headerImageBackgroundCon, { paddingTop: STICKY_HEADER_HEIGHT }]}
        />

        <Text style={styles.eventTitle}>{event.event_name}</Text>

        <View style={styles.infoColumn}>
          {event.attendanceRecorded && (
            <View style={[styles.infoBox, { marginBottom: 10 }]}>
              <Text style={styles.infoText}>Your attendance has been recorded. Thank you!</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.infoBox, { marginBottom: 10 }]}>
            <Text style={styles.infoText}>This event has concluded.</Text>
          </TouchableOpacity>

          {/* 🔥 FEEDBACK BUTTON FIXED */}
          {!hasSubmittedFeedback ? (
            <TouchableOpacity
              style={styles.infoBox}
              onPress={() => router.push(`/tab_container/EventDetails_ZFeedback?eventId=${event._id}`)}
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

        {/* DATE & TIME */}
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar" size={20} color="#0A0F51" />
          </View>
          <View>
            <Text style={styles.infoPrimary}>{eventDateFormatted}</Text>
            <Text style={styles.infoSecondary}>{eventTimeFull}</Text>
          </View>
        </View>

        {/* VENUE */}
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => {
            router.push({
              pathname: "/tab_container/EventDetails_ZLocation",
              params: { markerId: 52 },  // <--- SEND MARKER ID HERE
            });
          }}
        >

          <View style={styles.iconBox}>
            <Ionicons name="location" size={20} color="#0A0F51" />
          </View>
          <View>
            <Text style={styles.infoPrimary}>{event.venue}</Text>
            {event.venue_details && <Text>{event.venue_details}</Text>}
          </View>
        </TouchableOpacity>

        {/* ABOUT */}
        <Text style={styles.sectionTitle}>About Event</Text>
        <Text style={styles.aboutText}>{event.description}</Text>

        {/* ORGANIZER */}
        <View style={styles.organizerCard}>
          <View style={styles.organizerLeft}>
            <Image source={organizerPfpSource} style={styles.organizerLogo} />
            <View>
              <Text style={styles.organizerName}>{event.organization_id?.org_name}</Text>
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

        <Text style={styles.organizerDesc}>{event.organization_id?.description}</Text>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

export default Event_Concluded;
