// @ts-nocheck
import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions, ScrollView, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/page_eventdetails";

const { width } = Dimensions.get("window");
const isSmall = width < 360;
const isLarge = width > 420;
const rs = (size: number) => {
  if (isSmall) return size * 0.85;
  if (isLarge) return size * 1.1;
  return size;
};

const STICKY_HEADER_HEIGHT = 90;

const Skeleton_OrgEventDetails = () => {
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>

        {/* ── Sticky Nav (static — no fade so it never pulses) ── */}
        <View style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}>
          <LinearGradient
            colors={["rgba(45,45,45,0.4)", "rgba(0,0,0,0.2)", "rgba(255,255,255,0.1)"]}
            locations={[0, 0.7, 1]}
            style={styles.gradientOverlay}
          />
          <View style={styles.navRowContent}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}>
              <Ionicons name="arrow-back" size={18} color="#fff" style={{ flexShrink: 0 }} />
              <View style={{ width: 150, height: 18, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 4, marginLeft: 10 }} />
            </View>
            {/* Edit button placeholder */}
            <View style={[styles.bookmarkBtn, { flexShrink: 0, backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Ionicons name="create-outline" size={24} color="#fff" />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>

            {/* Hero image */}
            <View style={[styles.headerImageBackground, { backgroundColor: "#E0E0E0", paddingTop: STICKY_HEADER_HEIGHT }]} />

            {/* Event title */}
            <View style={{ paddingHorizontal: rs(20), marginTop: rs(20) }}>
              <View style={{ width: "80%", height: 28, backgroundColor: "#E0E0E0", borderRadius: 6, marginBottom: 6 }} />
              <View style={{ width: "55%", height: 28, backgroundColor: "#E0E0E0", borderRadius: 6 }} />
            </View>

            {/* Date info row */}
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: "#E0E0E0" }]} />
              <View style={{ justifyContent: "center" }}>
                <View style={{ width: 130, height: 16, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
                <View style={{ width: 180, height: 14, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
              </View>
            </View>

            {/* Location info row */}
            <View style={[styles.infoRow, { marginBottom: 10 }]}>
              <View style={[styles.iconBox, { backgroundColor: "#E0E0E0" }]} />
              <View style={{ justifyContent: "center" }}>
                <View style={{ width: 110, height: 16, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
                <View style={{ width: 160, height: 14, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
              </View>
            </View>

            {/* Action buttons row — 3 buttons */}
            <View style={styles.buttonsRow}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[styles.actionButton, { backgroundColor: "#E0E0E0" }]}
                />
              ))}
            </View>

            {/* About Event section title */}
            <View style={{ paddingHorizontal: rs(20), marginTop: rs(14), marginBottom: rs(8) }}>
              <View style={{ width: 110, height: 20, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
            </View>
            {/* About text lines */}
            <View style={{ paddingHorizontal: rs(20) }}>
              <View style={{ width: "100%", height: 14, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
              <View style={{ width: "100%", height: 14, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
              <View style={{ width: "75%",  height: 14, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
            </View>

            {/* Organizer card */}
            <View style={styles.organizerCard}>
              <View style={styles.organizerLeft}>
                <View style={[styles.organizerLogo, { backgroundColor: "#E0E0E0" }]} />
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <View style={{ width: 130, height: 16, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
                  <View style={{ width: 70,  height: 12, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
                </View>
              </View>
            </View>

            {/* Org description lines */}
            <View style={{ paddingHorizontal: rs(20), marginTop: rs(8) }}>
              <View style={{ width: "100%", height: 14, backgroundColor: "#E0E0E0", borderRadius: 4, marginBottom: 6 }} />
              <View style={{ width: "90%",  height: 14, backgroundColor: "#E0E0E0", borderRadius: 4 }} />
            </View>

            <View style={{ height: 80 }} />
          </Animated.View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Skeleton_OrgEventDetails;
