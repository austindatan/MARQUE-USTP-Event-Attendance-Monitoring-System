import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_sidebar";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { router } from "expo-router";
import { useUnreadNotifications } from "../hooks/useUnreadNotifications";
import NotificationBadge from "./NotificationBadge";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  role?: "Committee" | "Manager" | "President" | "Admin" | "Student";
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isVisible, onClose }) => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [renderSidebar, setRenderSidebar] = useState(isVisible);
  const hasUnread = useUnreadNotifications();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const storedStudentNumber = await AsyncStorage.getItem("student_number");
        if (!storedStudentNumber) return;

        // 1️⃣ Fetch basic student info
        const resStudent = await fetch(`${BASE_URL}/api/student/id/${storedStudentNumber}`);
        if (!resStudent.ok) return;
        const student = await resStudent.json();

        // 2️⃣ Fetch Org_officer roles for this student
        const resOrgs = await fetch(`${BASE_URL}/api/memberships/student/${student._id}`);
        let orgs = [];
        if (resOrgs.ok) {
          orgs = await resOrgs.json();
        }

        // 3️⃣ Determine Org role for conditional button
        const orgRole = orgs.find((org: any) =>
          org && typeof org.role === "string" && ["Committee", "Manager", "President"].includes(org.role)
        )?.role || null;


        setStudentData({ ...student, role: orgRole });
      } catch (err) {
        console.error("Error fetching student data and org roles:", err);
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

    type MenuName = "Home" | "Notifications" | "Bookmarks" | "Profile";

    const routes = {
      Home: "/tabs/Events",
      Bookmarks: "/tab_container/Bookmark_Page",
      Notifications: "/tab_container/Notifications",
      Profile: "/tabs/Profile",
    } as const;

    type RoutePath = typeof routes[keyof typeof routes];

    if (name === "Your Organizations") {
      try {
        router.push("/tabs_organization/Teams");
        return;
      } catch (err) {
        console.error("Error navigating to Organizations:", err);
        return;
      }
    }

    if (name in routes) {
      router.push(routes[name as MenuName] as RoutePath);
    } else {
      console.warn(`⚠️ No route found for menu item: ${name}`);
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

      <Animated.View style={[styles.sidebarContainer, animatedSidebarStyle, { paddingTop: insets.top }]}>
        <View style={styles.profileContainer}>
          <Image
            source={
              studentData?.profile_image
                ? { uri: studentData.profile_image }
                : require("../../assets/images/marque/profile_marque.png")
            }
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
              <View style={{ position: 'relative' }}>
                <Ionicons name={item.icon as any} size={24} color="#222762" />
                {item.name === "Notifications" && (
                  <NotificationBadge show={hasUnread} size={10} top={-2} right={-2} />
                )}
              </View>
              <Text style={styles.menuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conditionally show "Your Organizations" button based on Org role */}
        {["Committee", "Manager", "President"].includes(studentData?.role || "") && (
          <TouchableOpacity
            style={styles.organizationsButton}
            onPress={() => handleMenuItemPress("Your Organizations")}
          >
            <Ionicons name="people-circle-outline" size={24} color="#fff" />
            <Text style={styles.organizationsText}>Your Organizations</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

export default SidebarMenu;
