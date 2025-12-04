// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator, StyleSheet, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL } from "../../config";
import EventCard from "../components/Card_Event";
import Header from "../components/Header_Normal";
import styles from "../styles/page_editevents";
import { STYLES, COLORS } from "../styles/component_org_page";
import DateTimePicker from "@react-native-community/datetimepicker";

const EditEvents = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [venueModalVisible, setVenueModalVisible] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");
  const [currentField, setCurrentField] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const events = ["Main Event", "Side Event"];
  const venue = ["LRC", "DRER Memorial Hall", "Cafet Hall", "ICT AVR", "Building 28", "PAT AVR", "Building 5", "Science Building"];

  const openPicker = (field, mode) => {
    setCurrentField(field);
    setPickerMode(mode);
    setPickerVisible(true);
  };

  const format = (d) => (d ? d.toLocaleDateString() : "");

  const formatTime = (d) =>
    d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  const onPick = (event, selectedValue) => {
    setPickerVisible(false);
    if (!selectedValue) return;

    if (currentField === "startDate") {
      setStartDate(selectedValue);
      setEndDate(selectedValue);
    }

    if (currentField === "endDate") {
      setEndDate(selectedValue);
    }

    if (currentField === "startTime") {
      setStartTime(selectedValue);
      const autoEnd = new Date(selectedValue.getTime() + 60 * 60 * 1000);
      setEndTime(autoEnd);
    }

    if (currentField === "endTime") {
      setEndTime(selectedValue);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.containerEvents} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backButton, { flexDirection: "row", alignItems: "center" }]}>
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={styles.headerTitle}>Add Event</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageUploadArea}>
          <TouchableOpacity style={styles.mainImagePlaceholder}>
            <Ionicons name="add-circle" size={24} color="#222762" />
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
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Event Type<Text style={styles.required}> *</Text>
          </Text>

          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text 
              style={[
                styles.dropdownText,
                !selectedEvent && { color: "#C1C1C1" }
              ]}
            >
              {selectedEvent || "Select event type"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Select Date and Time<Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TouchableOpacity
                style={[styles.dateInputContainer, { paddingHorizontal: 20, justifyContent: "space-between" }]}
                onPress={() => openPicker("startDate", "date")}
              >
                <Text style={{fontFamily: "DMSans-Medium"}}>
                  {format(startDate) ? (
                    <Text style={{color: "black"}}>{format(startDate)}</Text>
                  ) : (
                    <Text style={{color: "#999"}}>Start date</Text>
                  )}
                </Text>
                <Ionicons name="calendar-number" size={22} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.halfInput}>
              <TouchableOpacity
                style={[styles.dateInputContainer, { paddingHorizontal: 20, justifyContent: "space-between" }]}
                onPress={() => openPicker("endDate", "date")}
              >
                <Text style={{fontFamily: "DMSans-Medium"}}>
                  {format(endDate) ? (
                    <Text style={{color: "black"}}>{format(endDate)}</Text>
                  ) : (
                    <Text style={{color: "#999"}}>End Date</Text>
                  )}
                </Text>
                <Ionicons name="calendar-number" size={22} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <TouchableOpacity
                style={[styles.dateInputContainer, { paddingHorizontal: 20, justifyContent: "space-between" }]}
                onPress={() => openPicker("startTime", "time")}
              >
                <Text style={{fontFamily: "DMSans-Medium"}}>
                  {formatTime(startTime) ? (
                    <Text style={{color: "black"}}>{formatTime(startTime)}</Text>
                  ) : (
                    <Text style={{color: "#999"}}>Start time</Text>
                  )}
                </Text>
                <Ionicons name="time-outline" size={22} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.halfInput}>
              <TouchableOpacity
                style={[styles.dateInputContainer, { paddingHorizontal: 20, justifyContent: "space-between" }]}
                onPress={() => openPicker("endTime", "time")}
              >
                <Text style={{fontFamily: "DMSans-Medium"}}>
                  {formatTime(endTime) ? (
                    <Text style={{color: "black"}}>{formatTime(endTime)}</Text>
                  ) : (
                    <Text style={{color: "#999"}}>End time</Text>
                  )}
                </Text>
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
            activeOpacity={0.8}
          >
            <Text 
              style={[
                styles.dropdownText,
                !selectedVenue && { color: "#C1C1C1" }
              ]}
            >
              {selectedVenue || "Select venue & location"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Description<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.textInput, styles.descriptionInput, {height: 150}]}
              placeholder="Type your event description..."
              placeholderTextColor="#C1C1C1"
              multiline
              textAlignVertical="top"
            />
        </View>

        <View style={{ height: 70 }} />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.registerButton}>
          <Text style={styles.registerText}>Publish Event</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {pickerVisible && (
          <DateTimePicker
            value={new Date()}
            mode={pickerMode}
            display="default"
            onChange={onPick}
          />
        )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        />

        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Event</Text>

          {events.map((item, index) => (
            <TouchableOpacity
              key={index}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={venueModalVisible}
        onRequestClose={() => setVenueModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setVenueModalVisible(false)}
        />

        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Venue & Location</Text>

          {venue.map((eventvl, index) => (
            <TouchableOpacity
              key={index}
              style={styles.modalItem}
              onPress={() => {
                setSelectedVenue(eventvl);
                setVenueModalVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>{eventvl}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
};

export default EditEvents;
