// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView, // Added for bottom bar placement
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Added MaterialCommunityIcons
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/page_eventdetails"; // Using styles from the first file
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL, CLOUD_NAME } from "../../config";
import ScannerButton from '../components/ScannerButton'; // Added ScannerButton import

// Helper function to fix Cloudinary URLs
const fixCloudinaryUrl = (url, cloudName) => {
    if (!url || url.startsWith("http")) {
        return url;
    }
    const path = url.replace(/ /g, "%20");
    if (path.includes(cloudName)) {
        return `https://${path}`;
    }
    return `https://res.cloudinary.com/${cloudName}/image/upload/${path}`;
};

// --- Main Component ---
const Events = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Safely extract eventId
    const rawEventId = params.eventId;
    const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

    const STICKY_HEADER_HEIGHT = 90;

    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    // 💡 STATE MERGED from Second File for Scanner/Analytics logic
    const [eventActive, setEventActive] = useState(false);
    const [within30Min, setWithin30Min] = useState(false);

    // TEMP STATIC USER ID (Replace this with real user context)
    const [userId, setUserId] = useState("692402df4600376c2cea56eb");

    const handleBack = () => {
        router.back();
    };

    // --- Backend Logic Merged ---
    const fetchEventDetails = async (id) => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // 1. Fetch event data
            const res = await fetch(`${BASE_URL}/events/event/${id}`);

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`API Error: ${res.status} - ${errorText}`);
            }

            const data = await res.json();
            const eventObj = data.event || data;

            if (!eventObj) {
                Alert.alert("Error", "Event data not found in response.");
                setLoading(false);
                return;
            }

            // Apply Cloudinary fix to images
            if (eventObj.event_image) {
                eventObj.event_image = fixCloudinaryUrl(eventObj.event_image, CLOUD_NAME);
            }
            if (eventObj.organization_id?.pfp) {
                eventObj.organization_id.pfp = fixCloudinaryUrl(eventObj.organization_id.pfp, CLOUD_NAME);
            }

            setEventData(eventObj);

            // 2. Fetch status from backend (from Second File)
            const statusRes = await fetch(`${BASE_URL}/events/event-status/${eventObj._id}`);
            const statusData = await statusRes.json();
            setEventActive(statusData.isActive);
            setWithin30Min(statusData.within30Min);


        } catch (error) {
            console.error("Error fetching event details/status:", error);
            Alert.alert("Network Error", `Failed to load event details. Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Check initial follow status for organizer (Copied from First File)
    const checkFollowStatus = async (orgId) => {
        try {
            const res = await fetch(`${BASE_URL}/api/followed-orgs/${userId}/ids`);
            if (!res.ok) return;

            const ids = await res.json();
            setIsFollowing(ids.includes(orgId));
        } catch (err) {
            console.error("Error checking follow:", err);
        }
    };

    // 🔹 Handle Follow/Unfollow toggle (Copied from First File)
    const handleFollowToggle = async () => {
        if (!eventData?.organization_id?._id || !userId) return;
        const orgId = eventData.organization_id._id;

        const action = isFollowing ? "unfollow" : "follow";

        try {
            setIsFollowing(!isFollowing); // optimistic UI

            const res = await fetch(`${BASE_URL}/api/followed-orgs/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, organizationId: orgId }),
            });

            if (!res.ok) {
                setIsFollowing(isFollowing); // revert if error
                Alert.alert("Error", `Failed to ${action} organization.`);
            }
        } catch (err) {
            setIsFollowing(isFollowing);
        }
    };


    useEffect(() => {
        if (eventId) {
            fetchEventDetails(eventId);
        } else {
            setLoading(false);
        }
    }, [eventId]);

    // Load follow status
    useEffect(() => {
        if (eventData?.organization_id?._id && userId) {
            checkFollowStatus(eventData.organization_id._id);
        }
    }, [eventData, userId]);


    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color="#0A0F51" />
                <Text style={{ marginTop: 10 }}>Loading Event Details...</Text>
            </View>
        );
    }

    if (!eventData) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
                <Text style={{ fontSize: 16, textAlign: 'center' }}>Could not load event details for ID: {eventId}</Text>
            </View>
        );
    }

    // DATE & TIME Formatting (from First File)
    const eventDateObj = eventData.event_date ? new Date(eventData.event_date) : null;
    const eventDate = eventDateObj
        ? eventDateObj.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
        : "Date N/A";
    const eventDay = eventDateObj ? eventDateObj.toLocaleDateString("en-US", { weekday: "long" }) : "";

    const startTime = eventData.start_time
        ? new Date(eventData.start_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
        : null;
    const endTime = eventData.end_time
        ? new Date(eventData.end_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
        : null;

    let eventTimeFull = "Time N/A";
    if (eventDay && startTime && endTime) {
        eventTimeFull = `${eventDay}, ${startTime} - ${endTime}`;
    } else if (eventDay && startTime) {
        eventTimeFull = `${eventDay}, ${startTime}`;
    } else if (eventDay) {
        eventTimeFull = eventDay;
    }

    const organizerPfpSource = eventData.organization_id?.pfp
        ? { uri: eventData.organization_id.pfp }
        : require("../../assets/images/profile_pic.png"); // Fallback image


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.container}>
                {/* TOP NAV */}
                <View style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}>
                    <LinearGradient
                        colors={["rgba(45, 45, 45, 0.4)", "rgba(0, 0, 0, 0.2)", "rgba(255,255,255,0.1)"]}
                        locations={[0, 0.7, 1]}
                        style={styles.gradientOverlay}
                    />

                    <View style={styles.navRowContent}>
                        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={18} color="#fff" />
                            <Text style={[styles.navText, { color: "#fff" }]}>
                                {eventData.title || eventData.event_name}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.bookmarkBtn} onPress={() => router.push({ pathname: '/tab_container_organization/EditEvents', params: { eventId: eventId } })}>
                            <Ionicons name="create" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <ImageBackground
                        source={{ uri: eventData.event_image }}
                        style={[styles.headerImageBackground, { paddingTop: STICKY_HEADER_HEIGHT }]}
                    />

                    <Text style={styles.eventTitle} numberOfLines={2} ellipsizeMode="tail">{eventData.title || eventData.event_name}</Text>

                    {/* DATE & TIME */}
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="calendar" size={20} color="#0A0F51" />
                        </View>
                        <View>
                            <Text style={styles.infoPrimary}>{eventDate}</Text>
                            <Text style={styles.infoSecondary}>{eventTimeFull}</Text>
                        </View>
                    </View>

                    {/* LOCATION */}
                    <View style={[styles.infoRow, { marginBottom: 10 }]}>
                        <View style={styles.iconBox}>
                            <Ionicons name="location" size={20} color="#0A0F51" />
                        </View>
                        <View>
                            <Text style={styles.infoPrimary}>{eventData.venue || eventData.location}</Text>
                            <Text style={styles.infoSecondary}>{eventData.venue_details || eventData.location_details}</Text>
                        </View>
                    </View>

                    {/* ANALYTICS/ATTENDANCE BUTTONS ROW (From Second File) */}
                    <View style={styles.buttonsRow}>
                        {/* Analytics Reports */}
                        <TouchableOpacity
                            // Using styles from the first file's assumed structure, might need adjustment based on 'page_eventdetails'
                            style={[styles.actionButton, !eventActive && { opacity: 0.5, backgroundColor: '#ccc' }]} 
                            disabled={!eventActive}
                        >
                            <Ionicons name="download" size={30} color="#090913ff" />
                            <Text style={styles.actionButtonText}>
                                Analytics{'\n'}Reports
                            </Text>
                        </TouchableOpacity>

                        <View style={{ width: 10 }} />

                        {/* Attendance Spreadsheets */}
                        <TouchableOpacity
                            style={[styles.actionButton, !eventActive && { opacity: 0.5, backgroundColor: '#ccc' }]}
                            disabled={!eventActive}
                        >
                            <Ionicons name="download" size={30} color="#090913ff" />
                            <Text style={styles.actionButtonText}>
                                Attendance{'\n'}Spreadsheets
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ABOUT EVENT */}
                    <Text style={styles.sectionTitle}>About Event</Text>
                    <Text style={styles.aboutText}>
                        {eventData.description}
                    </Text>

                    {/* ORGANIZER */}
                    <View style={styles.organizerCard}>
                        <View style={styles.organizerLeft}>
                            <Image
                                source={organizerPfpSource}
                                style={styles.organizerLogo}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.organizerName} numberOfLines={1} ellipsizeMode="tail">{eventData.organization_id?.org_name}</Text>
                                <Text style={styles.organizerLabel}>Organizers</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.organizerDesc}>
                        {eventData.organization_id?.org_description || eventData.organization_id?.description || "No description provided."}
                    </Text>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
            {/* FLOATING SCANNER BUTTON (From Second File) */}
            {eventActive && within30Min && (
                <ScannerButton
                    onPress={() =>
                        router.push({
                            pathname: '/tab_container_organization/Scanner',
                            params: { eventId },
                        })
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default Events;