import React, { useEffect, useState } from "react";
import { View, Image, Text, TextInput, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from "react-native-reanimated";
import styles from "./styles/effects_base";
import { BASE_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {

  // 🚨 CRITICAL FIX: Removed the useEffect hook that called AsyncStorage.clear()
  // If this was included, you would never stay logged in and the app would redirect to login repeatedly.

  const router = useRouter();

  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token"); //
      const userRole = await AsyncStorage.getItem("userRole"); //
      if (token) {
        console.log("Already logged in, redirecting..."); //
        // FIX: userRole enum is "Admin" (from User.js), not "Manager"
        if (userRole === "Admin") {
          router.replace("/tabs_admin/Dashboard"); //
        } else {
          router.replace("/tabs/Events"); //
        }
      }
    };
    checkLogin(); //
  }, []); //

  const logoY = useSharedValue(0); //
  const formOpacity = useSharedValue(0); //
  const formY = useSharedValue(40); //

  useEffect(() => {
    logoY.value = withTiming(-180, { duration: 1000, easing: Easing.out(Easing.exp) }); //
    formOpacity.value = withDelay(1000, withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })); //
    formY.value = withDelay(1000, withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) })); //
  }, []); //

  const logoStyle = useAnimatedStyle(() => ({ transform: [{ translateY: logoY.value }] })); //
  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value, //
    transform: [{ translateY: formY.value }], //
  }));

  const handleLogin = async () => {
    setErrorMessage(""); //

    if (!studentNumber || !password) {
      // UI Change: Update message to include Username
      setErrorMessage("Please fill in both ID/Username and Password.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST", //
        headers: { "Content-Type": "application/json" }, //
        body: JSON.stringify({ student_number: studentNumber, password }), //
      });

      const text = await response.text(); //
      let data;

      try {
        data = JSON.parse(text); //
      } catch (err) {
        console.error("Login response not JSON:", text); //
        setErrorMessage("Server returned invalid response.");
        return;
      }

      if (response.ok) {
        if (data.token) {
          await AsyncStorage.setItem("token", data.token); //
        }
        if (data.user && data.user.role) {
          await AsyncStorage.setItem("userRole", data.user.role); //
        }

        // CRITICAL FIX: Store the identifier using the key 'student_number'
        // This key matches the field returned by the modified auth.js
        if (data.student_number) {
          await AsyncStorage.setItem("student_number", data.student_number);
        }

        // Role-based redirection
        const userRole = data.user.role; //
        if (userRole === "Admin") { // FIX: Changed 'Manager' to 'Admin'
          router.replace("/tabs_admin/Dashboard"); //
        } else {
          router.replace("/tabs/Events"); //
        }
      } else {
        setErrorMessage(data.message || "Invalid ID or password."); //
      }
    } catch (error) {
      console.error("Error logging in:", error); //
      setErrorMessage("Could not connect to the server. Please try again."); //
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
            // UI Change: Update placeholder text
            placeholder="ID / Username"
            style={styles.input} //
            placeholderTextColor="#999" //
            value={studentNumber} //
            onChangeText={setStudentNumber} //
          />

          <TextInput
            placeholder="Password" //
            secureTextEntry //
            style={styles.input} //
            placeholderTextColor="#999" //
            value={password} //
            onChangeText={setPassword} //
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
            Problem with your account?{" "}
            <Text style={{ textDecorationLine: "underline" }}>Contact us</Text>
          </Text>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

export default Login;