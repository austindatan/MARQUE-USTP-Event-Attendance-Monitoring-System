// @ts-nocheck
import React from "react";
import { View, Text, Image } from "react-native";
import styles from "../styles/components_eventcard";

const EventCard = ({ image, title, orgLogo, organization, orgDate, dateDay, dateMonth, description, }) => {
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

          <Text style={styles.desc}>
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EventCard;
