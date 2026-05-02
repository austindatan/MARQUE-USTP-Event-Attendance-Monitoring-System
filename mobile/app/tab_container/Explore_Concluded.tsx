// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, ActivityIndicator, RefreshControl } from "react-native";
import EventCardSL from "../components/Card_EventSL";
import appeffects from "../styles/effects_app";
import Card_Blank from "../components/Card_Blank";
import EmptyCard from "../components/Card_Empty";
import { BASE_URL } from "../../config";
import { useRouter } from "expo-router"

const Concluded = ({ scrollY, handleScroll, initialScroll = 0 }) => {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Helper to request low-resolution thumbnails from Cloudinary
  const getOptimizedUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_300,h_300,c_fill,q_auto,f_auto/');
    }
    return url;
  };

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

  const onRefresh = async () => {
    setRefreshing(true);
    setVisibleCount(12);
    await fetchConcludedEvents();
    setRefreshing(false);
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

  const handleMomentumScrollEnd = (e) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const paddingToBottom = 300; 
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      if (visibleCount < events.length && !isLoadingMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((prev) => prev + 12);
          setIsLoadingMore(false);
        }, 300);
      }
    }
  };

  const renderConcludedEvents = () => {
    if (isLoading) {
      return (
        <>
          {Array.from({ length: 15 }).map((_, index) => (
            <Card_Blank key={`skeleton-${index}`} />
          ))}
        </>
      );
    }

    if (events.length === 0) {
      return (
        <EmptyCard
          image={require("../../assets/images/marque/MARQUE_singlelogo.png")}
          text="No Concluded Events Found"
          button={() => router.push("/tabs/Explore")}
        />
      );
    }

    const visibleEvents = events.slice(0, visibleCount);

    return (
      <>
        {visibleEvents.map((event) => {
          const date = new Date(event.event_date);
          const dateDay = date.getDate();
          const dateMonth = date.toLocaleString('default', { month: 'short' });

          const handleEventPress = () => {
            router.push(`/tab_container/EventDetails_Unified?eventId=${event._id}`);
          };

          return (
            <EventCardSL
              key={event._id}
              onPress={handleEventPress}
              image={{ uri: getOptimizedUrl(event.event_image) || null }}
              title={event.event_name}
              organization={event.organization_id?.org_name || "Unknown Org"}
              orgLogo={{ uri: getOptimizedUrl(event.organization_id?.pfp) || null }}
              dateDay={dateDay}
              dateMonth={dateMonth}
              description={event.description}
            />
          );
        })}
        {/* Add blank cards if not divisible by 3 */}
        {visibleEvents.length % 3 !== 0 && (
          Array.from({ length: 3 - (visibleEvents.length % 3) }).map((_, index) => (
            <Card_Blank key={`blank-${index}`} />
          ))
        )}
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
        onMomentumScrollEnd={handleMomentumScrollEnd}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={120} />
        }
      >
        <View style={appeffects.pageStarter}>
          <Text style={appeffects.pageTitle}>Concluded Events</Text>
        </View>

        <View style={appeffects.eventListEX}>
          {renderConcludedEvents()}
        </View>

        {isLoadingMore && (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator size="small" color="#FFD700" />
          </View>
        )}

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default Concluded;