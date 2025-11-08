import { StyleSheet, View, ImageBackground, Image } from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/marque/SplashScreen.png")}
      style={[styles.background, {alignSelf: "center" }]}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Image source={require("../assets/images/marque/MARQUE.png")} style={styles.logo} />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 280,
    height: 134,
    resizeMode: "contain",
    marginBottom: 6,
  },
});

export default Index;
