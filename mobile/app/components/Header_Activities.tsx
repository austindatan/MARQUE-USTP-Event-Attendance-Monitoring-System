// @ts-nocheck
import React, { useState } from "react";
import { View, TouchableOpacity, Image, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_header";
import { useRouter } from "expo-router";

// scrollY prop is no longer used for animation
const Header = ({ onMenuPress = () => {}, scrollY, onToggleChange = () => {} }) => {
  const router = useRouter();
  // Removed: scrollY = scrollY instanceof Animated.Value ? scrollY : new Animated.Value(0);
  // It's fine to keep the prop, but no need to initialize here if unused.

  const [activeTab, setActiveTab] = useState<"Back" | "Incoming" | "Concluded">("Incoming");

  const handleToggle = (tab: "Back" | "Incoming" | "Concluded") => {
    setActiveTab(tab);
    if (tab === "Back") {
      router.back(); // handle back navigation
    } else {
      onToggleChange(tab);
    }
  };

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
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

      {/* Search Row - Converted to standard <View> */}
      <View
        style={[
          styles.header,
          {
            paddingTop: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            // REMOVED: transform: [{ translateY: searchTranslateY }],
          },
        ]}
      >
        <View // Replaced Animated.View with View and removed opacity style
          style={styles.searchRow}
        />
      </View>

      {/* Toggle Tabs - Converted to standard <View> */}
      <View
        style={[
          styles.toggleContainerEX,
          {
            backgroundColor: "transparent",
            // REMOVED: transform: [{ translateY: toggleTranslateY }],
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
      </View>
    </View>
  );
};

export default Header;