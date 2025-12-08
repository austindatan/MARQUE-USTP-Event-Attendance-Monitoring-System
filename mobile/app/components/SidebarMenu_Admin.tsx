//@ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_sidebar";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { router } from "expo-router";
import LogoutModal from "./LogoutModal";

const adminMenuItems = [
  { name: "Home", icon: "home-outline", route: "/tabs_admin/Dashboard" },
  { name: "Events", icon: "calendar-outline", route: "/tabs_admin/ManageEvents" },
  { name: "Organizations", icon: "briefcase-outline", route: "/tabs_admin/ManageOrganizations" },
  { name: "Users", icon: "people-outline", route: "/tabs_admin/ManageUsers" },
  { name: "History", icon: "book-outline", route: "" },
  { name: "Change Password", icon: "key-outline", route: "" },
];

interface AdminSidebarMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

interface AdminData {
  firstname: string;
  lastname: string;
  email: string;
  profile_image?: string;
}

const AdminSidebarMenu: React.FC<AdminSidebarMenuProps> = ({ isVisible, onClose }) => {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [renderSidebar, setRenderSidebar] = useState(isVisible);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const storedStudentNumber = await AsyncStorage.getItem("student_number");
        if (!storedStudentNumber) return;

        const res = await fetch(`${BASE_URL}/api/student/id/${storedStudentNumber}`);
        if (!res.ok) return;

        const data = await res.json();
        if (data && data.firstname && data.lastname) {
          setAdminData(data);
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };

    fetchAdminData();
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

  const handleMenuItemPress = (route: string) => {
    onClose();
    if (route) {
      router.push(route);
    } else {
      console.warn("⚠️ Route not defined for this menu item.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userRole");
    await AsyncStorage.removeItem("student_number");
    setLogoutModalVisible(false);
    router.replace("/login");
  };

  if (!renderSidebar) return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 1000 }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={[StyleSheet.absoluteFill, { position: "absolute" }]}
      >
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      </TouchableOpacity>

      <Animated.View style={[styles.sidebarContainerAdmin, animatedSidebarStyle]}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: adminData?.profile_image || "https://via.placeholder.com/150" }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <Text style={styles.profileName}>
            {adminData ? `${adminData.firstname} ${adminData.lastname}` : "Loading..."}
          </Text>
          <Text style={styles.profileTitle}>Administrator</Text>
          <Text style={styles.profileEmail}>{adminData?.email ?? ""}</Text>
        </View>

        <View>
          {adminMenuItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item.route)}
            >
              <Ionicons name={item.icon as any} size={24} color="#222762" />
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.menuItem, { marginTop: 20 }]}
            onPress={() => setLogoutModalVisible(true)}
          >
            <Ionicons name="log-out" size={24} color="red" />
            <Text style={[styles.menuText, { color: "red" }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <LogoutModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
      />
    </View>
  );
};

export default AdminSidebarMenu;
