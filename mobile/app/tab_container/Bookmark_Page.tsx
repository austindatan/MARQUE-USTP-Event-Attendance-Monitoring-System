// @ts-nocheck
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header_Normal";
import styles from "../styles/components_bookmark";
import { useRouter } from "expo-router";
import BookmarkCard from "../components/Card_Bookmark";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL, CLOUD_NAME } from "../../config"; // ⭐️ MODIFIED: Added CLOUD_NAME import

// ⭐️ ADDED: Utility function to convert raw Cloudinary path to full URL
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


const Bookmark = () => {
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState([]);

    useEffect(() => {
        loadBookmarks();
    }, []);

    const loadBookmarks = async () => {
        const student_number = await AsyncStorage.getItem("student_number");
        if (!student_number) return;

        try {
            const res = await axios.get(`${BASE_URL}/api/bookmarks/${student_number}`);
            setBookmarks(res.data);
        } catch (err) {
            console.log("❌ Error loading bookmarks:", err);
        }
    };

    const removeBookmark = async (event_id) => {
        const student_number = await AsyncStorage.getItem("student_number");

        try {
            await axios.delete(
                `${BASE_URL}/api/bookmarks/${student_number}/${event_id}`
            );
            loadBookmarks(); // Refresh list
        } catch (err) {
            console.log("❌ Error removing bookmark:", err);
        }
    };

    const handleEventPress = (eventId) => {
        router.push({ 
            pathname: '../tab_container_organization/Events', 
            params: { eventId }
        });
    }

    return (
        <View style={styles.container}>
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ paddingHorizontal: 20, paddingTop: 20 }}
            >
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={18} color="#0A0F51" />
                    <Text style={styles.backText}>Bookmarks</Text>
                </TouchableOpacity>

                {bookmarks.map((b) => {
                    // ⭐️ FIX: Null check to prevent crash if event_id is null/deleted
                    if (!b.event_id) {
                        return null; 
                    }
                    
                    const event = b.event_id;
                    const organization = event.organization_id;

                    // Event Image Logic (using event_image from Events.tsx logic)
                    const eventImageUri = event.event_image
                        ? fixCloudinaryUrl(event.event_image, CLOUD_NAME)
                        : (event.event_images && event.event_images.length > 0
                            ? fixCloudinaryUrl(event.event_images[0], CLOUD_NAME)
                            : null);

                    // ⭐️ MODIFIED: Organization Logo/PFP Logic
                    const orgLogoUri = organization?.pfp
                        ? fixCloudinaryUrl(organization.pfp, CLOUD_NAME)
                        : null;

                    // ⭐️ MODIFIED: Determine organization name (assuming 'org_name' from Events.tsx)
                    const orgName = organization?.org_name || organization?.name || "Organization";

                    return (
                        <BookmarkCard
                            key={b._id}
                            id={event._id}
                            title={event.event_name}
                            // Apply image URI or fallback to a local asset
                            image={eventImageUri ? { uri: eventImageUri } : require("../../assets/images/marque/crtcg1.png")}
                            // Apply organization logo URI or fallback
                            orgLogo={orgLogoUri ? { uri: orgLogoUri } : require("../../assets/images/marque/crk.jpg")}
                            // Use the determined organization name
                            organization={orgName}
                            dateDay={
                                new Date(event.event_date).getDate().toString()
                            }
                            dateMonth={new Date(event.event_date).toLocaleString(
                                "en-US",
                                { month: "short" }
                            )}
                            orgDate={new Date(event.event_date).toDateString()}
                            onPress={() => handleEventPress(event._id)}
                            onRemove={() => removeBookmark(event._id)}
                        />
                    );
                })}

                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
};

export default Bookmark;