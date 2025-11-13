import React, { useState } from "react";
import { View, Text, Modal, StyleSheet } from "react-native";
import Header from "../components/Header_Events";
import SidebarMenu from "../components/SidebarMenu"; 

const Profile = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(prev => !prev);
  };

  return (
    <View style={styles.container}>
      <Header onMenuPress={toggleMenu} />
      
      <Text style={styles.contentText}>Upcoming Events...</Text>

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

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  contentText: { 
    padding: 20 
  }
});

export default Profile;
