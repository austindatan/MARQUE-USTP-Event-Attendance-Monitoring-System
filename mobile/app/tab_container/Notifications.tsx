// @ts-nocheck
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header_Normal";
import styles from "../styles/components_bookmark";
import { useRouter } from "expo-router";
import NotificationCard from "../components/Card_Notification";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, CLOUD_NAME } from "../../config";

const fixCloudinaryUrl = (url, cloudName) => {
    if (!url || url.startsWith("http")) {
        return url;
    }
    const path = url.replace(/ /g, "%20");
    if (path.includes(cloudName)) {
        return `https://${path}`;
    }
    return `https://res.cloudinary.com/${cloudName}/image/upload/${path}`;
};


const Notifications = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        const userId = await AsyncStorage.getItem("user_id");
        if (!userId) return;

        try {
            const res = await axios.get(`${BASE_URL}/api/notifications/${userId}`);
            setNotifications(res.data);
        } catch (err) {
            console.log("❌ Error loading notifications:", err);
        }
    };
    
    useEffect(() => {
        loadNotifications();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadNotifications().then(() => setRefreshing(false));
    }, []);

    const handleEventPress = (eventId) => {
        router.push({ 
            pathname: '../tab_container/EventDetails_Unified', 
            params: { eventId }
        });
    }

    const formatMessage = (notification) => {
        const { notification_type, event_id, message } = notification;
        const eventDate = moment(event_id.event_date);
        const now = moment();
        
        switch (notification_type) {
            case 'event_reminder':
                return `Event is ${eventDate.fromNow()}.`;
            case 'attendance_recorded':
                return message;
            case 'event_concluded':
                return `Event has concluded.`;
            case 'new_event':
                return `New event from ${event_id.organization_id.org_name || 'an organization'}.`;
            default:
                return message;
        }
    }

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ paddingHorizontal: 20, paddingTop: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={18} color="#0A0F51" />
                    <Text style={styles.backText}>Notifications</Text>
                </TouchableOpacity>

                {notifications.map((n) => {
                    if (!n.event_id) {
                        return null; 
                    }
                    
                    const event = n.event_id;
                    const organization = event.organization_id;

                    const eventImageUri = event.event_image
                        ? fixCloudinaryUrl(event.event_image, CLOUD_NAME)
                        : (event.event_images && event.event_images.length > 0
                            ? fixCloudinaryUrl(event.event_images[0], CLOUD_NAME)
                            : null);

                    const orgLogoUri = organization?.pfp
                        ? fixCloudinaryUrl(organization.pfp, CLOUD_NAME)
                        : null;

                    const orgName = organization?.org_name || organization?.name || "Organization";

                    return (
                        <NotificationCard
                            key={n._id}
                            id={event._id}
                            title={event.event_name}
                            image={eventImageUri ? { uri: eventImageUri } : require("../../assets/images/marque/crtcg1.png")}
                            orgLogo={orgLogoUri ? { uri: orgLogoUri } : require("../../assets/images/marque/crk.jpg")}
                            organization={orgName}
                            message={formatMessage(n)}
                            notification_type={n.notification_type}
                            onPress={() => handleEventPress(event._id)}
                        />
                    );
                })}

                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
};

export default Notifications;
