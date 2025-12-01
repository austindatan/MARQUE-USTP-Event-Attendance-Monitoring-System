// Incoming.tsx — only the relevant changed/added parts shown
// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { View, Animated, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { BASE_URL } from "../../config";

import OrgCard from "../components/Card_Organization.tsx";
import EventCard from "../components/Card_Event";
import appeffects from "../styles/effects_app";

const Incoming = ({ scrollY = new Animated.Value(0), handleScroll, initialScroll = 0, organizationId }) => {
  const scrollRef = useRef(null);
  const router = useRouter();
  const { orgId } = useLocalSearchParams();

  const [organizationData, setOrganizationData] = useState(null);
  const [events, setEvents] = useState([]); // <-- new state for events
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  // helper: format date into readable strings
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    // Example: Nov 25, 2025
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
    return d.toLocaleString(undefined, { month: "short" }); // "Nov"
  };

  // fetch organization details
  const fetchOrganizationData = async () => {
    if (!orgId) {
      setError("No organization ID found in route parameters.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/organizations/${orgId}`);
      setOrganizationData(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching organization data:", err);
      setError("Failed to load organization details. Check network and API route.");
    } finally {
      setLoading(false);
    }
  };

  // NEW: fetch events for this organization
  const fetchOrganizationEvents = async () => {
    if (!orgId) return;
    try {
      // GET /api/events/organization/:orgId/upcoming
      const res = await axios.get(`${BASE_URL}/events/organization/${orgId}/upcoming`);
      // res.data should be an array of events
      setEvents(res.data || []);
    } catch (err) {
      console.error("Error fetching organization events:", err);
      // If you want to show a specific error only for events, consider separate state.
    }
  };

  // Load both org data and events
  useEffect(() => {
    if (!orgId) return;
    fetchOrganizationData();
    fetchOrganizationEvents();
  }, [orgId]);

  // scroll restoration remains the same...
  useEffect(() => {
    if (scrollRef.current && initialScroll > 0) {
      const t = setTimeout(() => {
        const node = scrollRef.current?.getNode ? scrollRef.current.getNode() : scrollRef.current;
        if (node && node.scrollTo) node.scrollTo({ y: initialScroll, animated: false });
      }, 0);
      return () => clearTimeout(t);
    }
  }, [initialScroll]);

  const handleOrgPress = () => {
    router.push("../tab_container_organization/Profile");
  };

  const handleEventPress = (eventId) => {
    // navigate to a specific event page - update as per your route
    router.push({ pathname: "../tab_container_organization/Events", params: { eventId } });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 180 }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || !organizationData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 180 }}>
        <Text style={{ color: "red", textAlign: "center", marginHorizontal: 20 }}>
          {error || "Organization data could not be loaded."}
        </Text>
        <TouchableOpacity onPress={() => { fetchOrganizationData(); fetchOrganizationEvents(); }}>
          <Text style={{ marginTop: 10, color: "blue" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // derive image sources with fallbacks
  const org = organizationData;
  const orgImageSource = org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/crtcg1.png");
  const orgLogoSource = org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/crk.jpg");

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
        contentContainerStyle={{
          backgroundColor: "transparent",
          paddingTop: 180,
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={appeffects.eventList}>
          {/* ORG CARD */}
          <OrgCard
            image={orgImageSource}
            title={org.org_name}
            organization={org.org_name}
            orgLogo={orgLogoSource}
            dateDay={formatDay(org.createdAt || new Date())}
            type="Organizers"
            dateMonth={formatMonthShort(org.createdAt || new Date())}
            orgDate={formatDate(org.createdAt || new Date())}
            description={org.description}
            onPress={handleOrgPress}
          />

          {/* EVENT LIST: display all incoming/upcoming events for this organization */}
          {events.length > 0 ? (
            events.map((ev) => {
              // pick the first image from event_images or use fallback
              const evImage = (ev.event_images && ev.event_images.length > 0)
                ? { uri: ev.event_images[0] }
                : require("../../assets/images/marque/crtcg1.png");

              return (
                <EventCard
                  key={ev._id}
                  image={evImage}
                  title={ev.event_name}
                  organization={org.org_name}
                  orgLogo={orgLogoSource}
                  dateDay={formatDay(ev.event_date)}
                  dateMonth={formatMonthShort(ev.event_date)}
                  orgDate={formatDate(ev.event_date)}
                  description={ev.description}
                  onPress={() => handleEventPress(ev._id)}
                />
              );
            })
          ) : (
            <Text style={{ textAlign: "center", color: "gray", marginTop: 20 }}>
              No upcoming events for this organization.
            </Text>
          )}
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default Incoming;
