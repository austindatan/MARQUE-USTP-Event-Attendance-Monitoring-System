//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import styles from "../styles/page_admin_dashboard";
import Header from '../components/Header_Admin';
import AdminSidebarMenu from '../components/SidebarMenu_Admin';
import EventCard from '../components/Card_EventHorizontal';
import { BASE_URL } from "../../config";

const ManageEvents = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('incoming');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const openMenu = () => {
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };

  const handleEventPress = (id) => {
    console.log(`Event ${id} pressed. Admin will navigate to edit screen.`);
  };

  const fetchEvents = async (status) => {
    setLoading(true);
    setError(null);
    let endpoint = '';

    if (status === 'upcoming') {
      endpoint = `${BASE_URL}/events/all/upcoming`;
    } else if (status === 'concluded') {
      endpoint = `${BASE_URL}/events/all/concluded`;
    }

    try {
      const response = await axios.get(endpoint);
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Check API connection.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'incoming' || activeTab === 'concluded') {
      const statusToFetch = activeTab === 'incoming' ? 'upcoming' : activeTab;
      fetchEvents(statusToFetch);
    }
  }, [activeTab]);

  const renderEvents = () => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filteredBySearch = events.filter(event =>
      event.event_name.toLowerCase().includes(lowerCaseSearchTerm) ||
      event.description.toLowerCase().includes(lowerCaseSearchTerm) ||
      (event.organization_id?.org_name && event.organization_id.org_name.toLowerCase().includes(lowerCaseSearchTerm))
    );

    if (loading) {
      return <ActivityIndicator size="large" color="#0A0F51" style={{ marginTop: 20 }} />;
    }

    if (error) {
      return <Text style={styles.errorText}>Error: {error}</Text>;
    }

    if (filteredBySearch.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No {activeTab} events found.
          </Text>
          <Text style={styles.emptyStateSubText}>
            Try adjusting your search or checking another category.
          </Text>
        </View>
      );
    }

    return filteredBySearch.map((event) => (
      <EventCard
        key={event._id}
        title={event.event_name}
        organization={event.organization_id?.org_name || "Unknown Org"}
        orgLogo={{ uri: event.organization_id?.pfp || "https://via.placeholder.com/40" }}
        description={event.description}
        dateDay={new Date(event.event_date).getDate().toString().padStart(2, '0')}
        dateMonth={new Date(event.event_date).toLocaleString('default', { month: 'short' }).toUpperCase()}
        orgDate={`${new Date(event.event_date).getFullYear()}`}
        image={{ uri: event.event_image || "https://via.placeholder.com/100" }}
        onPress={() => handleEventPress(event._id)}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <Header onMenuPress={openMenu} />

      <View style={styles.content}>
        <View style={[styles.searchContainer, {zIndex: 1000}]}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events"
            placeholderTextColor="#888"
            numberOfLines={1}
            ellipsizeMode="tail"
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.categoryButtonContainer}>
          <TouchableOpacity
            style={activeTab === 'incoming' ? styles.activeButtonEX : styles.inactiveButtonEX}
            onPress={() => setActiveTab('incoming')}
          >
            <Text
              style={activeTab === 'incoming' ? styles.activeText : styles.inactiveText}
            >
              Incoming
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={activeTab === 'concluded' ? styles.activeButtonEX : styles.inactiveButtonEX}
            onPress={() => setActiveTab('concluded')}
          >
            <Text
              style={activeTab === 'concluded' ? styles.activeText : styles.inactiveText}
            >
              Concluded
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.eventList}>
          {renderEvents()}
        </ScrollView>
      </View>

      <AdminSidebarMenu
        isVisible={menuVisible}
        onClose={closeMenu}
      />
    </View>
  );
};

export default ManageEvents;
