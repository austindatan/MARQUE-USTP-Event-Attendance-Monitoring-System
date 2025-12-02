import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const QrCodePlaceholder = require('../../assets/images/marque/QRCode.png');
const BackgroundImage = require('../../assets/images/marque/BlueBackground.png');

const Scanner: React.FC = () => {
  const router = useRouter();
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    loadAttendanceCount();
  }, []);

  const loadAttendanceCount = async () => {
    try {
      const saved = await AsyncStorage.getItem('attendanceLog');
      if (saved) {
        const log = JSON.parse(saved);
        setAttendanceCount(log.length);
      }
    } catch (error) {
      console.error('Error loading attendance count:', error);
    }
  };

  const handleOpenCamera = () => {
    router.push('/tab_container_organization/Camera_State');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={BackgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>

          {/* Back Button */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* QR Code */}
          <View style={styles.qrCodeContainer}>
            <Image
              source={QrCodePlaceholder}
              style={styles.qrCodeImage}
              resizeMode="contain"
            />
          </View>

          {/* Instructions */}
          <Text style={styles.instructionText}>
            Scan the participant's QR code{'\n'}clearly under good lighting{'\n'}to record attendance accurately.
          </Text>

          {/* Open Camera / Scan Button */}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleOpenCamera}
          >
            <Text style={styles.scanButtonText}>SCAN</Text>
          </TouchableOpacity>

        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E2B5A',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 10,
    marginLeft: 15,
    marginTop: 10,
  },
  qrCodeContainer: {
    width: width * 0.7,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50,
  },
  qrCodeImage: {
    width: '80%',
    height: '80%',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20, // reduced for smaller gap between lines
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 30,
    fontWeight: 'bold', // bold text
  },
  scanButton: {
    backgroundColor: '#FFC837',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: width * 0.5,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  statsContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  statsText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default Scanner;