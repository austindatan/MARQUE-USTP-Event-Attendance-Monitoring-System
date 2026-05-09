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
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, CLOUD_NAME } from "../../config"; 
import EventCard from "../components/Card_Event";
import AddActivityButton from "../components/AddActivityButton";
import { STYLES, COLORS } from "../styles/component_org_page";
import styles from "../styles/page_eventdetails";

const OFFICER_ROLES = ["Manager", "President"]; 

const fixCloudinaryUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const path = url.replace(/ /g, "%20");
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${path}`;
};

type EventTabType = "Incoming" | "Concluded";

const ProfilePage = () => {
    const { orgId, refresh } = useLocalSearchParams();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<EventTabType>("Incoming");
    const [organization, setOrganization] = useState(null);
    const [incomingEvents, setIncomingEvents] = useState([]);
    const [concludedEvents, setConcludedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null); 

    const STICKY_HEADER_HEIGHT = 90;

    const formatDateForCard = (date) => {
        const d = new Date(date);
        return {
            dateDay: d.getDate().toString().padStart(2, "0"),
            dateMonth: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
            orgDate: d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        };
    };

    const fetchOrganizationProfile = async () => {
        const res = await fetch(`${BASE_URL}/api/organizations/profile/${orgId}`);
        return res.json();
    };

    // fetch user role
    const fetchUserRole = async (organizationId) => {
        try {
            const storedStudentNumber = await AsyncStorage.getItem("student_number");
            if (!storedStudentNumber || !organizationId) {
                console.warn("Missing student number or organization ID. Cannot fetch role.");
                return null;
            }
    
            // Fetch Student ID
            const studentIdUrl = `${BASE_URL}/api/student/id/${storedStudentNumber}`;
            const resStudent = await fetch(studentIdUrl);
            if (!resStudent.ok) return null;

            const student = await resStudent.json();
            const studentId = student._id;
            if (!studentId) return null;
    
            // Fetch Organizations & Role
            const joinedOrgsUrl = `${BASE_URL}/api/memberships/student/${studentId}`;
            const response = await fetch(joinedOrgsUrl); 
            if (!response.ok) return null;
            
            const joinedOrgs = await response.json(); 
    
            // Find the role for the current organization
            const currentOrgLink = joinedOrgs.find(org => org._id === organizationId);
            
            return currentOrgLink ? currentOrgLink.role : null; 
    
        } catch (error) {
            console.error("Error fetching user role:", error.message);
            return null;
        }
    };

    useEffect(() => {
        let profileLoaded = false;
        let roleLoaded = false;

        const finalizeLoading = () => {
            if (profileLoaded && roleLoaded) {
                setLoading(false);
            }
        };

        const loadProfileAndEvents = async () => {
            try {
                const profileData = await fetchOrganizationProfile();
                setOrganization(profileData.organization);
                setIncomingEvents(profileData.events.incoming);
                setConcludedEvents(profileData.events.concluded);
            } catch (err) {
                console.error("Error loading profile:", err);
            } finally {
                profileLoaded = true;
                finalizeLoading();
            }
        };

        const loadRole = async () => {
            const role = await fetchUserRole(orgId);
            setUserRole(role);
            roleLoaded = true;
            finalizeLoading();
        };

        if (orgId) {
            setLoading(true);
            loadProfileAndEvents();
            loadRole();
        }
    }, [orgId, refresh]);

    // Check if the user has the required permission
    const isOfficer = OFFICER_ROLES.includes(userRole);

    // handle event card press
    const handleEventPress = (eventId) => {
        router.push({
            pathname: '../tab_container_organization/Events',
            params: { eventId: eventId },
        });
    }

    if (loading || !organization) {
        return (
            <View
                style={[
                    STYLES.container,
                    { justifyContent: "center", alignItems: "center" },
                ]}
            >
                <ActivityIndicator size="large" color={COLORS.primaryNavy} />
                <Text style={{ marginTop: 10 }}>Loading organization profile...</Text>
            </View>
        );
    }

    const org = organization;
    const orgLogoSource = org.pfp
        ? { uri: fixCloudinaryUrl(org.pfp) }
        : require("../../assets/images/marque/LogoImage.jpg");


    return (
        <View style={styles.container}>
            {/* Sticky Header */}
            <View
                style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}
            >
                <LinearGradient
                    colors={["rgba(45,45,45,0.4)", "rgba(0,0,0,0.2)", "rgba(255,255,255,0.1)"]}
                    style={styles.gradientOverlay}
                />
                <View style={styles.navRowContent}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <Ionicons name="arrow-back" size={18} color="#fff" />
                        <Text style={[styles.navTextORG, { color: "#fff" }]} numberOfLines={2}>
                            {org.org_name}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Cover Photo */}
                <ImageBackground
                    source={
                        org.cover_photo
                            ? { uri: fixCloudinaryUrl(org.cover_photo) }
                            : require("../../assets/images/marque/CoverPage.png")
                    }
                    style={[styles.headerImageBackgroundCon, { paddingTop: STICKY_HEADER_HEIGHT }]}
                />

                {/* Profile Section */}
                <View style={STYLES.profileSectionContainer}>
                    <View style={STYLES.logoRow}>
                        <View style={STYLES.logoContainer}>
                            <Image
                                source={orgLogoSource}
                                style={STYLES.logoImage}
                            />
                        </View>

                        <TouchableOpacity
                            style={STYLES.editButton}
                            onPress={() =>
                                router.push({
                                    pathname: "../tab_container_organization/EditProfile",
                                    params: { orgId: org._id },
                                })
                            }
                        >
                            <Icon name="pencil" size={20} color={COLORS.primaryNavy} />
                        </TouchableOpacity>
                    </View>

                    <Text style={STYLES.orgTitle}>{org.org_name}</Text>

                    {/* Socials */}
                    <View style={STYLES.socialRow}>
                        {org.fb_link && (
                            <TouchableOpacity style={STYLES.socialIcon}>
                                <Icon name="logo-facebook" size={22} color={COLORS.primaryNavy} />
                            </TouchableOpacity>
                        )}
                        {org.ig_link && (
                            <TouchableOpacity style={STYLES.socialIcon}>
                                <Icon name="logo-instagram" size={22} color={COLORS.primaryNavy} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* About */}
                    <Text style={STYLES.sectionHeader}>About Organization</Text>
                    <Text style={STYLES.aboutText}>{org.description}</Text>

                    {/* Tabs */}
                    <Text style={STYLES.eventsTitle}>EVENTS</Text>
                    <View style={tabStyles.tabWrapper}>
                        <TouchableOpacity
                            style={[tabStyles.singleTab, activeTab === "Incoming" ? tabStyles.activeTab : tabStyles.inactiveTab]}
                            onPress={() => setActiveTab("Incoming")}
                        >
                            <Text style={[tabStyles.tabText, activeTab === "Incoming" ? tabStyles.activeTabText : tabStyles.inactiveTabText]}>
                                Incoming ({incomingEvents.length})
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[tabStyles.singleTab, activeTab === "Concluded" ? tabStyles.activeTab : tabStyles.inactiveTab]}
                            onPress={() => setActiveTab("Concluded")}
                        >
                            <Text style={[tabStyles.tabText, activeTab === "Concluded" ? tabStyles.activeTabText : tabStyles.inactiveTabText]}>
                                Concluded ({concludedEvents.length})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Incoming Events */}
                    {activeTab === "Incoming" &&
                        (incomingEvents.length > 0 ? (
                            incomingEvents.map((event) => {
                                const { dateDay, dateMonth, orgDate } = formatDateForCard(event.event_date);
                                const eventImageSource = event.event_image
                                    ? { uri: fixCloudinaryUrl(event.event_image) }
                                    : (event.event_images && event.event_images.length > 0
                                        ? { uri: fixCloudinaryUrl(event.event_images[0]) }
                                        : require("../../assets/images/marque/crtcg1.png"));

                                return (
                                    <EventCard
                                        key={event._id}
                                        image={eventImageSource}
                                        title={event.event_name}
                                        organization={org.org_name}
                                        orgLogo={orgLogoSource}
                                        orgDate={orgDate}
                                        dateDay={dateDay}
                                        dateMonth={dateMonth}
                                        description={event.description}
                                        onPress={() => handleEventPress(event._id)}
                                    />
                                );
                            })
                        ) : (
                            <Text style={tabStyles.noEventsText}>No upcoming events found.</Text>
                        ))}

                    {/* Concluded Events */}
                    {activeTab === "Concluded" &&
                        (concludedEvents.length > 0 ? (
                            concludedEvents.map((event) => {
                                const { dateDay, dateMonth, orgDate } = formatDateForCard(event.event_date);
                                const eventImageSource = event.event_image
                                    ? { uri: fixCloudinaryUrl(event.event_image) }
                                    : (event.event_images && event.event_images.length > 0
                                        ? { uri: fixCloudinaryUrl(event.event_images[0]) }
                                        : require("../../assets/images/marque/crtcg1.png"));

                                return (
                                    <EventCard
                                        key={event._id}
                                        image={eventImageSource}
                                        title={event.event_name}
                                        organization={org.org_name}
                                        orgLogo={orgLogoSource}
                                        orgDate={orgDate}
                                        dateDay={dateDay}
                                        dateMonth={dateMonth}
                                        description={event.description}
                                        onPress={() => handleEventPress(event._id)}
                                    />
                                );
                            })
                        ) : (
                            <Text style={tabStyles.noEventsText}>No concluded events found.</Text>
                        ))}
                </View>
            </ScrollView>

            {/* Floating Add Button */}
            {isOfficer && (
                <AddActivityButton
                    onPress={() =>
                        router.push({
                            pathname: "../tab_container_organization/EditEvents",
                            params: { orgId: org._id },
                        })
                    }
                />
            )}
        </View>
    );
};

export default ProfilePage;


const tabStyles = StyleSheet.create({
    tabWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 12,
    },
    singleTab: {
        flex: 1,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 120,
    },
    activeTab: {
        backgroundColor: COLORS.primaryNavy,
    },
    inactiveTab: {
        backgroundColor: "#d3d3d3",
    },
    tabText: {
        fontSize: 15,
        fontFamily: "DMSans-Bold",
    },
    activeTabText: {
        color: COLORS.white,
        fontFamily: "DMSans-Bold",
    },
    inactiveTabText: {
        color: COLORS.textDark,
        fontFamily: "DMSans-Medium",
    },
    noEventsText: {
        textAlign: "center",
        color: COLORS.textDark,
        marginVertical: 12,
    },
});