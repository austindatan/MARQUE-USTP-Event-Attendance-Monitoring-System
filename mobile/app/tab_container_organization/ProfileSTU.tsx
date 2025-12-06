// @ts-nocheck
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator, StyleSheet, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/page_eventdetails";
import { STYLES, COLORS } from "../styles/component_org_page";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL } from "../../config";
import EventCard from "../components/Card_Event";
import axios from "axios";

type EventTabType = "Incoming" | "Concluded";

interface Organization {
  _id: string;
  org_name: string;
  org_type: string;
  description: string;
  pfp?: string;
  cover_photo?: string;
  fb_link?: string;
  ig_link?: string;
  x_link?: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  image_url?: string;
}

interface OrgProfileData {
  organization: Organization;
  events: {
    incoming: Event[];
    concluded: Event[];
  };
}

const ProfilePage = () => {
  const { orgId, refresh } = useLocalSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<EventTabType>("Incoming");
  const [profileData, setProfileData] = useState<OrgProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const STICKY_HEADER_HEIGHT = 90;

  const formatDateForCard = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { dateDay: "-", dateMonth: "---", orgDate: "Invalid Date" };
    }
    return {
      dateDay: date.getDate().toString(),
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
      const response = await axios.get(`${BASE_URL}/api/organizations/profile/${orgId}`);
      setProfileData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching organization profile:", err);
      setError("Failed to load organization profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) fetchOrgProfile();
  }, [orgId, refresh]);

  if (loading) {
    return (
      <View style={[STYLES.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primaryNavy} />
      </View>
    );
  }

  if (error || !profileData) {
    return (
      <View
        style={[
          STYLES.container,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Text style={{ color: "red", fontSize: 18, marginBottom: 10, textAlign: "center" }}>
          {error || "Organization data not available."}
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: COLORS.primaryNavy, textDecorationLine: "underline" }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const org = profileData.organization;
  const incomingEvents = profileData.events.incoming;
  const concludedEvents = profileData.events.concluded;

  return (
    <View style={styles.container}>
      <View style={[styles.stickyNavContainer, { height: STICKY_HEADER_HEIGHT }]}>
        <LinearGradient
          colors={[
            "rgba(45,45,45,0.4)",
            "rgba(0,0,0,0.2)",
            "rgba(255,255,255,0.1)",
          ]}
          style={styles.gradientOverlay}
        />
        <View style={styles.navRowContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={[styles.navTextORG, { color: "#fff" }]} numberOfLines={2} ellipsizeMode="tail">{org.org_name}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={
            org.cover_photo
              ? { uri: `${org.cover_photo}?refresh=${refresh || ""}` }
              : require("../../assets/images/marque/CoverPage.png")
          }
          style={[styles.headerImageBackgroundCon, { paddingTop: STICKY_HEADER_HEIGHT }]}
        />

        <View style={STYLES.profileSectionContainer}>
          <View style={STYLES.logoRow}>
            <View style={STYLES.logoContainer}>
              <Image
                source={
                  org.pfp
                    ? { uri: `${org.pfp}?refresh=${refresh || ""}` }
                    : require("../../assets/images/marque/LogoImage.jpg")
                }
                style={STYLES.logoImage}
              />
            </View>
          </View>

          <Text style={STYLES.orgTitle}>{org.org_name}</Text>

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

          <Text style={STYLES.sectionHeader}>About Organization</Text>
          <Text style={STYLES.aboutText}>{org.description}</Text>

          <Text style={STYLES.eventsTitle}>EVENTS</Text>
          <View style={STYLES.divider} />

          <View style={tabStyles.tabWrapper}>
            <TouchableOpacity
              style={[
                tabStyles.singleTab,
                activeTab === "Incoming" ? tabStyles.activeTab : tabStyles.inactiveTab,
              ]}
              onPress={() => setActiveTab("Incoming")}
            >
              <Text
                style={[
                  tabStyles.tabText,
                  activeTab === "Incoming" ? tabStyles.activeTabText : tabStyles.inactiveTabText,
                ]}
              >
                Incoming ({incomingEvents.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                tabStyles.singleTab,
                activeTab === "Concluded" ? tabStyles.activeTab : tabStyles.inactiveTab,
              ]}
              onPress={() => setActiveTab("Concluded")}
            >
              <Text
                style={[
                  tabStyles.tabText,
                  activeTab === "Concluded" ? tabStyles.activeTabText : tabStyles.inactiveTabText,
                ]}
              >
                Concluded ({concludedEvents.length})
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "Incoming" && (
            <View>
              {incomingEvents.length > 0 ? (
                incomingEvents.map((event) => {
                  const { dateDay, dateMonth, orgDate } = formatDateForCard(event.date);
                  return (
                    <EventCard
                      key={event._id}
                      image={
                        event.image_url
                          ? { uri: event.image_url }
                          : "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
                      }
                      title={event.title}
                      orgLogo={
                        org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/LogoImage.jpg")
                      }
                      organization={org.org_name}
                      orgDate={orgDate}
                      dateDay={dateDay}
                      dateMonth={dateMonth}
                      description={event.description}
                    />
                  );
                })
              ) : (
                <Text style={tabStyles.noEventsText}>No upcoming events found.</Text>
              )}
            </View>
          )}

          {activeTab === "Concluded" && (
            <View>
              {concludedEvents.length > 0 ? (
                concludedEvents.map((event) => {
                  const { dateDay, dateMonth, orgDate } = formatDateForCard(event.date);
                  return (
                    <EventCard
                      key={event._id}
                      image={
                        event.image_url
                          ? { uri: event.image_url }
                          : "https://images.unsplash.com/photo-1529101091764-c3526daf38fe"
                      }
                      title={event.title}
                      orgLogo={
                        org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/LogoImage.jpg")
                      }
                      organization={org.org_name}
                      orgDate={orgDate}
                      dateDay={dateDay}
                      dateMonth={dateMonth}
                      description={event.description}
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