// @ts-nocheck
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ImageBackground, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Styles
import { STYLES, COLORS } from '../styles/component_org_page';

// IMPORT YOUR EVENT CARD
import EventCard from "../components/Card_Event";

type EventTabType = 'Incoming' | 'Concluded';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<EventTabType>('Incoming');
  const router = useRouter(); 

  return (
    <View style={STYLES.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* Header */}
        <View style={STYLES.headerContainer}>
          <ImageBackground 
            source={require("../../assets/images/marque/CoverPage.png")}
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
                <Text style={STYLES.navText}>Your Organization</Text>
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
                source={require("../../assets/images/marque/LogoImage.jpg")}
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
            Society of Information Technology Enthusiasts
          </Text>

          {/* Social Row */}
          <View style={STYLES.socialRow}>
            <TouchableOpacity style={STYLES.socialIcon}>
              <Icon name="logo-facebook" size={22} color={COLORS.primaryNavy} />
            </TouchableOpacity>
            <TouchableOpacity style={STYLES.socialIcon}>
              <Icon name="logo-instagram" size={22} color={COLORS.primaryNavy} />
            </TouchableOpacity>
            <TouchableOpacity style={STYLES.socialIcon}>
              <Icon name="close" size={22} color={COLORS.primaryNavy} />
            </TouchableOpacity>
          </View>

          {/* About */}
          <Text style={STYLES.sectionHeader}>About Organization</Text>
          <Text style={STYLES.aboutText}>
            SITE empowers future IT professionals through innovation, leadership, and collaboration. 
            We are the official student organization of BSIT students at USTP, driven by passion for tech, 
            committed to building a vibrant, skill-driven, inclusive IT community.
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
                Incoming
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
                Concluded
              </Text>
            </TouchableOpacity>
          </View>

          {/* Events List */}
          {activeTab === 'Incoming' && (
            <View>
              <EventCard
                image="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
                title="Tech Summit 2025"
                orgLogo={require("../../assets/images/marque/LogoImage.jpg")}
                organization="SITE Organization"
                orgDate="January 2025"
                dateDay="17"
                dateMonth="OCT"
                description="A gathering of innovators, developers, and tech-driven students."
                onPress={() => console.log("Open Incoming Event 1")}
              />
              <EventCard
                image="https://images.unsplash.com/photo-1525182008055-f88b95ff7980"
                title="Coding Bootcamp"
                orgLogo={require("../../assets/images/marque/LogoImage.jpg")}
                organization="SITE Organization"
                orgDate="February 2025"
                dateDay="22"
                dateMonth="NOV"
                description="Hands-on workshop focusing on React, Java, and UX design."
                onPress={() => console.log("Open Incoming Event 2")}
              />
            </View>
          )}

          {activeTab === 'Concluded' && (
            <View>
              <EventCard
                image="https://images.unsplash.com/photo-1529101091764-c3526daf38fe"
                title="USTP Welcome Orientation"
                orgLogo={require("../../assets/images/marque/LogoImage.jpg")}
                organization="SITE Organization"
                orgDate="August 2024"
                dateDay="01"
                dateMonth="SEP"
                description="Orientation event that welcomed IT students to USTP."
                onPress={() => console.log("Open Concluded Event 1")}
              />
              <EventCard
                image="https://images.unsplash.com/photo-1506784983877-45594efa4cbe"
                title="Hackathon 2024"
                orgLogo={require("../../assets/images/marque/LogoImage.jpg")}
                organization="SITE Organization"
                orgDate="August 2024"
                dateDay="09"
                dateMonth="AUG"
                description="24-hour coding challenge focused on solving real-life problems."
                onPress={() => console.log("Open Concluded Event 2")}
              />
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