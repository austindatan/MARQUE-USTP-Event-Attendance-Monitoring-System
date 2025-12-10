// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CameraWithWatermark() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationText, setLocationText] = useState("Getting location...");
  const [loading, setLoading] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [facing, setFacing] = useState("front");
  const [preview, setPreview] = useState(null);

  const cameraRef = useRef(null);
  const router = useRouter();
  const { eventId, attendanceLogId: initialAttendanceLogId } = useLocalSearchParams();

  // -------------------- LOCATION --------------------
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationText("Location disabled");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync(loc.coords);
      const place = geocode[0];

      setLocationText(`${place.city}, ${place.region}`);
    })();
  }, []);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Camera access needed</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------- CAMERA CONTROLS --------------------
  const toggleFlash = () => {
    setIsTorchOn((prev) => {
      const next = !prev;
      if (next && facing === "front") setFacing("back");
      return next;
    });
  };

  const flipCamera = () => {
    setFacing((prev) => {
      const next = prev === "front" ? "back" : "front";
      if (next === "front") setIsTorchOn(false);
      return next;
    });
  };

  const capturePhoto = async () => {
    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync();
      setPreview(photo.uri);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to capture photo.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- GET OR REGISTER ATTENDANCE LOG --------------------
  const getOrRegisterLog = async () => {
    try {
      const student_number = await AsyncStorage.getItem("student_number");
      if (!student_number) return null;

      const res = await axios.post(`${BASE_URL}/api/attendance/register-or-get-log`, {
        event_id: eventId,
        student_number,
      });

      return res.data.attendanceLog._id;
    } catch (err) {
      console.log("GET OR REGISTER LOG ERROR:", err);
      return null;
    }
  };

  // -------------------- UPLOAD PHOTO --------------------
  const uploadPhoto = async () => {
    try {
      setLoading(true);

      const student_number = await AsyncStorage.getItem("student_number");
      if (!student_number) {
        Alert.alert("Error", "Student number not found.");
        setLoading(false);
        return;
      }

      // 1. Get attendance log ID
      let logId = initialAttendanceLogId;
      if (!logId) {
        logId = await getOrRegisterLog();
        if (!logId) {
          Alert.alert("Error", "Cannot get attendance log ID. Upload failed.");
          setLoading(false);
          return;
        }
      }

      // 2. Prepare watermark text
      const now = new Date();
      const watermarkText = `${now.toLocaleDateString()}  ${now.toLocaleTimeString()}\n${locationText}`;

      // 3. Build form data
      const formData = new FormData();
      formData.append("file", {
        uri: preview,
        type: "image/jpeg",
        name: `photoproof_${Date.now()}.jpg`,
      });
      formData.append("attendanceLogId", logId);
      formData.append("watermarkText", watermarkText);
      formData.append("event_id", eventId);
      formData.append("student_number", student_number);

      // 4. Upload
      await axios.post(`${BASE_URL}/api/attendance/upload-photoproof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Photo proof submitted for verification.");

      router.replace({
        pathname: "tab_container/EventDetails_Unified",
        params: { eventId },
      });
    } catch (err) {
      console.log("UPLOAD ERROR:", err.response?.data || err);
      Alert.alert("Error", err.response?.data?.message || "Failed to upload photo.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- BACK BUTTON --------------------
  const goBack = () => {
    if (preview) setPreview(null);
    else router.back();
  };

  // -------------------- PREVIEW SCREEN --------------------
  if (preview) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={goBack}
          style={{
            position: "absolute",
            top: 40,
            left: 20,
            zIndex: 20,
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: 10,
            borderRadius: 25,
          }}
        >
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>

        <Image source={{ uri: preview }} style={{ flex: 1 }} />

        <View
          style={{
            position: "absolute",
            bottom: 40,
            alignSelf: "center",
            flexDirection: "row",
            gap: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => setPreview(null)}
            style={{
              backgroundColor: "white",
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={uploadPhoto}
            style={{
              backgroundColor: "#007bff",
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 10,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white", fontSize: 18 }}>Upload</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // -------------------- CAMERA SCREEN --------------------
  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} enableTorch={isTorchOn} />

      <View
        style={{
          position: "absolute",
          bottom: 170,
          left: 20,
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 15 }}>{locationText}</Text>
      </View>

      <TouchableOpacity
        onPress={goBack}
        style={{
          position: "absolute",
          top: 40,
          left: 20,
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: 10,
          borderRadius: 25,
        }}
      >
        <Ionicons name="arrow-back" size={26} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={toggleFlash}
        style={{
          position: "absolute",
          top: 40,
          right: 20,
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: 10,
          borderRadius: 25,
        }}
      >
        <Ionicons name={isTorchOn ? "flash-outline" : "flash-off-outline"} size={26} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={flipCamera}
        style={{
          position: "absolute",
          top: 100,
          right: 20,
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: 10,
          borderRadius: 25,
        }}
      >
        <Ionicons name="camera-reverse-outline" size={28} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={capturePhoto}
        style={{
          position: "absolute",
          bottom: 40,
          alignSelf: "center",
          backgroundColor: "white",
          width: 80,
          height: 80,
          borderRadius: 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading ? <ActivityIndicator size="large" /> : <Ionicons name="camera" size={40} color="black" />}
      </TouchableOpacity>
    </View>
  );
}
