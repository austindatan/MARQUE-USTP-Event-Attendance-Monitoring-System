// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "../styles/components_eventcard";

const EventCard = ({ image, title, description, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.shadowWrapper}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={typeof image === "string" ? { uri: image } : image}
            style={styles.eventPoster}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.eventTitle} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
          <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;