// 📁 app/tab_container_organization/EditEvents.tsx

// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { BASE_URL } from "../../config";
import Header from "../components/Header_Normal";

const eventsOptions = ["Event", "Sub-Event"];

const venueOptions = [
  "LRC",
  "DRER Memorial Hall",
  "Cafet Hall",
  "ICT AVR",
  "Building 28",
  "PAT AVR",
  "Building 5",
  "Science Building",
];

const EditEvents = () => {
  const router = useRouter();
  const { event_id, orgId } = useLocalSearchParams();
  const isEdit = !!event_id;

  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [venue, setVenue] = useState("");
  const [venueDetails, setVenueDetails] = useState("");
  const [description, setDescription] = useState("");
  // eventImages holds an array of URI objects for display, with 'local: true' for newly picked files.
  const [eventImages, setEventImages] = useState([]);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");
  const [currentField, setCurrentField] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [venueModalVisible, setVenueModalVisible] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      // Initialize dates for 'Add Event' mode
      const now = new Date();
      setStartDate(now);
      setEndDate(now);
      setStartTime(now);
      setEndTime(now);
      return;
    }

    const loadEvent = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/events/${event_id}`);
        const ev = res.data.event;

        setEventName(ev.event_name);
        setEventType(ev.event_type || "");
        setVenue(ev.venue || "");
        setVenueDetails(ev.venue_details || "");
        setDescription(ev.description);

        // Use fallbacks in case dates/times are missing or invalid
        setStartDate(ev.event_date ? new Date(ev.event_date) : new Date());
        setEndDate(ev.event_date ? new Date(ev.event_date) : new Date()); // Assuming end date is the same field for Mongoose
        setStartTime(ev.start_time ? new Date(ev.start_time) : new Date());
        setEndTime(ev.end_time ? new Date(ev.end_time) : new Date());

        // Handle single image URL from backend
        if (ev.event_image) {
          setEventImages([{ uri: ev.event_image }]);
        } else {
          setEventImages([]);
        }
      } catch (err) {
        console.error("Failed to load event:", err);
        Alert.alert("Error", "Failed to load event data for editing.");
      }
    };

    loadEvent();
  }, [event_id]);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (result.canceled) return;

    // Replace array with new selection(s), marking them as local
    setEventImages(result.assets.map((a) => ({ uri: a.uri, local: true })));
  };

  const openPicker = (field, mode) => {
    setCurrentField(field);
    setPickerMode(mode);
    setPickerVisible(true);
  };

  const onPick = (event, selected) => {
    setPickerVisible(false);
    if (!selected) return;

    switch (currentField) {
      case "startDate":
        setStartDate(selected);
        break;
      case "endDate":
        setEndDate(selected);
        break;
      case "startTime":
        setStartTime(selected);
        break;
      case "endTime":
        setEndTime(selected);
        break;
      default:
        break;
    }
  };

  const handleSave = async () => {
    // FIX: Use .trim() for string fields to catch empty/whitespace input
    // The date/time checks are removed as they are always truthy due to initialization.
    if (!eventName.trim() || !eventType.trim() || !venue.trim() || !description.trim()) {
      Alert.alert("Error", "Please fill all required fields (Name, Type, Venue, Description).");
      return;
    }

    const formData = new FormData();
    formData.append("organization_id", orgId);
    formData.append("event_name", eventName);
    formData.append("event_type", eventType);
    formData.append("venue", venue);
    formData.append("venue_details", venueDetails);
    formData.append("description", description);

    // Sending ISO string ensures correct UTC formatting for Mongoose
    formData.append("event_date", startDate.toISOString());
    formData.append("start_time", startTime.toISOString());
    formData.append("end_time", endTime.toISOString());

    // Send only the single, newly selected file (if any)
    const imageToSend = eventImages.find((img) => img.local);

    if (imageToSend) {
      // Use 'as any' for correct FormData file object format
      formData.append("event_image", {
        uri: imageToSend.uri,
        name: `event-${Date.now()}.jpeg`,
        type: "image/jpeg",
      } as any);
    }

    try {
      if (isEdit) {
        await axios.put(`${BASE_URL}/events/${event_id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Alert.alert("Success", "Event updated!");
      } else {
        await axios.post(`${BASE_URL}/events/create`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Alert.alert("Success", "Event added!");
      }
      router.back();
    } catch (err) {
      console.error("❌ AXIOS ERROR SAVING EVENT:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        `Failed to save event. Server responded: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const formatDate = (d) => (d ? d.toLocaleDateString() : "");
  const formatTime = (d) => (d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "");

  return (
    <View style={{ flex: 1 }}>
      <Header />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
          {isEdit ? "Edit Event" : "Add Event"}
        </Text>

        {/* Display the image currently selected */}
        {eventImages.length > 0 && (
          <Image
            source={{ uri: eventImages[0].uri }}
            style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 15 }}
            resizeMode="cover"
          />
        )}

        <TouchableOpacity onPress={handleImagePick} style={{ marginBottom: 15 }}>
          <Text style={{ color: "#222762" }}>{eventImages.length > 0 ? "Change Event Image" : "Upload Event Image"}</Text>
        </TouchableOpacity>

        <TextInput placeholder="Event Name *" value={eventName} onChangeText={setEventName} style={stylesLocal.textInput} />

        {/* Event Type Picker Trigger */}
        <TouchableOpacity onPress={() => setModalVisible(true)} style={stylesLocal.textInput}>
          <Text style={{ color: eventType ? "#000" : "#999" }}>{eventType || "Select Event Type *"}</Text>
        </TouchableOpacity>

        {/* Venue Picker Trigger */}
        <TouchableOpacity onPress={() => setVenueModalVisible(true)} style={stylesLocal.textInput}>
          <Text style={{ color: venue ? "#000" : "#999" }}>{venue || "Select Venue *"}</Text>
        </TouchableOpacity>

        <TextInput placeholder="Venue Details" value={venueDetails} onChangeText={setVenueDetails} style={stylesLocal.textInput} />

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 10 }}>
          <TouchableOpacity onPress={() => openPicker("startDate", "date")} style={stylesLocal.textInput}>
            <Text>{formatDate(startDate) || "Start Date"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPicker("endDate", "date")} style={stylesLocal.textInput}>
            <Text>{formatDate(endDate) || "End Date"}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 10 }}>
          <TouchableOpacity onPress={() => openPicker("startTime", "time")} style={stylesLocal.textInput}>
            <Text>{formatTime(startTime) || "Start Time"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPicker("endTime", "time")} style={stylesLocal.textInput}>
            <Text>{formatTime(endTime) || "End Time"}</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Event Description *"
          value={description}
          onChangeText={setDescription}
          multiline
          style={[stylesLocal.textInput, { height: 100 }]}
        />

        <TouchableOpacity onPress={handleSave} style={{ backgroundColor: "#5669FF", padding: 15, marginTop: 20, borderRadius: 8, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>{isEdit ? "Update Event" : "Publish Event"}</Text>
        </TouchableOpacity>
      </ScrollView>

      {pickerVisible && (
        <DateTimePicker
          value={currentField === "startDate" || currentField === "endDate" ? startDate : currentField === "startTime" ? startTime : endTime}
          mode={pickerMode}
          display="default"
          onChange={onPick}
        />
      )}

      {/* Event Type Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity style={{ flex: 1, backgroundColor: "#00000077" }} onPress={() => setModalVisible(false)} />
        <View style={{ backgroundColor: "#fff", padding: 20 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>Select Event Type</Text>
          {eventsOptions.map((ev, idx) => (
            <TouchableOpacity key={idx} onPress={() => { setEventType(ev); setModalVisible(false); }}>
              <Text style={{ paddingVertical: 10 }}>{ev}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Venue Modal */}
      <Modal visible={venueModalVisible} transparent animationType="slide">
        <TouchableOpacity style={{ flex: 1, backgroundColor: "#00000077" }} onPress={() => setVenueModalVisible(false)} />
        <View style={{ backgroundColor: "#fff", padding: 20 }}>
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>Select Venue</Text>
          {venueOptions.map((v, idx) => (
            <TouchableOpacity key={idx} onPress={() => { setVenue(v); setVenueModalVisible(false); }}>
              <Text style={{ paddingVertical: 10 }}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
};

export default EditEvents;

const stylesLocal = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 10,
  },
});