// @ts-nocheck
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput, Alert, ActivityIndicator, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const getAuthInfo = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) return { userId: null, token: null };

    const decoded = jwtDecode(token);

    return {
      userId: decoded.id,
      token: token,
    };
  } catch (error) {
    console.error("Auth Error:", error);
    return { userId: null, token: null };
  }
};

const RatingStars = ({ rating, setRating }) => {
  return (
    <View style={{ flexDirection: "row", marginTop: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={26}
            color="#FFC107"
            style={{ marginRight: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const EventFeedback = () => {
  const router = useRouter();
  const { eventId, eventName, eventImage: initialEventImage } = useLocalSearchParams(); 
  const [overall, setOverall] = useState(0);
  const [venue, setVenue] = useState(0);
  const [speaker, setSpeaker] = useState(0);
  const [experience, setExperience] = useState(0);
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authInfo, setAuthInfo] = useState({ userId: null, token: null });
  const [eventImageUrl, setEventImageUrl] = useState(null);
  const FALLBACK_IMAGE = require("../../assets/images/marque/crtcg1.png");

  const fetchEventImage = async () => {
    if (!eventId) return;

    try {
        const res = await fetch(`${BASE_URL}/events/event/${eventId}`);
        const data = await res.json();
        const eventObj = data.event || data;

        if (eventObj && eventObj.event_image) {
            let imageUrl = eventObj.event_image;
            const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dhfgfpoav/image/upload/";
            if (!imageUrl.startsWith("http")) {
                imageUrl = `${CLOUDINARY_BASE_URL}${imageUrl}`;
            }
            
            setEventImageUrl(imageUrl);
        }
    } catch (error) {
        console.error("Error fetching event image:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const info = await getAuthInfo();
      setAuthInfo(info);

      if (!info.userId) {
        Alert.alert(
          "Login Required",
          "You must be logged in to submit feedback.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }
      if (initialEventImage) {
          setEventImageUrl(initialEventImage);
      }
      
      fetchEventImage();
    };
    loadData();
  }, [eventId]);


  const handleSubmit = async () => {
    if (overall === 0 || venue === 0 || speaker === 0 || experience === 0) {
      Alert.alert(
        "Incomplete Feedback",
        "Please rate all four categories before submitting."
      );
      return;
    }

    if (!authInfo.userId || !authInfo.token) {
      Alert.alert("Login Required", "Please refresh the page or log in again.");
      return;
    }

    setIsLoading(true);

    const feedbackData = {
      event_id: eventId,
      ratings: {
        overall_experience: overall,
        venue_facilities: venue,
        speakers_program: speaker,
        event_organization: experience,
      },
      comment: comments,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/feedback/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authInfo.token}`,
        },
        body: JSON.stringify(feedbackData),
      });

      if (res.ok) {
        await AsyncStorage.setItem(`feedback_status_${eventId}`, 'submitted');
        router.back();
      } else {
        const errorData = await res.json();

        if (res.status === 409) {
          Alert.alert(
            "Already Submitted",
            "You have already submitted feedback for this event."
          );
          await AsyncStorage.setItem(`feedback_status_${eventId}`, 'submitted');
          router.back();
        } else {
          Alert.alert(
            "Submission Failed",
            errorData.message || "An error occurred."
          );
        }
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      Alert.alert(
        "Network Error",
        "Could not connect to the server. Check your connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.navBar, { zIndex: 10 }]}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.navTitle}>Feedback</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={eventImageUrl ? { uri: eventImageUrl } : FALLBACK_IMAGE}
          style={styles.headerImage}
        />

        <Text style={styles.pageTitle}>{eventName || "Event Feedback"}</Text>
        <Text style={styles.subText}>
          Help us improve your experience!{"\n"}Rate the event below.
        </Text>

        <View style={styles.block}>
          <Text style={styles.question}>Overall Experience</Text>
          <RatingStars rating={overall} setRating={setOverall} />
        </View>

        <View style={styles.block}>
          <Text style={styles.question}>Venue & Facilities</Text>
          <RatingStars rating={venue} setRating={setVenue} />
        </View>

        <View style={styles.block}>
          <Text style={styles.question}>Speakers / Program</Text>
          <RatingStars rating={speaker} setRating={setSpeaker} />
        </View>

        <View style={styles.block}>
          <Text style={styles.question}>Event Organization</Text>
          <RatingStars rating={experience} setRating={setExperience} />
        </View>

        <View style={styles.commentBox}>
          <Text style={styles.question}>Additional Feedback</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Share your thoughts..."
            placeholderTextColor="#999"
            value={comments}
            onChangeText={setComments}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.submitText}>Submit Feedback</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventFeedback;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  navBar: {
    height: 90,
    backgroundColor: "#0A0F51",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 15,
  },
  navTitle: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  headerImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#ddd",
  },
  pageTitle: {
    fontSize: 20,
    color: "#111",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  subText: {
    fontSize: 13,
    color: "#777",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  block: {
    backgroundColor: "#f5f6ff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 14,
  },
  question: {
    fontSize: 14,
    color: "#111",
  },
  commentBox: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  textInput: {
    marginTop: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 12,
    height: 120,
    fontSize: 13,
    textAlignVertical: "top",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  submitButton: {
    backgroundColor: "#0A0F51",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 30,
  },
  submitText: {
    color: "#fff",
    marginRight: 8,
    fontSize: 14,
  },
});