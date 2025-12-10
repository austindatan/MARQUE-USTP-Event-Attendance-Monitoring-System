// @ts-nocheck
import React, { useState } from "react";
import { View, TouchableOpacity, Image, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_header";
import { useRouter } from "expo-router";

const Header = ({ onMenuPress = () => { }, scrollY, onToggleChange = () => { } }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Back" | "Incoming" | "Concluded" | "Officers">("Incoming");
  const handleToggle = (tab: "Back" | "Incoming" | "Concluded" | "Officers") => {
    setActiveTab(tab);
    if (tab === "Back") {
      router.back();
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
            <View style={{ backgroundColor: "#0A0F51", padding: 5, borderRadius: 100 }}>
              <Ionicons name="notifications-outline" size={24} color="#0A0F51" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.header,
          {
            paddingTop: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          },
        ]}
      >
        <View
          style={styles.searchRow}
        />
      </View>

      <View
        style={[
          styles.toggleContainerEX,
          {
            backgroundColor: "transparent",
          },
        ]}
      >
        <TouchableOpacity
          style={activeTab === "Incoming" ? styles.activeButtonEX : styles.inactiveButtonEX}
          onPress={() => handleToggle("Incoming")}
        >
          <Text style={styles.activeTextEX}>Incoming</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === "Concluded" ? styles.activeButtonEX : styles.inactiveButtonEX}
          onPress={() => handleToggle("Concluded")}
        >
          <Text style={styles.activeTextEX}>Concluded</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === "Officers" ? styles.activeButtonEX : styles.inactiveButtonEX}
          onPress={() => handleToggle("Officers")}
        >
          <Image
            source={require("../../assets/images/marque/compass.png")}
            style={{ width: 20, height: 20, tintColor: "#fff" }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;