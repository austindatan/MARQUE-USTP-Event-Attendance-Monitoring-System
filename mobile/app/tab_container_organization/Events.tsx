// Events.tsx (Backend integration applied)
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  AspectRatio,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import { BASE_URL, CLOUD_NAME } from "../../config";

// Import the floating Scanner button
import ScannerButton from '../components/ScannerButton'; // Adjust path if needed

// --- Custom Header Component ---
const CustomHeader: React.FC<{ event: any }> = ({ event }) => (
  <View style={styles.headerImageContainer}>
    <Image
      source={event.event_image ? { uri: event.event_image } : require('../../assets/images/marque/Appetite.png')}
      style={styles.headerImage}
      resizeMode="cover"
    />
    <View style={styles.headerOverlay} />
    <View style={styles.headerNav}>
      <TouchableOpacity style={styles.backButton}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Event Details</Text>
    </View>
  </View>
);

// --- Info Row Component ---
interface InfoRowProps {
  iconSource: any;
  primaryText: string;
  secondaryText: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  iconSource,
  primaryText,
  secondaryText,
}) => (
  <View style={styles.infoRow}>
    <View style={styles.iconBox}>
      <Image source={iconSource} style={styles.iconImage} resizeMode="contain" />
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={styles.primaryInfoText}>{primaryText}</Text>
      <Text style={styles.secondaryInfoText}>{secondaryText}</Text>
    </View>
  </View>
);

// --- Main Component ---
const Events: React.FC = () => {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const [event, setEvent] = useState<any>(null);

  // Load DM Sans fonts
  const [fontsLoaded] = useFonts({
    'DMSans-Regular': require('../../assets/fonts/DMSans_18pt-Medium.ttf'),
    'DMSans-Bold': require('../../assets/fonts/DMSans_24pt-Regular.ttf'),
  });

  // --- Fetch event from backend ---
  const fetchEventDetails = async () => {
    if (!eventId) return;

    try {
      const res = await fetch(`${BASE_URL}/events/event/${eventId}`);
      const data = await res.json();

      const eventObj = data.event || data;

      // FIX Cloudinary URLs for single image
      if (eventObj.event_image && !eventObj.event_image.startsWith("http")) {
        eventObj.event_image = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${eventObj.event_image.replace(/ /g, "%20")}`;
      }

      // FIX Cloudinary URLs for multiple images
      if (Array.isArray(eventObj.event_images)) {
        eventObj.event_images = eventObj.event_images.map((img) => {
          if (!img) return null;
          if (img.startsWith("http")) return img;
          return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${img.replace(/ /g, "%20")}`;
        });
      }

      setEvent(eventObj);
    } catch (err) {
      console.error("Error fetching event:", err);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  if (!fontsLoaded || !event) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollViewContent}
      >
        <CustomHeader event={event} />

        <View style={styles.content}>
          <Text style={styles.eventTitle}>{event.event_name}</Text>

          {/* Date & Time Row */}
          <InfoRow
            iconSource={require('../../assets/images/marque/Calendar.png')}
            primaryText={new Date(event.event_date).toLocaleDateString()}
            secondaryText={`${new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          />

          {/* Location Row */}
          <InfoRow
            iconSource={require('../../assets/images/marque/Location.png')}
            primaryText={event.venue}
            secondaryText={event.venue_details || ""}
          />

          {/* Buttons Row */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Image
                source={require('../../assets/images/marque/Download.png')}
                style={styles.buttonIconImage}
                resizeMode="contain"
              />
              <Text style={styles.actionButtonText}>
                Analytics{'\n'}Reports
              </Text>
            </TouchableOpacity>

            <View style={{ width: 10 }} />

            <TouchableOpacity style={styles.actionButton}>
              <Image
                source={require('../../assets/images/marque/Download.png')}
                style={styles.buttonIconImage}
                resizeMode="contain"
              />
              <Text style={styles.actionButtonText}>
                Attendance{'\n'}Spreadsheets
              </Text>
            </TouchableOpacity>
          </View>

          {/* About Event */}
          <Text style={styles.sectionHeader}>About Event</Text>
          <Text style={styles.aboutText}>{event.description}</Text>

          {/* Organizer Row */}
          <View style={styles.organizerRow}>
            <View style={styles.organizerLogoContainer}>
              <Image
                source={event.organization_id?.pfp ? { uri: event.organization_id.pfp } : require('../../assets/images/marque/LogoImage.jpg')}
                style={styles.organizerLogoImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.organizerTextContainer}>
              <Text style={styles.organizerName} numberOfLines={1}>
                {event.organization_id?.org_name}
              </Text>
              <Text style={styles.organizerRole}>Organizers</Text>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Fixed Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.editEventButton}
          onPress={() => router.push('/tab_container_organization/EditEvents')}
        >
          <Text style={styles.editEventText}>Edit Event</Text>
          <MaterialCommunityIcons
            name="send"
            size={20}
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      {/* ---- FLOATING SCANNER BUTTON ---- */}
      <ScannerButton
        onPress={() => router.push({
        pathname: '/tab_container_organization/Scanner',
        params: { eventId } // this comes from useLocalSearchParams()
      })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  scrollViewContent: { paddingBottom: 0 },

  // Header
  headerImageContainer: { 
  width: '100%',
  aspectRatio: 16 / 9, // <-- makes it responsive like EditProfile banner
  overflow: 'hidden',  // optional: crop overflow
  borderRadius: 12,    // optional: rounded corners
},
headerImage: { 
  width: '100%', 
  height: '100%' 
},
headerOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.3)',
},
headerNav: {
  position: 'absolute',
  left: 10,
  right: 20,
  flexDirection: 'row',
  alignItems: 'center',
},
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '200',
    color: '#fff',
    marginLeft: 2,
    fontFamily: 'DMSans-Bold',
  },

  // Content
  content: { paddingHorizontal: 20, paddingTop: 20 },
  eventTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    fontFamily: 'DMSans-Bold',
  },

  // Info Rows
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#F0F0F0',
  },
  iconImage: { width: 24, height: 24 },
  infoTextContainer: { justifyContent: 'center' },
  primaryInfoText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'DMSans-Bold',
  },
  secondaryInfoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontFamily: 'DMSans-Regular',
  },

  // Buttons
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginBottom: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d3d3d3',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flex: 1,
    justifyContent: 'flex-start',
    minHeight: 48,
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'DMSans-Bold',
    textAlign: 'left',
    lineHeight: 14,
  },
  buttonIconImage: { width: 25, height: 25 },

  // About
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
    marginTop: 5,
    fontFamily: 'DMSans-Bold',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    marginBottom: 5,
    fontFamily: 'DMSans-Regular',
  },

  // Organizer
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  organizerLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerLogoImage: { width: '100%', height: '100%' },
  organizerTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  organizerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'DMSans-Bold',
  },
  organizerRole: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    fontFamily: 'DMSans-Regular',
  },
  followButton: {
    backgroundColor: '#E5E6FE',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6466F1',
    fontFamily: 'DMSans-Bold',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8,
  },
  editEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC83F',
    paddingVertical: 15,
    borderRadius: 18,
    width: '100%',
    minHeight: 55,
  },
  editEventText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'DMSans-Bold',
  },
});

export default Events;