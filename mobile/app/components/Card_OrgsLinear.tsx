// @ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "../styles/components_orgcardslinear";


const OrgLinear = ({ orgLogo, organization, text, isFollowed, onToggleFollow }) => {

  // Dynamically set the text for the button
  const buttonText = isFollowed ? "Following" : "Follow";
  
  // 2. Define dynamic styles based on follow status
  const dynamicButtonStyle = isFollowed 
    ? { ...styles.button, backgroundColor: '#DDDDDD' } // Light gray/subtle background when followed
    : styles.button; // Use original style when not followed
  
  const dynamicTextStyle = isFollowed
    ? { ...styles.followText, color: '#444444' } // Darker text for 'Following'
    : styles.followText; // Use original style for 'Follow'

  return (
    <View style={styles.card}>
        <View style={{ flexDirection: "row" }} >
            <Image
                // Added a check for object type for consistency with URL sources
                source={typeof orgLogo === "object" ? orgLogo : { uri: orgLogo }} 
                style={styles.organizationLogo}
            />
                <View style={styles.orgCol}>

                    <View style={styles.orgCol2}>
                        <Text style={styles.orgName}>{organization}</Text>
                        <Text style={styles.orgDesc}>{text}</Text>
                    </View>

                   
                    <TouchableOpacity 
                        style={dynamicButtonStyle} 
                        onPress={onToggleFollow}
                    >
                        <Text style={dynamicTextStyle}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
        </View>
    </View>
  );
};

export default OrgLinear;