// @ts-nocheck
import React, { useEffect, useRef } from "react";
import { View, Animated, TouchableOpacity } from "react-native";
import OrgCard from "../components/Card_Organization.tsx";
import EventCard from "../components/Card_Event";
import appeffects from "../styles/effects_app";
import { useRouter } from "expo-router";

const Incoming = ({ scrollY, handleScroll, initialScroll = 0 }) => {
  const scrollRef = useRef(null);
  const router = useRouter();

  const containerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  useEffect(() => {
    if (scrollRef.current && initialScroll > 0) {
      const t = setTimeout(() => {
        const node = scrollRef.current?.getNode
          ? scrollRef.current.getNode()
          : scrollRef.current;

        if (node && node.scrollTo) {
          node.scrollTo({ y: initialScroll, animated: false });
        }
      }, 0);
      return () => clearTimeout(t);
    }
  }, [initialScroll]);

  // Hardcoded OrgCard data
  const orgData = {
    title: "Society of Information Technology Enthusiasts",
    description:
      "SITE empowers future IT professionals through innovation, leadership, and collaboration.",
    orgLogo: require("../../assets/images/marque/crk.jpg"),
    image: require("../../assets/images/marque/crtcg1.png"),
  };

  // Navigate to Organization Profile.tsx
  const handleOrgPress = () => {
    router.push("../tab_container_organization/Profile");
  };

  // Navigate to Event Profile.tsx
  const handleEventPress = () => {
    router.push("../tab_container_organization/Events");
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
        style={{ flex: 1, backgroundColor: "transparent" }}
        contentContainerStyle={{
          backgroundColor: "transparent",
          paddingTop: 5,
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={appeffects.eventList}>

          {/* ORG CARD */}
          <OrgCard
            image={orgData.image}
            title={orgData.title}
            organization="Society of Information Tech..."
            orgLogo={orgData.orgLogo}
            dateDay="25"
            type="Organizers"
            dateMonth="Nov"
            orgDate="November 25, 2025"
            description={orgData.description}
            onPress={handleOrgPress}
          />

          {/* EVENT CARD WITH NEW ROUTE */}
          <EventCard
            image={orgData.image}
            title={orgData.title}
            organization="Society of Information Technology..."
            orgLogo={orgData.orgLogo}
            dateDay="25"
            dateMonth="Nov"
            orgDate="November 25, 2025"
            description="Empowering Students, Building Leaders."
            onPress={handleEventPress}
          />

        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default Incoming;