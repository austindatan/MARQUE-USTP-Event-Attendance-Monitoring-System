// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { BASE_URL } from "../../config";
import EventCard from "../components/Card_Event";
import appeffects from "../styles/effects_app";

const Concluded = ({ scrollY, handleScroll, initialScroll = 0, organizationId }) => {
  const scrollRef = useRef(null);
  const router = useRouter();

  const [organizationData, setOrganizationData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  
  const fetchAllData = async () => {
    if (!organizationId) {
      setError("No organization ID provided");
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const [orgRes, eventsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/organizations/${organizationId}`),
        axios.get(`${BASE_URL}/events/organization/${organizationId}/concluded`),
      ]);

      setOrganizationData(orgRes.data);
      setEvents(eventsRes.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load organization or concluded events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [organizationId]);
  
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
        <TouchableOpacity onPress={fetchAllData}>
          <Text style={{ marginTop: 10, color: "blue" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const orgLogoSource = organizationData.pfp
    ? { uri: organizationData.pfp }
    : require("../../assets/images/marque/crk.jpg");

  const handleEventPress = (eventId: string) => {
    router.push({
      pathname: "../tab_container_organization/Events",
      params: { eventId },
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "transparent",
      }}
    >
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: "transparent" }}
        contentContainerStyle={{ backgroundColor: "transparent", paddingTop: 170 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={appeffects.eventList}>
          {events.length > 0 ? (
            events.map((ev) => {
              const evImage = ev.event_image
                ? { uri: ev.event_image }
                : require("../../assets/images/marque/crk.jpg");
                
              return (
                <EventCard
                  key={ev._id}
                  image={evImage}
                  title={ev.event_name}
                  organization={organizationData.org_name}
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
              No concluded events for this organization.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Concluded;
