// @ts-nocheck
import React, { useState } from "react";
import { View, TouchableOpacity, Image, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_header";
import { useRouter } from "expo-router";

// Total header height (adjust to match your design)
export const HEADER_HEIGHT = 140;

const Header = ({ onMenuPress = () => {}, scrollY, onToggleChange = () => {} }) => {
  const router = useRouter();
  scrollY = scrollY instanceof Animated.Value ? scrollY : new Animated.Value(0);

  const [activeTab, setActiveTab] = useState<"Back" | "Incoming" | "Concluded">("Incoming");

  const handleToggle = (tab: "Back" | "Incoming" | "Concluded") => {
    setActiveTab(tab);
    if (tab === "Back") {
      router.back(); // handle back navigation
    } else {
      onToggleChange(tab);
    }
  };

  // Scroll animations
  const searchOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const searchTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -30],
    extrapolate: "clamp",
  });

  const toggleTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        height: HEADER_HEIGHT,
        backgroundColor: "transparent",
      }}
    >
      {/* Top Row (menu, logo, notifications) */}
      <View style={[styles.headerfirst, { paddingBottom: 0 }]}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={onMenuPress}>
            <Ionicons name="menu" size={30} color="#fff" />
          </TouchableOpacity>

          <Image
            source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity>
            <View style={styles.notif}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Row (optional, animated) */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            transform: [{ translateY: searchTranslateY }],
          },
        ]}
      >
        <Animated.View
          style={[styles.searchRow, { opacity: searchOpacity }]}
        />
      </Animated.View>

      {/* Toggle Tabs */}
      <Animated.View
        style={[
          styles.toggleContainerEX,
          {
            backgroundColor: "transparent",
            transform: [{ translateY: toggleTranslateY }],
          },
        ]}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={activeTab === "Back" ? styles.activeButtonEX : styles.inactiveButtonEX}
          onPress={() => handleToggle("Back")}
        >
          <Image
            source={require("../../assets/images/marque/arrow-left.png")}
            style={{ width: 20, height: 20, tintColor: "#fff" }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Incoming Tab */}
        <TouchableOpacity
          style={activeTab === "Incoming" ? styles.activeButtonEX : styles.inactiveButtonEX}
          onPress={() => handleToggle("Incoming")}
        >
          <Text style={styles.activeTextEX}>Incoming</Text>
        </TouchableOpacity>

        {/* Concluded Tab */}
        <TouchableOpacity
          style={activeTab === "Concluded" ? styles.activeButtonEX : styles.inactiveButtonEX}
          onPress={() => handleToggle("Concluded")}
        >
          <Text style={styles.activeTextEX}>Concluded</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Header;