// @ts-nocheck
import React, { useEffect, useState } from "react";
import { 
  View, Text, Image, TouchableOpacity, ScrollView, 
  ImageBackground, Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/page_eventdetails";
import { useRouter, useLocalSearchParams } from "expo-router"; 
import { BASE_URL, CLOUD_NAME } from "../../config";

const fixCloudinaryUrl = (url, cloudName) => {
  if (!url || url.startsWith("http")) return url;
  const path = url.replace(/ /g, "%20");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${path}`;
};

const formatTime = (timeString) => {
  if (!timeString) return "Time N/A";
  const parts = timeString.split(":");
  if (parts.length < 2) return "Time N/A";

  let hours = parseInt(parts[0], 10);
  let minutes = parseInt(parts[1], 10);

  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const minuteStr = minutes < 10 ? "0" + minutes : minutes;

  return `${hour12}:${minuteStr} ${ampm}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "Date N/A";
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const Event_NoAttendance = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawEventId = params.eventId;
  const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

  const STICKY_HEADER_HEIGHT = 90;
  const [event, setEvent] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userId, setUserId] = useState("692402df4600376c2cea56eb"); // TEMP STATIC USER ID

  const handleBack = () => router.back();

  // 🔹 Fetch event + fix Cloudinary URLs
  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/events/event/${eventId}`);
      const data = await res.json();
      const eventObj = data.event || data;
      if (!eventObj) return;

      if (eventObj.event_image && !eventObj.event_image.startsWith("http")) {
        eventObj.event_image = fixCloudinaryUrl(eventObj.event_image, CLOUD_NAME);
      }

      if (eventObj.organization_id?.pfp && !eventObj.organization_id.pfp.startsWith("http")) {
        eventObj.organization_id.pfp = fixCloudinaryUrl(eventObj.organization_id.pfp, CLOUD_NAME);
      }

      setEvent(eventObj);
    } catch (err) {
      console.error("Error fetching event:", err);
      Alert.alert("Error", "Failed to load event details.");
    }
  };

  // 🔹 Check follow status
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
      if (!res.ok) setIsFollowing(isFollowing); // revert if error
    } catch (err) {
      setIsFollowing(isFollowing);
      console.error("Follow error:", err);
    }
  };

  // 🔹 Load data
  useEffect(() => {
    if (eventId) fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    if (event?.organization_id?._id) checkFollowStatus(event.organization_id._id);
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


  return (
    <View style={styles.container}>
      {/* TOP NAV */}
      <View style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}>
        <LinearGradient
          colors={["rgba(45,45,45,0.4)", "rgba(0,0,0,0.2)", "rgba(255,255,255,0.1)"]}
          style={styles.gradientOverlay}
        />
        <View style={styles.navRowContent}>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleBack}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={[styles.navText, { color: "#fff" }]}>{event.event_title || event.event_name}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookmarkBtn}>
            <Ionicons name="bookmark-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={{ uri: event.event_image }}
          style={[styles.headerImageBackgroundCon, { paddingTop: STICKY_HEADER_HEIGHT }]}
        />

        <Text style={styles.eventTitle}>{event.event_title || event.event_name}</Text>

        {/* 🔹 Attendance Upload Section */}
        <View style={styles.infoColumn}>
          <TouchableOpacity style={styles.infoBoxAttendance}>
            <Text style={styles.infoTextAtt}>
              Upload a photo of yourself at the event for verification. Make sure your face and surroundings of the venue are visible.
            </Text>
            <Ionicons name="image" size={60} color="#fff" />
          </TouchableOpacity>
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
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="location" size={20} color="#0A0F51" />
          </View>
          <View>
            <Text style={styles.infoPrimary}>{event.venue}</Text>
            {event.venue_details && <Text>{event.venue_details}</Text>}
          </View>
        </View>

        {/* ABOUT */}
        <Text style={styles.sectionTitle}>About Event</Text>
        <Text style={styles.aboutText}>{event.event_description || event.description}</Text>

        {/* ORGANIZER */}
        <View style={styles.organizerCard}>
          <View style={styles.organizerLeft}>
            <Image source={{ uri: event.organization_id?.pfp }} style={styles.organizerLogo} />
            <View>
              <Text style={styles.organizerName}>{event.organization_id?.org_name}</Text>
              <Text style={styles.organizerLabel}>Organizer</Text>
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

export default Event_NoAttendance;
