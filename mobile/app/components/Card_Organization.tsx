// Card_Organization.tsx (The corrected file)

// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "../styles/component_org_activities";

const OrgCardHighlighted = ({
  bannerImage,
  orgLogo,
  organization,
  role,
  dateDay,
  dateMonth,
  description,
  type,
  onPress, // Ensure this prop is received
}) => {
  return (
    <TouchableOpacity
      style={styles.shadowWrapper}
      onPress={onPress} // ✅ FIX: Pass the onPress prop here
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Banner / Image */}
        {bannerImage && (
          <Image
            source={typeof bannerImage === "string" ? { uri: bannerImage } : bannerImage}
            style={styles.bannerImage}
          />
        )}

        {/* DETAILS */}
        <View style={styles.details}>
          <View style={styles.orgDetails}>
            <Image
              source={typeof orgLogo === "string" ? { uri: orgLogo } : orgLogo}
              style={styles.organizationLogo}
            />
            <View style={styles.orgRow}>
              <Text style={styles.eventTitle}>{organization}</Text>
              <Text style={styles.orgText}>{type}</Text>
              <Text style={styles.subText}>{role}</Text>
            </View>
          </View>
          <Text style={styles.desc}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity> // The TouchableOpacity is now correctly using the onPress prop
  );
};

export default OrgCardHighlighted;