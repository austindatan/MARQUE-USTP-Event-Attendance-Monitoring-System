// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, ActivityIndicator } from "react-native";
import EventCardSL from "../components/Card_EventSL";
import appeffects from "../styles/effects_app";
import Card_Blank from "../components/Card_Blank";
import { BASE_URL } from "../../config";
import { useRouter } from "expo-router"

const Concluded = ({ scrollY, handleScroll, initialScroll = 0 }) => {
  const router = useRouter ();
  const scrollRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all concluded events 
  const fetchConcludedEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/events/all/concluded`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.log("Error fetching concluded events:", err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConcludedEvents();
  }, []);

  useEffect(() => {
      if (scrollRef.current && typeof initialScroll === "number" && initialScroll > 0) {
        const t = setTimeout(() => {
          const node = scrollRef.current?.getNode ? scrollRef.current.getNode() : scrollRef.current;
          if (node && node.scrollTo) {
            node.scrollTo({ y: initialScroll, animated: false });
          }
        }, 0);
        return () => clearTimeout(t);
      }
    }, [initialScroll]);

  const containerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  const renderConcludedEvents = () => {
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
          <Text style={appeffects.pageSubtitle}>No concluded events found.</Text>
        </View>
      );
    }

    return (
      <>
        {events.map((event) => {
          const date = new Date(event.event_date);
          const dateDay = date.getDate();
          const dateMonth = date.toLocaleString('default', { month: 'short' });

          const handleEventPress = () => {
            // Navigate to EventDetails_Ongoing for concluded events
            router.push(`/tab_container/EventDetails_Concluded?eventId=${event._id}`);
          };

          return (
            <EventCardSL
              key={event._id}
              onPress={handleEventPress}
              image={{ uri: event.event_image || null }}
              title={event.event_name}
              organization={event.organization_id?.org_name || "Unknown Org"}
              orgLogo={{ uri: event.organization_id?.pfp || null }}
              dateDay={dateDay}
              dateMonth={dateMonth}
              description={event.description} 
            />
          );
        })}
      </>
    );
  };

  
  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: "transparent",
        transform: [{ translateY: containerTranslateY }],
      }}
    >
      <Animated.ScrollView
        ref={scrollRef}
        style={{
          flex: 1,
          marginTop: -120,
          backgroundColor: "transparent",
        }}
        contentContainerStyle={{
          backgroundColor: "transparent",
          paddingTop: 125,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={appeffects.pageStarter}>
          <Text style={appeffects.pageTitle}>Concluded Events</Text>
        </View>

        <View style={appeffects.eventListEX}>
          {renderConcludedEvents()}
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default Concluded;