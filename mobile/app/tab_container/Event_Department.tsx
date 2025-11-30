// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Animated, ActivityIndicator } from "react-native";
import EventCard from "../components/Card_Event";
import appeffects from "../styles/effects_app";
import { BASE_URL } from "../../config";
import { useRouter } from "expo-router"

const Departments = ({ scrollY, studentDept }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter ();

  const fetchEvents = useCallback(async (studentDept) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/events/${studentDept}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.log("Error fetching events:", err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (studentDept) {
      fetchEvents(studentDept); 
    }
  }, [studentDept, fetchEvents]);

  // --- Rendering Logic ---
  
  const renderEvents = () => {
    if (isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 50 }}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      );
    }
    
    if (events.length === 0) {
      return (
        <View style={{ flex: 1, paddingTop: 50, alignItems: 'center' }}>
          <Text style={appeffects.pageSubtitle}>No upcoming events found for your department.</Text>
        </View>
      );
    }

    return (
      <View style={appeffects.eventList}>
        {events.map((ev) => {
          const date = new Date(ev.event_date);
          const dateDay = date.getDate();
          const dateMonth = date.toLocaleString('default', { month: 'short' });
          const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          
          return (
            <EventCard
              onPress={() => {router.push("/tab_container/EventDetails_Concluded");}}
              key={ev._id}
              image={{ uri: ev.event_image }}
              title={ev.event_name}
              organization={ev.organization_id?.org_name || "Unknown Org"}
              orgLogo={{ uri: ev.organization_id?.pfp || "" }}
              dateDay={dateDay}
              dateMonth={dateMonth}
              orgDate={dateStr}
              description={ev.description}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Animated.ScrollView
      style={{ flex: 1, marginTop: -120 }}
      contentContainerStyle={{ paddingTop: 125, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    >
      <View style={appeffects.pageStarter}>
        <Text style={appeffects.pageTitle}>Upcoming Events</Text>
        <Text style={appeffects.pageSubtitle}>Filtered by Dept.</Text>
      </View>
      
      {renderEvents()}

      <View style={{ height: 40 }} />

    </Animated.ScrollView>
  );
};

export default Departments;