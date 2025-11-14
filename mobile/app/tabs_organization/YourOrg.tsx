import React from "react";
import { View, Text, Image, StyleSheet, ImageBackground } from "react-native";
import Header from "../components/OrganizationHeader";

const YourOrg = () => {
  return (
    <ImageBackground
      source={require("../../assets/images/marque/SplashScreen.png")} // background image
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1,}}> 
        {/* optional overlay to make text stand out */}
        <Header />

        <View style={styles.centerContainer}>
          <Image
            source={require("../../assets/images/marque/NoOrganizationFound.png")}
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.title}>No Organization Found</Text>
          <Text style={styles.subtitle}>Try to adjust your filters to see more organization.</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

export default YourOrg;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -120,
    paddingHorizontal: 20,
  },
  image: {
    width: 150,
    height: 150,
  },
  title: {
    paddingTop: 20,
    fontSize: 20,
    color: "gray",
    fontFamily: 'DMSans-Bold',
  },
  subtitle: {
    paddingTop: 5,
    color: "gray",
    fontFamily: 'DMSans-Regular',
  },
});
