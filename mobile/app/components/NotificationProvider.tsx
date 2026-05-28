import React, { createContext, useState, useEffect, useRef, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../config';

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
  const [bannerVisible, setBannerVisible] = useState(false);

  // Registry of component-level listeners that subscribe to raw WS messages
  const listenersRef = useRef<Set<(msg: any) => void>>(new Set());

  const addSocketListener = (callback: (msg: any) => void) => {
    listenersRef.current.add(callback);
    // Return unsubscribe function
    return () => listenersRef.current.delete(callback);
  };
  const [bannerMessage, setBannerMessage] = useState('');
  
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const socketRef = useRef<WebSocket | null>(null);

  const getWsUrl = () => {
    if (!BASE_URL) return '';
    return BASE_URL.replace(/^http/, 'ws');
  };

  const showBanner = (message: string) => {
    setBannerMessage(message);
    setBannerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 50, // Down below the status bar area
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 4.5 seconds
    const timer = setTimeout(() => {
      hideBanner();
    }, 4500);

    return timer;
  };

  const hideBanner = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setBannerVisible(false);
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
    if (!studentNumber) {
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

    const wsUrl = `${getWsUrl()}/ws?studentNumber=${studentNumber}`;
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

          if (data.type === 'ATTENDANCE_CONFIRMED') {
            // Trigger Haptics
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Show custom sliding banner
            showBanner(data.message || `You have been marked Present for ${data.eventName}`);

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
      {bannerVisible && (
        <Animated.View
          style={[
            styles.bannerContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity
            style={styles.bannerContent}
            activeOpacity={0.9}
            onPress={() => {
              hideBanner();
              router.push('/tab_container/Notifications');
            }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={24} color="#FECB20" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.bannerTitle}>Attendance Confirmed 🔔</Text>
              <Text style={styles.bannerMessage} numberOfLines={2}>
                {bannerMessage}
              </Text>
            </View>
            <TouchableOpacity onPress={hideBanner} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
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
