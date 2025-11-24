// @ts-nocheck
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, Animated, ActivityIndicator, Alert } from "react-native";
import OrgLinear from "../components/Card_OrgsLinear";
import appeffects from "../styles/effects_app";
import { BASE_URL } from "../../config";

// temporary for testing — replace later with actual logged in student ID
const MOCK_STUDENT_ID = "692402df4600376c2cea56eb";

const Orgs = ({ scrollY, handleScroll, initialScroll = 0 }) => {
  const scrollRef = useRef(null);
  const [organizations, setOrganizations] = useState([]);
  const [followedOrgIds, setFollowedOrgIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch all orgs
  const fetchOrganizations = async () => {
    try {
      const res = await fetch(`${BASE_URL}/exploreorgs/all`);
      const data = await res.json();
      setOrganizations(data);
    } catch (err) {
      console.log("Error fetching organizations:", err);
      setOrganizations([]);
    }
  };

  // 2. Fetch followed org IDs
  const fetchFollowedIds = async () => {
    if (!MOCK_STUDENT_ID) return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/followed-orgs/${MOCK_STUDENT_ID}/ids`
      );
      const data = await res.json();
      setFollowedOrgIds(data);
    } catch (err) {
      console.log("Error fetching followed IDs:", err);
      setFollowedOrgIds([]);
    }
  };

  // Combine fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchOrganizations(), fetchFollowedIds()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Follow / Unfollow
  const handleFollowToggle = async (orgId, isCurrentlyFollowed) => {
    if (!MOCK_STUDENT_ID) {
      Alert.alert("Authentication Required", "Please log in to follow organizations.");
      return;
    }

    const action = isCurrentlyFollowed ? "unfollow" : "follow";

    try {
      const res = await fetch(`${BASE_URL}/api/followed-orgs/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: MOCK_STUDENT_ID,
          organizationId: orgId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${action} organization`);
      }

      // Update UI instantly
      if (isCurrentlyFollowed) {
        setFollowedOrgIds((prev) => prev.filter((id) => id !== orgId));
      } else {
        setFollowedOrgIds((prev) => [...prev, orgId]);
      }
    } catch (error) {
      console.error("Follow/Unfollow error:", error);
      Alert.alert("Error", error.message);
    }
  };

  // Scroll initial
  useEffect(() => {
    if (scrollRef.current && initialScroll > 0) {
      const t = setTimeout(() => {
        const node = scrollRef.current?.getNode ? scrollRef.current.getNode() : scrollRef.current;
        node?.scrollTo?.({ y: initialScroll, animated: false });
      }, 0);

      return () => clearTimeout(t);
    }
  }, [initialScroll]);

  const containerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  const renderOrganizations = () => {
    if (isLoading) {
      return (
        <View style={{ flex: 1, paddingTop: 50 }}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      );
    }

    if (organizations.length === 0) {
      return (
        <View style={{ flex: 1, paddingTop: 50, alignItems: "center" }}>
          <Text style={appeffects.pageSubtitle}>No organizations found.</Text>
        </View>
      );
    }

    return organizations.map((org) => {
      const isFollowed = followedOrgIds.includes(org._id);

      return (
        <OrgLinear
          key={org._id}
          organization={org.org_name}
          orgLogo={{ uri: org.pfp }}
          text={org.description}
          isFollowed={isFollowed}
          onToggleFollow={() => handleFollowToggle(org._id, isFollowed)}
        />
      );
    });
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
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={appeffects.pageStarter}>
          <Text style={appeffects.pageTitle}>All Organizations</Text>
        </View>

        <View style={appeffects.eventListORG}>{renderOrganizations()}</View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default Orgs;
