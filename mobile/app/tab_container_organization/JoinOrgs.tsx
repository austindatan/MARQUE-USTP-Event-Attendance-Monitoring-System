// @ts-nocheck
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, Animated, ActivityIndicator, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventCard from "../components/Card_Teams";
import JoinModal from "../components/JoinModal";
import appeffects from "../styles/effects_app";
import { useFocusEffect } from "expo-router";
import axios from "axios";
import { BASE_URL } from "../../config";

const JoinOrgs = ({ scrollY, handleScroll, initialScroll = 0 }) => {
  const scrollRef = useRef(null);
  const [availableOrgs, setAvailableOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [studentId, setStudentId] = useState(null);

  const fetchStudentId = async () => {
    try {
      const storedStudentNumber = await AsyncStorage.getItem("student_number");
      if (!storedStudentNumber) throw new Error("Student number not found");
      const studentRes = await axios.get(`${BASE_URL}/api/student/id/${storedStudentNumber}`);
      setStudentId(studentRes.data._id);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch student profile");
    }
  };

  const fetchAvailableOrgs = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/memberships/available/student/${studentId}`);
      setAvailableOrgs(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load available organizations");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudentId();
    }, [])
  );

  useEffect(() => {
    fetchAvailableOrgs();
  }, [studentId]);

  const handleCardPress = (org) => {
    setSelectedOrg(org);
    setModalVisible(true);
  };

  const handleJoin = async () => {
    if (!studentId || !selectedOrg) return;
    try {
      await axios.post(`${BASE_URL}/api/memberships/join`, {
        studentId,
        orgId: selectedOrg._id
      });
      setModalVisible(false);
      fetchAvailableOrgs();
    } catch (err) {
      console.error(err);
      setError("Failed to join organization");
    }
  };

  const containerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  if (loading) return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );

  if (error) return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ color:'red' }}>{error}</Text>
      <TouchableOpacity onPress={fetchAvailableOrgs}>
        <Text style={{ color:'blue', marginTop:10 }}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "transparent",
          transform: [{ translateY: containerTranslateY }],
        }}
      >
        <Animated.ScrollView
          ref={scrollRef}
          style={{ flex:1, backgroundColor:"transparent" }}
          contentContainerStyle={{ paddingTop:5, paddingBottom:80 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={appeffects.pageStarterORG}></View>

          <View style={appeffects.eventList}>
            {availableOrgs.length > 0 ? (
              availableOrgs.map((org) => (
                <EventCard
                  key={org._id}
                  image={org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/crtcg1.png")}
                  title={org.org_name}
                  description={org.description}
                  onPress={() => handleCardPress(org)}
                />
              ))
            ) : (
              <Text style={{ textAlign:'center', color:'gray', marginTop:20 }}>
                No organizations available to join.
              </Text>
            )}
          </View>
        </Animated.ScrollView>
      </Animated.View>

      <JoinModal
        visible={modalVisible}
        orgName={selectedOrg?.org_name}
        onClose={() => setModalVisible(false)}
        onJoin={handleJoin}
      />
    </>
  );
};

export default JoinOrgs;
