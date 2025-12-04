// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/components_bookmark";

const BookmarkCard = ({
  image,
  title,
  orgLogo,
  organization,
  dateDay,
  dateMonth,
  onPress,
  orgDate,
  orgText,
  subText,
  onRemove,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={styles.shadowWrapper}>
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            <Image
              source={typeof image === "string" ? { uri: image } : image}
              style={styles.eventPoster}
            />

            <View style={styles.dateTag}>
              <Text style={styles.dateDay}>{dateDay}</Text>
              <Text style={styles.dateMonth}>{dateMonth}</Text>
            </View>

            <TouchableOpacity style={styles.bookmarkIcon}>
              <Ionicons name="bookmark" size={28} color="#4e2fffff" />
            </TouchableOpacity>
          </View>

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
