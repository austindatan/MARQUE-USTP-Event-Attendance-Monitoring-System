// @ts-nocheck
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Animated, ActivityIndicator, Image, RefreshControl } from "react-native";
import EventCard from "../components/Card_Event";
import EmptyCard from "../components/Card_Empty";
import Card_BlankHorizontal from "../components/Card_BlankHorizontal";
import appeffects from "../styles/effects_app";
import { BASE_URL } from "../../config";
import { useRouter } from "expo-router"

const Departments = ({ scrollY, studentDept }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const getOptimizedUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_500,q_auto,f_auto/');
    }
    return url;
  };

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

  const onRefresh = async () => {
    setRefreshing(true);
    if (studentDept) {
      await fetchEvents(studentDept);
    }
    setRefreshing(false);
  };

  const renderEvents = () => {
    if (isLoading) {
      return (
        <View style={[appeffects.eventList, { flex: 1, paddingTop: 10 }]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card_BlankHorizontal key={`skeleton-dept-${i}`} />
          ))}
        </View>
      );
    }

    if (events.length === 0) {
      return (
        <EmptyCard
          image={require("../../assets/images/marque/MARQUE_singlelogo.png")}
          text="No upcoming events found for your department."
          button={() => router.push("/tabs/Explore")}
        />
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
              key={ev._id}
              onPress={() => router.push({
                pathname: "/tab_container/EventDetails_Unified",
                params: { eventId: ev._id }
              })}
              image={{ uri: getOptimizedUrl(ev.event_image) }}
              title={ev.event_name}
              organization={ev.organization_id?.org_name || "Unknown Org"}
              orgLogo={{ uri: getOptimizedUrl(ev.organization_id?.pfp) || "" }}
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={120} />
      }
    >
      {/* ⭐️ HIDE THE TEXT IF LOADING IS DONE AND THERE ARE NO EVENTS ⭐️ */}
      {(!isLoading && events.length > 0) && (
        <View style={appeffects.pageStarter}>
          <Text style={appeffects.pageTitle}>Upcoming Events</Text>
          <Text style={appeffects.pageSubtitle}>Filtered by Dept.</Text>
        </View>
      )}

      {renderEvents()}

      <View style={{ height: 40 }} />

    </Animated.ScrollView>
  );
};

export default Departments;