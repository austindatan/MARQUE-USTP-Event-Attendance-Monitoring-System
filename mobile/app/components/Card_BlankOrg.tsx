import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import orgStyles from "../styles/components_orgcardslinear";

const Card_BlankOrg = () => {
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
    <View style={orgStyles.card}>
      <Animated.View style={[orgStyles.row, { opacity: fadeAnim }]}>
        <View style={styles.logoPlaceholder} />

        <View style={orgStyles.orgRow}>
          <View style={styles.orgInfoColPlaceholder}>
            <View style={styles.orgNamePlaceholder} />
            <View style={styles.orgDescPlaceholder} />
          </View>

          <View style={styles.buttonPlaceholder} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  orgInfoColPlaceholder: {
    flexDirection: "column",
    flexShrink: 1,
    gap: 4,
  },
  orgNamePlaceholder: {
    width: 120,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  orgDescPlaceholder: {
    width: 180,
    height: 10,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  buttonPlaceholder: {
    width: 55,
    height: 28,
    borderRadius: 7,
    backgroundColor: "#E0E0E0",
  },
});

export default Card_BlankOrg;
