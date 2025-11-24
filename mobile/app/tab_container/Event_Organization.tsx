// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, Animated, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import EventCard from "../components/Card_Event";
import appeffects from "../styles/effects_app";
import EmptyCard from "../components/Card_Empty";
import { BASE_URL } from "../../config";

// ⚠️ Replace this with the actual way you get the logged-in student's ID 
const MOCK_STUDENT_ID = '692402df4600376c2cea56eb'; // temporary for testing

const Organizations = ({ scrollY }) => {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFollowedEvents = async () => {
    setIsLoading(true);

    try {
      // 1. Get followed org IDs
      const orgsRes = await fetch(`${BASE_URL}/api/followed-orgs/${MOCK_STUDENT_ID}/ids`);
      const followedOrgIds = await orgsRes.json();

      console.log("Followed org IDs:", followedOrgIds);

      if (!followedOrgIds.length) {
        setEvents([]);
        return;
      }

      const query = followedOrgIds.join(",");

      // 2. Get events for those orgs
      const eventsRes = await fetch(
        `${BASE_URL}/events/followed?orgs=${query}`
      );

      const eventsData = await eventsRes.json();
      console.log("Fetched events:", eventsData);

      setEvents(eventsData);

    } catch (err) {
      console.error("Error fetching followed events:", err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    // Only fetch if the student ID is available
    if (MOCK_STUDENT_ID) { 
      fetchFollowedEvents();
    } else {
        setIsLoading(false);
    }
  }, [MOCK_STUDENT_ID]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 50 }}>
          <ActivityIndicator size="large" color="#FFD700" />
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
    
    // Logic to render EventCard 
    return (
      <View style={appeffects.eventList}>
        {events.map((ev) => {
          // Date formatting logic
          const date = new Date(ev.event_date);
          const dateDay = date.getDate();
          const dateMonth = date.toLocaleString('default', { month: 'short' });
          const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          
          // Time formatting logic
          const startTime = new Date(ev.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const endTime = new Date(ev.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const timeVenueStr = `⏰ ${startTime} - ${endTime} | 📍 ${ev.venue}`;
            
          return (
            <EventCard
              key={ev._id}
              image={{ uri: ev.event_image }}
              title={ev.event_name}
              organization={ev.organization_id?.org_name || "Unknown Org"}
              orgLogo={{ uri: ev.organization_id?.pfp || "" }}
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
      style={{ flex: 1, marginTop: -120 }}
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
    >
        {renderContent()}
    </Animated.ScrollView>
  );
};

export default Organizations;