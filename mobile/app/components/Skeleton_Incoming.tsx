import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions, StyleSheet, ScrollView } from "react-native";
import Skeleton_OrgEventCard from "./Skeleton_OrgEventCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WP = (pct: number) => Math.round((pct * SCREEN_WIDTH) / 100);
const scaleSize = (size: number) => Math.round(size * (SCREEN_WIDTH / 375));

const Skeleton_Incoming = () => {
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
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 165, paddingHorizontal: scaleSize(20), paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* Org card skeleton — matches Card_Organization layout */}
        <View style={styles.orgShadowWrapper}>
          <Animated.View style={[styles.orgCard, { opacity: fadeAnim }]}>
            <View style={styles.orgImage} />
            <View style={styles.orgDetails}>
              <View style={styles.orgTitle} />
              <View style={styles.orgRow}>
                <View style={styles.orgLogo} />
                <View>
                  <View style={styles.orgName} />
                  <View style={styles.orgSub} />
                </View>
              </View>
              <View style={styles.orgDesc} />
            </View>
          </Animated.View>
        </View>

        {/* Event card skeletons */}
        {[1, 2, 3].map((i) => (
          <Skeleton_OrgEventCard key={i} fadeAnim={fadeAnim} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  orgShadowWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: WP(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: WP(4),
  },
  orgCard: {
    borderRadius: WP(5),
    overflow: "hidden",
  },
  orgImage: {
    width: "100%",
    height: WP(38),
    backgroundColor: "#E0E0E0",
  },
  orgDetails: {
    padding: WP(4),
  },
  orgTitle: {
    width: "60%",
    height: WP(5),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
    marginBottom: WP(3),
  },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: WP(3),
  },
  orgLogo: {
    width: WP(8),
    height: WP(8),
    borderRadius: WP(4),
    backgroundColor: "#E0E0E0",
    marginRight: WP(2),
  },
  orgName: {
    width: WP(30),
    height: WP(3),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
    marginBottom: WP(1),
  },
  orgSub: {
    width: WP(20),
    height: WP(2.5),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
  },
  orgDesc: {
    width: "100%",
    height: WP(3),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
  },
});

export default Skeleton_Incoming;
