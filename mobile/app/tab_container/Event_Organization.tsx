// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, Animated, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import EventCard from "../components/Card_Event";
import appeffects from "../styles/effects_app";
import EmptyCard from "../components/Card_Empty";
import Card_BlankHorizontal from "../components/Card_BlankHorizontal";
import { BASE_URL } from "../../config";

import AsyncStorage from "@react-native-async-storage/async-storage";

const Organizations = ({ scrollY }) => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const getOptimizedUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_500,q_auto,f_auto/');
    }
    return url;
  };

  const fetchStudentId = async () => {
    try {
      const studentNumber = await AsyncStorage.getItem("student_number");
      if (!studentNumber) return null;

      const res = await fetch(`${BASE_URL}/api/student/id/${studentNumber}`);
      if (!res.ok) return null;

      const data = await res.json();
      setUserId(data._id);
      return data._id;
    } catch (error) {
      console.error("Error fetching student ID:", error);
      return null;
    }
  };

  const fetchFollowedEvents = async (currentUserId) => {
    setIsLoading(true);

    try {
      const orgsRes = await fetch(`${BASE_URL}/api/followed-orgs/${currentUserId}/ids`);
      const followedOrgIds = await orgsRes.json();


      if (!followedOrgIds.length) {
        setEvents([]);
        return;
      }

      const query = followedOrgIds.join(",");

      const eventsRes = await fetch(
        `${BASE_URL}/events/followed?orgs=${query}`
      );

      const eventsData = await eventsRes.json();

      setEvents(eventsData);

    } catch (err) {
      console.error("Error fetching followed events:", err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const loadEvents = async () => {
      const id = await fetchStudentId();
      if (id) {
        fetchFollowedEvents(id);
      } else {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);


  const onRefresh = async () => {
    setRefreshing(true);
    const id = await fetchStudentId();
    if (id) {
      await fetchFollowedEvents(id);
    } else {
      setIsLoading(false);
    }
    setRefreshing(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={[appeffects.eventList, { flex: 1, paddingTop: 10 }]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card_BlankHorizontal key={`skeleton-org-ev-${i}`} />
          ))}
        </View>
      );
    }

    if (events.length === 0) {
      return (
        <EmptyCard
          image={require("../../assets/images/marque/MARQUE_singlelogo.png")}
          text="Looks a little quiet here! Follow your favorite organizations to see their updates."
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

          const startTime = new Date(ev.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const endTime = new Date(ev.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const timeVenueStr = `${startTime} - ${endTime} | ${ev.venue}`;

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
              description={`${timeVenueStr}\n${ev.description}`}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Animated.ScrollView
      style={{ flex: 1, marginTop: -110 }}
      contentContainerStyle={{
        paddingTop: 125,
        paddingBottom: 40
      }}
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
      {renderContent()}
      <View style={{ height: 40 }} />
    </Animated.ScrollView>
  );
};

export default Organizations;