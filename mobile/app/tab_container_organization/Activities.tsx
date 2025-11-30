// Activities.tsx
// @ts-nocheck
import React, { useRef, useState } from "react";
import { View, Animated, Modal, ImageBackground } from "react-native";
import Header from "../components/Header_Activities";
import Incoming from "../tab_container_organization/Incoming";
import Concluded from "../tab_container_organization/Concluded";

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
    <ImageBackground
      source={require("../../assets/images/marque/SplashScreen.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <Header scrollY={activeProps.scrollY} onToggleChange={handleTabChange} />

      {activeTab === "Incoming" && <Incoming key="Incoming" {...activeProps} />}
      {activeTab === "Concluded" && <Concluded key="Concluded" {...activeProps} />}
    </ImageBackground>
  );
};

export default Activities;