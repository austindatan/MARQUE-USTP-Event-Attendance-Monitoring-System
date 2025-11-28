// @ts-nocheck
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  Animated,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_search_header";
import { useRouter } from "expo-router";

const Header = ({ query = "", setQuery, onBack, onMenuPress, scrollY = new Animated.Value(0), onToggleChange, onSearchPress }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("departments");

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
    <View>
      <View style={[styles.headerfirst, { paddingBottom: 0 }]}>
        <View style={styles.topRow}>
          {onMenuPress && (
            <TouchableOpacity onPress={onMenuPress}>
              <Ionicons name="menu" size={30} color="#fff" />
            </TouchableOpacity>
          )}
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
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#8c8c8c"
              value={query}
              onChangeText={setQuery}
              autoFocus={!!setQuery}
            />
            {query && setQuery && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={20} color="#8c8c8c" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <View style={styles.filterB}>
              <Ionicons name="filter" size={14} color="#222762" />
            </View>
            <Text style={styles.filterText}>Filters</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default Header;