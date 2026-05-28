import React, { createContext, useState, useEffect, useRef, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { BASE_URL, CLOUD_NAME } from '../../config';
import joinModalStyles from '../styles/components_joinmodal';

const getOptimizedImageUrl = (url: string | undefined | null) => {
  if (!url) return '';
  let processedUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const path = url.replace(/ /g, '%20');
    processedUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${path}`;
  }
  if (processedUrl.includes('res.cloudinary.com') && processedUrl.includes('/upload/')) {
    return processedUrl.replace('/upload/', '/upload/c_fill,w_400,h_250,q_auto,f_auto/');
  }
  return processedUrl;
};

interface NotificationContextType {
  hasUnread: boolean;
  setHasUnread: (unread: boolean) => void;
  triggerUnreadCheck: () => Promise<void>;
  addSocketListener: (callback: (msg: any) => void) => () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [hasUnread, setHasUnread] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);
  const [modalData, setModalData] = useState<{
    eventName: string;
    eventId: string;
    eventImage: string;
    timeIn: string;
    message: string;
  } | null>(null);

  // Registry of component-level listeners that subscribe to raw WS messages
  const listenersRef = useRef<Set<(msg: any) => void>>(new Set());

  const addSocketListener = (callback: (msg: any) => void) => {
    listenersRef.current.add(callback);
    // Return unsubscribe function
    return () => listenersRef.current.delete(callback);
  };

  const socketRef = useRef<WebSocket | null>(null);

  const getWsUrl = () => {
    if (!BASE_URL) return '';
    return BASE_URL.replace(/^http/, 'ws');
  };

  const showModal = (data: any) => {
    setModalData({
      eventName: data.eventName || "",
      eventId: data.eventId || "",
      eventImage: data.eventImage || "",
      timeIn: data.timeIn || "",
      message: data.message || "",
    });
    setModalVisible(true);
  };

  const formatTime = (timeInString: any) => {
    if (!timeInString) return "";
    const date = new Date(timeInString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const checkUnread = useCallback(async (studentNumber: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/notifications/${studentNumber}`);
      if (!response.ok) return;
      const notifications = await response.json();
      const unreadExists = notifications.some((notif: any) => !notif.is_read);
      setHasUnread(unreadExists);
    } catch (err) {
      console.error('[NotificationProvider] Error checking unread:', err);
    }
  }, []);

  const triggerUnreadCheck = useCallback(async () => {
    const studentNumber = await AsyncStorage.getItem('student_number');
    if (studentNumber) {
      await checkUnread(studentNumber);
    }
  }, [checkUnread]);

  const connectSocket = useCallback(async () => {
    const studentNumber = await AsyncStorage.getItem('student_number');
    const token = await AsyncStorage.getItem('token');
    if (!studentNumber || !token) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    // Check initial status
    checkUnread(studentNumber);

    if (socketRef.current) {
      // If already connected/connecting, don't re-create
      if (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN) {
        return;
      }
      socketRef.current.close();
    }

    const wsUrl = `${getWsUrl()}/ws?studentNumber=${studentNumber}&token=${token}`;
    console.log('[WebSocketClient] Connecting to:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WebSocketClient] Connected successfully to server');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Fan-out to all registered component listeners first
          listenersRef.current.forEach(cb => cb(data));

          if (data.type === 'TOKEN_EXPIRED') {
            console.log('[WebSocketClient] Token expired, logging out...');
            if (socketRef.current) {
              socketRef.current.close();
              socketRef.current = null;
            }
            setSessionExpiredVisible(true);
            return;
          }

          if (data.type === 'ATTENDANCE_CONFIRMED') {
            // Trigger Haptics
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Show dynamic modal dialog
            showModal(data);

            // Instantly update badge state
            setHasUnread(true);
          }
        } catch (err) {
          console.error('[WebSocketClient] Error parsing message data:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WebSocketClient] Connection closed. Retrying in 5s...');
        socketRef.current = null;
        setTimeout(() => {
          connectSocket();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('[WebSocketClient] Error:', error);
      };

      socketRef.current = ws;
    } catch (err) {
      console.error('[WebSocketClient] Exception when connecting:', err);
    }
  }, [checkUnread]);

  useEffect(() => {
    connectSocket();

    // Poller to check if login occurred or token was removed
    const interval = setInterval(async () => {
      const studentNumber = await AsyncStorage.getItem('student_number');
      if (studentNumber && !socketRef.current) {
        connectSocket();
      } else if (!studentNumber && socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectSocket]);

  return (
    <NotificationContext.Provider value={{ hasUnread, setHasUnread, triggerUnreadCheck, addSocketListener }}>
      {children}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={modalStyles.modalBox} onStartShouldSetResponder={() => true}>
            {/* Close Button X in the top right */}
            <TouchableOpacity
              style={modalStyles.closeIconButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            {/* Icon Container with Event Image */}
            <View style={modalStyles.iconContainer}>
              {modalData?.eventImage ? (
                <Image
                  source={{ uri: getOptimizedImageUrl(modalData.eventImage) }}
                  style={modalStyles.iconImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../../assets/images/marque/MARQUE_singlelogo.png')}
                  style={modalStyles.iconImage}
                  resizeMode="contain"
                />
              )}
            </View>

            <Text style={modalStyles.title}>Attendance Confirmed!</Text>
            <Text style={modalStyles.eventName}>{modalData?.eventName}</Text>

            {modalData?.timeIn ? (
              <View style={modalStyles.timeRow}>
                <Ionicons name="time-outline" size={16} color="#0A0F51" style={{ marginRight: 4 }} />
                <Text style={modalStyles.timeText}>
                  Time In: {formatTime(modalData.timeIn)}
                </Text>
              </View>
            ) : null}

            {/* Action button to view details */}
            <TouchableOpacity
              style={modalStyles.detailsButton}
              activeOpacity={0.7}
              onPress={() => {
                setModalVisible(false);
                if (modalData?.eventId) {
                  router.push({
                    pathname: '/tab_container/EventDetails_Unified',
                    params: { eventId: modalData.eventId }
                  });
                }
              }}
            >
              <Text style={modalStyles.detailsButtonText}>View Event Details</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Session Expired Modal */}
      <Modal
        visible={sessionExpiredVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSessionExpiredVisible(false)}
      >
        <TouchableOpacity
          style={joinModalStyles.overlay}
          onPress={() => setSessionExpiredVisible(false)}
          activeOpacity={1}
        >
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image
                source={require('../../assets/images/marque/MARQUE_whitelogo.png')}
                style={joinModalStyles.iconImage}
              />
            </View>

            <Text style={joinModalStyles.title}>Session Expired</Text>
            <Text style={joinModalStyles.desc}>Please log in again to continue.</Text>

            <View style={{ marginTop: 20, width: "100%" }}>
              <TouchableOpacity
                style={{
                  backgroundColor: "#0a0f51",
                  paddingVertical: 12,
                  borderRadius: 25,
                  alignItems: "center",
                }}
                onPress={async () => {
                  setSessionExpiredVisible(false);
                  await AsyncStorage.clear();
                  router.replace("/login");
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>
                  Go to Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 99999,
    backgroundColor: '#0A0F51',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#FECB20',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
    backgroundColor: 'rgba(254, 203, 32, 0.15)',
    borderRadius: 22,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  bannerTitle: {
    color: '#FECB20',
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    marginBottom: 2,
  },
  bannerMessage: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 320,
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    alignItems: "center",
    position: "relative",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  closeIconButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  iconContainer: {
    backgroundColor: "#14235b",
    width: 280,
    height: 160,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  iconImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    marginTop: 10,
    fontSize: 20,
    color: "#0A0F51",
    textAlign: "center",
    fontFamily: "DMSans-Bold",
    marginBottom: 5,
  },
  eventName: {
    fontSize: 16,
    color: "#222",
    textAlign: "center",
    fontFamily: "DMSans-Bold",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 15, 81, 0.08)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 14,
    color: "#0A0F51",
    fontFamily: "DMSans-Bold",
  },
  desc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "DMSans-Regular",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  detailsButton: {
    backgroundColor: "#FECB20",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  detailsButtonText: {
    color: "#0A0F51",
    fontSize: 16,
    fontFamily: "DMSans-Bold",
  },
});
