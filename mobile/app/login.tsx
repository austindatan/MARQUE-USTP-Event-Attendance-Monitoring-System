import React, { useEffect } from "react";
import { StyleSheet, View, Image, Text, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, } from "react-native-reanimated";
import styles from "./styles/baseeffects";

const login = () => {
  const router = useRouter();
  const logoY = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(40);

  useEffect(() => {
    logoY.value = withTiming(-180, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });

    formOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
    );

    formY.value = withDelay(
      1000,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  return (
    <ImageBackground
          source={require("../assets/images/marque/SplashScreen.png")}
          style={[styles.background, {alignSelf: "center" }]}
          resizeMode="cover"
        >

        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, logoStyle]}>
                <Image source={require("../assets/images/marque/MARQUE.png")} style={styles.logo} />
            </Animated.View>

            <Animated.View style={[styles.loginContainer, formStyle]}>
                <Text style={styles.title}>Login to your account</Text>

                <TextInput placeholder="Student ID" style={styles.input} placeholderTextColor="#999"/>
                <TextInput placeholder="Password" secureTextEntry style={styles.input} placeholderTextColor="#999"/>

                <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/tabs/Events")}>
                <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>

                <Text style={styles.footerText}> Problem with your account?{" "}
                    <Text style={{ textDecorationLine: "underline" }}>Contact us</Text>
                </Text>
            </Animated.View>
        </View>
    </ImageBackground>
  );
};


export default login;