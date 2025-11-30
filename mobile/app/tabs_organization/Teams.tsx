// Teams.tsx
import React, { useRef, useState } from "react";
import { View, Animated, Modal, ImageBackground } from "react-native";
import Header from "../components/Header_Teams";
import SidebarMenu from "../components/SidebarMenu_Organization";
import YourOrg from "../tab_container_organization/YourOrg";
import JoinOrgs from "../tab_container_organization/JoinOrgs";

type TabName = "JoinOrgs" | "YourOrg";

const Teams = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>("YourOrg");

  // Scroll values for each tab
  const joinScrollY = useRef(new Animated.Value(0)).current;
  const yourScrollY = useRef(new Animated.Value(0)).current;

  // Save last scroll position of each tab
  const tabScrollPositions = useRef<Record<TabName, number>>({
    JoinOrgs: 0,
    YourOrg: 0,
  }).current;

  const toggleMenu = () => setMenuVisible((prev) => !prev);

  // Track scroll per tab
  const createScrollHandler = (
    tabName: TabName,
    animatedValue: Animated.Value
  ) =>
    Animated.event(
      [{ nativeEvent: { contentOffset: { y: animatedValue } } }],
      {
        useNativeDriver: true,
        listener: (event: any) => {
          tabScrollPositions[tabName] = event.nativeEvent.contentOffset.y;
        },
      }
    );

  // When switching tabs
  const handleTabChange = (newTab: TabName) => {
    setActiveTab(newTab);

    const scrollValue = newTab === "JoinOrgs" ? joinScrollY : yourScrollY;
    const lastScrollPos = tabScrollPositions[newTab] || 0;

    // Restore previous tab scroll
    scrollValue.setValue(lastScrollPos);
  };

  // Provide active tab props
  const getActiveScrollProps = () => {
    if (activeTab === "JoinOrgs") {
      return {
        scrollY: joinScrollY,
        handleScroll: createScrollHandler("JoinOrgs", joinScrollY),
        initialScroll: tabScrollPositions.JoinOrgs,
      };
    } else {
      return {
        scrollY: yourScrollY,
        handleScroll: createScrollHandler("YourOrg", yourScrollY),
        initialScroll: tabScrollPositions.YourOrg,
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
      <Header
        onMenuPress={toggleMenu}
        scrollY={activeProps.scrollY}
        onToggleChange={handleTabChange}
      />

      {activeTab === "JoinOrgs" && (
        <JoinOrgs key="JoinOrgs" {...activeProps} />
      )}

      {activeTab === "YourOrg" && (
        <YourOrg key="YourOrg" {...activeProps} />
      )}

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <SidebarMenu isVisible={menuVisible} onClose={toggleMenu} />
      </Modal>
    </ImageBackground>
  );
};

export default Teams;