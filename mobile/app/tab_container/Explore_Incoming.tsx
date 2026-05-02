// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, ActivityIndicator, RefreshControl } from "react-native";
import EventCard from "../components/Card_Event";
import EmptyCard from "../components/Card_Empty";
import Card_BlankHorizontal from "../components/Card_BlankHorizontal";
import appeffects from "../styles/effects_app";
import { BASE_URL } from "../../config";
import { useRouter } from "expo-router"

const Incoming = ({ scrollY, handleScroll, initialScroll = 0 }) => {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getOptimizedUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_500,q_auto,f_auto/');
    }
    return url;
  };

  const fetchAllEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/events/all/upcoming`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.log("Error fetching all events:", err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllEvents();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAllEvents();
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
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={120} />
        }
      >
        <View style={appeffects.pageStarter}>
          <Text style={appeffects.pageTitle}>Incoming Events</Text>
        </View>

        <View style={appeffects.eventList}>
          {isLoading ? (
            <View style={{ flex: 1 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card_BlankHorizontal key={`skeleton-inc-${i}`} />
              ))}
            </View>
          ) : events.length > 0 ? (
            events.map((event) => {
              const date = new Date(event.event_date);
              const dateDay = date.getDate();
              const dateMonth = date.toLocaleString('default', { month: 'short' });
              const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

              const startTime = new Date(event.start_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              const endTime = new Date(event.end_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              const timeVenueStr = `${startTime} - ${endTime} | ${event.venue}`;
              const handleEventPress = () => {
                router.push(`/tab_container/EventDetails_Unified?eventId=${event._id}`);
              };

              return (
                <EventCard
                  key={event._id}
                  onPress={handleEventPress}
                  image={{ uri: getOptimizedUrl(event.event_image) }}
                  title={event.event_name}
                  organization={event.organization_id?.org_name || "Unknown Org"}
                  orgLogo={{ uri: getOptimizedUrl(event.organization_id?.pfp) || "" }}
                  orgDate={dateStr}
                  dateDay={dateDay}
                  dateMonth={dateMonth}
                  description={`${timeVenueStr}\n${event.description}`}
                />
              );
            })
          ) : (
            <EmptyCard
              image={require("../../assets/images/marque/MARQUE_singlelogo.png")}
              text="No Upcoming Events Found"
              button={() => router.push("/tabs/Explore")}
            />
          )}
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default Incoming;