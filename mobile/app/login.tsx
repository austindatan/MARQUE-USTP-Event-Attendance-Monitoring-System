import React, { useEffect, useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated";
import styles from "./styles/effects_base";
import { BASE_URL } from "../config";

const Login = () => {
  const router = useRouter();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const logoY = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(40);

  useEffect(() => {
    logoY.value = withTiming(-180, { duration: 1000, easing: Easing.out(Easing.exp) });
    formOpacity.value = withDelay(1000, withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }));
    formY.value = withDelay(1000, withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: logoY.value }] }));
  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  const handleLogin = async () => {
    setErrorMessage("");

    if (!studentId || !password) {
      setErrorMessage("Please fill in both Student ID and Password.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: studentId, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/tabs/Events");
      } else {
        setErrorMessage(data.message || "Invalid username or password.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("Could not connect to the server. Please check your connection.");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/marque/SplashScreen.png")}
      style={[styles.background, { alignSelf: "center" }]}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Image source={require("../assets/images/marque/MARQUE.png")} style={styles.logo} />
        </Animated.View>

        <Animated.View style={[styles.loginContainer, formStyle]}>
          <Text style={styles.title}>Login to your account</Text>

          <TextInput
            placeholder="Student ID"
            style={styles.input}
            placeholderTextColor="#999"
            value={studentId}
            onChangeText={setStudentId}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
          />

          {/*error message */}
          {errorMessage ? <Text style={{ color: "red", marginTop: -5, marginBottom:10, fontStyle: "italic", fontSize: 12,  }}>{errorMessage}</Text> : null}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Problem with your account?{" "}
            <Text style={{ textDecorationLine: "underline" }}>Contact us</Text>
          </Text>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

export default Login;
