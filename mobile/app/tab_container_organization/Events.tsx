// @ts-nocheck
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/page_eventdetails";
import { useRouter } from "expo-router";

// Going avatars stack (participants)
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
            { zIndex: avatar.zIndex },
          ]}
        >
          <Image source={avatar.source} style={styles.goingAvatar} />
        </View>
      ))}
    </View>
  );
};

// InfoRow component for date/location
const InfoRow = ({ iconName, primary, secondary }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconBox}>
      <Ionicons name={iconName} size={20} color="#0A0F51" />
    </View>
    <View>
      <Text style={styles.infoPrimary}>{primary}</Text>
      <Text style={styles.infoSecondary}>{secondary}</Text>
    </View>
  </View>
);

// Report Button component
const ReportButton = ({ text }) => (
  <TouchableOpacity
    style={[
      styles.infoBox,
      {
        flex: 1,
        marginRight: 5,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
      },
    ]}
  >
    <Text style={styles.infoText}>{text}</Text>
  </TouchableOpacity>
);

// Container for multiple report buttons
const ReportButtons = () => (
  <View style={{ flexDirection: "row", marginHorizontal: 10, marginVertical: 10 }}>
    <ReportButton text="Analytics Reports" />
    <ReportButton text="Attendance Spreadsheets" />
  </View>
);

// Main Events screen
const Events = () => {
  const router = useRouter();
  const STICKY_HEADER_HEIGHT = 90;

  // Responsive header size
  const { width } = Dimensions.get("window");
  const headerHeight = 300; // change if needed

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push("../tab_container_organization/EditEvents");
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}>
        <LinearGradient
          colors={[
            "rgba(45, 45, 45, 0.4)",
            "rgba(0, 0, 0, 0.2)",
            "rgba(255,255,255,0.1)",
          ]}
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
              Appetite: Free Meals for BSIT Students
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookmarkBtn}>
            <Ionicons name="bookmark-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Updated Header Image */}
        <ImageBackground
          source={require("../../assets/images/marque/Appetite.png")}
          style={[
            styles.headerImageBackgroundCon,
            {
              paddingTop: STICKY_HEADER_HEIGHT,
              width: width,
              height: headerHeight,
            },
          ]}
          imageStyle={{ opacity: 1 }}
        />

        <Text style={styles.eventTitle}>Appetite: Free Meals for BSIT...</Text>

        {/* Date / Location */}
        <InfoRow
          iconName="calendar"
          primary="17 October, 2025"
          secondary="Friday, 11:00 AM – 1:00 PM"
        />
        <InfoRow
          iconName="location"
          primary="SITE Corner"
          secondary="CITC Bldg 9, 4th Floor"
        />

        {/* Report Buttons */}
        <ReportButtons />

        {/* About Event */}
        <Text style={styles.sectionTitle}>About Event</Text>
        <Text style={styles.aboutText}>
          Focus: Promoting student well-being through shared meals and meaningful
          connections.
          {"\n"}Target Audience: BSIT students.
          {"\n"}Special Offer: Be among the first 100 IT students to get free coffee
          and pastry!
          {"\n"}Specific Location: SITE Corner, 4th Floor, CITC Building.
          {"\n"}Start Time: 11:00 AM.
        </Text>

        {/* Organizer Card */}
        <View style={styles.organizerCard}>
          <View style={styles.organizerLeft}>
            <Image
              source={require("../../assets/images/marque/crk.jpg")}
              style={styles.organizerLogo}
            />
            <View>
              <Text style={styles.organizerName}>Society of Information ...</Text>
              <Text style={styles.organizerLabel}>Organizers</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.organizerDesc}>
          SITE empowers future IT professionals through cutting-edge initiatives
          and a strong community spirit.
        </Text>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Floating Edit Button */}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onPress={handleEdit}
          style={{
            backgroundColor: "#FFD700",
            paddingVertical: 15,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#FFD700",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>Edit Event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Events;