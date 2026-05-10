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
import styles from "../styles/page_eventdetails";
import { STYLES, COLORS } from "../styles/component_org_page";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL, CLOUD_NAME } from "../../config";
import EventCard from "../components/Card_Event";
import AddActivityButton from "../components/AddActivityButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OFFICER_ROLES = ["Manager", "President"];

const fixCloudinaryUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const path = url.replace(/ /g, "%20");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${path}`;
};

type EventTabType = "Incoming" | "Concluded";

const ProfilePage = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const rawOrgId = params.orgId;
  const orgId = Array.isArray(rawOrgId) ? rawOrgId[0] : rawOrgId;
  const refresh = params.refresh;

  const [activeTab, setActiveTab] = useState<EventTabType>("Incoming");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const STICKY_HEADER_HEIGHT = 90;

  const formatDateForCard = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { dateDay: "-", dateMonth: "---", orgDate: "Invalid Date" };
    }
    return {
      dateDay: date.getDate().toString().padStart(2, "0"),
      dateMonth: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      orgDate: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  };

  const fetchOrgProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/organizations/profile/${orgId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProfileData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching organization profile:", err);
      setError("Failed to load organization profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async (organizationId) => {
    try {
      const storedStudentNumber = await AsyncStorage.getItem("student_number");
      if (!storedStudentNumber || !organizationId) return null;

      const resStudent = await fetch(`${BASE_URL}/api/student/id/${storedStudentNumber}`);
      if (!resStudent.ok) return null;
      const student = await resStudent.json();
      const studentId = student._id;
      if (!studentId) return null;

      const response = await fetch(`${BASE_URL}/api/memberships/student/${studentId}`);
      if (!response.ok) return null;
      const joinedOrgs = await response.json();

      const currentOrgLink = joinedOrgs.find((org) => org._id === organizationId);
      return currentOrgLink ? currentOrgLink.role : null;
    } catch (error) {
      console.error("Error fetching user role:", error.message);
      return null;
    }
  };

  useEffect(() => {
    if (orgId) fetchOrgProfile();
  }, [orgId, refresh]);

  useEffect(() => {
    if (orgId) {
      fetchUserRole(orgId).then(setUserRole);
    }
  }, [orgId]);

  if (loading) {
    return (
      <View style={[STYLES.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primaryNavy} />
      </View>
    );
  }

  if (error || !profileData) {
    return (
      <View style={[STYLES.container, { justifyContent: "center", alignItems: "center", padding: 20 }]}>
        <Text style={{ color: "red", fontSize: 18, marginBottom: 10, textAlign: "center", fontFamily: "DMSans-Bold" }}>
          {error || "Organization data not available."}
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.primaryNavy, textDecorationLine: "underline", fontFamily: "DMSans-Medium" }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const org = profileData.organization;
  const incomingEvents = profileData.events.incoming;
  const concludedEvents = profileData.events.concluded;
  const isOfficer = OFFICER_ROLES.includes(userRole);

  const orgLogoSource = org.pfp
    ? { uri: `${fixCloudinaryUrl(org.pfp)}?refresh=${refresh || ""}` }
    : require("../../assets/images/marque/LogoImage.jpg");

  const handleEventPress = (eventId) => {
    router.push({
      pathname: "../tab_container_organization/Events",
      params: { eventId },
    });
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}>
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
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <ImageBackground
          source={
            org.cover_photo
              ? { uri: `${fixCloudinaryUrl(org.cover_photo)}?refresh=${refresh || ""}` }
              : require("../../assets/images/marque/CoverPage.png")
          }
          style={[styles.headerImageBackgroundCon, { paddingTop: STICKY_HEADER_HEIGHT }]}
        />

        <View style={STYLES.profileSectionContainer}>
          {/* Logo row — edit button replaces follow button */}
          <View style={STYLES.logoRow}>
            <View style={STYLES.logoContainer}>
              <Image source={orgLogoSource} style={STYLES.logoImage} />
            </View>

            <TouchableOpacity
              style={localStyles.editBtn}
              onPress={() =>
                router.push({
                  pathname: "../tab_container_organization/EditProfile",
                  params: { orgId: org._id },
                })
              }
            >
              <Icon name="pencil" size={18} color={COLORS.primaryNavy} />
              <Text style={localStyles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <Text style={[STYLES.orgTitle, { fontSize: 18, marginBottom: 8 }]}>{org.org_name}</Text>

          {/* Socials */}
          {(org.fb_link || org.ig_link || org.x_link) ? (
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
          ) : null}

          <Text style={STYLES.sectionHeader}>About Organization</Text>
          <Text style={STYLES.aboutText}>{org.description}</Text>

          {/* Event Tabs */}
          <View style={tabStyles.tabWrapper}>
            <TouchableOpacity
              style={[tabStyles.singleTab, activeTab === "Incoming" ? tabStyles.activeTab : tabStyles.inactiveTab]}
              onPress={() => setActiveTab("Incoming")}
            >
              <Text style={[tabStyles.tabText, activeTab === "Incoming" ? tabStyles.activeTabText : tabStyles.inactiveTabText]}>
                Incoming
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[tabStyles.singleTab, activeTab === "Concluded" ? tabStyles.activeTab : tabStyles.inactiveTab]}
              onPress={() => setActiveTab("Concluded")}
            >
              <Text style={[tabStyles.tabText, activeTab === "Concluded" ? tabStyles.activeTabText : tabStyles.inactiveTabText]}>
                Concluded
              </Text>
            </TouchableOpacity>
          </View>

          {/* Incoming Events */}
          {activeTab === "Incoming" && (
            <View>
              {incomingEvents.length > 0 ? (
                incomingEvents.map((event) => {
                  const { dateDay, dateMonth, orgDate } = formatDateForCard(event.event_date);
                  return (
                    <EventCard
                      key={event._id}
                      image={
                        event.event_image
                          ? { uri: fixCloudinaryUrl(event.event_image) }
                          : require("../../assets/images/marque/MARQUE.png")
                      }
                      title={event.event_name}
                      orgLogo={orgLogoSource}
                      organization={org.org_name}
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
              )}
            </View>
          )}

          {/* Concluded Events */}
          {activeTab === "Concluded" && (
            <View>
              {concludedEvents.length > 0 ? (
                concludedEvents.map((event) => {
                  const { dateDay, dateMonth, orgDate } = formatDateForCard(event.event_date);
                  return (
                    <EventCard
                      key={event._id}
                      image={
                        event.event_image
                          ? { uri: fixCloudinaryUrl(event.event_image) }
                          : require("../../assets/images/marque/MARQUE.png")
                      }
                      title={event.event_name}
                      orgLogo={orgLogoSource}
                      organization={org.org_name}
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
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button — officers only */}
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
  activeTab: { backgroundColor: COLORS.primaryNavy },
  inactiveTab: { backgroundColor: "#d3d3d3" },
  tabText: { fontSize: 15, fontFamily: "DMSans-Bold" },
  activeTabText: { color: COLORS.white, fontFamily: "DMSans-Bold" },
  inactiveTabText: { color: COLORS.textDark, fontFamily: "DMSans-Medium" },
  noEventsText: {
    textAlign: "center",
    color: COLORS.textDark,
    marginVertical: 12,
    fontFamily: "DMSans-Medium",
  },
});

const localStyles = StyleSheet.create({
  editBtn: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.primaryNavy,
    backgroundColor: "#fff",
  },
  editBtnText: {
    fontSize: 13,
    fontFamily: "DMSans-Bold",
    color: COLORS.primaryNavy,
  },
});