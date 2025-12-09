// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useRouter } from "expo-router";
import Header from "../components/Header_Normal";
import styles from "../styles/page_editevents";
import { BASE_URL } from "../../config";

const AddUser = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");

  // DEFAULT & LOCKED ROLE
  const [role] = useState("Student");

  // IMAGE
  const [profileImage, setProfileImage] = useState(null);

  // COLLEGE / DEPARTMENT / STUDENT NO.
  const [collegeId, setCollegeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [studentNumber, setStudentNumber] = useState(""); // 🔥 Not auto-generated

  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [collegeModalVisible, setCollegeModalVisible] = useState(false);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);

  const filteredDepartments = departments.filter(d => d.college_id === collegeId);

  // Load Colleges + Departments
  useEffect(() => {
    const fetchCollegesAndDepartments = async () => {
      try {
        const collegeRes = await axios.get(`${BASE_URL}/api/college/colleges`);
        setColleges(collegeRes.data);

        const departmentRes = await axios.get(`${BASE_URL}/api/departments`);
        setDepartments(departmentRes.data);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data);
        Alert.alert("Error", "Failed to load college/department data.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchCollegesAndDepartments();
  }, []);

  // Pick Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri, local: true });
    }
  };

  // Save User
  const handleSave = async () => {
    if (!username || !firstname || !lastname || !email || !password) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }

    if (!studentNumber || !collegeId || !departmentId) {
      Alert.alert("Missing Fields", "Please enter Student Number, College, and Department.");
      return;
    }

    const payload = {
      username,
      firstname,
      middlename,
      lastname,
      email,
      contact_number: contactNumber,
      password,
      role: "Student",
      student_number: studentNumber,
      college_id: collegeId,
      department_id: departmentId,
    };

    console.log("Payload sent:", payload);

    try {
      const res = await axios.post(`${BASE_URL}/api/student/create`, payload);
      console.log("Response:", res.data);

      Alert.alert("Success", "Student added successfully.");
      router.back();
    } catch (err) {
      console.error("Error creating student:", err.response?.data || err.message);

      let message = "Failed to create user.";
      if (err.response?.data?.message) message = err.response.data.message;

      Alert.alert("Error", message);
    }
  };

  if (loadingData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#222762" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.containerEvents}>
        <View style={styles.header}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={styles.headerTitle}>Add User</Text>
          </TouchableOpacity>
        </View>

        {/* PROFILE IMAGE */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <TouchableOpacity onPress={pickImage}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage.uri }}
                style={{ width: 120, height: 120, borderRadius: 12 }}
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

        {/* STUDENT NUMBER */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Student Number *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter student number"
            placeholderTextColor="#C1C1C1"
            value={studentNumber}
            onChangeText={setStudentNumber}
          />
        </View>

        {/* COLLEGE */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>College *</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setCollegeModalVisible(true)}
          >
            <Text style={{ color: collegeId ? "#000" : "#C1C1C1" }}>
              {colleges.find(c => c._id === collegeId)?.college_name || "Select college"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* DEPARTMENT */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Department *</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setDepartmentModalVisible(true)}
          >
            <Text style={{ color: departmentId ? "#000" : "#C1C1C1" }}>
              {departments.find(d => d._id === departmentId)?.department_name ||
                "Select department"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* OTHER USER FIELDS */}
        {[
          { label: "Username", value: username, setter: setUsername },
          { label: "First Name", value: firstname, setter: setFirstname },
          { label: "Middle Name", value: middlename, setter: setMiddlename, optional: true },
          { label: "Last Name", value: lastname, setter: setLastname },
          { label: "Email", value: email, setter: setEmail },
          { label: "Contact Number", value: contactNumber, setter: setContactNumber, optional: true },
          { label: "Password", value: password, setter: setPassword, secure: true },
        ].map((field, i) => (
          <View style={styles.inputGroup} key={i}>
            <Text style={styles.label}>
              {field.label}
              {!field.optional && <Text style={styles.required}>*</Text>}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={field.label}
              placeholderTextColor="#C1C1C1"
              value={field.value}
              onChangeText={field.setter}
              secureTextEntry={field.secure}
            />
          </View>
        ))}

        {/* FIXED ROLE DISPLAY */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role</Text>
          <View style={[styles.dropdownInput, { backgroundColor: "#EEE" }]}>
            <Text style={{ color: "#000" }}>Student</Text>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
          <TouchableOpacity style={styles.registerButton} onPress={handleSave}>
            <Text style={styles.registerText}>Publish User</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* COLLEGE MODAL */}
      <Modal transparent visible={collegeModalVisible}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setCollegeModalVisible(false)}
        />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select College</Text>
          {colleges.map(c => (
            <TouchableOpacity
              key={c._id}
              style={[
                styles.modalItem,
                c._id === collegeId && { backgroundColor: "#E7E7E7" },
              ]}
              onPress={() => {
                setCollegeId(c._id);
                setCollegeModalVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>{c.college_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* DEPARTMENT MODAL */}
      <Modal transparent visible={departmentModalVisible}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setDepartmentModalVisible(false)}
        />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Department</Text>
          {filteredDepartments.map(d => (
            <TouchableOpacity
              key={d._id}
              style={[
                styles.modalItem,
                d._id === departmentId && { backgroundColor: "#E7E7E7" },
              ]}
              onPress={() => {
                setDepartmentId(d._id);
                setDepartmentModalVisible(false);
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

export default AddUser;
