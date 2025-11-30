import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function OrgEventDetails() {
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
    router.push("/tab_container_organization/Camera_State");
  };

  return (
    <View style={styles.homeContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>PAUGNAT</Text>
          <Text style={styles.subtitle}>Scan QR codes to record attendance</Text>
        </View>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleOpenCamera}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.cameraButtonText}>Open Camera to Scan QR</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Total Scans: {attendanceCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  cameraButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  cameraButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statsContainer: { marginTop: 24, alignItems: 'center' },
  statsText: { fontSize: 14, color: '#6b7280' },
});
