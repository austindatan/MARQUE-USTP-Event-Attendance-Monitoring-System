// Incoming.tsx (FINAL FIXED CODE: Dynamic Org Data, Hardcoded Events)
// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
// ✅ Import necessary components/libraries
import { View, Animated, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native"; 
import { useRouter, useLocalSearchParams } from "expo-router"; // Use useLocalSearchParams for ID
import axios from "axios";
import { BASE_URL } from "../../config"; // Import BASE_URL

import OrgCard from "../components/Card_Organization.tsx";
import EventCard from "../components/Card_Event";
import appeffects from "../styles/effects_app";

// Interface for fetched Organization data (from YourOrg.tsx reference)
interface Organization {
    _id: string;
    org_name: string;
    description: string;
    pfp: string; // Profile picture URL
}

// ✅ FIX: Provide a default value for scrollY to prevent "interpolate of undefined"
const Incoming = ({ scrollY = new Animated.Value(0), handleScroll, initialScroll = 0 }) => {
    const scrollRef = useRef(null);
    const router = useRouter();
    const { orgId } = useLocalSearchParams(); // Get the orgId from the route

    const [organizationData, setOrganizationData] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const containerTranslateY = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [0, -40],
        extrapolate: "clamp",
    });

    const fetchOrganizationData = async () => {
        if (!orgId) {
            setError("No organization ID found in route parameters.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Fetch organization details using the ID from the route
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

    useEffect(() => {
        fetchOrganizationData();
    }, [orgId]);


    // Scroll restoration logic remains unchanged
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


    // Navigation handlers
    const handleOrgPress = () => {
        router.push("../tab_container_organization/Profile");
    };

    const handleEventPress = () => {
        router.push("../tab_container_organization/Events");
    };


    // === RENDER LOGIC: LOADING & ERROR STATES ===
    if (loading) {
        return (
            // Maintain padding to start below the header
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 180 }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error || !organizationData) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 180 }}>
                <Text style={{ color: 'red', textAlign: 'center', marginHorizontal: 20 }}>
                    {error || "Organization data could not be loaded."}
                </Text>
                <TouchableOpacity onPress={fetchOrganizationData}>
                    <Text style={{ marginTop: 10, color: 'blue' }}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }
    
    // Use fetched data (OrgCard only)
    const org = organizationData;
    const orgImageSource = org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/crtcg1.png");
    const orgLogoSource = org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/crk.jpg");


    // === MAIN COMPONENT RETURN ===
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
                    // ✅ FIX: Sufficient padding to clear the header area
                    paddingTop: 180, 
                    paddingBottom: 80,
                }}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <View style={appeffects.eventList}>

                    {/* ORG CARD - Now using fetched data */}
                    <OrgCard
                        image={orgImageSource}
                        title={org.org_name}
                        organization={org.org_name}
                        orgLogo={orgLogoSource}
                        dateDay="25"
                        type="Organizers"
                        dateMonth="Nov"
                        orgDate="November 25, 2025"
                        description={org.description}
                        onPress={handleOrgPress}
                    />

                    {/* EVENT CARD WITH NEW ROUTE - Hardcoded as requested */}
                    <EventCard
                        image={require("../../assets/images/marque/crtcg1.png")} // Hardcoded
                        title="Empowering Students Seminar" // Hardcoded
                        organization={org.org_name} // Using fetched org name
                        orgLogo={orgLogoSource}
                        dateDay="25"
                        dateMonth="Nov"
                        orgDate="November 25, 2025"
                        description="Empowering Students, Building Leaders." // Hardcoded
                        onPress={handleEventPress}
                    />

                </View>
            </Animated.ScrollView>
        </Animated.View>
    );
};

export default Incoming;