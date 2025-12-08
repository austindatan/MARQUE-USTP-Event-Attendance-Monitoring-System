//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from "../styles/page_admin_dashboard";
import Header from '../components/Header_Admin';
import AdminSidebarMenu from '../components/SidebarMenu_Admin';
import StudentLinear from '../components/Card_StudentLinear';
import { BASE_URL } from "../../config";

const ManageUsers = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const openMenu = () => {
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleFilterPress = () => {
    console.log("Opening student filter options.");
  };

  const handleEditPress = (studentId) => {
    console.log(`Editing User ID: ${studentId}`);
  };

  const fetchStudents = async (tab) => {
    setIsLoading(true);
    setError(null);

    let filterParam = tab === 'roles' ? 'roles' : 'all';

    try {
      const url = `${BASE_URL}/api/student/all?filter=${filterParam}`;
      console.log('Frontend Fetching URL:', url);
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
  };

  const safeImage = (img) =>
    typeof img === "string" && img.trim() !== "" ? { uri: img } : require("../../assets/images/marque/crk.jpg");

  useEffect(() => {
    fetchStudents(activeTab);
  }, [activeTab]);

  const renderStudents = () => {
    if (isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 50 }}>
          <ActivityIndicator size="large" color="#0A0F51" />
        </View>
      );
    }

    if (error) {
      return <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>Error: {error}</Text>;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredStudents = students.filter(student =>
      student.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.studentId.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.department.toLowerCase().includes(lowerCaseSearchTerm) ||
      student.course.toLowerCase().includes(lowerCaseSearchTerm) ||
      (student.orgName && student.orgName.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (student.position && student.position.toLowerCase().includes(lowerCaseSearchTerm))
    );

    const tabText = activeTab === 'all' ? 'standard student' : 'role-assigned';

    if (filteredStudents.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No {tabText} students found matching "{searchTerm}".
          </Text>
        </View>
      );
    }

    return filteredStudents.map((student) => (
      <StudentLinear
        key={student.id}
        name={student.name}
        studentId={student.studentId}
        studentImage={safeImage(student.studentImage)}
        department={student.department}
        course={student.course}
        orgName={student.orgName}
        orgLogo={safeImage(student.orgLogo)}
        position={student.position}
        onEditPress={() => handleEditPress(student.id)}
        onPress={() => console.log(`Viewing details for ${student.name}`)}
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
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#0A0F51" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleFilterPress}
          >
            <Ionicons name="filter" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryButtonContainer}>
          <TouchableOpacity
            style={activeTab === 'all' ? styles.activeButtonEX : styles.inactiveButtonEX}
            onPress={() => setActiveTab('all')}
          >
            <Text style={activeTab === 'all' ? styles.activeText : styles.inactiveText}>
              Students
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={activeTab === 'roles' ? styles.activeButtonEX : styles.inactiveButtonEX}
            onPress={() => setActiveTab('roles')}
          >
            <Text style={activeTab === 'roles' ? styles.activeText : styles.inactiveText}>
              Students w/ Roles
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.eventList}>
          {renderStudents()}
        </ScrollView>
      </View>

      <AdminSidebarMenu
        isVisible={menuVisible}
        onClose={closeMenu}
      />
    </View>
  );
};

export default ManageUsers;
