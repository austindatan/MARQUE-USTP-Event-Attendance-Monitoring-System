// @ts-nocheck
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_header";

const Header = ({ onMenuPress, scrollY = new Animated.Value(0), onToggleChange }) => {
  const [activeTab, setActiveTab] = useState<"YourOrg" | "JoinOrgs">("YourOrg");

  const handleToggle = (tab: "YourOrg" | "JoinOrgs") => {
    setActiveTab(tab);
    if (onToggleChange) onToggleChange(tab);
  };

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
    <View style={{ zIndex: 10 }}>
      {/* Top header */}
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

      {/* Search */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            transform: [{ translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, -40], extrapolate: "clamp" }) }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.searchRow,
            {
              opacity: searchOpacity,
              transform: [{ translateY: searchTranslateY }],
            },
          ]}
        >
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={24} color="#fff" style={{ marginRight: 8 }} />
            <TextInput placeholder="Search Teams..." placeholderTextColor="#8c8c8c" style={styles.searchInput} />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Toggle Buttons */}
      <Animated.View
        style={[styles.toggleContainerEX, { backgroundColor: "transparent", transform: [{ translateY: toggleTranslateY }] }]}
      >
        <TouchableOpacity
          style={activeTab === "YourOrg" ? styles.activeButtonEX : styles.inactiveButtonEX}
          onPress={() => handleToggle("YourOrg")}
        >
          <Text style={activeTab === "YourOrg" ? styles.activeTextEX : styles.inactiveTextEX}>Your Orgs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === "JoinOrgs" ? styles.activeButtonEX : styles.inactiveButtonEX}
          onPress={() => handleToggle("JoinOrgs")}
        >
          <Text style={activeTab === "JoinOrgs" ? styles.activeTextEX : styles.inactiveTextEX}>Join Orgs</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Header;