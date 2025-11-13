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
  const scrollY = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => setMenuVisible(prev => !prev);

  const renderContent = () => {
    switch (activeTab) {
      case "incoming":
        return <Incoming scrollY={scrollY} />;
      case "concluded":
        return <Concluded scrollY={scrollY} />;
      case "orgs":
        return <Orgs scrollY={scrollY} />;
      default:
        return null;
    }
  };

  return (
    <View style={[appeffects.container, { flex: 1 }]}>
      <Header
        onMenuPress={toggleMenu}
        scrollY={scrollY}
        onToggleChange={setActiveTab}
      />

      {renderContent()}

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

export default Explore;
