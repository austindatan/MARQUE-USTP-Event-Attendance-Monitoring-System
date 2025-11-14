import React from "react";
import { View, TextInput, TouchableOpacity, Image, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_header";

const Header = () => {
  return (
    <View>
      {/* Main header */}
      <View style={styles.header}>
        {/* Top row: menu, logo, notifications */}
        <View style={styles.topRow}>
          <TouchableOpacity>
            <Ionicons name="menu" size={30} color="#fff" />
          </TouchableOpacity>

          <Image
            source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#fff"
              style={styles.notif}
            />
          </TouchableOpacity>
        </View>

        {/* Search row */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={24}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Search Teams..."
              placeholderTextColor="#8c8c8c"
              style={[styles.searchInput, { fontFamily: "DMSans-Regular" }]}
            />
          </View>
        </View>
      </View>

      {/* Toggle buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity style={styles.activeButton}>
          <Text style={[styles.activeText, { fontFamily: "DMSans-Bold" }]}>
            Your Orgs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveButton}>
          <Text style={[styles.inactiveText, { fontFamily: "DMSans-Regular" }]}>
            Join Orgs
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;