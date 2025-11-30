// @ts-nocheck
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// --- Image Placeholder Component ---
const ImagePlaceholder = () => (
  <View style={styles.imagePlaceholder}>
    <Ionicons name="add" size={32} color="#FFD700" />
  </View>
);

// --- Form Input Component ---
const FormInput = ({ label, value, setValue, multiline = false, icon }) => (
  <View style={styles.formGroup}>
    <View style={styles.formLabelContainer}>
      <Text style={styles.formLabel}>{label}</Text>
      {icon && <Ionicons name={icon} size={20} color="#888" />}
    </View>
    <TextInput
      style={[styles.input, multiline && { height: 100, textAlignVertical: "top" }]}
      value={value}
      onChangeText={setValue}
      placeholder={`Enter ${label}`}
      multiline={multiline}
    />
  </View>
);

// --- Main Edit Event Screen ---
const EditEvents = () => {
  const router = useRouter();

  // Form state
  const [eventName, setEventName] = useState("Appetite: Free Meals for BSIT...");
  const [eventType, setEventType] = useState("Food Distribution Event");
  const [dateTime, setDateTime] = useState("October 17, 2025, 11:00 AM – 1:00 PM");
  const [description, setDescription] = useState(
    "APPETITE | Heads up BSIT students! Get ready to start your morning the IT way! Join us today for AppetiTE— our way of promoting student well-being through shared meals and meaningful connections."
  );

  const handleBack = () => router.back();

  const handlePublish = () => {
    console.log("Event saved:", { eventName, eventType, dateTime, description });
    alert("Event saved successfully!");
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.headerText}>Edit Event</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        <View style={styles.headerImage}>
          <Text style={styles.headerImageText}>FREE COFFEE & PASTRY</Text>
        </View>

        {/* Image Placeholders */}
        <View style={styles.imagePlaceholdersContainer}>
          <ImagePlaceholder />
          <ImagePlaceholder />
          <ImagePlaceholder />
          <ImagePlaceholder />
        </View>

        {/* Form Inputs */}
        <FormInput label="Event Name" value={eventName} setValue={setEventName} />
        <FormInput label="Event Type" value={eventType} setValue={setEventType} />
        <FormInput
          label="Date & Time"
          value={dateTime}
          setValue={setDateTime}
          icon="calendar"
        />
        <FormInput
          label="Event Description"
          value={description}
          setValue={setDescription}
          multiline
        />

        <View style={{ height: 80 }} /> {/* Spacer for scroll */}
      </ScrollView>

      {/* Floating Save Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={handlePublish}>
          <Text style={styles.floatingButtonText}>Save Event</Text>
          <Ionicons
            name="send"
            size={20}
            color="#000"
            style={{ marginLeft: 10, transform: [{ rotate: "45deg" }] }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditEvents;

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  header: {
    backgroundColor: "#0A0F51",
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  content: {
    padding: 15,
  },
  headerImage: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    backgroundColor: "#6f4e37",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerImageText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  imagePlaceholdersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: "22%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#FFD700",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  floatingButton: {
    flexDirection: "row",
    backgroundColor: "#FFD700",
    paddingVertical: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});