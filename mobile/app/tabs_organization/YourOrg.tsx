import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import Header from "../components/OrganizationHeader";
import { useRouter } from "expo-router";

const YourOrg = () => {
  const router = useRouter();
  const [hasOrganization, setHasOrganization] = useState(false);

  useEffect(() => {
    const fetchOrgStatus = async () => {
      const studentHasOrg = true; 
      setHasOrganization(studentHasOrg);
    };
    fetchOrgStatus();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/images/marque/SplashScreen.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1 }}>
        <Header />

        <View style={styles.centerContainer}>
          <Image
            source={require("../../assets/images/marque/NoOrganizationFound.png")}
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.title}>No Organization Found</Text>
          <Text style={styles.subtitle}>Try to adjust your filters to see more organization.</Text>

          {hasOrganization && (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push("/tab_container/Camera_State")}
              activeOpacity={0.8}
            >
              <Text style={styles.cardTitle}>Paugnat</Text>
              <View style={styles.cardButton}>
                <Text style={styles.cardButtonText}>View Event details</Text>
              </View>
            </TouchableOpacity>
          )}
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
  image: { width: 150, height: 150 },
  title: { paddingTop: 20, fontSize: 20, color: "gray", fontFamily: "DMSans-Bold" },
  subtitle: { paddingTop: 5, color: "gray", fontFamily: "DMSans-Regular" },
  card: {
    marginTop: 30,
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: { fontSize: 18, fontFamily: "DMSans-Bold", marginBottom: 15 },
  cardButton: { backgroundColor: "#3BAF78", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },
  cardButtonText: { color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" },
});