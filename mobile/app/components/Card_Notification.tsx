// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "../styles/components_bookmark"; // I'll reuse styles for now, can create a new style file later if needed

const NotificationCard = ({
  id,
  image,
  title,
  orgLogo,
  organization,
  message,
  notification_type
}) => {

  const router = useRouter();

  // Navigate to EventDetails_Unified or other relevant page
  const openNotification = () => {
    // Depending on notification type, it might navigate somewhere else
    if (notification_type === 'event_reminder' || notification_type === 'event_concluded' || notification_type === 'attendance_recorded') {
      router.push({
        pathname: "/tab_container/EventDetails_Unified",
        params: { eventId: id }
      });
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={openNotification}>
      <View style={styles.shadowWrapper}>
        <View style={styles.card}>
          
          {/* IMAGE */}
          <View style={styles.imageContainer}>
            <Image
              source={typeof image === "string" ? { uri: image } : image}
              style={styles.eventPoster}
            />
          </View>

          {/* DETAILS */}
          <View style={styles.details}>
            <Text style={styles.eventTitle}>{title}</Text>

            <View style={styles.orgDetails}>
              <Image
                source={typeof orgLogo === "string" ? { uri: orgLogo } : orgLogo}
                style={styles.organizationLogo}
              />

              <View style={styles.orgRow}>
                <Text style={styles.orgText}>{organization}</Text>
                <Text style={styles.subText}>{message}</Text>
              </View>
            </View>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;