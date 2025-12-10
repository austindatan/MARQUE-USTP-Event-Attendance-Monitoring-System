// @ts-nocheck
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_header";
import { useRouter } from "expo-router";

const Header = ({ query = "", setQuery, onBack, onSearchPress }) => {
  const router = useRouter();
  return (
    <View style={{ zIndex: 10 }}>
      <View style={[styles.headerfirstPRO, { paddingBottom: 0 }]}>
        <View style={styles.topRow}>
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

          <TouchableOpacity style={styles.filterButton} onPress={() => router.push("/tab_container/Filter_Page")}>
            <View style={styles.filterB}>
              <Ionicons name="filter" size={14} color="#222762" />
            </View>
            <Text style={styles.filterText}>Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Header;
