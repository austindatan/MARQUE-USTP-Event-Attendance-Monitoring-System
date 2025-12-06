// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import styles from "../styles/components_bookmark";

const BookmarkCard = ({
  id,
  image,
  title,
  orgLogo,
  organization,
  dateDay,
  dateMonth,
  orgDate,
  onRemove
}) => {

  const router = useRouter();

  // 🔥 Navigate to EventDetails_Unified
  const openEvent = () => {
    router.push({
      pathname: "/tab_container/EventDetails_Unified",
      params: { eventId: id }
    });
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={openEvent}>
      <View style={styles.shadowWrapper}>
        <View style={styles.card}>
          
          {/* IMAGE */}
          <View style={styles.imageContainer}>
            <Image
              source={typeof image === "string" ? { uri: image } : image}
              style={styles.eventPoster}
            />

            {/* DATE */}
            <View style={styles.dateTag}>
              <Text style={styles.dateDay}>{dateDay}</Text>
              <Text style={styles.dateMonth}>{dateMonth}</Text>
            </View>

            {/* REMOVE BOOKMARK BUTTON */}
            <TouchableOpacity
              style={styles.bookmarkIcon}
              onPress={() => onRemove(id)}
            >
              <Ionicons name="bookmark" size={28} color="#4E2FFF" />
            </TouchableOpacity>

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
                <Text style={styles.subText}>{orgDate}</Text>
              </View>
            </View>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BookmarkCard;
