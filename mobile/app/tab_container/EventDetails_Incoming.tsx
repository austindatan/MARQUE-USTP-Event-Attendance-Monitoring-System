// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, ActivityIndicator, Alert, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/page_eventdetails";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL, CLOUD_NAME } from "../../config";

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

const GoingAvatarStack = () => {
  const avatars = [
    { id: 1, source: require("../../assets/images/profile_pic.png"), zIndex: 3 },
    { id: 2, source: require("../../assets/images/neka_profile.jpg"), zIndex: 2 },
    { id: 3, source: require("../../assets/images/sabrina_profile.jpg"), zIndex: 1 },
  ];

  return (
    <View style={styles.avatarStackContainer}>
      {avatars.map((avatar, index) => (
        <View
          key={avatar.id}
          style={[
            styles.avatarContainer,
            index > 0 && styles.overlappingAvatar,
            { zIndex: avatar.zIndex }
          ]}
        >
          <Image source={avatar.source} style={styles.goingAvatar} />
        </View>
      ))}
    </View>
  );
};

const Event_Incoming = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const rawEventId = params.eventId;
  const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

  const STICKY_HEADER_HEIGHT = 90;

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userId, setUserId] = useState("692402df4600376c2cea56eb");

  const fetchEventDetails = async (id) => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/events/event/${id}`);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const eventObj = data.event || data;

      if (!eventObj) {
        Alert.alert("Error", "Event data not found in response.");
        setLoading(false);
        return;
      }

      if (eventObj.event_image) {
        eventObj.event_image = fixCloudinaryUrl(eventObj.event_image, CLOUD_NAME);
      }

      if (eventObj.organization_id?.pfp) {
        eventObj.organization_id.pfp = fixCloudinaryUrl(eventObj.organization_id.pfp, CLOUD_NAME);
      }

      setEventData(eventObj);
    } catch (error) {
      console.error("Error fetching event details:", error);
      Alert.alert("Network Error", `Failed to load event details. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
        setIsFollowing(isFollowing);
        Alert.alert("Error", `Failed to ${action} organization.`);
      }
    } catch (err) {
      setIsFollowing(isFollowing);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    } else {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventData?.organization_id?._id && userId) {
      checkFollowStatus(eventData.organization_id._id);
    }
  }, [eventData, userId]);

  const handleBack = () => {
    router.back();
  };

  const handleRegister = () => {
    Alert.alert("Register", "Navigating to registration form...");
  };

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

  const organizerPfpSource = eventData.organization_id?.pfp
    ? { uri: eventData.organization_id.pfp }
    : require("../../assets/images/profile_pic.png");

  return (
    <View style={styles.container}>
      <View style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}>
        <LinearGradient
          colors={["rgba(45, 45, 45, 0.4)", "rgba(0, 0, 0, 0.2)", "rgba(255,255,255,0.1)"]}
          locations={[0, 0.7, 1]}
          style={styles.gradientOverlay}
        />

        <View style={styles.navRowContent}>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleBack}>
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
          source={{ uri: eventData.event_image }}
          style={[styles.headerImageBackground, { paddingTop: STICKY_HEADER_HEIGHT }]}
        />

        <Text style={styles.eventTitle} numberOfLines={2} ellipsizeMode="tail">
          {eventData.title || eventData.event_name}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar" size={20} color="#0A0F51" />
          </View>

          <View>
            <Text style={styles.infoPrimary}>{eventDate}</Text>
            <Text style={styles.infoSecondary}>{eventTimeFull}</Text>
          </View>
        </View>

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
          {eventData.description}
        </Text>

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

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerText}>REGISTER NOW</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Event_Incoming;
