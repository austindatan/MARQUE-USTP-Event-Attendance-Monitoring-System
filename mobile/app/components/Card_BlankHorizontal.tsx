import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const WP = (percentage) => Math.round((percentage * SCREEN_WIDTH) / 100);

const Card_BlankHorizontal = () => {
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
    <View style={styles.shadowWrapper}>
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.imagePlaceholder} />
        <View style={styles.detailsPlaceholder}>
          <View style={styles.titlePlaceholder} />
          <View style={styles.orgPlaceholder}>
            <View style={styles.logoPlaceholder} />
            <View>
              <View style={styles.orgTextPlaceholder} />
              <View style={styles.subTextPlaceholder} />
            </View>
          </View>
          <View style={styles.descPlaceholder} />
          <View style={styles.descPlaceholderShort} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: WP(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: WP(5),
  },
  card: {
    width: "100%",
    borderRadius: WP(5),
    overflow: "hidden",
  },
  imagePlaceholder: {
    width: "100%",
    height: WP(45),
    backgroundColor: "#E0E0E0",
  },
  detailsPlaceholder: {
    padding: WP(4),
  },
  titlePlaceholder: {
    width: "70%",
    height: WP(5),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
    marginBottom: WP(3),
  },
  orgPlaceholder: {
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
    height: WP(3.5),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
    marginBottom: WP(1),
  },
  subTextPlaceholder: {
    width: WP(20),
    height: WP(3),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
  },
  descPlaceholder: {
    width: "100%",
    height: WP(3),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
    marginBottom: WP(1),
  },
  descPlaceholderShort: {
    width: "80%",
    height: WP(3),
    backgroundColor: "#E0E0E0",
    borderRadius: WP(1),
  },
});

export default Card_BlankHorizontal;
