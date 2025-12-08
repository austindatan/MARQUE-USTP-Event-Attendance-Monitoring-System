// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from "../styles/page_admin_dashboard";
import Header from '../components/Header_Admin';
import AdminSidebarMenu from '../components/SidebarMenu_Admin';
import OrgLinear from '../components/Card_OrgsAdmin';
import { BASE_URL } from "../../config";

const PLACEHOLDER_LOGO_URL = "https://via.placeholder.com/100?text=No+Logo";

const ManageOrganizations = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleAddOrganization = () => {
    console.log("Navigating to Add Organization form.");
  };

  const handleEditPress = (orgId) => {
    console.log(`Editing Organization ID: ${orgId}`);
  };

  // 🔥 Fetch Organizations
  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/exploreorgs/all`);
      const data = await res.json();

      // Sanitize images (make sure pfp is always a string)
      const cleaned = data.map(org => ({
        ...org,
        safePfp:
          typeof org.pfp === "string" && org.pfp.trim() !== ""
            ? org.pfp
            : PLACEHOLDER_LOGO_URL
      }));

      setOrganizations(cleaned);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError("Failed to load organizations.");
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // 🔎 Filtering Logic
  const renderOrganizations = () => {
    if (isLoading) {
      return (
        <View style={{ paddingTop: 50 }}>
          <ActivityIndicator size="large" color="#0A0F51" />
        </View>
      );
    }

    if (error) {
      return <Text style={styles.errorText}>Error: {error}</Text>;
    }

    const filtered = organizations.filter(org =>
      org.org_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No organizations found matching "{searchTerm}".
          </Text>
        </View>
      );
    }

    return filtered.map((org) => (
      <OrgLinear
        key={org._id}
        organization={org.org_name}
        orgLogo={org.safePfp}   // ✔ FIXED: pass a STRING, NOT {uri: ...}
        text={org.description}
        onEditPress={() => handleEditPress(org._id)}
        onPress={() => console.log(`Viewing details for ${org.org_name}`)}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <Header onMenuPress={openMenu} />

      <View style={styles.content}>
        <View style={[styles.searchAndAddRow, { zIndex: 1}]}>

          <View style={styles.searchContainerRow}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search organizations..."
              placeholderTextColor="#888"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <TouchableOpacity style={styles.addButtonOrg} onPress={handleAddOrganization}>
            <Ionicons name="add" size={24} color="#0A0F51" />
          </TouchableOpacity>

        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.eventList}>
          {renderOrganizations()}
        </ScrollView>
      </View>

      <AdminSidebarMenu isVisible={menuVisible} onClose={closeMenu} />
    </View>
  );
};

export default ManageOrganizations;
