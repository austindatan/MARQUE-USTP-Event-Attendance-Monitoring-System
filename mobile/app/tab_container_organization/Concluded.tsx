// Concluded.tsx
// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, ActivityIndicator } from "react-native";
import axios from "axios";
import { BASE_URL } from "../../config";

import EventCard from "../components/Card_Event";
import appeffects from "../styles/effects_app";

const Concluded = ({ scrollY, handleScroll, initialScroll = 0, organizationId }) => {
  const scrollRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  // Format date helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const month = d.toLocaleString(undefined, { month: "short" });
    const day = d.getDate();
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const formatDay = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return String(d.getDate()).padStart(2, "0");
  };

  const formatMonthShort = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, { month: "short" });
  };

  // Fetch concluded events
  const fetchConcludedEvents = async () => {
    if (!organizationId) {
      setError("No organization ID provided");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/events/organization/${organizationId}/concluded`);
      setEvents(res.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching concluded events:", err);
      setError("Failed to load concluded events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcludedEvents();
  }, [organizationId]);

  // Scroll restoration
  useEffect(() => {
    if (scrollRef.current && initialScroll > 0) {
      const t = setTimeout(() => {
        const node = scrollRef.current?.getNode ? scrollRef.current.getNode() : scrollRef.current;
        if (node && node.scrollTo) node.scrollTo({ y: initialScroll, animated: false });
      }, 0);
      return () => clearTimeout(t);
    }
  }, [initialScroll]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 180 }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 180 }}>
        <Text style={{ color: "red", textAlign: "center", marginHorizontal: 20 }}>{error}</Text>
        <Text style={{ marginTop: 10, color: "blue" }} onPress={fetchConcludedEvents}>
          Retry
        </Text>
      </View>
    );
  }

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
        style={{ flex: 1, backgroundColor: "transparent" }}
        contentContainerStyle={{ backgroundColor: "transparent", paddingTop: 180, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={appeffects.eventList}>
          {events.length > 0 ? (
            events.map((ev) => {
              const evImage = ev.event_images && ev.event_images.length > 0
                ? { uri: ev.event_images[0] }
                : require("../../assets/images/marque/crtcg1.png");
              return (
                <EventCard
                  key={ev._id}
                  image={evImage}
                  title={ev.event_name}
                  organization={ev.organization_id?.org_name || "Organization"}
                  orgLogo={ev.organization_id?.pfp ? { uri: ev.organization_id.pfp } : require("../../assets/images/marque/crk.jpg")}
                  dateDay={formatDay(ev.event_date)}
                  dateMonth={formatMonthShort(ev.event_date)}
                  orgDate={formatDate(ev.event_date)}
                  description={ev.description}
                  onPress={() => console.log("Pressed event", ev._id)}
                />
              );
            })
          ) : (
            <Text style={{ textAlign: "center", color: "gray", marginTop: 20 }}>
              No concluded events for this organization.
            </Text>
          )}
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default Concluded;
