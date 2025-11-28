// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/page_eventdetails"

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
          <Image
            source={avatar.source}
            style={styles.goingAvatar}
          />
        </View>
      ))}
    </View>
  );
};

const Event_Ongoing = ({ navigation }) => {
  const STICKY_HEADER_HEIGHT = 90;

  const handleBack = () => {
    console.log("Go back pressed");
  };

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
            <Text style={[styles.navText, { color: "#fff" }]}>ISDA Pagsugpong 2.0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bookmarkBtn}>
            <Ionicons name="bookmark-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require("../../assets/images/marque/crtcg1.png")}
          style={[styles.headerImageBackgroundCon, { paddingTop: STICKY_HEADER_HEIGHT }]}
          imageStyle={{ opacity: 1 }}
        >
        </ImageBackground>

        <Text style={styles.eventTitle}>ISDA Pagsugpong 2.0</Text>

        <View style={styles.infoColumn}>
          <TouchableOpacity style={styles.infoBox}>
            <Text style={styles.infoText}>This event is currently ongoing. Please proceed to the event venue.</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar" size={20} color="#0A0F51" />
          </View>
          <View>
            <Text style={styles.infoPrimary}>25 October, 2025</Text>
            <Text style={styles.infoSecondary}>Saturday 1:00PM – 4:00PM</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Ionicons name="location" size={20} color="#0A0F51" />
          </View>
          <View>
            <Text style={styles.infoPrimary}>Cafeteria Hall</Text>
            <Text style={styles.infoSecondary}>Building 5</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About Event</Text>

        <Text style={styles.aboutText}>
          Dili lang ta scholars — we are leaders with powers.
          {"\n"}We lead with heart, with purpose, with grit. City scholars man ta,
          pero mas labaw ana — we're movers, changemakers, voices for others.
          {"\n\n"}Let's discover the leader inside us through ISDA Pagsugpong 2.0:
          Bake the Path Forward: Unleashing Leadership, Unlocked Potential.
          {"\n\n"}We're not just dreaming for ourselves — we're moving for something
          bigger.
        </Text>

        <View style={styles.organizerCard}>
          <View style={styles.organizerLeft}>
            <Image
              source={require("../../assets/images/marque/crk.jpg")}
              style={styles.organizerLogo}
            />
            <View>
              <Text style={styles.organizerName}>University City Scholars</Text>
              <Text style={styles.organizerLabel}>Organizers</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.organizerDesc}>
          University City Scholars – USTP: An organization of trailblazing Iskolar
          sa Dakbayan across the USTP System.
        </Text>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

export default Event_Ongoing;

