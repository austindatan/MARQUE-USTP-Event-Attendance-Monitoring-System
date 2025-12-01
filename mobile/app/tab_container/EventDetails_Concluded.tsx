// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ImageBackground, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/page_eventdetails";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL, CLOUD_NAME } from "../../config"; 

const Event_Concluded = () => {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const STICKY_HEADER_HEIGHT = 90;

  const [event, setEvent] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false); 
  const [userId, setUserId] = useState(null); 

  // ⚠️ CRITICAL: Replace this dummy function with your actual token/ID retrieval logic.
  const getAuthInfo = async () => {
      // In a real app, you would retrieve the JWT and decode it, or retrieve the user object.
      // For testing, replace '60c72b1234567890abcdef12' with a real User MongoDB _id.
      const dummyUserId = "692402df4600376c2cea56eb"; 
      const dummyToken = "dummy-jwt-token-replace-me";
      setUserId(dummyUserId); 
      return { token: dummyToken, userId: dummyUserId };
  };


  // 🔑 FIXED FUNCTION: Checks follow status by fetching ALL followed IDs and filtering
  const checkFollowStatus = async (orgId) => {
    const auth = await getAuthInfo();
    if (!auth.userId) return; 

    try {
        const res = await fetch(`${BASE_URL}/api/followed-orgs/${auth.userId}/ids`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`,
            },
        });
        
        if (!res.ok) {
            console.error("Failed to fetch followed IDs:", res.status);
            return;
        }

        const followedIds: string[] = await res.json();
        const following = followedIds.includes(orgId);
        setIsFollowing(following); 

    } catch (err) {
        console.error("Error checking follow status:", err);
    }
  };

  // 🔑 FIXED FUNCTION: Handle Follow/Unfollow button press
  const handleFollowToggle = async () => {
      // Safety check: ensure event and organization_id are available
      if (!event?.organization_id?._id || !userId) return;

      const orgId = event.organization_id._id;
      const action = isFollowing ? 'unfollow' : 'follow';
      
      try {
          const auth = await getAuthInfo();
          if (!auth.token) {
              Alert.alert("Error", "You must be logged in to follow an organization.");
              return;
          }

          // Optimistic UI update
          setIsFollowing(!isFollowing); 

          const res = await fetch(`${BASE_URL}/api/followed-orgs/${action}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${auth.token}`, 
              },
              body: JSON.stringify({
                  userId: auth.userId, 
                  organizationId: orgId,
              }),
          });

          if (!res.ok) {
              // Revert UI state on failure
              setIsFollowing(isFollowing); 
              Alert.alert("Error", `Failed to ${action} organization. Please try again. Status: ${res.status}`);
          }
      } catch (err) {
          // Revert UI state on failure
          setIsFollowing(isFollowing); 
          console.error("Error toggling follow status:", err);
      }
  };


  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`${BASE_URL}/events/event/${eventId}`);
      const data = await res.json();

      const eventObj = data.event || data;

      if (!eventObj) {
        console.error("No event data returned");
        return;
      }

      // 🔑 FIX: Process singular 'event_image' field
      if (eventObj.event_image && !eventObj.event_image.startsWith("http")) {
          const encoded = eventObj.event_image.replace(/ /g, "%20");
          eventObj.event_image = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${encoded}`; 
      }

      // Fix event images (plural - kept for compatibility)
      if (Array.isArray(eventObj.event_images)) {
        eventObj.event_images = eventObj.event_images.map((img) => {
          if (!img) return null;
          if (img.startsWith("http")) return img;

          const encoded = img.replace(/ /g, "%20");
          return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${encoded}`;
        });
      }

      // Fix organization image (pfp)
      if (eventObj.organization_id?.pfp) {
        if (!eventObj.organization_id.pfp.startsWith("http")) {
          const encodedPfp = eventObj.organization_id.pfp.replace(/ /g, "%20");
          eventObj.organization_id.pfp =
            `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${encodedPfp}`;
        }
      }

      setEvent(eventObj);
    } catch (err) {
      console.error("Error fetching event:", err);
    }
  };


  useEffect(() => {
    if (eventId) fetchEventDetails();
    getAuthInfo(); // Fetch user info on mount
  }, [eventId]);

  // 🔑 FIX APPLIED HERE: Added safety checks to prevent accessing properties of null
  useEffect(() => {
    // Check if both the event object is loaded AND it contains organization_id
    if (event?.organization_id?._id && userId) {
        checkFollowStatus(event.organization_id._id);
    }
  }, [event, userId]); 

  if (!event) { 
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading event details...</Text>
      </View>
    );
  }

  // Format date and time
  const eventDate = new Date(event.event_date).toLocaleDateString();
  const startTime = new Date(event.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const endTime = new Date(event.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const eventImageSource = event.event_image ? { uri: event.event_image } : { uri: event.event_images?.[0] };
  const organizerPfpSource = event.organization_id?.pfp ? { uri: event.organization_id.pfp } : null;


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
            style={styles.infoBox}
            onPress={() => router.push(`/tab_container/EventDetails_ZFeedback?eventId=${event._id}`)}
          >
            <Text style={styles.infoText}>Please answer the feedback survey.</Text>
          </TouchableOpacity>
        </View>

        {/* DATE & TIME */}
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar" size={20} color="#0A0F51" />
          </View>
          <View>
            <Text style={styles.infoPrimary}>{eventDate}</Text>
            <Text style={styles.infoSecondary}>{startTime} – {endTime}</Text>
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
        <Text style={styles.aboutText}>{event.description}</Text>

        {/* ORGANIZER */}
        <View style={styles.organizerCard}>
          <View style={styles.organizerLeft}>
            <Image
              source={organizerPfpSource}
              style={styles.organizerLogo}
            />
            <View>
              <Text style={styles.organizerName}>{event.organization_id?.org_name}</Text>
              <Text style={styles.organizerLabel}>Organizers</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
                styles.followButton, 
                isFollowing && { backgroundColor: '#ccc' }
            ]}
            onPress={handleFollowToggle}
            // Disable button if user ID or org ID is missing
            disabled={!event.organization_id?._id || !userId} 
          >
            <Text style={[
                styles.followText, 
                isFollowing && { color: '#000' }
            ]}>
                {isFollowing ? 'Following' : 'Follow'}
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