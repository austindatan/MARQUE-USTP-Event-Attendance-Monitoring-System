import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AttendanceCameraProps {
  onClose: () => void;
  onShowHistory: () => void;
}

export default function AttendanceCamera({ onClose, onShowHistory }: AttendanceCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const scannedRef = useRef(false); // prevents multiple triggers

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (scannedRef.current) return; // ignore duplicate scans
    scannedRef.current = true;
    setScanned(true);

    try {
      // parse QR code (split by spaces)
      const parts = data.trim().split(/\s+/);
      if (parts.length < 3) throw new Error('Invalid QR format');

      const program = parts.pop();      // last part is program
      const studentId = parts.pop();    // second last part is studentId
      const name = parts.join(' ');     // rest is name
      const parsedData = { name, studentId, program };

      // save attendance
      const newRecord = { ...parsedData, timestamp: new Date().toISOString() };
      const saved = await AsyncStorage.getItem('attendanceLog');
      const log = saved ? JSON.parse(saved) : [];
      await AsyncStorage.setItem('attendanceLog', JSON.stringify([newRecord, ...log]));

      Alert.alert('Scan Successful', `${parsedData.name} attendance recorded`);
    } catch (error) {
      Alert.alert(
        'Invalid QR Code',
        'The scanned QR code is not in the correct format.\nIt must contain: name, studentId, program.'
      );
    } finally {
      // Reset after 2 seconds to allow next scan
      setTimeout(() => {
        scannedRef.current = false;
        setScanned(false);
      }, 2000);
    }
  };

  if (!permission) {
    return (
      <View style={styles.cameraContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.cameraContainer}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <StatusBar barStyle="light-content" />
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        {/* Top Close Button */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Center Instructions */}
        <View style={styles.centerOverlay}>
          <Text style={styles.instructionText}>Position QR code within frame</Text>
        </View>

        {/* Scanning Frame */}
        <View style={styles.frameContainer}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Success Indicator */}
        {scanned && (
          <View style={styles.successOverlay}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            </View>
          </View>
        )}

        {/* Bottom Menu Bar - Attendance Log Button */}
        <View style={styles.bottomMenu}>
          <TouchableOpacity
            style={styles.attendanceLogButton}
            onPress={onShowHistory}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={24} color="#fff" />
            <Text style={styles.attendanceLogText}>Attendance Log</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1, width: '100%' },
  permissionText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  permissionButton: { backgroundColor: '#6366f1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 50, paddingHorizontal: 20, zIndex: 10 },
  closeButton: { alignSelf: 'flex-start', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 25, padding: 8 },
  centerOverlay: { position: 'absolute', top: 120, left: 0, right: 0, alignItems: 'center' },
  instructionText: { color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20 },
  frameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.5)', borderRadius: 20, position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#6366f1' },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 20 },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 20 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 20 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 20 },
  successOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(16, 185, 129, 0.5)', justifyContent: 'center', alignItems: 'center' },
  successCircle: { backgroundColor: '#fff', borderRadius: 50, padding: 24 },
  bottomMenu: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(17, 24, 39, 0.95)', paddingVertical: 20, paddingHorizontal: 32, paddingBottom: 40, alignItems: 'center' },
  attendanceLogButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366f1', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, gap: 12 },
  attendanceLogText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
