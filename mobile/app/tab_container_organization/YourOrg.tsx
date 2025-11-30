// @ts-nocheck
import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import EventCard from "../components/Card_Teams";
import appeffects from "../styles/effects_app";
import { useRouter } from "expo-router";

const YourOrgs = ({ scrollY, handleScroll, initialScroll = 0 }) => {
  const scrollRef = useRef(null);
  const router = useRouter();

  // Redirect to Activities.jsx instead of Incoming
  const handleCardPress = () => {
    router.push("../tab_container_organization/Activities");
  };

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
        <View style={appeffects.pageStarter}>
          <Text style={appeffects.pageTitle}>Your Organizations</Text>
        </View>

        <View style={appeffects.eventList}>
          <EventCard
            image={require("../../assets/images/marque/crtcg1.png")}
            title="Society of Information Technology Enthusiasts"
            description="Empowering Students, Building Leaders."
            onPress={handleCardPress}
          />
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default YourOrgs;