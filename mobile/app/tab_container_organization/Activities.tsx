// Activities.tsx (FINAL FIXED CODE)
// @ts-nocheck
import React, { useRef, useState } from "react";
import { View, Animated, Modal, ImageBackground } from "react-native";
import Header from "../components/Header_Activities";
import Incoming from "../tab_container_organization/Incoming";
import Concluded from "../tab_container_organization/Concluded";
import AddActivityButton from "../components/AddActivityButton"; // Import the new component
import { Text } from "react-native"; // Ensure Text is imported if needed for internal components

type TabName = "Incoming" | "Concluded";

const Activities = () => {
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
    // Base container is a View to ensure full flex context
    <View style={{ flex: 1, backgroundColor: 'white' }}> 
      
      {/* 1. Background Layer: ImageBackground placed absolutely */}
      <ImageBackground
        source={require("../../assets/images/marque/SplashScreen.png")}
        // Set position absolute to prevent it from consuming the flex space
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
        resizeMode="cover"
      />

      {/* 2. Content Layer: Tab components occupy the full screen space */}
      <View style={{ flex: 1 }}>
        {activeTab === "Incoming" && <Incoming key="Incoming" {...activeProps} />}
        {activeTab === "Concluded" && <Concluded key="Concluded" {...activeProps} />}
      </View>

      {/* 3. Header Layer: Positioned absolutely on top of everything */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <Header scrollY={activeProps.scrollY} onToggleChange={handleTabChange} />
      </View>

      {/* 4. Floating Action Button Layer: Renders on top of everything. 
          It will rely on its internal absolute positioning (e.g., bottom: 30, right: 30) 
          or inherit a high ZIndex from the container. We keep it as a sibling.
      */}
      <AddActivityButton /> 

      {/* Modal for SidebarMenu remains here */}
      <Modal
        transparent
        visible={/* State for menu visibility */ false} 
        animationType="fade"
        onRequestClose={() => {/* closeModal function */}}
      >
        {/* If you have a sidebar menu, it goes here */}
      </Modal>
    </View>
  );
};

export default Activities;