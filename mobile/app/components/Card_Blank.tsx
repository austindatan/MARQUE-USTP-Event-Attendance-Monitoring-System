// @ts-nocheck
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import styles from "../styles/components_blankcard";

const Card_Blank = () => {
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
    <Animated.View style={[styles.shadowWrapper, { opacity: fadeAnim, backgroundColor: '#E0E0E0' }]}>
    </Animated.View>
  );
};

export default Card_Blank;
