import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, TouchableWithoutFeedback, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/sidebar_styles"; 


const menuItems = [
  { name: "Home", icon: "home-outline" },
  { name: "Notifications", icon: "notifications-outline" },
  { name: "Bookmarks", icon: "bookmark-outline" },
  { name: "Profile", icon: "person-outline" },
];

interface SidebarMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isVisible, onClose }) => {
  if (!isVisible) {
    return null; 
  }

  
  const handleOverlayPress = (event: any) => {
    
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleMenuItemPress = (name: string) => {
    console.log(`Navigating to: ${name}`);
   
    onClose(); 
  };

  return (
    
    <TouchableWithoutFeedback onPress={handleOverlayPress}>
      <View style={StyleSheet.absoluteFillObject}>
        
        <View style={styles.modalBackground} />
        
       
        <View style={styles.sidebarContainer}>
          
          
          <View style={styles.profileContainer}>
            <Image
              source= {require("../../assets/images/profile_pic.png")}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <Text style={styles.profileName}>Sabrina Aryan</Text>
            <Text style={styles.profileTitle}>BSIT | STUDENT ID: 20233300120</Text>
            <Text style={styles.profileEmail}>sabrinaaryan@gmail.com</Text>
          </View>

          <View>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item.name)}
              >
                <Ionicons name={item.icon as any} size={24} color="#222762" />
                <Text style={styles.menuText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        
          <TouchableOpacity 
            style={styles.organizationsButton}
            onPress={() => handleMenuItemPress("Your Organizations")}
          >
            <Ionicons name="people-circle-outline" size={24} color="#222762" />
            <Text style={styles.organizationsText}>Your Organizations</Text>
          </TouchableOpacity>

        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SidebarMenu;