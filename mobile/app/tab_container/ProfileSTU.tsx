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
import { BASE_URL } from "../../config";
import EventCard from "../components/Card_Event";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "../../utils/apiFetch";

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
  event_name: string;
  description: string;
  event_date: string;
  event_image?: string;
}

interface OrgProfileData {
  organization: Organization;
  events: {
    incoming: Event[];
    concluded: Event[];
  };
}

const ProfilePage = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const rawOrgId = params.orgId;
  const orgId = Array.isArray(rawOrgId) ? rawOrgId[0] : rawOrgId;
  const refresh = params.refresh;

  const [activeTab, setActiveTab] = useState<EventTabType>("Incoming");
  const [profileData, setProfileData] = useState<OrgProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

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
      console.log("[ProfileSTU] Fetching profile for orgId:", orgId);
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

  const fetchStudentId = async () => {
    try {
      const studentNumber = await AsyncStorage.getItem("student_number");
      if (!studentNumber) return null;
      const res = await fetch(`${BASE_URL}/api/student/id/${studentNumber}`);
      if (!res.ok) return null;
      const data = await res.json();
      setUserId(data._id);
      return data._id;
    } catch (e) {
      console.error("Error fetching student ID:", e);
      return null;
    }
  };

  const checkFollowStatus = async (currentUserId: string) => {
    try {
      if (!orgId || !currentUserId) return;
      const ids = await apiFetch(`/api/followed-orgs/${currentUserId}/ids`);
      setIsFollowing(Array.isArray(ids) ? ids.includes(orgId) : false);
    } catch (e) {
      console.error("Error checking follow status:", e);
    }
  };

  const handleFollowToggle = async () => {
    if (!userId || !orgId || followBusy) return;
    const next = !isFollowing;
    const action = next ? "follow" : "unfollow";
    try {
      setFollowBusy(true);
      setIsFollowing(next);
      await apiFetch(`/api/followed-orgs/${action}`, {
        method: "POST",
        body: JSON.stringify({ userId, organizationId: orgId }),
      });
    } catch (e) {
      // revert optimistic toggle
      setIsFollowing(!next);
      console.error("Follow toggle error:", e);
    } finally {
      setFollowBusy(false);
    }
  };

  useEffect(() => {
    if (orgId) fetchOrgProfile();
  }, [orgId, refresh]);

  useEffect(() => {
    const init = async () => {
      const id = await fetchStudentId();
      if (id) await checkFollowStatus(id);
    };
    init();
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
      <View
        style={[
          STYLES.container,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Text
          style={{
            color: "red",
            fontSize: 18,
            marginBottom: 10,
            textAlign: "center",
            fontFamily: "DMSans-Bold",
          }}
        >
          {error || "Organization data not available."}
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text
            style={{
              color: COLORS.primaryNavy,
              textDecorationLine: "underline",
              fontFamily: "DMSans-Medium",
            }}
          >
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

            <TouchableOpacity
              style={[
                localStyles.followBtn,
                isFollowing ? localStyles.followBtnActive : localStyles.followBtnInactive,
              ]}
              onPress={handleFollowToggle}
              activeOpacity={0.8}
              disabled={followBusy || !userId}
            >
              <Text
                style={[
                  localStyles.followText,
                  isFollowing ? localStyles.followTextActive : localStyles.followTextInactive,
                ]}
              >
                {followBusy ? "..." : isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[STYLES.orgTitle, localStyles.orgTitleTight]}>{org.org_name}</Text>

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
                Incoming
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
                Concluded
              </Text>
            </TouchableOpacity>
          </View>

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
                          ? { uri: event.event_image }
                          : "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
                      }
                      title={event.event_name}
                      orgLogo={org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/LogoImage.jpg")}
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
                  const { dateDay, dateMonth, orgDate } = formatDateForCard(event.event_date);
                  return (
                    <EventCard
                      key={event._id}
                      image={
                        event.event_image
                          ? { uri: event.event_image }
                          : "https://images.unsplash.com/photo-1529101091764-c3526daf38fe"
                      }
                      title={event.event_name}
                      orgLogo={org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/LogoImage.jpg")}
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
    fontFamily: "DMSans-Medium",
  },
});

const localStyles = StyleSheet.create({
  orgTitleTight: {
    fontSize: 18,
    marginBottom: 8,
  },
  followBtn: {
    marginTop: 60,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 110,
  },
  followBtnInactive: {
    backgroundColor: COLORS.primaryNavy,
  },
  followBtnActive: {
    backgroundColor: "#d3d3d3",
  },
  followText: {
    fontSize: 14,
    fontFamily: "DMSans-Bold",
  },
  followTextInactive: {
    color: COLORS.white,
  },
  followTextActive: {
    color: COLORS.textDark,
  },
});

