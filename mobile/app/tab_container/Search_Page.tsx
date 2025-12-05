// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; 
import { Ionicons } from "@expo/vector-icons";

import Header_Search from "../components/Header_Search";
import EventCard from "../components/Card_Event"; 
import styles from "../styles/component_search_page"; 
import { BASE_URL } from "../../config"; 

export default function SearchPage() {
  const router = useRouter();

  const params = useLocalSearchParams(); 

  const [query, setQuery] = useState("");
  const [fetchedEvents, setFetchedEvents] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); 
  const [activeFilterIds, setActiveFilterIds] = useState([]);
  
  useEffect(() => {
    if (params.filterIds) {
      try {
        const parsedIds = JSON.parse(params.filterIds);
        setActiveFilterIds(parsedIds);
      } catch (e) {
        console.error("Failed to parse filter IDs", e);
      }
    }
  }, [params.filterIds]);

  const fetchEvents = useCallback(async (searchQuery, filterIds) => { 
    setIsLoading(true);
    let url;
    const isFilterActive = filterIds && filterIds.length > 0;

    if (isFilterActive) {
        const query = filterIds.join(",");
        url = `${BASE_URL}/events/filter?orgs=${query}`; 
        console.log(`Fetching FILTERED events: ${url}`);
    } else if (searchQuery.trim()) {
      url = `${BASE_URL}/api/search?query=${encodeURIComponent(searchQuery)}`; 
    } else {
      url = `${BASE_URL}/api/ongoing`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
      fetchEvents(query, activeFilterIds); 
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeFilterIds, fetchEvents]);

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

    if (!isInitialLoad && (query.trim() || activeFilterIds.length > 0) && fetchedEvents.length === 0) {
      return (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.noResultsText}>No events found</Text>
          <Text style={styles.noResultsSubtext}>Try changing filters or keywords</Text>
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
        onFilterPress={() => router.push("../tab_container/Filter_Page")} 
      />

      <View style={styles.headerContentWrapper}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButtonTitleContainer}
        >
          <Ionicons name="chevron-back" size={24} color="#000" style={styles.backButtonIcon} /> 
          <Text style={styles.backButtonTitleText}>
            {activeFilterIds.length > 0 
                ? `Filtered by ${activeFilterIds.length} organizations`
                : query.trim() ? `Results for "${query}"` : "Ongoing Events"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}