//@ts-nocheck
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import styles from "../styles/page_admin_dashboard";
import Header from '../components/Header_Admin';
import AdminSidebarMenu from '../components/SidebarMenu_Admin';
import StudentLinear from '../components/Card_StudentLinear';
import { BASE_URL } from "../../config";

// ======================================================
// 1. CUSTOM MODAL (LogoutModal-style)
// ======================================================
const UserActionModal = ({ visible, onClose, onConfirm, title, message, confirmText, cancelText = "Cancel" }) => {
  const LOGO = require("../../assets/images/marque/MARQUE_whitelogo.png");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={modalStyles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={modalStyles.modalBox}>
          {/* Icon overlaps the modal */}
          <View style={modalStyles.iconContainerWrapper}>
            <View style={modalStyles.iconContainer}>
              <Image source={LOGO} style={modalStyles.iconImage} />
            </View>
          </View>
          <Text style={modalStyles.title}>{title}</Text>
          <Text style={modalStyles.desc}>{message}</Text>

          <View style={modalStyles.buttonRow}>
            {cancelText && (
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.cancelButton]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={modalStyles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[modalStyles.button, modalStyles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={modalStyles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================
const ManageUsers = () => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isResultModalVisible, setIsResultModalVisible] = useState(false);
  const [resultModalData, setResultModalData] = useState({ title: '', message: '', type: '' });

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleFilterPress = () => console.log("Opening student filter options.");
  const handleEditPress = (studentId) => router.push(`/tabs_admin/EditUser?studentNumber=${studentId}`);

  const fetchStudents = useCallback(async (tab) => {
    setIsLoading(true);
    setError(null);

    const filterParam = tab === 'roles' ? 'roles' : 'all';
    try {
      const url = `${BASE_URL}/api/student/all?filter=${filterParam}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load user data.");
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStudentDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleteModalVisible(false);

    const { studentNumber, name } = studentToDelete;
    try {
      const url = `${BASE_URL}/api/student/profile/${studentNumber}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');

      setResultModalData({
        title: "Success",
        message: `${name} has been successfully deleted.`,
        type: 'success'
      });
      setIsResultModalVisible(true);
      fetchStudents(activeTab);
    } catch (err) {
      console.error("Error deleting student:", err);
      setResultModalData({
        title: "Error",
        message: err.message || "An unknown error occurred.",
        type: 'error'
      });
      setIsResultModalVisible(true);
    }

    setStudentToDelete(null);
  };

  const handleDeletePress = (studentNumber, name) => {
    setStudentToDelete({ studentNumber, name });
    setIsDeleteModalVisible(true);
  };

  const safeImage = (img) =>
    typeof img === "string" && img.trim() !== "" ? { uri: img } : require("../../assets/images/marque/crk.jpg");

  useFocusEffect(
    useCallback(() => {
      fetchStudents(activeTab);
    }, [activeTab, fetchStudents])
  );

  const renderStudents = () => {
    if (isLoading) return <ActivityIndicator style={{ flex: 1, paddingTop: 50 }} size="large" color="#0A0F51" />;
    if (error) return <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>Error: {error}</Text>;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredStudents = students.filter(student =>
      student.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.studentId.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.department.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.course.toLowerCase().includes(lowerCaseSearchTerm) ||
      (student.orgName && student.orgName.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (student.position && student.position.toLowerCase().includes(lowerCaseSearchTerm))
    );

    if (filteredStudents.length === 0) return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>
          No {activeTab === 'all' ? 'standard student' : 'role-assigned'} students found matching "{searchTerm}".
        </Text>
      </View>
    );

    return filteredStudents.map(student => (
      <StudentLinear
        key={student.id}
        name={student.name}
        studentId={student.studentId}
        studentImage={safeImage(student.studentImage)}
        department={student.department}
        course={student.course}
        allRoles={student.allRoles}
        orgName={student.orgName}
        orgLogo={safeImage(student.orgLogo)}
        position={student.position}
        onEditPress={() => handleEditPress(student.studentId)}
        onDeletePress={() => handleDeletePress(student.studentId, student.name)}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <Header onMenuPress={openMenu} />
      <View style={styles.content}>
        <View style={styles.searchAndAddRow}>
          <View style={styles.searchContainerRow}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search students..."
              placeholderTextColor="#888"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <TouchableOpacity style={styles.addButtonOrg} onPress={() => router.push("tabs_admin/AddUser")}>
            <Ionicons name="add" size={24} color="#0A0F51" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryButtonContainer}>
          <TouchableOpacity
            style={activeTab === 'all' ? styles.activeButtonEX : styles.inactiveButtonEX}
            onPress={() => setActiveTab('all')}
          >
            <Text style={activeTab === 'all' ? styles.activeText : styles.inactiveText}>Students</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeTab === 'roles' ? styles.activeButtonEX : styles.inactiveButtonEX}
            onPress={() => setActiveTab('roles')}
          >
            <Text style={activeTab === 'roles' ? styles.activeText : styles.inactiveText}>Students w/ Roles</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.eventList}>
          {renderStudents()}
        </ScrollView>
      </View>

      <AdminSidebarMenu isVisible={menuVisible} onClose={closeMenu} />

      {/* Delete confirmation modal */}
      {studentToDelete && (
        <UserActionModal
          visible={isDeleteModalVisible}
          onClose={() => setIsDeleteModalVisible(false)}
          onConfirm={handleStudentDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to permanently delete user: ${studentToDelete.name} (${studentToDelete.studentNumber})? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {/* Result modal */}
      <UserActionModal
        visible={isResultModalVisible}
        onClose={() => setIsResultModalVisible(false)}
        onConfirm={() => setIsResultModalVisible(false)}
        title={resultModalData.title}
        message={resultModalData.message}
        confirmText="Close"
        cancelText={null} // hide cancel
      />
    </View>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "white",
    borderRadius: 15,
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 25,
    alignItems: "center",
    position: "relative",
  },
  iconContainerWrapper: {
    position: "absolute",
    top: -25,
    borderRadius: 50,
    backgroundColor: "white",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    backgroundColor: "#0A0F51",
    borderRadius: 50,
    padding: 10,
  },
  iconImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  title: {
    fontSize: 20,
    color: "#0A0F51",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "DMSans-Bold"
  },
  desc: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "DMSans-Regular"
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#0a0f51",
  },
  confirmButton: {
    backgroundColor: "#fecb20",
  },
  cancelText: {
    color: "white",
    fontSize: 16,
    fontFamily: "DMSans-Bold"
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "DMSans-Bold"
  },
});

export default ManageUsers;
