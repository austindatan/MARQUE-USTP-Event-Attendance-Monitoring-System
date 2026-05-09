import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions, ScrollView } from "react-native";
import Skeleton_OrgEventCard from "./Skeleton_OrgEventCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WP = (pct: number) => Math.round((pct * SCREEN_WIDTH) / 100);
const scaleSize = (size: number) => Math.round(size * (SCREEN_WIDTH / 375));

const Skeleton_Concluded = () => {
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
        contentContainerStyle={{ paddingTop: 170, paddingHorizontal: scaleSize(20), paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {[1, 2, 3].map((i) => (
          <Skeleton_OrgEventCard key={i} fadeAnim={fadeAnim} />
        ))}
      </ScrollView>
    </View>
  );
};

export default Skeleton_Concluded;
