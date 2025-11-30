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
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
// import * as ImagePicker from 'expo-image-picker'; // You'll need to install this for actual photo selection

/*
  NOTE: Since your STYLES and COLORS objects were not provided,
  I've created placeholders below based on the image design.
  You should replace these with the actual imports from '../styles/component_org_page'
  and ensure the colors match your theme for an exact replication.
*/

// --- PLACEHOLDER STYLES AND COLORS (REPLACE WITH YOUR ACTUAL IMPORTS) ---
const COLORS = {
  primaryNavy: '#002C6F', // A dark blue color based on the SITE logo in the image
  white: '#FFFFFF',
  textDark: '#333333',
  inputBackground: '#F5F5F5',
  placeholderText: '#A9A9A9',
  cameraIconBg: 'rgba(0,0,0,0.4)',
  saveButtonBg: '#8A2BE2', // A vibrant color for the save button, or match your theme
  // Using a soft pink/red for the status bar and header background opacity from the image
  overlay: 'rgba(100, 0, 0, 0.4)',
  border: '#DDDDDD',
};

const STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    height: 250, // Height of the banner image area
  },
  headerImageBackground: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: StatusBar.currentHeight,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  navText: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 10,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay, // Use the overlay color for the dark/blurry effect
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cameraIcon: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    backgroundColor: COLORS.cameraIconBg,
    borderRadius: 20,
    padding: 8,
  },
  // Main Content Section
  contentContainer: {
    padding: 20,
    marginTop: -50, // Pulls the content up over the banner
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  // Profile Picture Row
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: -80, // Position the logo over the banner and content boundary
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoCameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  saveButton: {
    backgroundColor: COLORS.saveButtonBg, // Use your desired save button color
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: -20, // Align with the profile picture section
    height: 40,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Form Fields
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 15,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 5,
    marginTop: 15,
  },
  requiredAsterisk: {
    color: 'red',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.textDark,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
// -------------------------------------------------------------

const EditProfile = () => {
  const router = useRouter();
  // State for form fields
  const [orgName, setOrgName] = useState('Society of Information Technology Enthusiasts');
  const [description, setDescription] = useState(
    'SITE empowers future IT professionals through innovation, leadership, and collaboration. We are the official student organization of BSIT students at USTP, driven by passion for tech, committed to building a vibrant, skill-driven, inclusive IT community.'
  );
  const [facebookLink, setFacebookLink] = useState('https://www.facebook.com/username');
  const [instagramLink, setInstagramLink] = useState('https://www.instagram.com/username');
  
  // State for image URIs (using local paths as placeholders)
  const [bannerUri, setBannerUri] = useState(require("../../assets/images/marque/CoverPage.png"));
  const [logoUri, setLogoUri] = useState(require("../../assets/images/marque/LogoImage.jpg"));

  /**
   * Placeholder function for image selection (Banner or Logo)
   * You'll need to install and configure 'expo-image-picker' to make this functional.
   */
  const handleImagePick = async (setImageFunction: Function) => {
    /*
      // Uncomment and use this block when you install expo-image-picker
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant access to your photo library to select an image.');
        return;
      }
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: setImageFunction === setBannerUri ? [16, 9] : [1, 1], // Different aspects for banner vs logo
        quality: 1,
      });

      if (!result.canceled) {
        setImageFunction({ uri: result.assets[0].uri });
      }
    */
    Alert.alert("Image Upload", "Prompted to select an image. Implement 'expo-image-picker' for full functionality.");
    // Placeholder logic to simulate change:
    // setImageFunction({ uri: 'new_image_uri_placeholder' });
  };


  /**
   * Function to handle saving the profile and navigating back to Profile.tsx
   */
  const handleSave = () => {
    // 1. Perform client-side validation (e.g., check for required fields)
    if (!orgName || !description) {
      Alert.alert('Error', 'Organization Name and Description are required.');
      return;
    }

    // 2. Perform the actual update logic (API call to backend would go here)
    // In a real application, you would send:
    // { orgName, description, facebookLink, instagramLink, bannerUri, logoUri }
    
    console.log('Profile Data Saved:', { orgName, description, facebookLink, instagramLink, bannerUri, logoUri });

    // 3. Show success message
    Alert.alert('Success', 'Organization profile updated successfully!', [
      // 4. Redirect to the Profile.tsx page
      { text: 'OK', onPress: () => router.replace("/ProfilePage") } // Use replace to prevent going back to edit page via back button
    ]);
  };

  return (
    <View style={STYLES.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header/Banner Section */}
        <View style={STYLES.headerContainer}>
          <ImageBackground
            source={bannerUri} // Use state variable for image source
            style={STYLES.headerImageBackground}
            imageStyle={{ opacity: 1 }}
          >
            {/* The colored overlay with text */}
            <View style={STYLES.bannerOverlay}>
              {/* Top Navigation/Header Bar */}
              <View style={STYLES.navRow}>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => router.back()}
                >
                  <Icon name="arrow-back" size={24} color={COLORS.white} />
                  {/* Note: In the image the title is "ORGANIZER-DEPARTMENT-EDIT" but based on the context, "Your Organization" or similar might be better for the back action */}
                  <Text style={STYLES.navText}>ORGANIZER-DEPARTMENT-EDIT</Text>
                </TouchableOpacity>

                {/* Placeholder for the other icon (like MaterialCommunityIcons name="molecule") is omitted for replication but can be added here */}
                <TouchableOpacity 
                    style={STYLES.saveButton}
                    onPress={handleSave} // Navigate back to Profile.tsx on save
                    activeOpacity={0.8}
                >
                    <Text style={STYLES.saveButtonText}>SAVE</Text>
                </TouchableOpacity>

              </View>
            </View>

            {/* Camera Icon for Banner */}
            <TouchableOpacity 
              style={STYLES.cameraIcon}
              onPress={() => handleImagePick(setBannerUri)}
            >
              <Icon name="camera" size={24} color={COLORS.white} />
            </TouchableOpacity>

          </ImageBackground>
        </View>

        {/* Body/Form Section */}
        <View style={STYLES.contentContainer}>

          {/* Logo/Save Row */}
          <View style={STYLES.logoRow}>
            <View style={STYLES.logoContainer}>
              <Image
                source={logoUri} // Use state variable for image source
                style={STYLES.logoImage}
              />
              {/* Camera Icon Overlay for Logo */}
              <TouchableOpacity
                style={STYLES.logoCameraOverlay}
                onPress={() => handleImagePick(setLogoUri)}
              >
                <Icon name="camera" size={30} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* The Save button is already in the header to replicate the image layout exactly */}
          </View>

          {/* Organization Information */}
          <Text style={STYLES.sectionHeader}>Organization Information</Text>

          {/* Organization Name Field */}
          <Text style={STYLES.label}>
            Organization Name
            <Text style={STYLES.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={STYLES.textInput}
            value={orgName}
            onChangeText={setOrgName}
            placeholder="Enter Organization Name"
            placeholderTextColor={COLORS.placeholderText}
          />

          {/* Description Field */}
          <Text style={STYLES.label}>
            Description
            <Text style={STYLES.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[STYLES.textInput, STYLES.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter a description for your organization"
            placeholderTextColor={COLORS.placeholderText}
            multiline
          />

          {/* Social Media Links */}
          <Text style={STYLES.sectionHeader}>Social Media Links</Text>

          {/* Facebook Link Field */}
          <Text style={STYLES.label}>Facebook</Text>
          <TextInput
            style={STYLES.textInput}
            value={facebookLink}
            onChangeText={setFacebookLink}
            placeholder="https://www.facebook.com/username"
            placeholderTextColor={COLORS.placeholderText}
          />

          {/* Instagram Link Field */}
          <Text style={STYLES.label}>Instagram</Text>
          <TextInput
            style={STYLES.textInput}
            value={instagramLink}
            onChangeText={setInstagramLink}
            placeholder="https://www.instagram.com/username"
            placeholderTextColor={COLORS.placeholderText}
            marginBottom={30}
          />

        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfile;