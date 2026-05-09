import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, Image,
  SafeAreaView, Dimensions, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const QrCodePlaceholder = require('../../assets/images/marque/QRCode.png');
const MARQUELogo = require('../../assets/images/marque/MARQUE_whitelogo.png');

const Scanner: React.FC = () => {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    loadAttendanceCount();
  }, []);

  const loadAttendanceCount = async () => {
    try {
      const saved = await AsyncStorage.getItem('attendanceLog');
      if (saved) setAttendanceCount(JSON.parse(saved).length);
    } catch (error) {
      console.error('Error loading attendance count:', error);
    }
  };

  const handleOpenCamera = () => {
    router.push({
      pathname: '/tab_container_organization/Camera_State',
      params: { eventId },
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F51" />

      <LinearGradient
        colors={['#0A0F51', '#1a2580', '#0A0F51']}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Back ── */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* ── Logo + Title ── */}
      <View style={styles.brandRow}>
        <Image source={MARQUELogo} style={styles.brandLogo} />
        <Text style={styles.brandText}>MARQUE</Text>
      </View>

      {/* ── QR Illustration ── */}
      <View style={styles.qrWrapper}>
        <View style={styles.qrGlow}>
          <Image source={QrCodePlaceholder} style={styles.qrImage} resizeMode="contain" />
        </View>
      </View>

      {/* ── Label ── */}
      <Text style={styles.title}>Attendance Scanner</Text>
      <Text style={styles.subtitle}>
        Scan the participant's QR code clearly{'\n'}under good lighting to record attendance.
      </Text>

      {/* ── Stats pill ── */}
      {attendanceCount > 0 && (
        <View style={styles.statsPill}>
          <Ionicons name="checkmark-circle" size={16} color="#FFD100" />
          <Text style={styles.statsText}>{attendanceCount} scanned this session</Text>
        </View>
      )}

      {/* ── Scan button ── */}
      <TouchableOpacity style={styles.scanBtn} onPress={handleOpenCamera} activeOpacity={0.85}>
        <Ionicons name="qr-code" size={20} color="#0A0F51" style={{ marginRight: 8 }} />
        <Text style={styles.scanBtnText}>OPEN SCANNER</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0F51',
    alignItems: 'center',
  },

  backBtn: {
    position: 'absolute',
    top: 54,
    left: 20,
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 10,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    gap: 10,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  brandText: {
    color: '#FFD100',
    fontSize: 22,
    fontFamily: 'DMSans-Bold',
    letterSpacing: 3,
  },

  qrWrapper: {
    marginTop: height * 0.07,
    marginBottom: height * 0.05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrGlow: {
    width: width * 0.58,
    height: width * 0.58,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: '75%',
    height: '75%',
  },

  title: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 30,
  },

  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 18,
  },
  statsText: {
    color: '#FFD100',
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
  },

  scanBtn: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD100',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#FFD100',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  scanBtnText: {
    color: '#0A0F51',
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    letterSpacing: 1,
  },
});

export default Scanner;