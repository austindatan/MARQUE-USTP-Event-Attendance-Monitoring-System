import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/component_sidebar";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  if (!isVisible) return null;

  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
  const fetchStudentData = async () => {
    try {
      const storedStudentNumber = await AsyncStorage.getItem("student_number");
      console.log("Stored studentNumber:", storedStudentNumber);

      if (!storedStudentNumber) return;

      const res = await fetch(`${BASE_URL}/api/student/id/${storedStudentNumber}`);
      console.log("Fetch status:", res.status);

      if (!res.ok) {
        console.error("Failed to fetch student data:", res.status);
        return;
      }

      const data = await res.json();
      console.log("Fetched student data:", data);

      // validation
      if (data && data.firstname && data.lastname && data.student_number) {
        setStudentData(data);
      } else {
        console.error("Incomplete student data returned:", data);
      }
    } catch (err) {
      console.error("Error fetching student data:", err);
    }
  };

  fetchStudentData();
}, []);


  const handleOverlayPress = (event: any) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleMenuItemPress = (name: string) => {
    console.log(`Navigating to: ${name}`);
    onClose();
  };

  return (
    <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.modalBackground} />

        <View style={styles.sidebarContainer}>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: studentData?.profile_image || "https://via.placeholder.com/150" }}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <Text style={styles.profileName}>
              {studentData?.firstname && studentData?.lastname
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
            {menuItems.map(item => (
              <TouchableOpacity key={item.name} style={styles.menuItem} onPress={() => handleMenuItemPress(item.name)}>
                <Ionicons name={item.icon as any} size={24} color="#222762" />
                <Text style={styles.menuText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.organizationsButton} onPress={() => handleMenuItemPress("Your Organizations")}>
            <Ionicons name="people-circle-outline" size={24} color="#222762" />
            <Text style={styles.organizationsText}>Your Organizations</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SidebarMenu;
