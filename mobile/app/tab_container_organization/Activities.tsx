// @ts-nocheck
import React, { useRef, useState } from "react";
import { View, Animated, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../components/Header_Activities";
import Incoming from "./Incoming";
import Concluded from "./Concluded";
import Officers from "./Officers";
import AddActivityButton from "../components/AddActivityButton";
import SidebarMenu from "../components/SidebarMenu_Organization";
import appeffects from "../styles/effects_app";

type TabName = "Incoming" | "Concluded" | "Officers";

const Activities = () => {
  const router = useRouter(); // <<< ADDED
  const { orgId } = useLocalSearchParams();

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

  const createScrollHandler = (tabName, animatedValue) => (event) => {
    const y = event.nativeEvent.contentOffset.y;
    animatedValue.setValue(y);
    tabScrollPositions[tabName] = y;
  };

  const handleTabChange = (newTab: TabName) => {
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
      />

      {activeTab === "Incoming" && (
        <Incoming key="Incoming" {...activeProps} organizationId={orgId} />
      )}
      {activeTab === "Concluded" && (
        <Concluded key="Concluded" {...activeProps} organizationId={orgId} />
      )}
      {activeTab === "Officers" && (
        <Officers key="Officers" {...activeProps} organizationId={orgId} />
      )}

      {/* ROUTED BUTTON */}
      <AddActivityButton
        onPress={() =>
          router.push({
            pathname: "/tab_container_organization/EditEvents",
            params: { orgId },
          })
        }
      />

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
