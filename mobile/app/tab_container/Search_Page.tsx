// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal, // 🔑 ADDED: Import Modal
  Switch, // 🔑 ADDED: Import Switch for the toggle
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Header_Search from "../components/Header_Search";
import EventCard from "../components/Card_Event"; 
import styles from "../styles/component_search_page"; 
import { BASE_URL } from "../../config"; 

// ===============================================
// 🔑 FILTER MODAL COMPONENT (Full Screen)
// ===============================================
const FilterModal = ({ isVisible, onClose, onApply, onClear }) => {
    // Placeholder states for filter options
    const [isUpcomingOnly, setIsUpcomingOnly] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState([]);
    // In a real app, you would fetch and manage organization selections here

    const toggleType = (type) => {
        setSelectedTypes(prev => 
            prev.includes(type) 
                ? prev.filter(t => t !== type) 
                : [...prev, type]
        );
    };

    const filterTypes = ["Academic", "Sports", "Cultural", "Social"];

    // Basic style for selected/unselected filter tags
    const getTagStyle = (type) => ({
        padding: 10,
        borderWidth: 1,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        backgroundColor: selectedTypes.includes(type) ? '#222762' : 'transparent',
        borderColor: selectedTypes.includes(type) ? '#222762' : '#ccc',
    });
    const getTagTextStyle = (type) => ({
        color: selectedTypes.includes(type) ? 'white' : 'black',
        fontWeight: '500',
    });

    return (
        <Modal
            animationType="slide"
            transparent={false} // Ensures full screen coverage
            visible={isVisible}
            onRequestClose={onClose}
        >
            {/* Full Screen Container: flex: 1 */}
            <View style={{ flex: 1, backgroundColor: 'white' }}> 
                
                {/* Header (Title and Close Button) */}
                <View style={{ 
                    paddingHorizontal: 20, 
                    paddingTop: 40, // Adjust for status bar/safe area
                    paddingBottom: 15,
                    flexDirection: 'row', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee'
                }}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Filter Events</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="close" size={30} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Scrollable Filter Options */}
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    
                    {/* Status Filter (Upcoming Only Toggle) */}
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>Status</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
                         <Text style={{ fontSize: 16 }}>Upcoming Only</Text>
                         <Switch
                            trackColor={{ false: "#767577", true: "#222762" }}
                            thumbColor={isUpcomingOnly ? "#f4f3f4" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={setIsUpcomingOnly}
                            value={isUpcomingOnly}
                        />
                    </View>
                    
                    {/* Type Filters */}
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>Types</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 25 }}>
                        {filterTypes.map(type => (
                            <TouchableOpacity 
                                key={type} 
                                style={getTagStyle(type)}
                                onPress={() => toggleType(type)}
                            >
                                <Text style={getTagTextStyle(type)}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Organization Filters (Placeholder) */}
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>Organizations</Text>
                    <Text style={{ fontSize: 16, marginBottom: 10 }}>USTP JMCF</Text>
                    <Text style={{ fontSize: 16, marginBottom: 10 }}>Al-Balad MSU</Text>

                </ScrollView>
                
                {/* Action Buttons (Fixed at Bottom) */}
                <View style={{ 
                    padding: 20, 
                    borderTopWidth: 1, 
                    borderTopColor: '#eee', 
                    flexDirection: 'row', 
                    justifyContent: 'space-between' 
                }}>
                    <TouchableOpacity 
                        onPress={onClear} 
                        style={{ padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, flex: 1, marginRight: 10, alignItems: 'center' }}
                    >
                        <Text style={{ color: 'black', fontWeight: 'bold' }}>Clear All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={onApply} 
                        style={{ padding: 10, backgroundColor: '#222762', borderRadius: 8, flex: 1.5, marginLeft: 10, alignItems: 'center' }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


// ===============================================
// SEARCH PAGE MAIN COMPONENT
// ===============================================

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [fetchedEvents, setFetchedEvents] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); 
  const [isFilterVisible, setIsFilterVisible] = useState(false); // 🔑 ADDED: Filter modal state

  const fetchEvents = useCallback(async (searchQuery) => {
    setIsLoading(true);
    let url;

    if (searchQuery.trim()) {
      url = `${BASE_URL}/api/search?query=${encodeURIComponent(searchQuery)}`; 
    } else {
      url = `${BASE_URL}/api/ongoing`;
    }

    try {
      console.log(`Fetching events from: ${url}`);
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setFetchedEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setFetchedEvents([]); 
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, []); 

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEvents(query);
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [query, fetchEvents]); 

  // 🔑 ADDED: Filter handling functions
  const handleApplyFilters = () => {
      // Future Logic: This is where you would process selected filters 
      // and re-run fetchEvents(query, filters)
      setIsFilterVisible(false);
  };
  
  const handleClearFilters = () => {
      // Future Logic: This is where you would reset all filter states 
      // (in the FilterModal component or its parent)
      setIsFilterVisible(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#222762" />
          <Text style={styles.loadingText}>
            {query.trim() ? "Searching..." : "Loading Events..."}
          </Text>
        </View>
      );
    }

   
    if (fetchedEvents.length > 0) {
      return fetchedEvents.map((event) => {
        const date = new Date(event.event_date);
        const dateDay = date.getDate();
        const dateMonth = date.toLocaleString('default', { month: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        return (
          <EventCard
            key={event._id}
            image={{ uri: event.event_image }}
            title={event.event_name}
            organization={event.organization_id?.org_name || "Unknown Org"}
            orgLogo={{ uri: event.organization_id?.pfp || "" }}
            orgDate={dateStr}
            description={event.description}
            dateDay={dateDay}
            dateMonth={dateMonth}
            onPress={() => router.push(`/events/${event._id}`)}
          />
        );
      });
    }

    if (!isInitialLoad && query.trim() && fetchedEvents.length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.noResultsText}>No events found</Text>
          <Text style={styles.noResultsSubtext}>Try different keywords</Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      
      <Header_Search
        query={query}
        setQuery={setQuery}
        onBack={() => router.back()}
        onFilterPress={() => setIsFilterVisible(true)} // 🔑 ADDED: Open the filter modal
      />

      <View style={styles.headerContentWrapper}>
        
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButtonTitleContainer}
        >
          <Ionicons name="chevron-back" size={24} color="#000" style={styles.backButtonIcon} /> 
          <Text style={styles.backButtonTitleText}>
            {query.trim() ? `Results for "${query}"` : "Ongoing Events"}
          </Text>
        </TouchableOpacity>
        
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* 🔑 ADDED: The Full-Screen Filter Modal Component */}
      <FilterModal 
          isVisible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
      />
    </View>
  );
}