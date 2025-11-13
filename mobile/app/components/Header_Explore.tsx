// @ts-nocheck
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_header";
import { useRouter } from "expo-router";

const Header = ({ onMenuPress, scrollY = new Animated.Value(0), onToggleChange }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("incoming");

  const handleToggle = (tab) => {
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
                translateY: scrollY.interpolate({
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
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={24} color="#fff" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search..."
              placeholderTextColor="#8c8c8c"
              style={styles.searchInput}
            />
          </View>

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
          styles.toggleContainerEX,
          { backgroundColor: "transparent", transform: [{ translateY: toggleTranslateY }] },
        ]}
      >
        <TouchableOpacity
          style={activeTab === "incoming" ? styles.activeButtonEX : styles.inactiveButtonEX}
          onPress={() => handleToggle("incoming")}
        >
          <Text style={styles.activeTextEX}>Incoming</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === "concluded" ? styles.activeButtonEX : styles.inactiveButtonEX}
          onPress={() => handleToggle("concluded")}
        >
          <Text style={styles.activeTextEX}>Concluded</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === "orgs" ? styles.activeButtonEX : styles.inactiveButtonEX}
          onPress={() => handleToggle("orgs")}
        >
          <Text style={styles.activeTextEX}>Orgs</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Header;