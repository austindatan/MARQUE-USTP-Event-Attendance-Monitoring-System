// @ts-nocheck
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, Animated, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventCard from "../components/Card_Teams";
import JoinModal from "../components/JoinModal";
import appeffects from "../styles/effects_app";
import { useFocusEffect } from "expo-router";
import axios from "axios";
import { BASE_URL } from "../../config";

const JoinOrgs = ({ scrollY, handleScroll }) => {
    const scrollRef = useRef(null);
    const [availableOrgs, setAvailableOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null); // Used to hold data for the success modal
    const [studentId, setStudentId] = useState(null);

    // =======================
    // FETCH STUDENT ID
    // =======================
    const fetchStudentId = async () => {
        console.log("CLIENT: Starting fetchStudentId...");
        try {
            const storedStudentNumber = await AsyncStorage.getItem("student_number");
            if (!storedStudentNumber) throw new Error("Student number not found");
            console.log(`CLIENT: Found stored student_number: ${storedStudentNumber}`);

            const res = await axios.get(`${BASE_URL}/api/student/id/${storedStudentNumber}`);
            setStudentId(res.data._id);
            console.log(`CLIENT: Successfully fetched studentId: ${res.data._id}`);
        } catch (err) {
            console.error("CLIENT ERROR: Failed to fetch student profile", err);
            setError("Failed to fetch student profile");
        }
    };

    // =======================
    // FETCH AVAILABLE ORGS
    // =======================
    const fetchAvailableOrgs = async () => {
        if (!studentId) return;
        setLoading(true);
        console.log("CLIENT: Starting fetchAvailableOrgs...");
        try {
            const res = await axios.get(`${BASE_URL}/api/memberships/available/student/${studentId}`);
            setAvailableOrgs(res.data);
            console.log(`CLIENT: Fetched ${res.data.length} available organizations.`);
            setError(null);
        } catch (err) {
            console.error("CLIENT ERROR: Failed to load available organizations", err);
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
        if (studentId) {
            fetchAvailableOrgs();
        }
    }, [studentId]);

    // =======================
    // HANDLE JOIN REQUEST (UPDATED)
    // =======================
    const handleJoin = async (orgToJoin) => {
        console.log("CLIENT: handleJoin called directly from card");
        console.log("CLIENT: studentId =", studentId);
        console.log("CLIENT: organization_id =", orgToJoin._id);

        if (!studentId) {
            console.log("CLIENT ERROR: Missing studentId, request aborted.");
            Alert.alert("Error", "Cannot join, student profile not loaded.");
            return;
        }

        const payload = {
            student_id: studentId,
            organization_id: orgToJoin._id,
        };

        console.log("CLIENT: Payload created:", JSON.stringify(payload));
        console.log("CLIENT: Full URL =", `${BASE_URL}/api/join-request`);

        try {
            console.log("CLIENT: About to make axios POST request...");

            const response = await axios.post(
                `${BASE_URL}/api/join-request`,
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );

            console.log("CLIENT: POST request succeeded! Response status:", response.status);

            // 🛑 SUCCESS FLOW: Set state to show the success modal
            setSelectedOrg(orgToJoin); // Store the org data for the modal display
            setModalVisible(true);

            fetchAvailableOrgs(); // Refresh the list
        } catch (err) {
            console.error("CLIENT ERROR: POST request failed");
            console.error("Error message:", err.message);
            console.error("Response status:", err.response?.status);
            console.error("Response data:", err.response?.data);
            console.error("Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to submit join request due to an unknown error.";
            Alert.alert("Error", errorMessage);
        }
    };

    // =======================
    // SCROLL ANIMATION
    // =======================
    const containerTranslateY = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [0, -40],
        extrapolate: "clamp",
    });

    // =======================
    // LOADING & ERROR STATES
    // =======================
    if (loading)
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );

    if (error)
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red' }}>{error}</Text>
                <TouchableOpacity onPress={fetchAvailableOrgs}>
                    <Text style={{ color: 'blue', marginTop: 10 }}>Retry</Text>
                </TouchableOpacity>
            </View>
        );

    // =======================
    // MAIN RENDER
    // =======================
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
                    style={{ flex: 1, backgroundColor: "transparent" }}
                    contentContainerStyle={{ paddingTop: 5, paddingBottom: 50 }}
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
                                    onPress={() => handleJoin(org)}
                                />
                            ))
                        ) : (
                            <Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>
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
            />
        </>
    );
};

export default JoinOrgs;
