import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Modal, Image, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../config';
import { apiFetch } from '../../utils/apiFetch';
import joinModalStyles from '../styles/components_joinmodal';

const ICON_PLACEHOLDER_PATH = require('../../assets/images/marque/Flip.png');

const PRIMARY_COLOR = '#0a0f4c';
const SECONDARY_COLOR = '#fecb20';
const QR_SIZE = 250;

interface AttendanceCameraProps {
  onShowHistory: () => void;
  eventId: string;
}

const Attendance_Camera: React.FC<AttendanceCameraProps> = ({ onShowHistory, eventId }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannedRef = useRef(false);

  // Modal state
  const [modal, setModal] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ visible: false, type: 'success', title: '', message: '' });

  const showModal = (type: 'success' | 'error', title: string, message: string) =>
    setModal({ visible: true, type, title, message });
  const closeModal = () => setModal(m => ({ ...m, visible: false }));

  useEffect(() => {
    if (!eventId) showModal('error', 'No Event', 'No event selected. Please go back and try again.');
  }, [eventId]);

  const scanAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const moveAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: QR_SIZE, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2000, easing: Easing.linear, useNativeDriver: true }),
      ])
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 1000, easing: Easing.linear, useNativeDriver: true }),
      ])
    );

    moveAnimation.start();
    glowAnimation.start();
  }, []);

  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
  }, [permission]);

  const toggleFlash = () => setIsTorchOn(prev => !prev);
  const toggleFlip = () => setIsFlipped(prev => !prev);

  const registerAttendance = async (studentNumber: string) => {
  if (!eventId) return;
  try {
    setLoading(true);
    const data = await apiFetch('/api/attendance/register', {
      method: 'POST',
      body: JSON.stringify({ student_number: studentNumber, event_id: eventId }),
    });
    showModal(
      'success',
      'Attendance Registered!',
      `${data.data.name}\nProgram: ${data.data.program || 'N/A'}\nTime In: ${new Date(data.data.time_in).toLocaleTimeString()}`
    );
  } catch (err: any) {
    showModal('error', 'Registration Failed', err?.message || 'Unable to register attendance.');
  } finally {
    setLoading(false);
  }
};


  const handleBarCodeScanned = async ({ data }: any) => {
  if (scannedRef.current) return;
  scannedRef.current = true;
  setScanned(true);

  try {
    const parts = data.trim().split(/\s+/);
    if (parts.length < 3) throw new Error('Invalid QR format. Please scan a valid student QR code.');
    const program = parts.pop();
    const studentNumber = parts.pop();
    const name = parts.join(' ');

    setLoading(true);
    const result = await apiFetch('/api/attendance/register', {
      method: 'POST',
      body: JSON.stringify({ student_number: studentNumber, event_id: eventId }),
    });
    showModal(
      'success',
      'Attendance Registered!',
      `${result.data.name}\nProgram: ${result.data.program || 'N/A'}\nTime In: ${new Date(result.data.time_in).toLocaleTimeString()}`
    );
  } catch (err: any) {
    showModal('error', 'Scan Failed', err?.message || 'Unable to register attendance.');
  } finally {
    setTimeout(() => {
      scannedRef.current = false;
      setScanned(false);
      setLoading(false);
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Branded Result Modal ── */}
      <Modal visible={modal.visible} transparent animationType="fade" onRequestClose={closeModal}>
        <TouchableOpacity style={joinModalStyles.overlay} activeOpacity={1} onPress={closeModal}>
          <View style={joinModalStyles.modalBox}>
            <View style={[
              joinModalStyles.iconContainer,
              { backgroundColor: modal.type === 'success' ? '#0A0F51' : '#c0392b' }
            ]}>
              <Image
                source={require('../../assets/images/marque/MARQUE_whitelogo.png')}
                style={joinModalStyles.iconImage}
              />
            </View>
            <Text style={[
              joinModalStyles.title,
              { color: modal.type === 'success' ? '#0A0F51' : '#c0392b' }
            ]}>
              {modal.title}
            </Text>
            <Text style={joinModalStyles.desc}>{modal.message}</Text>
            <TouchableOpacity
              onPress={closeModal}
              style={{
                marginTop: 20,
                backgroundColor: modal.type === 'success' ? '#0A0F51' : '#c0392b',
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 40,
              }}
            >
              <Text style={{ color: '#fff', fontFamily: 'DMSans-Bold', fontSize: 15 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <CameraView
        style={StyleSheet.absoluteFill}
        facing={isFlipped ? 'front' : 'back'}
        flash="off"
        enableTorch={isTorchOn}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={[styles.topOverlay, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Image source={require('../../assets/images/marque/arrow-left.png')} style={styles.bottomIconImage} />
          </TouchableOpacity>
        </View>

        <View style={styles.scannerArea}>
          <View style={styles.scannerFocus}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              <Animated.View
                style={[
                  styles.scannerLine,
                  {
                    transform: [{ translateY: scanAnim }],
                    opacity: glowAnim,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.successOverlay}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        )}

        <View style={[styles.bottomBar, { bottom: (insets.bottom ? insets.bottom : 20) + 20 }]}>
          <View style={styles.leftIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
              <Image source={require('../../assets/images/marque/Flash.png')} style={styles.bottomIconImage} />
              <Text style={styles.iconText}>Flash</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={toggleFlip}>
              <Image source={ICON_PLACEHOLDER_PATH} style={styles.bottomIconImage} />
              <Text style={styles.iconText}>Flip</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
              <Image source={require('../../assets/images/marque/Settings.png')} style={styles.bottomIconImage} />
              <Text style={styles.iconText}>Setting</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={onShowHistory}>
              <Image source={require('../../assets/images/marque/History.png')} style={styles.bottomIconImage} />
              <Text style={styles.iconText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.centerButton} onPress={() => {}}>
          <Image source={require('../../assets/images/marque/QRCode.png')} style={styles.centerIconImage} />
        </TouchableOpacity>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'DMSans-Regular',
  },
  permissionButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginTop: 10,
  },
  scannerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFocus: {
    width: QR_SIZE,
    height: QR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: QR_SIZE,
    height: QR_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFF',
    borderWidth: 5,
    borderRadius: 2,
    zIndex: 1,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 5,
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 100,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 100,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: '40%',
  },
  iconText: {
    color: '#FFF',
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'DMSans-Medium',
  },
  centerButton: {
    position: 'absolute',
    bottom: 80,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: SECONDARY_COLOR,
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 20,
  },
  bottomIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  centerIconImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  scannerLine: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 3,
    backgroundColor: '#fecb20',
    borderRadius: 3,
    shadowColor: '#fecb20',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 30,
    zIndex: 0,
  },
});

export default Attendance_Camera;