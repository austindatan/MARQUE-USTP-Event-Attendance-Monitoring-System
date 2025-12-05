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
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { BASE_URL } from "../../config";

export default function CameraWithWatermark() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationText, setLocationText] = useState("Getting location...");
  const [loading, setLoading] = useState(false);

  const [isTorchOn, setIsTorchOn] = useState(false); // ⭐ Torch/flash toggle
  const [facing, setFacing] = useState("front");   // ⭐ Flip Camera
  const [preview, setPreview] = useState(null);   // ⭐ Retake Preview Screen

  const cameraRef = useRef(null);
  const router = useRouter();
  const { eventId } = useLocalSearchParams();

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

  // -------------------- FLASH TOGGLE --------------------
  const toggleFlash = () => {
    // Torch works only on back camera; switch to back if turning torch on
    setIsTorchOn((prev) => {
      const next = !prev;
      if (next && facing === 'front') {
        setFacing('back');
      }
      return next;
    });
  };

  // -------------------- FLIP CAMERA --------------------
  const flipCamera = () => {
    setFacing((prev) => {
      const next = prev === "front" ? "back" : "front";
      // if switching to front camera, ensure torch is off
      if (next === 'front') setIsTorchOn(false);
      return next;
    });
  };

  // -------------------- CAPTURE PHOTO --------------------
  const capturePhoto = async () => {
    try {
      setLoading(true);

      const photo = await cameraRef.current.takePictureAsync();
      setPreview(photo.uri); // go to preview screen
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to capture photo.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- UPLOAD PHOTO --------------------
  const uploadPhoto = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const watermarkText = `${now.toLocaleDateString()}  ${now.toLocaleTimeString()}\n${locationText}`;

      const formData = new FormData();
      formData.append("file", {
        uri: preview,
        type: "image/jpeg",
        name: `photoproof_${Date.now()}.jpg`,
      });

      formData.append("watermarkText", watermarkText);
      formData.append("eventId", eventId || "");

      await axios.post(`${BASE_URL}/api/attendance/upload-photoproof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Photoproof uploaded successfully!");
      router.back();
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      Alert.alert("Error", "Failed to upload photo.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- BACK BUTTON --------------------
  const goBack = () => {
    if (preview) {
      setPreview(null); // return to camera
    } else {
      router.back(); // return to previous page
    }
  };

  // -------------------- PREVIEW SCREEN --------------------
  if (preview) {
    return (
      <View style={{ flex: 1 }}>
        {/* BACK BUTTON */}
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

        {/* RETAKE + UPLOAD BUTTONS */}
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
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        enableTorch={isTorchOn}
      />

      {/* DARK OVERLAY FOR WATERMARK */}
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

      {/* BACK BUTTON */}
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

      {/* FLASH BUTTON */}
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
        <Ionicons
          name={isTorchOn ? "flash-outline" : "flash-off-outline"}
          size={26}
          color="white"
        />
      </TouchableOpacity>

      {/* FLIP CAMERA */}
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

      {/* CAPTURE BUTTON */}
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
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Ionicons name="camera" size={40} color="black" />
        )}
      </TouchableOpacity>
    </View>
  );
}
