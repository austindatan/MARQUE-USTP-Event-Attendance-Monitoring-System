import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions, ScrollView } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WP = (pct: number) => Math.round((pct * SCREEN_WIDTH) / 100);

// Single student row — shadow on static outer View, fade only on inner content
const SkeletonStudentRow = ({ fadeAnim }: { fadeAnim: Animated.Value }) => (
  <View style={styles.cardShadow}>
    <Animated.View style={[styles.cardInner, { opacity: fadeAnim }]}>
      <View style={styles.row}>
        {/* Avatar */}
        <View style={styles.avatar} />
        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <View style={styles.namePlaceholder} />
            <View style={styles.idPlaceholder} />
          </View>
          <View style={styles.deptPlaceholder} />
          <View style={styles.coursePlaceholder} />
        </View>
      </View>
    </Animated.View>
  </View>
);

// embedded=true  → used inside Officers' own ScrollView (no extra paddingTop)
// embedded=false → used for isIdLoading (full-screen, below Activities header)
const Skeleton_Officers = ({ embedded = false }: { embedded?: boolean }) => {
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
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: embedded ? 0 : 165,
          paddingHorizontal: embedded ? 0 : 15,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStudentRow key={i} fadeAnim={fadeAnim} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    backgroundColor: "#fff",
    borderRadius: 13,
    shadowColor: "#505588",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: WP(4),
  },
  cardInner: {
    borderRadius: 13,
    overflow: "hidden",
    padding: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 45,
    backgroundColor: "#E0E0E0",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: WP(1.5),
  },
  namePlaceholder: {
    width: WP(28),
    height: WP(3.5),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
    marginRight: 8,
  },
  idPlaceholder: {
    width: WP(15),
    height: WP(2.5),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
  },
  deptPlaceholder: {
    width: "80%",
    height: WP(2.8),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
    marginBottom: WP(1.2),
  },
  coursePlaceholder: {
    width: "60%",
    height: WP(2.8),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
  },
});

export default Skeleton_Officers;
