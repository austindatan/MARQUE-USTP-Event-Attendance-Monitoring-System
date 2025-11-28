// @ts-nocheck
import React from "react";
import { View, Text, Image } from "react-native";
import styles from "../styles/components_eventcardattendance";

const EventCardSL = ({ image, title, dateDay, dateMonth, }) => {

  const short = (s, n = 15) =>
  s && s.length > n ? `${s.slice(0, n).trim()}...` : s;

  return (
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
        </View>

        <View style={styles.details}>
          <Text style={styles.eventTitle}>{title}</Text>
        </View>
      </View>
    </View>
  );
};

export default EventCardSL;
