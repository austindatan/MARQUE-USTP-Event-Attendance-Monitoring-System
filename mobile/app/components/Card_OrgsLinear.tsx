// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "../styles/components_orgcardslinear";

const OrgLinear = ({ 
  orgLogo, 
  organization = "", 
  text = "", 
  isFollowed = false, 
  onToggleFollow,
  onPress
}) => {
  return (
    <TouchableOpacity activeOpacity={0.6} style={styles.card} onPress={onPress}>

      <View style={styles.row}>
        <Image
          source={
            typeof orgLogo === "object"
              ? orgLogo
              : { uri: orgLogo || "https://via.placeholder.com/40" }
          }
          style={styles.organizationLogo}
        />

        <View style={styles.orgRow}>

          <View style={styles.orgInfoCol}>
            <Text style={styles.orgName} numberOfLines={1}>{organization}</Text>
            <Text style={styles.orgDesc} numberOfLines={2} ellipsizeMode="tail">
              {text}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              isFollowed && styles.buttonFollowing
            ]}
            onPress={onToggleFollow}
          >
            <Text
              style={[
                styles.followText,
                isFollowed && styles.followingText
              ]}
            >
              {isFollowed ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </TouchableOpacity>
  );
};

export default OrgLinear;
