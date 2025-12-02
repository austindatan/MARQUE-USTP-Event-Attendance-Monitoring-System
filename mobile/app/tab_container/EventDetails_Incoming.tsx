// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Alert, // Added for better error reporting
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/page_eventdetails";
// 💡 IMPORTANT: Added expo-router imports
import { useRouter, useLocalSearchParams } from "expo-router"; 
// 💡 IMPORTANT: Added CLOUD_NAME import
import { BASE_URL, CLOUD_NAME } from "../../config"; 

// Helper function to fix Cloudinary URLs (adapted for consistency)
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

// 💡 Refactored to use expo-router hooks
const Event_Incoming = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // 🔥 FIX: Safely extract eventId, handling both string and string[]
  const rawEventId = params.eventId;
  const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;
  
  const STICKY_HEADER_HEIGHT = 90;

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  // TEMP STATIC USER ID (Replace this with real user context)
  const [userId, setUserId] = useState("692402df4600376c2cea56eb"); 

  // 💡 Refactored to fetch a specific event by ID
  const fetchEventDetails = async (id) => {
    if (!id) {
        setLoading(false);
        return;
    }
    
    try {
      setLoading(true);
      // Fetches details for the specific eventId
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
      
      // Apply Cloudinary fix to event image
      if (eventObj.event_image) {
        eventObj.event_image = fixCloudinaryUrl(eventObj.event_image, CLOUD_NAME);
      }
      
      // Apply Cloudinary fix to organizer pfp
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

  // 🔹 Check initial follow status for organizer (Copied from Concluded for consistency)
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

  // 🔹 Handle Follow/Unfollow toggle (Copied from Concluded for consistency)
  const handleFollowToggle = async () => {
    if (!eventData?.organization_id?._id || !userId) return;
    const orgId = eventData.organization_id._id;

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


  useEffect(() => {
    if (eventId) {
        fetchEventDetails(eventId);
    } else {
        setLoading(false);
    }
  }, [eventId]);

  // Load follow status
  useEffect(() => {
    if (eventData?.organization_id?._id && userId) {
      checkFollowStatus(eventData.organization_id._id);
    }
  }, [eventData, userId]);


  const handleBack = () => {
    router.back();
  };
  
  const handleRegister = () => {
    // Implement your navigation or logic for the registration form here
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
        <Text style={{fontSize: 16, textAlign: 'center'}}>Could not load event details for ID: {eventId}</Text>
      </View>
    );
  }
  
  // NOTE: Assuming your API returns start_date and end_date/start_time/end_time
  // DATE
  const eventDate = eventData.event_date
    ? new Date(eventData.event_date).toLocaleDateString()
    : "Date N/A";

  // TIME
  const startTime = eventData.start_time
    ? new Date(eventData.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Time N/A";

  const endTime = eventData.end_time
    ? new Date(eventData.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Time N/A";

  const organizerPfpSource = eventData.organization_id?.pfp
    ? { uri: eventData.organization_id.pfp }
    : require("../../assets/images/profile_pic.png"); // Fallback image


  return (
    <View style={styles.container}>
      {/* TOP NAV */}
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
          imageStyle={{ opacity: 1 }}
        >
          <View style={styles.inviteRow}>
            <View style={styles.goingContainer}>
              <View style={styles.tabRow}>
                <GoingAvatarStack />
                <Text style={styles.goingText}>+{eventData.attendee_count || eventData.going_count || 0} Going</Text>
              </View>

              <TouchableOpacity style={styles.inviteButton}>
                <Text style={styles.inviteText}>Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        <Text style={styles.eventTitle}>{eventData.title || eventData.event_name}</Text>

        {/* DATE & TIME */}
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar" size={20} color="#0A0F51" />
          </View>

          <View>
            <Text style={styles.infoPrimary}>{eventDate}</Text>
            <Text style={styles.infoSecondary}>{startTime} - {endTime}</Text>
          </View>
        </View>

        {/* LOCATION */}
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

        {/* ORGANIZER */}
        <View style={styles.organizerCard}>
          <View style={styles.organizerLeft}>
            <Image
              source={organizerPfpSource}
              style={styles.organizerLogo}
            />
            <View>
              <Text style={styles.organizerName}>{eventData.organization_id?.org_name}</Text>
              <Text style={styles.organizerLabel}>Organizers</Text>
            </View>
          </View>

          {/* FOLLOW BUTTON with logic from concluded event */}
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

      {/* FOOTER - REGISTER BUTTON */}
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