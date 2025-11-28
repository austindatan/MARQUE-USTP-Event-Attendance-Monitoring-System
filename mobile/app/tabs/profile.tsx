// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header_Profile";
import EventCardSL from "../components/Card_EventAttendance";
import styles from "../styles/effects_profile"
import { useRouter } from "expo-router";

const ProfilePage = ({ navigation }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.profileHeader}>
          <Image
            source={require("../../assets/images/sabrina_profile.jpg")}
            style={styles.profileImage}
          />

          <Text style={styles.name}>Sabrina Aryan</Text>
          <Text style={styles.department}>College of Information Technology</Text>
          <Text style={styles.course}>BS Information Technology</Text>
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.row}>
            <Text style={styles.label}>Student ID</Text>
            <Text style={styles.value}>20233300120</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>sabrinaarayn@gmail.com</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Attendance Summary</Text>
        <View style={styles.attendanceCard}>
          <View style={styles.cardContainer}>
            <EventCardSL
              image={require("../../assets/images/marque/crtcg1.png")}
              title="Last Cookie Standing!"
              dateDay="17"
              dateMonth="NOV"
            />
            <EventCardSL
              image={require("../../assets/images/marque/crtcg1.png")}
              title="Last Cookie Standing!"
              dateDay="17"
              dateMonth="NOV"
            />
            <EventCardSL
              image={require("../../assets/images/marque/crtcg1.png")}
              title="Last Cookie Standing!"
              dateDay="17"
              dateMonth="NOV"
            />
            <EventCardSL
              image={require("../../assets/images/marque/crtcg1.png")}
              title="Last Cookie Standing!"
              dateDay="17"
              dateMonth="NOV"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.settingsBlock}>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="create" size={20} color="#0A0F51" />
            <Text style={styles.settingLabel}>Change Avatar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={() => {router.push("/tab_container/Profile_ChangePassword");}}>
            <Ionicons name="lock-closed" size={20} color="#0A0F51" />
            <Text style={styles.settingLabel}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications" size={20} color="#0A0F51" />
            <Text style={styles.settingLabel}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="log-out" size={20} color="red" />
            <Text style={[styles.settingLabel, { color: "red" }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

export default ProfilePage;

