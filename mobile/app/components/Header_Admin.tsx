// @ts-nocheck
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_header";

const Header = ({ onMenuPress, scrollY = new Animated.Value(0), onToggleChange }) => {
  return (
    <View style={{ zIndex: 10 }}>
      <View style={[styles.headerfirstPRO, { paddingBottom: 0 }]}>
        <View style={styles.middle}>
          <Image
            source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

export default Header;