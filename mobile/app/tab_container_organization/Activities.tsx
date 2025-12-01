// Activities.tsx
// @ts-nocheck
import React, { useRef, useState } from "react";
import { View, Animated, Modal, ImageBackground, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

import Header from "../components/Header_Activities";
import Incoming from "../tab_container_organization/Incoming";
import Concluded from "../tab_container_organization/Concluded";
import AddActivityButton from "../components/AddActivityButton"; // Floating action button

type TabName = "Incoming" | "Concluded";

const Activities = () => {
  const { orgId } = useLocalSearchParams(); // get orgId from route
  const [activeTab, setActiveTab] = useState<TabName>("Incoming");

  // Scroll values for each tab
  const incomingScrollY = useRef(new Animated.Value(0)).current;
  const concludedScrollY = useRef(new Animated.Value(0)).current;

  // Save last scroll positions per tab
  const tabScrollPositions = useRef<Record<TabName, number>>({
    Incoming: 0,
    Concluded: 0,
  }).current;

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

  // Switch tab and restore scroll
  const handleTabChange = (newTab: TabName) => {
    setActiveTab(newTab);

    const scrollValue = newTab === "Incoming" ? incomingScrollY : concludedScrollY;
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Background */}
      <ImageBackground
        source={require("../../assets/images/marque/SplashScreen.png")}
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
        resizeMode="cover"
      />

      {/* Tabs */}
      <View style={{ flex: 1 }}>
        {activeTab === "Incoming" && <Incoming key="Incoming" {...activeProps} organizationId={orgId} />}
        {activeTab === "Concluded" && <Concluded key="Concluded" {...activeProps} organizationId={orgId} />}
      </View>

      {/* Header */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
        <Header scrollY={activeProps.scrollY} onToggleChange={handleTabChange} />
      </View>

      {/* Floating Action Button */}
      <AddActivityButton />

      {/* Modal placeholder */}
      <Modal transparent visible={false} animationType="fade" onRequestClose={() => {}}>
        {/* Sidebar menu goes here */}
      </Modal>
    </View>
  );
};

export default Activities;
