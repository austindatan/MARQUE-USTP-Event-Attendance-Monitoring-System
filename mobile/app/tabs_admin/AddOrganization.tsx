// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL } from "../../config";

import Header from "../components/Header_Normal";
import styles from "../styles/page_editevents";
import { COLORS } from "../styles/component_org_page";

const orgTypes = [
  "Unit Organization",
  "Mother Organization",
  "FAESO Organization",
];

const EditOrganization = () => {
  const router = useRouter();
  const { orgId } = useLocalSearchParams();
  const isEdit = !!orgId;

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [moderatorName, setModeratorName] = useState("");

  const [fbLink, setFbLink] = useState("");
  const [igLink, setIgLink] = useState("");
  const [xLink, setXLink] = useState("");

  const [coverPhoto, setCoverPhoto] = useState(null);
  const [pfp, setPfp] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [loadingOrg, setLoadingOrg] = useState(true);

  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [deptModalVisible, setDeptModalVisible] = useState(false);

  // Fetch organization details if editing
  useEffect(() => {
    const fetchOrg = async () => {
      if (!isEdit) {
        setLoadingOrg(false);
        return;
      }

      try {
        // FIX 3: Update to /api/organizations/:orgId
        const res = await axios.get(`${BASE_URL}/api/organizations/${orgId}`);
        const org = res.data.organization || res.data;

        if (!org) {
          Alert.alert("Error", "Organization not found.");
          setLoadingOrg(false);
          return;
        }

        setOrgName(org.org_name);
        setOrgType(org.org_type);
        setDepartment(org.department_id?._id || "");
        setDescription(org.description);
        setModeratorName(org.moderator_name);

        setFbLink(org.fb_link || "");
        setIgLink(org.ig_link || "");
        setXLink(org.x_link || "");

        if (org.cover_photo) setCoverPhoto({ uri: org.cover_photo });
        if (org.pfp) setPfp({ uri: org.pfp });
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load organization.");
      } finally {
        setLoadingOrg(false);
      }
    };

    fetchOrg();
  }, [orgId]);

  // Fetch department options dynamically from backend
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/departments`);
        setDepartments(res.data); // res.data should be array of { _id, name }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        Alert.alert("Error", "Failed to load departments.");
      }
    };
    fetchDepartments();
  }, []);

  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      if (type === "cover") {
        setCoverPhoto({ uri: result.assets[0].uri, local: true });
      } else {
        setPfp({ uri: result.assets[0].uri, local: true });
      }
    }
  };

  const handleSave = async () => {
    if (!orgName.trim() || !orgType || !department || !description.trim()) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("org_name", orgName);
    formData.append("org_type", orgType);
    formData.append("department_id", department);
    formData.append("description", description);
    formData.append("moderator_name", moderatorName);

    formData.append("fb_link", fbLink);
    formData.append("ig_link", igLink);
    formData.append("x_link", xLink);

    if (coverPhoto?.local) {
      formData.append("cover_photo", {
        uri: coverPhoto.uri,
        name: `cover-${Date.now()}.jpg`,
        type: "image/jpeg",
      });
    }

    if (pfp?.local) {
      formData.append("pfp", {
        uri: pfp.uri,
        name: `pfp-${Date.now()}.jpg`,
        type: "image/jpeg",
      });
    }

    try {
      if (isEdit) {
          // FIX 1: Update to /api/organizations/:orgId
          await axios.put(`${BASE_URL}/api/organizations/${orgId}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
          });
          Alert.alert("Updated", "Organization updated successfully.");
      } else {
          // FIX 2: Update to /api/organizations (remove /create)
          await axios.post(`${BASE_URL}/api/organizations`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
          });
          Alert.alert("Created", "Organization added successfully.");
      }

      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save organization.");
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Organization",
      "Are you sure you want to delete this organization? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/api/organizations/${orgId}`);
              Alert.alert("Deleted", "Organization deleted successfully.");
              router.back(); // go back to manage organizations page
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete organization.");
            }
          }
        }
      ]
    );
  };

  if (loadingOrg) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#222762" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.containerEvents}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { flexDirection: "row", alignItems: "center" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={styles.headerTitle}>
              {isEdit ? "Edit Organization" : "Add Organization"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* COVER PHOTO */}
        <View style={styles.imageUploadArea}>
          <TouchableOpacity
            style={styles.mainImagePlaceholder}
            onPress={() => pickImage("cover")}
          >
            {coverPhoto ? (
              <Image
                source={{ uri: coverPhoto.uri }}
                style={{ width: "100%", height: "100%", borderRadius: 12 }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="add-circle" size={32} color="#222762" />
            )}
          </TouchableOpacity>
        </View>

        {/* PROFILE PICTURE */}
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <TouchableOpacity onPress={() => pickImage("pfp")}>
            {pfp ? (
              <Image
                source={{ uri: pfp.uri }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                }}
              />
            ) : (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                  backgroundColor: "#E7E7E7",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="camera" size={30} color="#222762" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.formSectionTitle}>Organization Details</Text>

        {/* ORG NAME */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Organization Name<Text style={styles.required}> *</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="USTP Week of Welcome"
            placeholderTextColor="#C1C1C1"
            value={orgName}
            onChangeText={setOrgName}
          />
        </View>

        {/* ORG TYPE */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Organization Type<Text style={styles.required}> *</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setTypeModalVisible(true)}
          >
            <Text style={[styles.dropdownText, !orgType && { color: "#C1C1C1" }]}>
              {orgType || "Select organization type"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DEPARTMENT */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Department<Text style={styles.required}> *</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setDeptModalVisible(true)}
          >
            <Text style={[styles.dropdownText, !department && { color: "#C1C1C1" }]}>
              {departments.find(d => d._id === department)?.department_name || "Select department"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODERATOR */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Moderator Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="John Doe"
            placeholderTextColor="#C1C1C1"
            value={moderatorName}
            onChangeText={setModeratorName}
          />
        </View>

        {/* DESCRIPTION */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.textInput, styles.descriptionInput]}
            placeholder="Hello world"
            placeholderTextColor="#C1C1C1"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* FB LINK */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Facebook Link</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://www.facebook.com/ustpwow"
            placeholderTextColor="#C1C1C1"
            value={fbLink}
            onChangeText={setFbLink}
          />
        </View>

        {/* IG LINK */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instagram Link</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://www.instagram.com/ustpwow"
            placeholderTextColor="#C1C1C1"
            value={igLink}
            onChangeText={setIgLink}
          />
        </View>

        {/* X LINK */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>X Link</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://www.x.com/ustpwow"
            placeholderTextColor="#C1C1C1"
            value={xLink}
            onChangeText={setXLink}
          />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          {/* SAVE / UPDATE BUTTON */}
          <TouchableOpacity
            style={[styles.registerButton, { marginBottom: 12 }]}
            onPress={handleSave}
          >
            <Text style={styles.registerText}>
              {isEdit ? "Update Organization" : "Publish Organization"}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>

          {/* DELETE BUTTON */}
          {isEdit && (
            <TouchableOpacity
              style={{
                backgroundColor: "#FF4D4F",
                paddingVertical: 14,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Delete Organization
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ORG TYPE MODAL */}
      <Modal transparent visible={typeModalVisible}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setTypeModalVisible(false)}
        />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Organization Type</Text>

          {orgTypes.map((t, i) => (
            <TouchableOpacity
              key={i}
              style={styles.modalItem}
              onPress={() => {
                setOrgType(t);
                setTypeModalVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* DEPARTMENT MODAL */}
      <Modal transparent visible={deptModalVisible}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setDeptModalVisible(false)}
        />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Department</Text>

          {departments.map((d) => (
            <TouchableOpacity
              key={d._id}
              style={[
                styles.modalItem,
                d._id === department && { backgroundColor: "#E7E7E7" } // highlight current
              ]}
              onPress={() => {
                setDepartment(d._id);
                setDeptModalVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>{d.department_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
};

export default EditOrganization;
