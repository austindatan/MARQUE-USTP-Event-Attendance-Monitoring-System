// @ts-nocheck
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

const EventFeedback = ({ navigation }) => {
  const [overall, setOverall] = useState(0);
  const [venue, setVenue] = useState(0);
  const [speaker, setSpeaker] = useState(0);
  const [experience, setExperience] = useState(0);
  const [comments, setComments] = useState("");

  return (
    <View style={styles.container}>
      <View style={[styles.navBar, { zIndex: 10,}]}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.navTitle}>Feedback</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={require("../../assets/images/marque/crtcg1.png")}
          style={styles.headerImage}
        />

        <Text style={styles.pageTitle}>ISDA Pagsugpong 2.0</Text>
        <Text style={styles.subText}>Event Feedback. {"\n"}Help us improve your experience!</Text>

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

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Submit Feedback</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
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
    fontFamily: "DMSans-Bold",
  },

  headerImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#ddd",
  },

  pageTitle: {
    fontSize: 20,
    fontFamily: "DMSans-Bold",
    color: "#111",
    paddingHorizontal: 20,
    marginTop: 20,
  },

  subText: {
    fontSize: 13,
    fontFamily: "DMSans-Medium",
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
    fontFamily: "DMSans-Bold",
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
    fontFamily: "DMSans-Medium",
    textAlignVertical: "top",
  },

  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    paddingHorizontal: 20,
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
    fontFamily: "DMSans-Bold",
  },
});
