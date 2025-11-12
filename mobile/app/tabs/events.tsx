import React, { useRef, useState } from "react";
import { View, Animated, Modal } from "react-native";
import Header from "../components/Header";
import SidebarMenu from "../components/SidebarMenu";
import appeffects from "../styles/effects_app";
import Departments from "../event_container/Department";
import Organizations from "../event_container/Organization";

const Events = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("departments");
  const scrollY = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => setMenuVisible(prev => !prev);

  return (
    <View style={[appeffects.container, { flex: 1 }]}>
      <Header
        onMenuPress={toggleMenu}
        scrollY={scrollY}
        onToggleChange={setActiveTab}
      />

      {activeTab === "departments" ? (
        <Departments scrollY={scrollY} />
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
