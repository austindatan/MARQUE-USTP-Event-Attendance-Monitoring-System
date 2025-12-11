// @ts-nocheck
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../config';

export const useUnreadNotifications = () => {
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const checkUnreadNotifications = async () => {
            try {
                const studentNumber = await AsyncStorage.getItem('student_number');
                if (!studentNumber) return;

                const response = await fetch(`${BASE_URL}/api/notifications/${studentNumber}`);
                if (!response.ok) return;

                const notifications = await response.json();
                const unreadExists = notifications.some((notif) => !notif.is_read);
                setHasUnread(unreadExists);
            } catch (error) {
                console.error('Error checking unread notifications:', error);
            }
        };

        checkUnreadNotifications();

        // Poll every 30 seconds for new notifications
        const interval = setInterval(checkUnreadNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    return hasUnread;
};
