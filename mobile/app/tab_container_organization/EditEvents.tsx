// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator, Alert, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL } from "../../config";

import Header from "../components/Header_Normal";
import styles from "../styles/page_editevents";
import { COLORS } from "../styles/component_org_page";

const eventTypes = ["Event", "Sub-Event"];
const venueOptions = [ "LRC", "DRER Memorial Hall", "Cafet Hall", "ICT AVR", "Building 28", "PAT AVR", "Building 5", "Science Building", ];

const EditEvents = () => {
  const router = useRouter();
  const { eventId: event_id, orgId } = useLocalSearchParams();
  const isEdit = !!event_id;

  const [eventName, setEventName] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedVenue, setSelectedVenue] = useState("");
  const [venueDetails, setVenueDetails] = useState("");
  const [description, setDescription] = useState("");

  const [eventImage, setEventImage] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
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
      setLoadingEvent(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/events/event/${event_id}`);
        const ev = res.data.event || res.data; 

        console.log("EVENT RESPONSE:", res.data);

        if (!ev || !ev.event_name) {
          console.error("Event data is missing or incomplete:", ev);
          Alert.alert("Error", "Event data could not be loaded. Please check the ID.");
          setLoadingEvent(false);
          return;
        }
        
        setEventName(ev.event_name);
        setSelectedEvent(ev.event_type || "");
        setSelectedVenue(ev.venue || "");
        setVenueDetails(ev.venue_details || "");
        setDescription(ev.description || "");

        setStartDate(ev.event_date ? new Date(ev.event_date) : new Date());
        setEndDate(ev.event_date ? new Date(ev.event_date) : new Date());
        setStartTime(ev.start_time ? new Date(ev.start_time) : new Date());
        setEndTime(ev.end_time ? new Date(ev.end_time) : new Date());

        if (ev.event_image) {
          setEventImage({ uri: ev.event_image });
        }
      } catch (err) {
        console.error("Error loading event", err);
        Alert.alert("Error", "Failed to load event.");
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [event_id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setEventImage({ uri: result.assets[0].uri, local: true });
    }
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
    }
  };

  const formatDate = (d) => d?.toLocaleDateString() || "";
  const formatTime = (d) =>
    d?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "";

  const handleSave = async () => {
    if (!eventName.trim() || !selectedEvent || !selectedVenue || !description.trim()) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("organization_id", orgId);
    formData.append("event_name", eventName);
    formData.append("event_type", selectedEvent);
    formData.append("venue", selectedVenue);
    formData.append("venue_details", venueDetails);
    formData.append("description", description);

    formData.append("event_date", startDate.toISOString());
    formData.append("start_time", startTime.toISOString());
    formData.append("end_time", endTime.toISOString());

    if (eventImage?.local) {
      formData.append("event_image", {
        uri: eventImage.uri,
        name: `event-${Date.now()}.jpg`,
        type: "image/jpeg",
      });
    }

    try {
      if (isEdit) {
        await axios.put(`${BASE_URL}/events/${event_id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Alert.alert("Updated", "Event updated successfully.");
      } else {
        await axios.post(`${BASE_URL}/events/create`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Alert.alert("Created", "Event created successfully.");
      }

      router.back();
    } catch (err) {
      console.error("Saving error:", err.response?.data || err);
      Alert.alert("Error", "Failed to save event.");
    }
  };

  if (loadingEvent) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#222762" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.containerEvents} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { flexDirection: "row", alignItems: "center" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={styles.headerTitle}>{isEdit ? "Edit Event" : "Add Event"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageUploadArea}>
          <TouchableOpacity style={styles.mainImagePlaceholder} onPress={pickImage}>
            {eventImage ? (
              <Image
                source={{ uri: eventImage.uri }}
                style={{ width: "100%", height: "100%", borderRadius: 12 }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="add-circle" size={32} color="#222762" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.formSectionTitle}>Event Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Event Name<Text style={styles.required}> *</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Type your event name"
            placeholderTextColor="#C1C1C1"
            value={eventName}
            onChangeText={setEventName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Event Type<Text style={styles.required}> *</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.dropdownText, !selectedEvent && { color: "#C1C1C1" }]}>
              {selectedEvent || "Select event type"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Date and Time *</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => openPicker("startDate", "date")}
              >
                <Text>{formatDate(startDate) || "Start date"}</Text>
                <Ionicons name="calendar-number" size={22} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.halfInput}>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => openPicker("endDate", "date")}
              >
                <Text>{formatDate(endDate) || "End date"}</Text>
                <Ionicons name="calendar-number" size={22} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => openPicker("startTime", "time")}
              >
                <Text>{formatTime(startTime) || "Start time"}</Text>
                <Ionicons name="time-outline" size={22} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.halfInput}>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => openPicker("endTime", "time")}
              >
                <Text>{formatTime(endTime) || "End time"}</Text>
                <Ionicons name="time-outline" size={22} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Venue & Location<Text style={styles.required}> *</Text>
          </Text>

          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setVenueModalVisible(true)}
          >
            <Text style={[styles.dropdownText, !selectedVenue && { color: "#C1C1C1" }]}>
              {selectedVenue || "Select venue & location"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Venue Details</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Optional venue details..."
            placeholderTextColor="#C1C1C1"
            value={venueDetails}
            onChangeText={setVenueDetails}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Description *</Text>
          <TextInput
            style={[styles.textInput, styles.descriptionInput]}
            placeholder="Type your event description..."
            placeholderTextColor="#C1C1C1"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.registerButton} onPress={handleSave}>
          <Text style={styles.registerText}>{isEdit ? "Update Event" : "Publish Event"}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {pickerVisible && (
        <DateTimePicker
          value={
            currentField === "startDate" ? startDate :
            currentField === "endDate" ? endDate :
            currentField === "startTime" ? startTime :
            currentField === "endTime" ? endTime :
            new Date()
          }
          mode={pickerMode}
          display="default"
          onChange={onPick}
        />
      )}

      <Modal transparent visible={modalVisible}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Event</Text>

          {eventTypes.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.modalItem}
              onPress={() => {
                setSelectedEvent(item);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <Modal transparent visible={venueModalVisible}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVenueModalVisible(false)}
        />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Venue</Text>

          {venueOptions.map((v, i) => (
            <TouchableOpacity
              key={i}
              style={styles.modalItem}
              onPress={() => {
                setSelectedVenue(v);
                setVenueModalVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
};

export default EditEvents;
