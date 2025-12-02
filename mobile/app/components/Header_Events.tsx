// Header_Activities.tsx
// @ts-nocheck
import React, { useState } from "react";
import { View, TouchableOpacity, Image, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_header";
import { useRouter } from "expo-router";

const Header = ({ onMenuPress = () => {}, scrollY, onToggleChange = () => {} }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Back" | "Incoming" | "Concluded">("Incoming");

  // Improved scrollY handling
  const animatedScrollY = scrollY || new Animated.Value(0);

  const handleToggle = (tab: "Back" | "Incoming" | "Concluded") => {
    setActiveTab(tab);
    if (tab === "Back") {
      router.back(); // Back navigation
    } else if (onToggleChange) {
      onToggleChange(tab);
    }
  };

  // Animations
  const searchOpacity = animatedScrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const searchTranslateY = animatedScrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -30],
    extrapolate: "clamp",
  });

  const toggleTranslateY = animatedScrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  return (
    <View style={{ zIndex: 10 }}>
      {/* Top header with menu, logo, notifications */}
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

      {/* Animated search row */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            transform: [
              {
                translateY: animatedScrollY.interpolate({
                  inputRange: [0, 80],
                  outputRange: [0, -40],
                  extrapolate: "clamp",
                }),
              },
            ],
          },
        ]}
      >
        <Animated.View
          style={[styles.searchRow, { opacity: searchOpacity, transform: [{ translateY: searchTranslateY }] }]}
        >
          {/* Search bar */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.searchContainer}
            onPress={() => router.push("/tab_container/Search_Page")}
          >
            <Ionicons name="search" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: "#8c8c8c", fontSize: 16 }}>Search...</Text>
          </TouchableOpacity>

          {/* Filter button */}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => router.push("/tab_container/Filter_Page")}
          >
            <View style={styles.filterB}>
              <Ionicons name="filter" size={14} color="#222762" />
            </View>
            <Text style={styles.filterText}>Filters</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Toggle tabs */}
      <Animated.View
        style={[styles.toggleContainer, { backgroundColor: "transparent", transform: [{ translateY: toggleTranslateY }] }]}
      >
        {/* Incoming tab */}
        <TouchableOpacity
          style={activeTab === "Incoming" ? styles.activeButton : styles.inactiveButton}
          onPress={() => handleToggle("Incoming")}
        >
          <Text style={styles.activeText}>Incoming</Text>
        </TouchableOpacity>

        {/* Concluded tab */}
        <TouchableOpacity
          style={activeTab === "Concluded" ? styles.activeButton : styles.inactiveButton}
          onPress={() => handleToggle("Concluded")}
        >
          <Text style={styles.activeText}>Concluded</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Header;