// @ts-nocheck
import React, { useRef, useState, useEffect } from "react";
import { View, Animated, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import Header from "../components/Header_Activities";
import Incoming from "./Incoming";
import Concluded from "./Concluded";
import Officers from "./Officers";
import AddActivityButton from "../components/AddActivityButton";
import SidebarMenu from "../components/SidebarMenu_Organization";
import Skeleton_Incoming from "../components/Skeleton_Incoming";
import appeffects from "../styles/effects_app";
import { BASE_URL } from "../../config"; 

// Define the roles 
const OFFICER_ROLES = ["Manager", "President"];

type TabName = "Incoming" | "Concluded" | "Officers";

const Activities = () => {
  const router = useRouter();
  const { orgId } = useLocalSearchParams();

  const [userRole, setUserRole] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState<TabName>("Incoming");

  const incomingScrollY = useRef(new Animated.Value(0)).current;
  const concludedScrollY = useRef(new Animated.Value(0)).current;
  const officersScrollY = useRef(new Animated.Value(0)).current;

  const tabScrollPositions = useRef<Record<TabName, number>>({
    Incoming: 0,
    Concluded: 0,
    Officers: 0,
  }).current;

  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => setMenuVisible((prev) => !prev);
  
  const isOfficerTabAllowed = OFFICER_ROLES.includes(userRole);

  // ROLE FETCHING LOGIC
  useEffect(() => {
    const fetchUserRoleForOrganization = async () => {
      setIsLoading(true); 

      const storedStudentNumber = await AsyncStorage.getItem("student_number");

      if (!storedStudentNumber || !orgId) {
        console.warn("[DEBUG] Missing student number or organization ID. Aborting role fetch.");
        setUserRole("Committee"); 
        setIsLoading(false);
        return;
      }
      
      try {
        const studentIdUrl = `${BASE_URL}/api/student/id/${storedStudentNumber}`;
        const resStudent = await fetch(studentIdUrl);
        if (!resStudent.ok) throw new Error(`Could not find student profile. Status: ${resStudent.status}`);
        const student = await resStudent.json();
        const studentId = student._id;

        if (!studentId) throw new Error("Student ID is missing from profile data.");
        
        const joinedOrgsUrl = `${BASE_URL}/api/memberships/student/${studentId}`;
        const response = await fetch(joinedOrgsUrl); 
        if (!response.ok) throw new Error(`API returned status ${response.status}`);
        
        const joinedOrgs = await response.json(); 
        const currentOrgLink = joinedOrgs.find(org => org._id === orgId);
        const fetchedRole = currentOrgLink ? currentOrgLink.role : null; 
        
        setUserRole(fetchedRole);

        if (!OFFICER_ROLES.includes(fetchedRole) && activeTab === "Officers") {
          setActiveTab("Incoming");
        }

      } catch (error) {
        console.error("Error fetching user role:", error.message);
        setUserRole(null); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoleForOrganization();

  }, [orgId]); 

  if (isLoading) {
    return (
      <View style={[appeffects.container, { flex: 1 }]}>
        <Header
          onMenuPress={() => {}}
          scrollY={incomingScrollY}
          onToggleChange={() => {}}
          isOfficerTabAllowed={false}
        />
        <Skeleton_Incoming />
      </View>
    );
  }

  const createScrollHandler = (tabName, animatedValue) => (event) => {
    const y = event.nativeEvent.contentOffset.y;
    animatedValue.setValue(y);
    tabScrollPositions[tabName] = y;
  };

  const handleTabChange = (newTab: TabName) => {
    if (newTab === "Officers" && !isOfficerTabAllowed) {
        console.warn("User attempted to access Officers tab without permission.");
        return; 
    }
    
    setActiveTab(newTab);

    let scrollValue;
    if (newTab === "Incoming") scrollValue = incomingScrollY;
    else if (newTab === "Concluded") scrollValue = concludedScrollY;
    else scrollValue = officersScrollY;

    const lastScrollPos = tabScrollPositions[newTab] || 0;
    scrollValue.setValue(lastScrollPos);
  };

  const getActiveScrollProps = () => {
    if (activeTab === "Incoming") {
      return {
        scrollY: incomingScrollY,
        handleScroll: createScrollHandler("Incoming", incomingScrollY),
        initialScroll: tabScrollPositions.Incoming,
      };
    } else if (activeTab === "Concluded") {
      return {
        scrollY: concludedScrollY,
        handleScroll: createScrollHandler("Concluded", concludedScrollY),
        initialScroll: tabScrollPositions.Concluded,
      };
    } else {
      return {
        scrollY: officersScrollY,
        handleScroll: createScrollHandler("Officers", officersScrollY),
        initialScroll: tabScrollPositions.Officers,
      };
    }
  };

  const activeProps = getActiveScrollProps();

  return (
    <View style={[appeffects.container, { flex: 1 }]}>
      <Header
        onMenuPress={toggleMenu}
        scrollY={activeProps.scrollY}
        onToggleChange={handleTabChange}
        isOfficerTabAllowed={isOfficerTabAllowed} 
      />

      {activeTab === "Incoming" && (
        <Incoming key="Incoming" {...activeProps} organizationId={orgId} />
      )}
      {activeTab === "Concluded" && (
        <Concluded key="Concluded" {...activeProps} organizationId={orgId} />
      )}
      {isOfficerTabAllowed && activeTab === "Officers" && (
        <Officers key="Officers" {...activeProps} organizationId={orgId} />
      )}

      {/* CONDITIONAL RENDER */}
      {isOfficerTabAllowed && (
        <AddActivityButton
            onPress={() =>
            router.push({
                pathname: "/tab_container_organization/EditEvents",
                params: { orgId },
            })
            }
        />
      )}

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <SidebarMenu isVisible={menuVisible} onClose={toggleMenu} />
      </Modal>
    </View>
  );
};

export default Activities;