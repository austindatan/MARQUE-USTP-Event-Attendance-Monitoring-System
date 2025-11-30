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

// --- COLORS DEFINITION ---
const COLORS = {
  primaryDark: '#013C7B', 
  white: '#FFFFFF',
  textDark: '#333333',
  inputBackground: '#FFFFFF',
  placeholderText: '#A9A9A9',
  cameraIconBg: '#d9d9d9',
  saveButtonBg: '#eaedff', 
  saveButtonText: '#5669ff', 
  border: '#DDDDDD',
  requiredAsterisk: '#FF0000',
  socialSmallText: '#EAEAEA',
};

// --- ASSETS ---
const PLACEHOLDER_ASSETS = {
  bannerUri: require("../../assets/images/marque/CoverPage.png"),
  logoUri: require("../../assets/images/marque/LogoImage.jpg"),
};

// --- STYLES ---
const STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    height: 200, 
  },
  headerImageBackground: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1, 
    width: '100%',
    paddingTop: StatusBar.currentHeight + 10,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 60,
  },
  navRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bannerCameraIcon: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    backgroundColor: COLORS.cameraIconBg,
    borderRadius: 50,
    padding: 8,
  },
  saveButton: {
    position: 'absolute',
    top: StatusBar.currentHeight - 10,
    right: 20,
    backgroundColor: COLORS.saveButtonBg,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 10,

    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  saveButtonText: {
    color: COLORS.saveButtonText,
    fontWeight: 'bold',
    fontSize: 14,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 40, 
    backgroundColor: COLORS.white,
  },
  logoWrapper: {
    position: 'absolute',
    left: 20,
    top: -60,
    zIndex: 5, 
    width: 120,
    height: 120,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
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
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 10,
    marginTop: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
    marginTop: 15,
  },
  requiredAsterisk: {
    color: COLORS.requiredAsterisk,
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
    height: 120, 
    textAlignVertical: 'top',
  },
});

// --- COMPONENT ---
const EditProfile = () => {
  const router = useRouter();

  // Form State
  const [orgName, setOrgName] = useState('Society of Information Technology Enthusiasts');
  const [description, setDescription] = useState(
    'SITE empowers future IT professionals through innovation, leadership, and collaboration. We are the official student organization of BSIT students at USTP, driven by passion for tech, committed to building a vibrant, skill-driven, inclusive IT community.'
  );
  const [facebookLink, setFacebookLink] = useState('https://www.facebook.com/username');
  const [instagramLink, setInstagramLink] = useState('https://www.instagram.com/username');

  // Image State
  const [bannerUri, setBannerUri] = useState(PLACEHOLDER_ASSETS.bannerUri);
  const [logoUri, setLogoUri] = useState(PLACEHOLDER_ASSETS.logoUri);

  const handleImagePick = async (setImageFunction: Function) => {
    Alert.alert("Image Upload", "Prompted to select an image. Implement 'expo-image-picker' for full functionality.");
  };

  const handleSave = () => {
    if (!orgName || !description) {
      Alert.alert('Error', 'Organization Name and Description are required.');
      return;
    }

    console.log('Profile Data Saved:', { orgName, description, facebookLink, instagramLink, bannerUri, logoUri });

    Alert.alert('Success', 'Organization profile updated successfully!', [
      { text: 'OK', onPress: () => router.replace("/ProfilePage") }
    ]);
  };

  return (
    <View style={STYLES.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Banner Section */}
        <View style={STYLES.headerContainer}>
          <ImageBackground
            source={bannerUri}
            style={STYLES.headerImageBackground}
            imageStyle={{ opacity: 1 }}
          >
            <View style={STYLES.bannerOverlay}>
              <View style={STYLES.bannerContent}>
                <View style={STYLES.navRow}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => router.back()}
                  >
                    <Icon name="arrow-back" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                  <View style={{ width: 60 }} />
                </View>
              </View>
            </View>

            {/* Banner Upload Icon */}
            <TouchableOpacity
              style={STYLES.bannerCameraIcon}
              onPress={() => handleImagePick(setBannerUri)}
            >
              <Image
                source={require("../../assets/images/marque/Camera1.png")}
                style={{ width: 24, height: 24, resizeMode: 'contain' }}
              />
            </TouchableOpacity>
          </ImageBackground>
        </View>

        {/* Form Section */}
        <View style={STYLES.contentContainer}>

          {/* Logo */}
          <View style={STYLES.logoWrapper}>
            <TouchableOpacity
                style={STYLES.logoContainer}
                onPress={() => handleImagePick(setLogoUri)}
            >
              <Image source={logoUri} style={STYLES.logoImage} />
              <View style={STYLES.logoCameraOverlay}>
                <Image
                  source={require("../../assets/images/marque/Camera1.png")}
                  style={{ width: 30, height: 30, resizeMode: 'contain' }}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Organization Info */}
          <Text style={STYLES.sectionHeader}>Organization Information</Text>

          {/* Save Button */}
          <TouchableOpacity
            style={STYLES.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={STYLES.saveButtonText}>SAVE</Text>
          </TouchableOpacity>

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

          <Text style={STYLES.sectionHeader}>Social Media Links</Text>

          <Text style={STYLES.label}>Facebook</Text>
          <TextInput
            style={STYLES.textInput}
            value={facebookLink}
            onChangeText={setFacebookLink}
            placeholder="https://www.facebook.com/username"
            placeholderTextColor={COLORS.placeholderText}
          />

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