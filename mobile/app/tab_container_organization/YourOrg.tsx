// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, ActivityIndicator, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import EventCard from "../components/Card_Teams"; 
import appeffects from "../styles/effects_app";
import { useFocusEffect, useRouter } from "expo-router";
import axios from "axios";
import { BASE_URL } from "../../config"; 
import { useCallback } from "react";

interface Organization {
  _id: string;
  org_name: string;
  description: string;
  pfp: string; 
}

const YourOrgs = ({ scrollY, handleScroll, initialScroll = 0 }) => {
  const scrollRef = useRef(null);
  const router = useRouter();
  const internalScrollY = useRef(scrollY instanceof Animated.Value ? scrollY : new Animated.Value(0)).current;

  const [joinedOrgs, setJoinedOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJoinedOrganizations = async () => {
    setLoading(true);
    try {
      const storedStudentNumber = await AsyncStorage.getItem("student_number");
      if (!storedStudentNumber) {
        setError("User not logged in or student number not found.");
        setLoading(false);
        return;
      }
      const studentRes = await axios.get(`${BASE_URL}/api/student/id/${storedStudentNumber}`)
      const studentId = studentRes.data._id; 
      if (!studentId) {
          setError("Could not find student profile data.");
          setLoading(false);
          return;
      }

      const orgsRes = await axios.get(`${BASE_URL}/api/memberships/student/${studentId}`);
      
      setJoinedOrgs(orgsRes.data);
      setError(null);

    } catch (err) {
      console.error("Error fetching joined organizations:", err);
      if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
         setError("Connection Error: API route not found. Please check your BASE_URL and server route configuration.");
      } else {
         setError("Failed to load your organizations.");
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJoinedOrganizations();
    }, [])
  );

  const handleCardPress = (orgId: string) => {
    router.push({
      pathname: "../tab_container_organization/Activities", 
      params: { 
        orgId: orgId 
      },
    });
  };

  const containerTranslateY = internalScrollY.interpolate({ 
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
  }

  if (error) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'red' }}>{error}</Text>
            <TouchableOpacity onPress={fetchJoinedOrganizations}>
                <Text style={{ marginTop: 10, color: 'blue' }}>Retry</Text>
            </TouchableOpacity>
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
        contentContainerStyle={{
          backgroundColor: "transparent",
          paddingTop: 5,
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={appeffects.pageStarterORG}>
        </View>

        <View style={appeffects.eventList}>
          {joinedOrgs.length > 0 ? (
            joinedOrgs.map((org) => (
              <EventCard 
                key={org._id}
                image={org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/crtcg1.png")}
                title={org.org_name}
                description={org.description}
                onPress={() => handleCardPress(org._id)} 
              />
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>
                You have not joined any organizations yet.
            </Text>
          )}
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default YourOrgs;