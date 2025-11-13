// @ts-nocheck
import React, { useRef, useState } from "react";
import { View, Animated, Modal } from "react-native";
import Header from "../components/Header_Explore";
import SidebarMenu from "../components/SidebarMenu";
import appeffects from "../styles/effects_app";
import Incoming from "../tab_container/Explore_Incoming";
import Concluded from "../tab_container/Explore_Concluded";
import Orgs from "../tab_container/Explore_Orgs";

const Explore = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("incoming");
  
  const incomingScrollY = useRef(new Animated.Value(0)).current;
  const concludedScrollY = useRef(new Animated.Value(0)).current;
  const orgsScrollY = useRef(new Animated.Value(0)).current;
  
  const tabScrollPositions = useRef({
    incoming: 0,
    concluded: 0,
    orgs: 0,
  }).current; 

  const toggleMenu = () => setMenuVisible(prev => !prev);

  const handleScroll = (tabName, animatedValue) => Animated.event(
    [{ nativeEvent: { contentOffset: { y: animatedValue } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        tabScrollPositions[tabName] = event.nativeEvent.contentOffset.y;
      },
    }
  );

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    
    let newScrollY;
    let newScrollPosition;

    if (newScrollY) {
        newScrollY.setValue(newScrollPosition);
    }
  };

  const getActiveScrollState = () => {
    switch (activeTab) {
      case "incoming":
        return { 
          scrollY: incomingScrollY, 
          handleScroll: handleScroll('incoming', incomingScrollY),
          initialScroll: tabScrollPositions.incoming,
        };
      case "concluded":
        return { 
          scrollY: concludedScrollY, 
          handleScroll: handleScroll('concluded', concludedScrollY),
          initialScroll: tabScrollPositions.concluded, 
        };
      case "orgs":
        return { 
          scrollY: orgsScrollY, 
          handleScroll: handleScroll('orgs', orgsScrollY),
          initialScroll: tabScrollPositions.orgs, 
        };
      default:
        return { scrollY: incomingScrollY, handleScroll: () => {}, initialScroll: 0 };
    }
  };

  const activeProps = getActiveScrollState();
  
  return (
    <View style={[appeffects.container, { flex: 1 }]}>
      <Header
        onMenuPress={toggleMenu}
        scrollY={activeProps.scrollY}
        onToggleChange={handleTabChange} 
      />

      {activeTab === "incoming" && <Incoming key="incoming" {...activeProps} />}
      {activeTab === "concluded" && <Concluded key="concluded" {...activeProps} />}
      {activeTab === "orgs" && <Orgs key="orgs" {...activeProps} />}

      <Modal
        animationType="fade"
        transparent
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <SidebarMenu isVisible={menuVisible} onClose={toggleMenu} />
      </Modal>
    </View>
  );
};

export default Explore;