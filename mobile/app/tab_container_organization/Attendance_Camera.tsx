import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; 
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../config';

interface AttendanceCameraProps {
  onShowHistory: () => void;
  eventId?: string; // Optional: if not provided, can use DEFAULT_EVENT_ID
}

export default function AttendanceCamera({ onShowHistory, eventId }: AttendanceCameraProps) {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false); 
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for attendance registration
  const scannedRef = useRef(false);

  // -------------------------------
  // Uncomment this for testing without passing eventId
   const DEFAULT_EVENT_ID = "6923517772c7b61301a4e31f";
   if (!eventId) eventId = DEFAULT_EVENT_ID;
  // -------------------------------

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const toggleFlash = () => setIsTorchOn(prev => !prev);
  const toggleFlip = () => setIsFlipped(prev => !prev);

  const registerAttendance = async (studentNumber: string) => {
    try {
      if (!eventId) throw new Error("No eventId provided");

      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/attendance/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_number: studentNumber, event_id: eventId }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Attendance Registered',
          `${data.data.name}\nProgram: ${data.data.program || 'N/A'}\nTime: ${new Date(data.data.time_in).toLocaleTimeString()}`
        );
      } else {
        Alert.alert('Error', data.message || 'Unable to register attendance');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Unable to reach server');
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setScanned(true);

    try {
      const parts = data.trim().split(/\s+/);
      if (parts.length < 3) throw new Error('Invalid QR format');
      const program = parts.pop(); 
      const studentNumber = parts.pop(); 
      const name = parts.join(' '); 

      await registerAttendance(studentNumber);
    } catch (error) {
      Alert.alert('Invalid QR Code', 'The scanned QR code is not in the correct format.');
    } finally {
      setTimeout(() => {
        scannedRef.current = false;
        setScanned(false);
      }, 2000);
    }
  };

  if (!permission || !permission.granted) {
    return (
      <View style={styles.cameraContainer}>
        <Text style={styles.permissionText}>
          {permission ? 'No access to camera' : 'Requesting camera permission...'}
        </Text>
        {permission && (
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const flashIconName = isTorchOn ? 'flash' : 'flash-off';
  const flashIconColor = isTorchOn ? '#fde047' : '#fff';

  return (
    <View style={styles.cameraContainer}>
      <StatusBar barStyle="light-content" />
      <CameraView
        style={styles.camera}
        facing={isFlipped ? "front" : "back"}
        flash="off"
        enableTorch={isTorchOn}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        {/* Close Button */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Instruction */}
        <View style={styles.centerOverlay}>
          <Text style={styles.instructionText}>Position QR code within frame</Text>
        </View>

        {/* Scan Frame */}
        <View style={styles.frameContainer}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.successOverlay}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        )}

        {/* Bottom Menu */}
        <View style={styles.bottomMenu}>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: isTorchOn ? '#1e40af' : '#6366f1' }]} 
            onPress={toggleFlash}
            activeOpacity={0.8}
          >
            <Ionicons name={flashIconName as any} size={24} color={flashIconColor} />
            <Text style={styles.menuButtonText}>Flash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: isFlipped ? '#1e40af' : '#6366f1' }]} 
            onPress={toggleFlip}
            activeOpacity={0.8}
          >
            <Ionicons name={isFlipped ? "camera-reverse" : "camera"} size={24} color="#fff" />
            <Text style={styles.menuButtonText}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={onShowHistory}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={24} color="#fff" />
            <Text style={styles.menuButtonText}>Attendance Log</Text>
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
  bottomMenu: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(17, 24, 39, 0.95)', paddingVertical: 20, paddingHorizontal: 32, paddingBottom: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  menuButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366f1', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, gap: 8 },
  menuButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
