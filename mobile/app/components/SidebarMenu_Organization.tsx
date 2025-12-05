import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_sidebar";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { router } from "expo-router";

const menuItems = [
  { name: "Home", icon: "home-outline" },
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

const SidebarMenuOrganization: React.FC<SidebarMenuProps> = ({ isVisible, onClose }) => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [renderSidebar, setRenderSidebar] = useState(isVisible);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const storedStudentNumber = await AsyncStorage.getItem("student_number");
        if (!storedStudentNumber) return;

        const res = await fetch(`${BASE_URL}/api/student/id/${storedStudentNumber}`);
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

  const translateX = useSharedValue(-300);

  useEffect(() => {
    if (isVisible) {
      setRenderSidebar(true);
      translateX.value = withTiming(0, { duration: 250 });
    } else {
      translateX.value = withTiming(-300, { duration: 250 }, () => {
        runOnJS(setRenderSidebar)(false);
      });
    }
  }, [isVisible]);

  const animatedSidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleMenuItemPress = async (name: string) => {
    onClose();

    if (name === "Student Side") {
      try {
        const studentNumber = await AsyncStorage.getItem("student_number");
        if (!studentNumber) {
          console.log("No student number found in AsyncStorage.");
          return;
        }

        router.push("/tabs/Events");
      } catch (err) {
        console.error("Error navigating to Student Side:", err);
      }
    } else {
      console.log("Navigating to:", name);
    }
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
            source={{ uri: studentData?.profile_image || "https://via.placeholder.com/150" }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <Text style={styles.profileName}>
            {studentData ? `${studentData.firstname} ${studentData.lastname}` : "Loading..."}
          </Text>
          <Text style={styles.profileTitle}>
            {studentData ? `${studentData.department_code} | STUDENT ID: ${studentData.student_number}` : ""}
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
              <Ionicons name="home-outline" size={24} color="#000" />
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.organizationsButton}
          onPress={() => handleMenuItemPress("Student Side")}
        >
          <Ionicons name="people-circle-outline" size={24} color="#fff" />
          <Text style={styles.organizationsText}>Student Side</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default SidebarMenuOrganization;