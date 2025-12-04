import React, { useRef, useState, useEffect } from "react";
import { View, Animated, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header_Events";
import SidebarMenu from "../components/SidebarMenu";
import appeffects from "../styles/effects_app";
import Departments from "../tab_container/Event_Department";
import Organizations from "../tab_container/Event_Organization";
import { BASE_URL } from "../../config";
import { useRouter } from "expo-router";

const Events = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("departments");
  const [studentDept, setStudentDept] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    fetchStudentDepartment();
  }, []);

  const fetchStudentDepartment = async () => {
    try {
      const studentNumber = await AsyncStorage.getItem("student_number");

      if (!studentNumber) {
        return;
      }

      const res = await fetch(`${BASE_URL}/api/student/id/${studentNumber}`);
      const data = await res.json();

      setStudentDept(data.department_id);
    } catch (error) {
      console.log("Error fetching student department:", error);
    }
  };

  const toggleMenu = () => setMenuVisible(prev => !prev);

  const router = useRouter();
  useEffect(() => {
  const checkAuth = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      router.replace("/");
    }
  };
  checkAuth();
}, []);


  return (
    <View style={[appeffects.container, { flex: 1 }]}>
      <Header
        onMenuPress={toggleMenu}
        scrollY={scrollY}
        onToggleChange={setActiveTab}
      />

      {activeTab === "departments" ? (
        <Departments scrollY={scrollY} studentDept={studentDept} />
      ) : (
        <Organizations scrollY={scrollY} /> 
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <SidebarMenu isVisible={menuVisible} onClose={toggleMenu} />
      </Modal>
    </View>
  );
};

export default Events;