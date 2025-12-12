// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator, Alert, Platform, SafeAreaView, Linking } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/page_eventdetails";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL, CLOUD_NAME } from "../../config";
import ScannerButton from '../components/ScannerButton';
import AsyncStorage from "@react-native-async-storage/async-storage";

const OFFICER_ROLES = ["Manager", "President"];

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

const Events = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const rawEventId = params.eventId;
    const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

    const [pendingProofsCount, setPendingProofsCount] = useState(0);

    const STICKY_HEADER_HEIGHT = 90;

    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [eventActive, setEventActive] = useState(false);
    const [within30Min, setWithin30Min] = useState(false);

    const [studentId, setStudentId] = useState(null);
    const [userRole, setUserRole] = useState(null);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCancelledOverlay, setShowCancelledOverlay] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const fetchStudentAndRole = async (organizationId) => {
        let fetchedStudentId = null;
        try {
            const storedStudentNumber = await AsyncStorage.getItem("student_number");
            if (!storedStudentNumber || !organizationId) {
                setUserRole(null);
                return null;
            }

            // Fetch Student ID
            const studentIdUrl = `${BASE_URL}/api/student/id/${storedStudentNumber}`;
            const resStudent = await fetch(studentIdUrl);
            if (!resStudent.ok) throw new Error("Failed to fetch student ID.");

            const student = await resStudent.json();
            fetchedStudentId = student._id;

            if (!fetchedStudentId) {
                setUserRole(null);
                return null;
            }

            // Fetch Memberships & Role
            const joinedOrgsUrl = `${BASE_URL}/api/memberships/student/${fetchedStudentId}`;
            const response = await fetch(joinedOrgsUrl);
            if (!response.ok) throw new Error("Failed to fetch memberships.");

            const joinedOrgs = await response.json();
            const currentOrgLink = joinedOrgs.find(org => org._id === organizationId);
            const role = currentOrgLink ? currentOrgLink.role : null;
            setUserRole(role);

        } catch (error) {
            console.error("Error fetching user role or student ID:", error.message);
            setUserRole(null);
        }
        return fetchedStudentId;
    };

    const fetchEventDetails = async (id) => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
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

            if (eventObj.event_image) {
                eventObj.event_image = fixCloudinaryUrl(eventObj.event_image, CLOUD_NAME);
            }
            if (eventObj.organization_id?.pfp) {
                eventObj.organization_id.pfp = fixCloudinaryUrl(eventObj.organization_id.pfp, CLOUD_NAME);
            }

            setEventData(eventObj);

            // Check if event is cancelled
            if (eventObj.status === "Cancelled") {
                setShowCancelledOverlay(true);
            } else {
                setShowCancelledOverlay(false);
            }

            // Fetch event status and map within1Hour to within30Min
            const statusRes = await fetch(`${BASE_URL}/events/event-status/${eventObj._id}`);
            const statusData = await statusRes.json();
            setEventActive(statusData.isActive);
            setWithin30Min(statusData.within1Hour);

        } catch (error) {
            console.error("Error fetching event details/status:", error);
            Alert.alert("Network Error", `Failed to load event details. Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const checkFollowStatus = async (orgId, currentStudentId) => {
        if (!currentStudentId) return;
        try {
            const res = await fetch(`${BASE_URL}/api/followed-orgs/${currentStudentId}/ids`);
            if (!res.ok) return;

            const ids = await res.json();
            setIsFollowing(ids.includes(orgId));
        } catch (err) {
            console.error("Error checking follow:", err);
        }
    };

    const handleFollowToggle = async () => {
        if (!eventData?.organization_id?._id || !studentId) return;
        const orgId = eventData.organization_id._id;

        const action = isFollowing ? "unfollow" : "follow";

        try {
            setIsFollowing(!isFollowing);

            const res = await fetch(`${BASE_URL}/api/followed-orgs/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: studentId, organizationId: orgId }),
            });

            if (!res.ok) {
                setIsFollowing(isFollowing);
                Alert.alert("Error", `Failed to ${action} organization.`);
            }
        } catch (err) {
            setIsFollowing(isFollowing);
        }
    };

    // Cancel/Resume Handler 
    const handleCancelOrResume = async () => {
        if (!eventData) return;

        const endpoint =
            eventData.status === "Cancelled"
                ? `${BASE_URL}/events/resume/${eventId}`
                : `${BASE_URL}/events/cancel/${eventId}`;

        try {
            const res = await fetch(endpoint, { method: "PUT" });
            const result = await res.json();

            if (!res.ok) {
                Alert.alert("Error", "Failed to update event status.");
                return;
            }

            setShowCancelModal(false);

            setEventData({ ...eventData, status: result.status });

            if (result.status === "Cancelled") {
                setShowCancelledOverlay(true);
            } else {
                setShowCancelledOverlay(false);
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to update event status.");
        }
    };

    const handleVerifyProofPress = () => {
        router.push({
            pathname: "tab_container_organization/Photo_Proof_Verification",
            params: { eventId: eventId }
        });
    };

    useEffect(() => {
        if (eventId) {
            fetchEventDetails(eventId);
        } else {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        const organizationId = eventData?.organization_id?._id;
        if (organizationId) {
            // Fetch student role and ID
            fetchStudentAndRole(organizationId).then((fetchedStudentId) => {
                if (fetchedStudentId) {
                    setStudentId(fetchedStudentId);
                    checkFollowStatus(organizationId, fetchedStudentId);
                }
            });
        }
    }, [eventData]);

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

    const isOfficer = OFFICER_ROLES.includes(userRole);

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
        : require("../../assets/images/profile_pic.png");

    const isDownloadEnabled = eventData.status === "Concluded";


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.container}>
                <View style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}>
                    <LinearGradient
                        colors={["rgba(45, 45, 45, 0.4)", "rgba(0, 0, 0, 0.2)", "rgba(255,255,255,0.1)"]}
                        locations={[0, 0.7, 1]}
                        style={styles.gradientOverlay}
                    />

                    <View style={styles.navRowContent}>
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}
                            onPress={handleBack}
                        >
                            <Ionicons name="arrow-back" size={18} color="#fff" style={{ flexShrink: 0 }} />
                            <Text
                                style={[styles.navText, { color: "#fff", flex: 1 }]}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {eventData.title || eventData.event_name}
                            </Text>
                        </TouchableOpacity>

                        {isOfficer && (
                            <TouchableOpacity
                                style={[styles.bookmarkBtn, { flexShrink: 0 }]}
                                onPress={() => router.push({ pathname: '/tab_container_organization/EditEvents', params: { eventId: eventId } })}
                            >
                                <Ionicons name="create" size={24} color="#fff" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <ImageBackground
                        source={{ uri: eventData.event_image }}
                        style={[styles.headerImageBackground, { paddingTop: STICKY_HEADER_HEIGHT }]}
                    />

                    <Text style={styles.eventTitle} numberOfLines={2} ellipsizeMode="tail">{eventData.title || eventData.event_name}</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="calendar" size={20} color="#0A0F51" />
                        </View>
                        <View>
                            <Text style={styles.infoPrimary}>{eventDate}</Text>
                            <Text style={styles.infoSecondary}>{eventTimeFull}</Text>
                        </View>
                    </View>

                    <View style={[styles.infoRow, { marginBottom: 10 }]}>
                        <View style={styles.iconBox}>
                            <Ionicons name="location" size={20} color="#0A0F51" />
                        </View>
                        <View>
                            <Text style={styles.infoPrimary}>{eventData.venue || eventData.location}</Text>
                            <Text style={styles.infoSecondary}>{eventData.venue_details || eventData.location_details}</Text>
                        </View>
                    </View>

                    <View style={styles.buttonsRow}>

                        {eventData && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#0A0F51' }]}
                                onPress={handleVerifyProofPress}
                            >
                                <Ionicons name="camera" size={30} color="#fff" />
                                <Text style={styles.actionButtonText}>
                                    Verify {'\n'}Photos {pendingProofsCount > 0 && `(${pendingProofsCount})`}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={{ width: 5 }} />

                        <TouchableOpacity
                            style={[styles.actionButton, !isDownloadEnabled && { opacity: 0.5 }]}
                            activeOpacity={isDownloadEnabled ? 0.8 : 1}
                            onPress={() => {
                                if (isDownloadEnabled) {
                                    const url = `${BASE_URL}/api/reports/event/${eventId}/download-report`;
                                    Linking.openURL(url).catch(err => console.error(err));
                                } else {
                                    Alert.alert(
                                        "Feature Unavailable",
                                        `Analytics report download is only available after the event has been Concluded. Current status: ${eventData.status}.`
                                    );
                                }
                            }}
                        >
                            <Ionicons name="download" size={30} color="#fff" />
                            <Text style={styles.actionButtonText}>Analytics Reports</Text>
                        </TouchableOpacity>

                        <View style={{ width: 5 }} />

                        <TouchableOpacity
                            style={[styles.actionButton, !isDownloadEnabled && { opacity: 0.5 }]}
                            activeOpacity={isDownloadEnabled ? 0.8 : 1}
                            onPress={() => {
                                if (isDownloadEnabled) {
                                    const url = `${BASE_URL}/api/attendance/export/${eventId}`;
                                    Linking.openURL(url).catch(err => console.error(err));
                                } else {
                                    Alert.alert(
                                        "Feature Unavailable",
                                        `Attendance download is only available after the event has been Concluded. Current status: ${eventData.status}.`
                                    );
                                }
                            }}
                        >
                            <Ionicons name="download" size={30} color="#fff" />
                            <Text style={styles.actionButtonText}>Attendance Spreadsheets</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>About Event</Text>
                    <Text style={styles.aboutText}>
                        {eventData.description}
                    </Text>

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
                </ScrollView>
            </View>
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

            {showCancelModal && (
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <View style={{ width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 15 }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
                            {eventData.status === "Cancelled" ? "Resume Event?" : "Cancel Event?"}
                        </Text>
                        <Text style={{ marginBottom: 20 }}>
                            {eventData.status === "Cancelled" ? "Are you sure you want to resume this event?" : "Are you sure you want to cancel this event?"}
                        </Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                                <Text style={{ color: "#555", fontSize: 16 }}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCancelOrResume}>
                                <Text style={{ color: "#B40000", fontSize: 16 }}>Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {showCancelledOverlay && (
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", zIndex: 900 }}>
                    <Text style={{ color: "#fff", fontSize: 26, fontFamily: "DMSans-Bold", textAlign: "center" }}>
                        This Event Has Been Cancelled
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
};

export default Events;
