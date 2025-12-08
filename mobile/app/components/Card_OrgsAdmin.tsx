// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import styles from "../styles/components_orgcardslinear";

const OrgLinear = ({ 
  orgLogo, 
  organization = "", 
  text = "", 
  onEditPress,
  onPress
}) => {
  return (
    <TouchableOpacity activeOpacity={0.6} style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Image
          source={
            typeof orgLogo === 'number' 
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
            style={styles.editButton}
            onPress={onEditPress}
          >
            <Ionicons name="create-outline" size={24} color="#0A0F51" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OrgLinear;
