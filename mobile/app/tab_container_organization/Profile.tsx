// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ImageBackground, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { BASE_URL } from "../../config";

// Styles
import { STYLES, COLORS } from '../styles/component_org_page';

// IMPORT YOUR EVENT CARD
import EventCard from "../components/Card_Event";

type EventTabType = 'Incoming' | 'Concluded';

// Interface definitions (for reference)
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
    date: string; // Event date (e.g., ISO string)
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
  const { orgId } = useLocalSearchParams(); 
  const [activeTab, setActiveTab] = useState<EventTabType>('Incoming');
  const [profileData, setProfileData] = useState<OrgProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); 

  // Helper function to format the date
  const formatDateForCard = (dateString: string) => {
    const date = new Date(dateString);
    // Fallback for invalid dates
    if (isNaN(date.getTime())) {
        return { dateDay: '-', dateMonth: '---', orgDate: 'Invalid Date' };
    }
    return {
        dateDay: date.getDate().toString(),
        dateMonth: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        orgDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
  };

  useEffect(() => {
    // Ensure orgId is present before fetching
    if (!orgId || typeof orgId !== 'string') {
      setError("No valid organization ID provided.");
      setLoading(false);
      return;
    }

    const fetchOrgProfile = async () => {
      setLoading(true);
      try {
        // Calls the backend route: GET /api/organizations/profile/:orgId
        const response = await axios.get(`${BASE_URL}/api/organizations/profile/${orgId}`);
        setProfileData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching organization profile:", err);
        setError("Failed to load organization profile. Ensure API and ID are valid.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrgProfile();
  }, [orgId]);

  if (loading) {
    return (
        <View style={[STYLES.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={COLORS.primaryNavy} />
        </View>
    );
  }

  if (error || !profileData) {
    return (
        <View style={[STYLES.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
            <Text style={{ color: 'red', fontSize: 18, marginBottom: 10, textAlign: 'center' }}>{error || "Organization data not available."}</Text>
            <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ color: COLORS.primaryNavy, textDecorationLine: 'underline' }}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
  }
  
  const org = profileData.organization;
  const incomingEvents = profileData.events.incoming;
  const concludedEvents = profileData.events.concluded;


  return (
    <View style={STYLES.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {/* ⭐️ FIXED: The stray space/character was removed here. */}
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* Header */}
        <View style={STYLES.headerContainer}>
          <ImageBackground 
            source={org.cover_photo ? { uri: org.cover_photo } : require("../../assets/images/marque/CoverPage.png")}
            style={STYLES.headerImageBackground}
            imageStyle={{ opacity: 1 }}
          >
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
              style={STYLES.bannerGradient}
            />

            {/* Navigation Row */}
            <View style={STYLES.navRow}>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => router.back()}
              >
                <Icon name="arrow-back" size={24} color={COLORS.white} />
                <Text style={STYLES.navText}>{org.org_name}</Text>
              </TouchableOpacity>
              
              <MaterialCommunityIcons name="molecule" size={30} color="rgba(255,255,255,0.5)" />
            </View>
          </ImageBackground>
        </View>

        {/* Body */}
        <View style={STYLES.profileSectionContainer}>
          
          {/* Logo Row */}
          <View style={STYLES.logoRow}>
            <View style={STYLES.logoContainer}>
              <Image 
                source={org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/LogoImage.jpg")}
                style={STYLES.logoImage}
              />
            </View>

            {/* Edit Button */}
            <TouchableOpacity 
              style={STYLES.editButton}
              onPress={() => router.push("../tab_container_organization/EditProfile")}
              activeOpacity={0.7}
            >
              <Icon name="pencil" size={20} color={COLORS.primaryNavy} />
            </TouchableOpacity>
          </View>

          {/* Organization Name */}
          <Text style={STYLES.orgTitle}>
            {org.org_name}
          </Text>

          {/* Social Row (Dynamic) */}
          <View style={STYLES.socialRow}>
            {org.fb_link && (
                <TouchableOpacity style={STYLES.socialIcon} onPress={() => {/* Open URL logic */}}>
                    <Icon name="logo-facebook" size={22} color={COLORS.primaryNavy} />
                </TouchableOpacity>
            )}
            {org.ig_link && (
                <TouchableOpacity style={STYLES.socialIcon} onPress={() => {/* Open URL logic */}}>
                    <Icon name="logo-instagram" size={22} color={COLORS.primaryNavy} />
                </TouchableOpacity>
            )}
            {org.x_link && (
                <TouchableOpacity style={STYLES.socialIcon} onPress={() => {/* Open URL logic */}}>
                    <Icon name="close" size={22} color={COLORS.primaryNavy} />
                </TouchableOpacity>
            )}
          </View>

          {/* About */}
          <Text style={STYLES.sectionHeader}>About Organization</Text>
          <Text style={STYLES.aboutText}>
            {org.description}
          </Text>

          {/* Events Header */}
          <Text style={STYLES.eventsTitle}>EVENTS</Text>
          <View style={STYLES.divider} />

          {/* Tabs */}
          <View style={tabStyles.tabWrapper}>
            <TouchableOpacity
              style={[
                tabStyles.singleTab,
                activeTab === 'Incoming' ? tabStyles.activeTab : tabStyles.inactiveTab
              ]}
              onPress={() => setActiveTab('Incoming')}
            >
              <Text
                style={[
                  tabStyles.tabText,
                  activeTab === 'Incoming' ? tabStyles.activeTabText : tabStyles.inactiveTabText
                ]}
              >
                Incoming ({incomingEvents.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                tabStyles.singleTab,
                activeTab === 'Concluded' ? tabStyles.activeTab : tabStyles.inactiveTab
              ]}
              onPress={() => setActiveTab('Concluded')}
            >
              <Text
                style={[
                  tabStyles.tabText,
                  activeTab === 'Concluded' ? tabStyles.activeTabText : tabStyles.inactiveTabText
                ]}
              >
                Concluded ({concludedEvents.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Events List */}
          {activeTab === 'Incoming' && (
            <View>
                {incomingEvents.length > 0 ? (
                    incomingEvents.map((event) => {
                        const { dateDay, dateMonth, orgDate } = formatDateForCard(event.date);
                        return (
                            <EventCard
                                key={event._id}
                                image={event.image_url ? { uri: event.image_url } : "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"} 
                                title={event.title}
                                orgLogo={org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/LogoImage.jpg")}
                                organization={org.org_name}
                                orgDate={orgDate}
                                dateDay={dateDay}
                                dateMonth={dateMonth}
                                description={event.description}
                                onPress={() => console.log("Open Incoming Event", event._id)}
                            />
                        );
                    })
                ) : (
                    <Text style={tabStyles.noEventsText}>No upcoming events found.</Text>
                )}
            </View>
          )}

          {activeTab === 'Concluded' && (
            <View>
                {concludedEvents.length > 0 ? (
                    concludedEvents.map((event) => {
                        const { dateDay, dateMonth, orgDate } = formatDateForCard(event.date);
                        return (
                            <EventCard
                                key={event._id}
                                image={event.image_url ? { uri: event.image_url } : "https://images.unsplash.com/photo-1529101091764-c3526daf38fe"} 
                                title={event.title}
                                orgLogo={org.pfp ? { uri: org.pfp } : require("../../assets/images/marque/LogoImage.jpg")}
                                organization={org.org_name}
                                orgDate={orgDate}
                                dateDay={dateDay}
                                dateMonth={dateMonth}
                                description={event.description}
                                onPress={() => console.log("Open Concluded Event", event._id)}
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


/* ---------------- LOCAL TAB STYLES ---------------- */
const tabStyles = StyleSheet.create({
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  singleTab: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  activeTab: {
    backgroundColor: COLORS.primaryNavy,
  },
  inactiveTab: {
    backgroundColor: '#d3d3d3',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.white,
  },
  inactiveTabText: {
    color: COLORS.textDark,
  },
});