// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "../styles/components_orgcardslinear";

const OrgLinear = ({ orgLogo, organization, text, }) => {
  return (
    <View style={styles.card}>
        <View style={{ flexDirection: "row" }} >
            <Image
                source={typeof orgLogo === "string" ? { uri: orgLogo } : orgLogo}
                style={styles.organizationLogo}
            />
                <View style={styles.orgCol}>

                    <View style={styles.orgCol2}>
                        <Text style={styles.orgName}>{organization}</Text>
                        <Text style={styles.orgDesc}>{text}</Text>
                    </View>

                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.followText}>Follow</Text>
                    </TouchableOpacity>
                </View>
        </View>
    </View>
  );
};

export default OrgLinear;
