// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, ScrollView, TouchableOpacity, StatusBar, StyleSheet, TextInput, Alert, } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from "../styles/page_eventdetails";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../config";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";
import EditProfileModal from "../components/EditProfileModal";
import { apiFetchForm } from "../../utils/apiFetch";

const EditProfile = () => {
  const router = useRouter();
  const { orgId } = useLocalSearchParams();
  const STICKY_HEADER_HEIGHT = 90;

  const [orgName, setOrgName] = useState('');
  const [description, setDescription] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [bannerUri, setBannerUri] = useState(PLACEHOLDER_ASSETS.bannerUri);
  const [logoUri, setLogoUri] = useState(PLACEHOLDER_ASSETS.logoUri);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/organizations/profile/${orgId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const org = data.organization;

        setOrgName(org.org_name);
        setDescription(org.description);
        setFacebookLink(org.fb_link || "");
        setInstagramLink(org.ig_link || "");
        setBannerUri(org.cover_photo ? { uri: org.cover_photo } : PLACEHOLDER_ASSETS.bannerUri);
        setLogoUri(org.pfp ? { uri: org.pfp } : PLACEHOLDER_ASSETS.logoUri);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    if (orgId) loadProfile();
  }, [orgId]);

  const handleImagePick = async (setImageFunction, aspectRatio = [4, 3]) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: aspectRatio,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageFunction({ uri: result.assets[0].uri, local: true });
    }
  };

  const handleSave = async () => {
    if (!orgName || !description) {
      Alert.alert('Error', 'Organization Name and Description are required.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append("org_name", orgName);
      formData.append("description", description);
      formData.append("fb_link", facebookLink);
      formData.append("ig_link", instagramLink);

      if (logoUri.local) {
        formData.append("pfp", {
          uri: logoUri.uri,
          name: `logo_${Date.now()}.png`,
          type: "image/png",
        });
      }

      if (bannerUri.local) {
        formData.append("cover_photo", {
          uri: bannerUri.uri,
          name: `banner_${Date.now()}.png`,
          type: "image/png",
        });
      }

      await apiFetchForm("PUT", `/api/organizations/${orgId}`, formData);

      console.log("Data updates successfully.");

      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        router.push({
          pathname: "../tab_container_organization/Profile",
          params: { orgId, refresh: Date.now().toString() }
        });
      }, 2000);

    } catch (err) {
      console.error("Error updating org:", err);
      Alert.alert("Error", "Failed to update organization.");
    }
  };

  return (
    <View style={STYLES.container}>
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
        
        <View style={STYLES.headerContainer}>
          <ImageBackground source={bannerUri} style={STYLES.headerImageBackground}>
            <View style={STYLES.bannerOverlay}>
              <View style={STYLES.bannerContent}>
                <View style={STYLES.navRow}>
                  <View style={{ width: 60 }} />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={STYLES.bannerCameraIcon}
              onPress={() => handleImagePick(setBannerUri)}
            >
              <Image source={require("../../assets/images/marque/Camera1.png")}
                style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View style={STYLES.contentContainer}>
          
          <View style={STYLES.logoWrapper}>
            <TouchableOpacity
              style={STYLES.logoContainer}
              onPress={() => handleImagePick(setLogoUri, [1, 1])}
            >
              <Image source={logoUri} style={STYLES.logoImage} />
              <View style={STYLES.logoCameraOverlay}>
                <Image
                  source={require("../../assets/images/marque/Camera1.png")}
                  style={{ width: 30, height: 30 }}
                />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={STYLES.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={STYLES.saveButtonText}>SAVE</Text>
          </TouchableOpacity>

          <Text style={STYLES.sectionHeader}>Organization Information</Text>

          <Text style={STYLES.label}>
            Organization Name<Text style={STYLES.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={STYLES.textInput}
            value={orgName}
            onChangeText={setOrgName}
            placeholder="Enter Organization Name"
            placeholderTextColor={COLORS.placeholderText}
          />

          <Text style={STYLES.label}>
            Description<Text style={STYLES.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={[STYLES.textInput, STYLES.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter a description for your organization"
            placeholderTextColor={COLORS.placeholderText}
            multiline
          />

          <Text style={STYLES.sectionHeaderSOC}>Social Media Links</Text>

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
          />

        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <EditProfileModal
        visible={showModal}
        title="Profile Updated!"
        message="Your organization profile has been successfully updated."
        onClose={() => setShowModal(false)}
      />

    </View>
  );
};

export default EditProfile;

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

const PLACEHOLDER_ASSETS = {
  bannerUri: require("../../assets/images/marque/CoverPage.png"),
  logoUri: require("../../assets/images/marque/LogoImage.jpg"),
};

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
    fontSize: 14,
    fontFamily: "DMSans-Bold",
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
    color: COLORS.textDark,
    marginTop: 40,
    fontFamily: "DMSans-Bold",
  },

  sectionHeaderSOC: {
    fontSize: 20,
    color: COLORS.textDark,
    marginTop: 20,
    fontFamily: "DMSans-Bold",
  },

  label: {
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 8,
    marginTop: 15,
    fontFamily: "DMSans-Bold",
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