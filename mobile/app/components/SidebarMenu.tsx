import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_sidebar";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS, } from "react-native-reanimated";

const menuItems = [
  { name: "Home", icon: "home-outline" },
  { name: "Notifications", icon: "notifications-outline" },
  { name: "Bookmarks", icon: "bookmark-outline" },
  { name: "Profile", icon: "person-outline" },
];

interface SidebarMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

interface StudentData {
  firstname: string;
  lastname: string;
  email: string;
  student_number: string;
  department_code: string;
  college_name: string;
  profile_image?: string;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isVisible, onClose }) => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [renderSidebar, setRenderSidebar] = useState(isVisible);

 
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const storedStudentNumber = await AsyncStorage.getItem(
          "student_number"
        );
        if (!storedStudentNumber) return;

        const res = await fetch(
          `${BASE_URL}/api/student/id/${storedStudentNumber}`
        );
        if (!res.ok) return;

        const data = await res.json();
        if (data && data.firstname && data.lastname) {
          setStudentData(data);
        }
      } catch (err) {
        console.error("Error fetching student data:", err);
      }
    };

    fetchStudentData();
  }, []);

  //animation
  const translateX = useSharedValue(-300);

  useEffect(() => {
    if (isVisible) {
      setRenderSidebar(true); //opening
      translateX.value = withTiming(0, { duration: 250 });
    } else {
      translateX.value = withTiming(-300, { duration: 250 }, () => {
        runOnJS(setRenderSidebar)(false); //closing
      });
    }
  }, [isVisible]);

  const animatedSidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleMenuItemPress = (name: string) => {
    console.log("Navigating to:", name);
    onClose();
  };

  if (!renderSidebar) return null;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={[StyleSheet.absoluteFill, { position: "absolute" }]}
      >
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      </TouchableOpacity>

      <Animated.View style={[styles.sidebarContainer, animatedSidebarStyle]}>
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri:
                studentData?.profile_image ||
                "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <Text style={styles.profileName}>
            {studentData
              ? `${studentData.firstname} ${studentData.lastname}`
              : "Loading..."}
          </Text>
          <Text style={styles.profileTitle}>
            {studentData
              ? `${studentData.department_code} | STUDENT ID: ${studentData.student_number}`
              : ""}
          </Text>
          <Text style={styles.profileEmail}>{studentData?.email ?? ""}</Text>
        </View>

        <View>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.name)}
            >
              <Ionicons name={item.icon as any} size={24} color="#222762" />
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.organizationsButton}
          onPress={() => handleMenuItemPress("Your Organizations")}
        >
          <Ionicons name="people-circle-outline" size={24} color="#222762" />
          <Text style={styles.organizationsText}>Your Organizations</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default SidebarMenu;
