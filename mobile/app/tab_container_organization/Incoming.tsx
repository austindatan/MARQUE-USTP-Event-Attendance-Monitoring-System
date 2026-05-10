// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import Skeleton_Incoming from "../components/Skeleton_Incoming";
import EventCard from "../components/Card_Event";
import OrgCard from "../components/Card_Organization";
import appeffects from "../styles/effects_app";
import { BASE_URL } from "../../config";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";

const getOneSentence = (text: string = "") => {
    if (!text) return "";
    const sentenceEnd = text.indexOf(".");
    if (sentenceEnd !== -1) return text.substring(0, sentenceEnd + 1);
    return text;
};

const Incoming = ({ scrollY, handleScroll, initialScroll = 0 }) => {
    const router = useRouter();
    const scrollRef = useRef(null);
    const { orgId } = useLocalSearchParams();
    const [organizationData, setOrganizationData] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const month = d.toLocaleString(undefined, { month: "long" });
        const day = d.getDate();
        const year = d.getFullYear();
        return `${month} ${day}, ${year}`;
    };

    const formatDay = (dateStr) => {
        if (!dateStr) return "";
        return String(new Date(dateStr).getDate()).padStart(2, "0");
    };

    const formatMonthShort = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString(undefined, { month: "short" });
    };

    const fetchAllData = async () => {
        if (!orgId) {
            setError("No organization ID found in route parameters.");
            setLoading(false);
            return;
        }
        setLoading(true);

        try {
            const [orgRes, eventsRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/organizations/${orgId}`),
                axios.get(`${BASE_URL}/events/organization/${orgId}/upcoming`),
            ]);

            setOrganizationData(orgRes.data);
            setEvents(eventsRes.data || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load organization or events details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [orgId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAllData();
        setRefreshing(false);
    };
    -
        useEffect(() => {
            if (scrollRef.current && typeof initialScroll === "number" && initialScroll > 0) {
                const t = setTimeout(() => {
                    const node = scrollRef.current?.getNode
                        ? scrollRef.current.getNode()
                        : scrollRef.current;

                    if (node?.scrollTo) {
                        node.scrollTo({ y: initialScroll, animated: false });
                    }
                }, 0);

                return () => clearTimeout(t);
            }
        }, [initialScroll]);

    const handleOrgPress = () => {
        router.push({
            pathname: "../tab_container_organization/Profile",
            params: { orgId: orgId },
        });
    };

    const handleEventPress = (eventId: string) => {
        router.push({
            pathname: "../tab_container_organization/Events",
            params: { eventId },
        });
    };

    if (loading) {
        return <Skeleton_Incoming />;
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

    const org = organizationData;
    const orgImageSource = org.pfp
        ? { uri: org.pfp }
        : require("../../assets/images/marque/MARQUE_singlelogo.png");

    const orgLogoSource = org.pfp
        ? { uri: org.pfp }
        : require("../../assets/images/marque/MARQUE_singlelogo.png");

    return (
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
            <ScrollView
                ref={scrollRef}
                style={{ flex: 1, backgroundColor: "transparent" }}
                contentContainerStyle={{
                    backgroundColor: "transparent",
                    paddingTop: 165,
                }}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        progressViewOffset={165}
                        colors={["#0A0F51"]}
                        tintColor="#0A0F51"
                    />
                }
            >
                <View style={appeffects.pageStarter}>
                </View>

                <View style={appeffects.eventList}>
                    <OrgCard
                        image={orgImageSource}
                        title={org.org_name}
                        organization={org.org_name}
                        orgLogo={orgLogoSource}
                        dateDay={formatDay(org.createdAt || new Date())}
                        dateMonth={formatMonthShort(org.createdAt || new Date())}
                        orgDate={formatDate(org.createdAt || new Date())}
                        description={getOneSentence(org.description)}
                        onPress={handleOrgPress}
                        type="Organizers"
                    />
                    {events.length > 0 ? (
                        events.map((ev) => {
                            const evImage = ev.event_image
                                ? { uri: ev.event_image }
                                : require("../../assets/images/marque/MARQUE_singlelogo.png");

                            return (
                                <EventCard
                                    key={ev._id}
                                    image={evImage}
                                    title={ev.event_name}
                                    organization={org.org_name}
                                    orgLogo={orgLogoSource}
                                    dateDay={formatDay(ev.event_date)}
                                    dateMonth={formatMonthShort(ev.event_date)}
                                    orgDate={formatDate(ev.event_date)}
                                    description={getOneSentence(ev.description)}
                                    onPress={() => handleEventPress(ev._id)}
                                />
                            );
                        })
                    ) : (
                        <Text style={{ textAlign: "center", color: "gray", marginTop: 20, fontFamily: "DMSans-Regular" }}>
                            No upcoming events for this organization.
                        </Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default Incoming;
