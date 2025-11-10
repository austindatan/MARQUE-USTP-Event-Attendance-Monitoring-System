import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, Image } from "react-native";
import Header from "../components/Header";
import SidebarMenu from "../components/SidebarMenu";
import appeffects from "../styles/effects_app";
import EventCard from "../components/EventCard";

const Events = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(prev => !prev);
  };

  return (
    <View style={appeffects.container}>
      <Header onMenuPress={toggleMenu} />
      
      <View style={appeffects.pageStarter}>
        <Text style={appeffects.pageTitle}>Upcoming Events</Text>
        <Text style={appeffects.pageSubtitle}>Filtered by Dept.</Text>
      </View>

      <View style={appeffects.eventList}>

        <EventCard
          image={require("../../assets/images/marque/crtcg1.png")}
          title="Last Cookie Standing!"
          organization="Cooking Run Kingdom"
          orgLogo={require("../../assets/images/marque/crk.jpg")}
          orgDate="November 10"
          dateDay="17"
          dateMonth="NOV"
          description="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
        />

        <EventCard
          image={require("../../assets/images/marque/crtcg1.png")}
          title="Last Cookie Standing!"
          organization="Cooking Run Kingdom"
          orgLogo={require("../../assets/images/marque/crk.jpg")}
          orgDate="November 10"
          dateDay="17"
          dateMonth="NOV"
          description="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
        />

      </View>

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