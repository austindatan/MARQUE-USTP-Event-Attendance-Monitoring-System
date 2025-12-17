// @ts-nocheck
import React, { useEffect, useState, useRef } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import Header from "../components/Header_Normal";
import styles from "../styles/page_editevents";
import { BASE_URL } from "../../config";

const SPYGLASS_ICON = require("../../assets/images/marque/MARQUE_whitelogo.png");

const EditUser = () => {
  const router = useRouter();
  const { studentNumber } = useLocalSearchParams();
  const isInitialMount = useRef(true);

  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [studentNumberState, setStudentNumberState] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [orgs, setOrgs] = useState([]);

  const [userRoles, setUserRoles] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [collegeModalVisible, setCollegeModalVisible] = useState(false);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);

  const [addRoleModalVisible, setAddRoleModalVisible] = useState(false);
  const [tempRole, setTempRole] = useState("Student");
  const [tempOrgId, setTempOrgId] = useState("");
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [orgModalVisible, setOrgModalVisible] = useState(false);

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const ROLE_OPTIONS = ["Student", "President", "Manager", "Committee"];

  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [extracurricularDepartmentId, setExtracurricularDepartmentId] = useState("");

  // fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, collegeRes, departmentRes, orgsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/student/id/${studentNumber}`),
          axios.get(`${BASE_URL}/api/college/colleges`),
          axios.get(`${BASE_URL}/api/departments`),
        ]);

        const student = studentRes.data;

        if (!student) {
          throw new Error("Student data received from API is null or undefined.");
        }

        setFirstname(student.firstname);
        setLastname(student.lastname);
        setMiddlename(student.middlename || "");
        setEmail(student.email);
        setContactNumber(student.contact_number || "");
        setStudentNumberState(student.student_number);
        setDepartmentId(String(student.department_id || ''));
        setCollegeId(String(student.college_id || ''));
        setProfileImage({ uri: student.profile_image, local: false });

        const membershipRes = await axios.get(`${BASE_URL}/api/memberships/student/${student._id}`);
        const roles = membershipRes.data.map(membership => ({
          role: membership.role,
          org_id: membership._id,
          org_name: membership.org_name,
          org_pfp: membership.pfp
        }));

        setUserRoles(roles.length > 0 ? roles : [{ role: 'Student', org_id: null, org_name: null, org_pfp: null }]);

        setColleges(collegeRes.data);
        setDepartments(departmentRes.data);

        const extracurricularDept = departmentRes.data.find(d => d.department_name === "Extracurricular");
        if (extracurricularDept) {
          setExtracurricularDepartmentId(extracurricularDept._id);
        }

      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
        Alert.alert("Error", "Failed to load student or college/department data.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [studentNumber]);

  useEffect(() => {
    if (!collegeId || departments.length === 0) return;

    const filtered = departments.filter(d => d.college_id === collegeId);
    setFilteredDepartments(filtered);

    if (!isInitialMount.current && departmentId) {
      if (!filtered.find(d => String(d._id) === departmentId)) {
        setDepartmentId("");
      }
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
    }

  }, [collegeId, departments, departmentId]);

  useEffect(() => {
    const fetchOrgs = async () => {
      // Only fetch if a department is selected and we have the Extracurricular ID
      if (!departmentId || !extracurricularDepartmentId) return;
      // Create a list of department IDs to query
      const departmentIdsToQuery = [departmentId];
      if (departmentId !== extracurricularDepartmentId) {
        departmentIdsToQuery.push(extracurricularDepartmentId);
      }


      try {
        const deptIdsString = departmentIdsToQuery.join(',');
        const res = await axios.get(`${BASE_URL}/api/student/organizations/by-departments?departmentIds=${deptIdsString}`);

        const uniqueOrgs = res.data.reduce((acc, current) => {
          const x = acc.find(item => item._id === current._id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        setOrgs(uniqueOrgs);
      } catch (err) {
        console.error("Error fetching orgs:", err);
      }
    };
    fetchOrgs();
  }, [departmentId, extracurricularDepartmentId]);

  // image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri, local: true });
    }
  };

  // upload image
  const handleImageUpload = async () => {
    if (!profileImage?.local) return;

    const formData = new FormData();
    formData.append("profile_image", {
      uri: profileImage.uri,
      type: "image/jpeg",
      name: "profile.jpg",
    });

    try {
      const res = await axios.post(
        `${BASE_URL}/api/student/profile/${studentNumber}/upload-photo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setProfileImage({ uri: res.data.profile_image, local: false });
    } catch (err) {
      console.error("Error uploading image:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to upload profile image.");
    }
  };

  // save update
  const handleSave = async () => {
    if (!firstname || !lastname || !email) {
      Alert.alert("Missing Fields", "Please fill all required fields.");
      return;
    }

    // Validate roles
    const nonStudentRoles = userRoles.filter(r => r.role !== 'Student');
    for (const roleObj of nonStudentRoles) {
      if (!roleObj.org_id) {
        Alert.alert("Missing Organization", `Please select an organization for the ${roleObj.role} role.`);
        return;
      }
    }

    // Validate president count
    const presidentRoles = userRoles.filter(r => r.role === 'President');
    if (presidentRoles.length > 2) {
      Alert.alert("Too Many President Roles", "A student cannot be President of more than 2 organizations.");
      return;
    }

    try {
      const payload = {
        firstname,
        middlename,
        lastname,
        email,
        contact_number: contactNumber,
        roles: userRoles,  // Send entire roles array
        department_id: departmentId,
        college_id: collegeId,
      };

      await axios.put(`${BASE_URL}/api/student/profile/${studentNumber}`, payload);
      await handleImageUpload();

      Alert.alert("Success", "Student updated successfully.");
      router.back();
    } catch (err) {

      let message = "Failed to update student profile.";

      if (err.response?.data?.message?.includes("duplicate email")) {
        message = "This email is already used by another student.";
      }

      if (err.response?.data?.message?.includes("President of more than 2")) {
        message = err.response.data.message;
      }

      setErrorMessage(message);
      setErrorModalVisible(true);

    }
  };

  // Role management functions
  const handleAddRole = () => {
    if (tempRole !== 'Student' && !tempOrgId) {
      Alert.alert("Missing Organization", "Please select an organization for this role.");
      return;
    }

    const selectedOrg = orgs.find(o => o._id === tempOrgId);

    const newRole = {
      role: tempRole,
      org_id: tempRole === 'Student' ? null : tempOrgId,
      org_name: selectedOrg?.org_name || null,
      org_pfp: selectedOrg?.pfp || null
    };

    setUserRoles([...userRoles, newRole]);
    setAddRoleModalVisible(false);
    setTempRole("Student");
    setTempOrgId("");
  };

  const handleRemoveRole = (index) => {
    const newRoles = userRoles.filter((_, i) => i !== index);
    // Ensure at least one role (default to Student)
    setUserRoles(newRoles.length > 0 ? newRoles : [{ role: 'Student', org_id: null, org_name: null, org_pfp: null }]);
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
        {/* Back + Title */}
        <View style={styles.header}>
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
            <Text style={styles.headerTitle}>Edit User</Text>
          </TouchableOpacity>
        </View>

        {/* IMAGE */}
        <View style={{ alignItems: "left", marginBottom: 20 }}>
          <TouchableOpacity onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage.uri }} style={{ width: 120, height: 120, borderRadius: 12 }} />
            ) : (
              <View style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: "#E7E7E7", justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="camera" size={30} color="#222762" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* STUDENT NUMBER */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Student Number *</Text>
          <TextInput style={styles.textInput} value={studentNumberState} editable={false} />
        </View>

        {/* COLLEGE */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>College *</Text>
          <TouchableOpacity style={styles.dropdownInput} onPress={() => setCollegeModalVisible(true)}>
            <Text style={{ fontFamily: "DMSans-Medium" }}>{colleges.find(c => String(c._id) === String(collegeId))?.college_name || "Select college"}</Text>
          </TouchableOpacity>
        </View>

        {/* DEPARTMENT */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Department *</Text>
          <TouchableOpacity style={styles.dropdownInput} onPress={() => setDepartmentModalVisible(true)}>
            <Text style={{ fontFamily: "DMSans-Medium" }}>{departments.find(d => String(d._id) === String(departmentId))?.department_name || "Select department"}</Text>
          </TouchableOpacity>
        </View>

        {/* USER FIELDS */}
        {[
          { label: "First Name", value: firstname, setter: setFirstname },
          { label: "Middle Name", value: middlename, setter: setMiddlename, optional: true },
          { label: "Last Name", value: lastname, setter: setLastname },
          { label: "Email", value: email, setter: setEmail },
          { label: "Contact Number", value: contactNumber, setter: setContactNumber, optional: true },
        ].map((field, i) => (
          <View style={styles.inputGroup} key={i}>
            <Text style={styles.label}>{field.label}{!field.optional && <Text style={styles.required}>*</Text>}</Text>
            <TextInput style={styles.textInput} value={field.value} onChangeText={field.setter} />
          </View>
        ))}

        {/* ORGANIZATION ROLES - NEW MULTI-ROLE UI */}
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Text style={[styles.label, { fontSize: 16, marginBottom: 10 }]}>Organization Roles</Text>

          {userRoles.map((roleObj, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
            }}>
              {/* Org Logo */}
              {roleObj.org_pfp && (
                <Image
                  source={{ uri: roleObj.org_pfp }}
                  style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                />
              )}

              {/* Role Info */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', fontFamily: 'DMSans-Bold' }}>
                  {roleObj.role}
                </Text>
                {roleObj.org_name && (
                  <Text style={{ fontSize: 12, color: '#666', fontFamily: 'DMSans-Regular' }}>
                    {roleObj.org_name}
                  </Text>
                )}
              </View>

              {/* Remove Button */}
              <TouchableOpacity onPress={() => handleRemoveRole(index)}>
                <Ionicons name="close-circle" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Role Button */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 12,
              borderWidth: 1,
              borderColor: '#0A0F51',
              borderRadius: 8,
              borderStyle: 'dashed',
            }}
            onPress={() => {
              setTempRole("Student");
              setTempOrgId("");
              setAddRoleModalVisible(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color="#0A0F51" />
            <Text style={{ marginLeft: 8, color: '#0A0F51', fontFamily: 'DMSans-Medium' }}>
              Add Another Role
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* SAVE BUTTON */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.registerButton} onPress={handleSave}>
          <Text style={styles.registerText}>Update User</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* COLLEGE MODAL */}
      <Modal transparent visible={collegeModalVisible}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setCollegeModalVisible(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select College</Text>
          {colleges.map((c) => (
            <TouchableOpacity
              key={c._id}
              style={[styles.modalItem, c._id === collegeId && { backgroundColor: "#E7E7E7" }]}
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
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setDepartmentModalVisible(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Department</Text>
          {filteredDepartments.map((d) => (
            <TouchableOpacity
              key={d._id}
              style={[styles.modalItem, d._id === departmentId && { backgroundColor: "#E7E7E7" }]}
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

      {/* ROLE MODAL */}
      <Modal transparent visible={roleModalVisible}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setRoleModalVisible(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Role</Text>
          {ROLE_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.modalItem, tempRole === r && { backgroundColor: "#E7E7E7" }]}
              onPress={() => {
                setTempRole(r);
                if (r === "Student") setTempOrgId("");
                setRoleModalVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* ORG MODAL */}
      <Modal transparent visible={orgModalVisible}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setOrgModalVisible(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Organization</Text>
          {orgs.map((o) => (
            <TouchableOpacity
              key={o._id}
              style={[styles.modalItem, tempOrgId === o._id && { backgroundColor: "#E7E7E7" }]}
              onPress={() => {
                setTempOrgId(o._id);
                setOrgModalVisible(false);
              }}
            >
              <Text style={styles.modalItemText}>{o.org_name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* ADD ROLE MODAL */}
      <Modal transparent visible={addRoleModalVisible}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setAddRoleModalVisible(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Add Role</Text>

          <Text style={[styles.label, { marginTop: 10, marginBottom: 5 }]}>Select Role</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() => setRoleModalVisible(true)}
          >
            <Text style={{ fontFamily: "DMSans-Medium" }}>{tempRole}</Text>
          </TouchableOpacity>

          {tempRole !== 'Student' && (
            <>
              <Text style={[styles.label, { marginTop: 10, marginBottom: 5 }]}>Select Organization</Text>
              <TouchableOpacity
                style={styles.dropdownInput}
                onPress={() => setOrgModalVisible(true)}
              >
                <Text style={{ fontFamily: "DMSans-Medium" }}>
                  {orgs.find(o => o._id === tempOrgId)?.org_name || "Select organization"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.dropdownInput, { flex: 1, marginRight: 10, backgroundColor: '#e0e0e0' }]}
              onPress={() => setAddRoleModalVisible(false)}
            >
              <Text style={{ fontFamily: "DMSans-Medium", textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dropdownInput, { flex: 1, backgroundColor: '#0A0F51' }]}
              onPress={handleAddRole}
            >
              <Text style={{ fontFamily: "DMSans-Medium", color: '#fff', textAlign: 'center' }}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ERROR MODAL */}
      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>

          <View style={styles.modalWrapper}>

            <View style={styles.modalBox}>
              <View style={styles.iconContainer}>
                <Image
                  source={SPYGLASS_ICON}
                  style={styles.iconImage}
                />
              </View>
              <Text style={styles.modalTitle}>Update Failed</Text>
              <Text style={styles.modalMessage}>{errorMessage}</Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setErrorModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditUser;
