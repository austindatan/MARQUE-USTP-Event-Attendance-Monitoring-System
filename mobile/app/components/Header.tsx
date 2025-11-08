import React from "react";
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_header";

const Header = () => {
  return (
    <View>
      <View style={styles.header}>
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
            <View style={styles.notif}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
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
              <Ionicons name="filter" size={14} color="##222762"/>
            </View>
            <Text style={styles.filterText}>Filters</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity style={styles.activeButton}>
          <Text style={styles.activeText}>Departments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveButton}>
          <Text style={styles.inactiveText}>Organizations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



export default Header;
