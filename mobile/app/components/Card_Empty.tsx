// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "../styles/components_emptycard";

const EmptyCard = ({ image, text, button }) => {
  return (
    <View style={styles.card}>
        <Image
          source={typeof image === "string" ? { uri: image } : image}
          style={styles.logo}
        />

        <Text style={styles.text}>{text}</Text>

        <TouchableOpacity style={styles.button}
        >
          <Text style={styles.activeText}>Explore.</Text>
        </TouchableOpacity>
    </View>
  );
};

export default EmptyCard;
