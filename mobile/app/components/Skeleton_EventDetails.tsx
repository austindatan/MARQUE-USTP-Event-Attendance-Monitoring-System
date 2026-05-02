import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions, ScrollView } from "react-native";
import styles from "../styles/page_eventdetails";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const isSmall = width < 360;
const isLarge = width > 420;
const rs = (size) => {
  if (isSmall) return size * 0.85;
  if (isLarge) return size * 1.1;
  return size;
};

const Skeleton_EventDetails = () => {
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      {/* Sticky Nav Placeholder */}
      <View style={[styles.stickyNavContainer, { height: 90 }]}>
        <LinearGradient
          colors={["rgba(45, 45, 45, 0.4)", "rgba(0, 0, 0, 0.2)", "rgba(255,255,255,0.1)"]}
          locations={[0, 0.7, 1]}
          style={styles.gradientOverlay}
        />
        <View style={styles.navRowContent}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}>
            <Ionicons name="arrow-back" size={18} color="#fff" style={{ flexShrink: 0 }} />
            <View style={{ width: 150, height: 20, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 4, marginLeft: 10 }} />
          </View>
          <View style={[styles.bookmarkBtn, { flexShrink: 0, backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Ionicons name="bookmark-outline" size={24} color="#fff" />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {/* Header Image Placeholder */}
          <View style={[styles.headerImageBackground, { backgroundColor: "#E0E0E0", paddingTop: 90 }]} />

          {/* Event Title Placeholder */}
          <View style={{ paddingHorizontal: rs(20), marginTop: rs(20) }}>
            <View style={{ width: "80%", height: 28, backgroundColor: "#E0E0E0", borderRadius: 6, marginBottom: 6 }} />
            <View style={{ width: "60%", height: 28, backgroundColor: "#E0E0E0", borderRadius: 6 }} />
          </View>

          {/* Info Rows Placeholders */}
          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: "#E0E0E0" }]} />
            <View style={{ justifyContent: "center" }}>
              <View style={{ width: 120, height: 16, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
              <View style={{ width: 160, height: 14, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: "#E0E0E0" }]} />
            <View style={{ justifyContent: "center" }}>
              <View style={{ width: 140, height: 16, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
              <View style={{ width: 180, height: 14, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
            </View>
          </View>

          {/* About Event */}
          <View style={{ paddingHorizontal: rs(20), marginTop: rs(10), marginBottom: rs(8) }}>
            <View style={{ width: 120, height: 20, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
          </View>
          <View style={{ paddingHorizontal: rs(20) }}>
            <View style={{ width: "100%", height: 14, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
            <View style={{ width: "100%", height: 14, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
            <View style={{ width: "80%", height: 14, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
          </View>

          {/* Organizer Card */}
          <View style={styles.organizerCard}>
            <View style={styles.organizerLeft}>
              <View style={[styles.organizerLogo, { backgroundColor: "#E0E0E0" }]} />
              <View style={{ flex: 1, justifyContent: "center" }}>
                <View style={{ width: 120, height: 16, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
                <View style={{ width: 80, height: 12, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
              </View>
            </View>
            <View style={[styles.followButton, { backgroundColor: "#E0E0E0", width: 80, height: 30 }]} />
          </View>

          <View style={{ paddingHorizontal: rs(20), marginTop: rs(10) }}>
            <View style={{ width: "100%", height: 14, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
            <View style={{ width: "90%", height: 14, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
          </View>
          
          <View style={{ height: 80 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default Skeleton_EventDetails;
