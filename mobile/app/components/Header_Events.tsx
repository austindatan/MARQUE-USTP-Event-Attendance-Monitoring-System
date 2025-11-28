// @ts-nocheck
import React, { useState } from "react";
import { View, TouchableOpacity, Image, Text, Animated,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_header";
import { useRouter } from "expo-router";

const Header = ({ onMenuPress, scrollY, onToggleChange }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("departments");
  const animatedScrollY = scrollY || new Animated.Value(0);

  const handleToggle = (tab) => {
    setActiveTab(tab);
    if (onToggleChange) onToggleChange(tab);
  };

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
          style={[
            styles.searchRow,
            {
              opacity: searchOpacity,
              transform: [{ translateY: searchTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.searchContainer}
            onPress={() => router.push("/tab_container/Search_Page")}
          >
            <Ionicons name="search" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: "#8c8c8c", fontSize: 16 }}>Search...</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <View style={styles.filterB}>
              <Ionicons name="filter" size={14} color="#222762" />
            </View>
            <Text style={styles.filterText}>Filters</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.toggleContainer,
          { transform: [{ translateY: toggleTranslateY }] },
        ]}
      >
        <TouchableOpacity
          style={activeTab === "departments" ? styles.activeButton : styles.inactiveButton}
          onPress={() => handleToggle("departments")}
        >
          <Text style={styles.activeText}>Departments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === "organizations" ? styles.activeButton : styles.inactiveButton}
          onPress={() => handleToggle("organizations")}
        >
          <Text style={styles.activeText}>Organizations</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Header;
