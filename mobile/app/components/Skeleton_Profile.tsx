import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions, ScrollView } from "react-native";
import profileStyles from "../styles/effects_profile";
import Header from "./Header_Profile";
import Card_Blank from "./Card_BlankProfile";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const vScale = (size) => (Dimensions.get("window").height / 812) * size;

const Skeleton_Profile = () => {
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={profileStyles.container}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          
          {/* Profile Header Block */}
          <View style={profileStyles.profileHeader}>
            <View style={styles.avatarPlaceholder} />
            <View style={styles.namePlaceholder} />
            <View style={styles.deptPlaceholder} />
            <View style={styles.coursePlaceholder} />
          </View>

          {/* Info Block (Student ID and Email) */}
          <View style={profileStyles.infoBlock}>
            <View style={profileStyles.row}>
              <View style={styles.labelPlaceholder} />
              <View style={styles.valuePlaceholder} />
            </View>
            <View style={profileStyles.row}>
              <View style={styles.labelPlaceholder} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.valuePlaceholder} />
                <View style={{ marginLeft: 10, width: 20, height: 20, backgroundColor: "#E0E0E0", borderRadius: 10 }} />
              </View>
            </View>
          </View>

          {/* Attendance Summary */}
          <View style={styles.sectionTitlePlaceholder} />
          
          <View style={profileStyles.attendanceCard}>
            <View style={profileStyles.cardContainer}>
              <Card_Blank />
              <Card_Blank />
              <Card_Blank />
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.sectionTitlePlaceholder} />
          
          <View style={profileStyles.settingsBlock}>
            {[1, 2, 3, 4].map((i) => (
              <View key={`setting-${i}`} style={profileStyles.settingItem}>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#E0E0E0" }} />
                <View style={styles.settingLabelPlaceholder} />
              </View>
            ))}
          </View>

          <View style={{ height: 80 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarPlaceholder: {
    width: scale(95),
    height: scale(95),
    borderRadius: scale(50),
    backgroundColor: "#E0E0E0",
    marginBottom: vScale(10),
  },
  namePlaceholder: {
    width: 200,
    height: 24,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    marginBottom: vScale(5),
  },
  deptPlaceholder: {
    width: 150,
    height: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: vScale(4),
  },
  coursePlaceholder: {
    width: 120,
    height: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginTop: vScale(2),
  },
  labelPlaceholder: {
    width: 80,
    height: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
  valuePlaceholder: {
    width: 140,
    height: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
  sectionTitlePlaceholder: {
    width: 150,
    height: 22,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    marginHorizontal: scale(20),
    marginTop: vScale(28),
    marginBottom: vScale(8),
  },
  settingLabelPlaceholder: {
    width: 120,
    height: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginLeft: scale(10),
  },
});

export default Skeleton_Profile;
