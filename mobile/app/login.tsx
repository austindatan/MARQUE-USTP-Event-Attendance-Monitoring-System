import React, { useEffect, useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated";
import styles from "./styles/effects_base";
import { BASE_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const router = useRouter();

  const [studentNumber, setStudentNumber] = useState("");
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

  if (!studentNumber || !password) {
    setErrorMessage("Please fill in both Student ID and Password.");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_number: studentNumber, password }),
    });

    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Login response not JSON:", text);
      setErrorMessage("Server returned invalid response.");
      return;
    }

    if (response.ok) {
      await AsyncStorage.setItem("student_number", studentNumber); 
      router.push("/tabs/Events");
    } else {
      setErrorMessage(data.message || "Invalid student ID or password.");
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
            value={studentNumber}
            onChangeText={setStudentNumber}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
          />

          {errorMessage ? (
            <Text style={{ color: "red", marginTop: -5, marginBottom: 10, fontStyle: "italic", fontSize: 12 }}>
              {errorMessage}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Problem with your account? <Text style={{ textDecorationLine: "underline" }}>Contact us</Text>
          </Text>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

export default Login;
