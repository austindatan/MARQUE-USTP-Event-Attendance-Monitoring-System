// Activities.tsx
// @ts-nocheck
import React, { useRef, useState } from "react";
import { View, Animated, Modal, ImageBackground } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Header from "../components/Header_Activities";
import Incoming from "../tab_container_organization/Incoming";
import Concluded from "../tab_container_organization/Concluded";
import AddActivityButton from "../components/AddActivityButton";
import SidebarMenu from "../components/SidebarMenu_Organization";
import appeffects from "../styles/effects_app";

type TabName = "Incoming" | "Concluded";

const Activities = () => {
  const { orgId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabName>("Incoming");

  // Scroll values for each tab
  const incomingScrollY = useRef(new Animated.Value(0)).current;
  const concludedScrollY = useRef(new Animated.Value(0)).current;

  // Save last scroll positions
  const tabScrollPositions = useRef<Record<TabName, number>>({
    Incoming: 0,
    Concluded: 0,
  }).current;

  // Sidebar modal state
  const [menuVisible, setMenuVisible] = useState(false);
  const toggleMenu = () => setMenuVisible((prev) => !prev);

  // Track scroll per tab
  const createScrollHandler = (tabName: TabName, animatedValue: Animated.Value) =>
    Animated.event(
      [{ nativeEvent: { contentOffset: { y: animatedValue } } }],
      {
        useNativeDriver: true,
        listener: (event: any) => {
          tabScrollPositions[tabName] = event.nativeEvent.contentOffset.y;
        },
      }
    );

  // Switch tabs and restore scroll
  const handleTabChange = (newTab: TabName) => {
    setActiveTab(newTab);

    const scrollValue = newTab === "Incoming" ? incomingScrollY : concludedScrollY;
    const lastScrollPos = tabScrollPositions[newTab] || 0;

    scrollValue.setValue(lastScrollPos);
  };

  // Provide active tab props
  const getActiveScrollProps = () => {
    if (activeTab === "Incoming") {
      return {
        scrollY: incomingScrollY,
        handleScroll: createScrollHandler("Incoming", incomingScrollY),
        initialScroll: tabScrollPositions.Incoming,
      };
    } else {
      return {
        scrollY: concludedScrollY,
        handleScroll: createScrollHandler("Concluded", concludedScrollY),
        initialScroll: tabScrollPositions.Concluded,
      };
    }
  };

  const activeProps = getActiveScrollProps();

  return (
    <View style={[appeffects.container, { flex: 1 }]}>
      {/* HEADER */}
      <Header
        onMenuPress={toggleMenu} // Trigger sidebar modal
        scrollY={activeProps.scrollY}
        onToggleChange={handleTabChange}
      />

      {/* ACTIVE TAB CONTENT */}
      {activeTab === "Incoming" && (
        <Incoming key="Incoming" {...activeProps} organizationId={orgId} />
      )}
      {activeTab === "Concluded" && (
        <Concluded key="Concluded" {...activeProps} organizationId={orgId} />
      )}

      {/* Floating Action Button */}
      <AddActivityButton />

      {/* Sidebar as Modal */}
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