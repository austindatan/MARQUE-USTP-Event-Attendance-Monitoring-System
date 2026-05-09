import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WP = (pct: number) => Math.round((pct * SCREEN_WIDTH) / 100);
const scale = SCREEN_WIDTH / 390;

interface Props { fadeAnim: Animated.Value; }

const Skeleton_OrgEventCard = ({ fadeAnim }: Props) => (
  // Shadow stays on a plain (non-animated) wrapper so it never pulses
  <View style={styles.shadowWrapper}>
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      {/* Image placeholder */}
      <View style={styles.imagePlaceholder}>
        {/* Date tag */}
        <View style={styles.dateTag} />
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.titlePlaceholder} />
        <View style={styles.orgRow}>
          <View style={styles.logoPlaceholder} />
          <View>
            <View style={styles.orgTextPlaceholder} />
            <View style={styles.subTextPlaceholder} />
          </View>
        </View>
        <View style={styles.descPlaceholder} />
        <View style={styles.descShortPlaceholder} />
      </View>
    </Animated.View>
  </View>
);

const styles = StyleSheet.create({
  shadowWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10 * scale,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    marginBottom: WP(4),
  },
  card: {
    borderRadius: 10 * scale,
    overflow: "hidden",
  },
  imagePlaceholder: {
    width: "100%",
    height: WP(42),
    backgroundColor: "#E0E0E0",
    padding: 10,
  },
  dateTag: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 36,
    height: 42,
    backgroundColor: "#C8C8C8",
    borderRadius: 8,
  },
  details: {
    padding: WP(4),
  },
  titlePlaceholder: {
    width: "70%",
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
  logoPlaceholder: {
    width: WP(8),
    height: WP(8),
    borderRadius: WP(4),
    backgroundColor: "#E0E0E0",
    marginRight: WP(2),
  },
  orgTextPlaceholder: {
    width: WP(30),
    height: WP(3),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
    marginBottom: WP(1),
  },
  subTextPlaceholder: {
    width: WP(20),
    height: WP(2.5),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
  },
  descPlaceholder: {
    width: "100%",
    height: WP(3),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
    marginBottom: WP(1.5),
  },
  descShortPlaceholder: {
    width: "80%",
    height: WP(3),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
  },
});

export default Skeleton_OrgEventCard;
