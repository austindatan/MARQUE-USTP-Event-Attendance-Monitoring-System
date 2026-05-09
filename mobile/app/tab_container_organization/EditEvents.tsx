// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { apiFetch, apiFetchForm } from "../../utils/apiFetch";
import { BASE_URL } from "../../config";
import Header from "../components/Header_Normal";
import styles from "../styles/page_editevents";
import { COLORS } from "../styles/component_org_page";
import joinModalStyles from "../styles/components_joinmodal";

const eventTypes = ["Event", "Sub-Event"];
const venueOptions = ["LRC", "DRER Memorial Hall", "Cafet Hall", "ICT AVR", "Building 28", "PAT AVR", "Building 5", "Science Building",];

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

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveAction, setSaveAction] = useState<"created" | "updated" | "deleted" | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);

  const [missingFieldsVisible, setMissingFieldsVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [invalidDateTimeVisible, setInvalidDateTimeVisible] = useState(false);
  const [invalidDateTimeMessage, setInvalidDateTimeMessage] = useState("");

  const showError = (msg: string) => { setErrorMessage(msg); setErrorVisible(true); };
  const showDateTimeError = (msg: string) => { setInvalidDateTimeMessage(msg); setInvalidDateTimeVisible(true); };

  useEffect(() => {
    if (!isEdit) {
      setLoadingEvent(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        const res = await apiFetch(`/events/event/${event_id}`);
        const ev = res.event || res;

        console.log("EVENT RESPONSE:", res);

        if (!ev || !ev.event_name) {
          console.error("Event data is missing or incomplete:", ev);
          showError("Event data could not be loaded. Please check the ID.");
          setLoadingEvent(false);
          return;
        }

        setEventName(ev.event_name);
        setSelectedEvent(ev.event_type || "");
        setSelectedVenue(ev.venue || "");
        setVenueDetails(ev.venue_details || "");
        setDescription(ev.description || "");

        setStartDate(ev.event_date ? new Date(ev.event_date) : new Date());
        setEndDate(ev.end_date ? new Date(ev.end_date) : new Date());
        setStartTime(ev.start_time ? new Date(ev.start_time) : new Date());
        setEndTime(ev.end_time ? new Date(ev.end_time) : new Date());

        if (ev.event_image) {
          setEventImage({ uri: ev.event_image });
        }
      } catch (err) {
        console.error("Error loading event", err);
        showError("Failed to load event. Please try again.");
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
    setMissingFieldsVisible(true);
    return;
  }

  // Helper to combine date and time
  const combineDateTime = (date, time) => {
      const combined = new Date(date);
      combined.setHours(time.getHours());
      combined.setMinutes(time.getMinutes());
      combined.setSeconds(time.getSeconds());
      combined.setMilliseconds(time.getMilliseconds());
      return combined;
    };

    const startDateTime = combineDateTime(startDate, startTime);
    const endDateTime = combineDateTime(endDate, endTime);

    // --- Date/Time Validation ---
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    if (endDay < startDay) {
      showDateTimeError(
        `End date (${formatDate(endDate)}) cannot be before start date (${formatDate(startDate)}).`
      );
      return;
    }

    if (endDay.getTime() === startDay.getTime() && endDateTime <= startDateTime) {
      showDateTimeError(
        `End time (${formatTime(endTime)}) cannot be the same as or before start time (${formatTime(startTime)}) on the same day.`
      );
      return;
    }

    const formData = new FormData();
    formData.append("organization_id", orgId);
    formData.append("event_name", eventName);
    formData.append("event_type", selectedEvent);
    formData.append("venue", selectedVenue);
    formData.append("venue_details", venueDetails);
    formData.append("description", description);

    // Use combined date-time values
    formData.append("event_date", startDateTime.toISOString());
    formData.append("end_date", endDateTime.toISOString());
    formData.append("start_time", startDateTime.toISOString());
    formData.append("end_time", endDateTime.toISOString());

    if (eventImage?.local) {
      formData.append("event_image", {
        uri: eventImage.uri,
        name: `event-${Date.now()}.jpg`,
        type: "image/jpeg",
      });
    }

    try {
      setIsSaving(true);
      if (isEdit) {
        await apiFetchForm("PUT", `/events/${event_id}`, formData);
        setSaveAction("updated");
      } else {
        await apiFetchForm("POST", `/events/create`, formData);
        setSaveAction("created");
      }
      setSaveSuccess(true);
    } catch (err) {
      console.error("Saving error:", err.message);
      showError(err.message || "Failed to save event.");
    } finally {
      setIsSaving(false);
    }
  };


  const handleDelete = async () => {
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    setDeleteConfirmVisible(false);
    try {
      setIsSaving(true);
      await apiFetch(`/events/${event_id}`, { method: "DELETE" });
      setSaveAction("deleted");
      setSaveSuccess(true);
    } catch (err) {
      console.error("Delete error:", err.message);
      showError(err.message || "Failed to delete event.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingEvent) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#222762" />
      </View>
    );
  }

  const getPickerValue = () => {
    switch (currentField) {
      case "startDate": return startDate;
      case "endDate": return endDate;
      case "startTime": return startTime;
      case "endTime": return endTime;
      default: return new Date();
    }
  };

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

      <View style={styles.bottomButtonContainerAdmin}>
        <TouchableOpacity style={[styles.registerButton, { width: isEdit ? "48%" : "100%" }]} onPress={handleSave}>
          <Text style={styles.registerText}>{isEdit ? "Update Event" : "Publish Event"}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        {isEdit && (
          <TouchableOpacity
            style={[styles.deleteButton, { width: "48%" }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.deleteText}>Delete Event</Text>
          </TouchableOpacity>
        )}
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
      {/* ===== SAVING LOADING MODAL ===== */}
      <Modal visible={isSaving} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={joinModalStyles.overlay}>
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image
                source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
                style={joinModalStyles.iconImage}
              />
            </View>
            <Text style={joinModalStyles.title}>
              {isEdit ? "Updating Event…" : "Publishing Event…"}
            </Text>
            <Text style={joinModalStyles.desc}>Please wait while we save your event.</Text>
            <View style={{ marginTop: 18 }}>
              <ActivityIndicator size="large" color="#0A0F51" />
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== SAVE SUCCESS MODAL ===== */}
      <Modal visible={saveSuccess} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={joinModalStyles.overlay}>
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image
                source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
                style={joinModalStyles.iconImage}
              />
            </View>
            <Text style={joinModalStyles.title}>
              {saveAction === "deleted"
                ? "Event Deleted"
                : saveAction === "updated"
                ? "Event Updated"
                : "Event Published"}
            </Text>
            <Text style={joinModalStyles.desc}>
              {saveAction === "deleted"
                ? "The event has been removed successfully."
                : saveAction === "updated"
                ? "Your event has been updated successfully."
                : "Your event has been published successfully."}
            </Text>
            <View style={{ marginTop: 20, width: "100%" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#fecb20",
                  paddingVertical: 12,
                  borderRadius: 25,
                  alignItems: "center",
                }}
                onPress={() => {
                  setSaveSuccess(false);
                  router.back();
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== MISSING FIELDS MODAL ===== */}
      <Modal visible={missingFieldsVisible} transparent animationType="fade" onRequestClose={() => setMissingFieldsVisible(false)}>
        <TouchableOpacity style={joinModalStyles.overlay} onPress={() => setMissingFieldsVisible(false)} activeOpacity={1}>
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image source={require("../../assets/images/marque/MARQUE_whitelogo.png")} style={joinModalStyles.iconImage} />
            </View>
            <Text style={joinModalStyles.title}>Missing Fields</Text>
            <Text style={joinModalStyles.desc}>Please fill in all required fields before continuing.</Text>
            <View style={{ marginTop: 20, width: "100%" }}>
              <TouchableOpacity
                style={{ backgroundColor: "#0a0f51", paddingVertical: 12, borderRadius: 25, alignItems: "center" }}
                onPress={() => setMissingFieldsVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===== DELETE CONFIRM MODAL ===== */}
      <Modal visible={deleteConfirmVisible} transparent animationType="fade" onRequestClose={() => setDeleteConfirmVisible(false)}>
        <TouchableOpacity style={joinModalStyles.overlay} onPress={() => setDeleteConfirmVisible(false)} activeOpacity={1}>
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image source={require("../../assets/images/marque/MARQUE_whitelogo.png")} style={joinModalStyles.iconImage} />
            </View>
            <Text style={joinModalStyles.title}>Delete Event?</Text>
            <Text style={joinModalStyles.desc}>Are you sure you want to delete this event? This action cannot be undone.</Text>
            <View style={{ flexDirection: "row", marginTop: 20, width: "100%" }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: "#0a0f51", paddingVertical: 12, borderRadius: 25, alignItems: "center", marginRight: 6 }}
                onPress={() => setDeleteConfirmVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: "#e53935", paddingVertical: 12, borderRadius: 25, alignItems: "center", marginLeft: 6 }}
                onPress={confirmDelete}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===== ERROR MODAL ===== */}
      <Modal visible={errorVisible} transparent animationType="fade" onRequestClose={() => setErrorVisible(false)}>
        <TouchableOpacity style={joinModalStyles.overlay} onPress={() => setErrorVisible(false)} activeOpacity={1}>
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image source={require("../../assets/images/marque/MARQUE_whitelogo.png")} style={joinModalStyles.iconImage} />
            </View>
            <Text style={joinModalStyles.title}>Something Went Wrong</Text>
            <Text style={joinModalStyles.desc}>{errorMessage || "An unexpected error occurred."}</Text>
            <View style={{ marginTop: 20, width: "100%" }}>
              <TouchableOpacity
                style={{ backgroundColor: "#0a0f51", paddingVertical: 12, borderRadius: 25, alignItems: "center" }}
                onPress={() => setErrorVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===== INVALID DATE/TIME MODAL ===== */}
      <Modal visible={invalidDateTimeVisible} transparent animationType="fade" onRequestClose={() => setInvalidDateTimeVisible(false)}>
        <TouchableOpacity style={joinModalStyles.overlay} onPress={() => setInvalidDateTimeVisible(false)} activeOpacity={1}>
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image source={require("../../assets/images/marque/MARQUE_whitelogo.png")} style={joinModalStyles.iconImage} />
            </View>
            <Text style={joinModalStyles.title}>Invalid Date / Time</Text>
            <Text style={joinModalStyles.desc}>{invalidDateTimeMessage}</Text>
            <View style={{ marginTop: 20, width: "100%" }}>
              <TouchableOpacity
                style={{ backgroundColor: "#0a0f51", paddingVertical: 12, borderRadius: 25, alignItems: "center" }}
                onPress={() => setInvalidDateTimeVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default EditEvents;
