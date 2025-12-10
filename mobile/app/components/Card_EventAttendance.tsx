// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "../styles/components_eventcardattendance";

const EventCardSL = ({ image, title, organization, orgLogo, dateDay, dateMonth, onPress }) => {

  const short = (s, n = 15) =>
    s && s.length > n ? `${s.slice(0, n).trim()}...` : s;

  return (
    <View style={styles.shadowWrapper}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.card}>
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
          <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">{short(title)}</Text>
          <View style={styles.orgDetails}>
            {orgLogo && <Image source={orgLogo} style={styles.organizationLogo} />}
            <View style={styles.orgRow}>
              <Text style={styles.orgText} numberOfLines={1} ellipsizeMode="tail">{short(organization, 20)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default EventCardSL;
