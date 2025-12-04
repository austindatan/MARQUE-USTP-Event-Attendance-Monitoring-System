// @ts-nocheck
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header_Normal";
import styles from "../styles/components_bookmark"
import { useRouter } from "expo-router";
import BookmarkCard from "../components/Card_Bookmark";

const Bookmark = ({ navigation }) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(prev => !prev);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal: 20, paddingTop: 20}}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={18} color="#0A0F51" />
          <Text style={styles.backText}>Bookmarks</Text>
        </TouchableOpacity>

        <BookmarkCard
          id={1}
          title="Campus Fun Run 2025"
          image={require("../../assets/images/marque/crtcg1.png")}
          orgLogo={require("../../assets/images/marque/crk.jpg")}
          organization="Cookie Run Kingdom"
          dateDay="12"
          dateMonth="Jan"
          orgDate="Jan 5, 2025"
          orgText=""
          subText=""
          onPress={() => console.log("Open event", 1)}
          onRemove={() => console.log("Remove bookmark", 1)}
        />
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

export default Bookmark;
