// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { BASE_URL } from '../../config';
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/page_admin_dashboard";
import LogoutModal from "../components/LogoutModal";
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header_Normal';

interface AdminData {
    firstname: string;
    lastname: string;
    email: string;
    profile_image?: string;
}

const AdminDashboard = () => {
    const router = useRouter();
    const [adminData, setAdminData] = useState<AdminData | null>(null);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const storedIdentifier = await AsyncStorage.getItem("student_number");
                if (!storedIdentifier) {
                    console.log("Identifier not found, cannot fetch profile.");
                    return;
                }

                const res = await fetch(`${BASE_URL}/api/auth/user-details/${storedIdentifier}`);
                
                if (!res.ok) {
                    console.error("Fetch user data failed:", res.status);
                    return;
                }
    
                const data = await res.json();
                
                if (data && data.firstname && data.lastname) {
                    setAdminData(data);
                }
            } catch (err) {
                console.error("Error fetching admin data:", err);
            }
        };
    
        fetchAdminData();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("userRole");
        await AsyncStorage.removeItem("student_number");
        setLogoutModalVisible(false);
        router.replace("/login");
    };

    return (
        <View style={styles.container}>
            <Header title="Admin Dashboard" />
            <View style={styles.contentDashboard}>
                <View style={styles.profileContainer}>
                    <Image
                        source={{ uri: adminData?.profile_image}}
                        style={styles.profileImage}
                        resizeMode="cover"
                    />
                    <Text style={styles.profileName}>
                        {adminData ? adminData.firstname : "Loading..."}
                    </Text>
                    <Text style={styles.profileTitle}>Administrator</Text>
                    <Text style={styles.profileEmail}>{adminData?.email ?? ""}</Text>
                </View>

                <View style={styles.adminContainer}>
                    <TouchableOpacity
                        style={styles.adminButton}
                        onPress={() => router.push("/tabs_admin/ManageEvents")}
                    >
                        <Ionicons name="calendar-outline" size={24} color="#0A0F51" />
                        <Text style={styles.adminText}>Events</Text>
                    </TouchableOpacity>
                </View>

                
                <View style={styles.adminContainer}>
                    <TouchableOpacity
                        style={styles.adminButton}
                        onPress={() => router.push("/tabs_admin/ManageOrganizations")}
                    >
                        <Ionicons name="briefcase-outline" size={24} color="#0A0F51" />
                        <Text style={styles.adminText}>Organizations</Text>
                    </TouchableOpacity>
                </View>

                
                <View style={styles.adminContainer}>
                    <TouchableOpacity
                        style={styles.adminButton}
                        onPress={() => router.push("/tabs_admin/ManageUsers")}
                    >
                        <Ionicons name="people-outline" size={24} color="#0A0F51" />
                        <Text style={styles.adminText}>Users</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.adminContainer}>
                    <TouchableOpacity
                        style={styles.adminButton}
                        onPress={() => router.push("/tab_container/Profile_ChangePassword")}
                    >
                        <Ionicons name="key-outline" size={24} color="#0A0F51" />
                        <Text style={styles.adminText}>Change Password</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.adminContainer}>
                    <TouchableOpacity
                        style={styles.adminButton}
                        onPress={() => setLogoutModalVisible(true)}
                    >
                        <Ionicons name="log-out" size={24} color="red" />
                        <Text style={styles.organizationsText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <LogoutModal
                visible={logoutModalVisible}
                onClose={() => setLogoutModalVisible(false)}
                onConfirm={handleLogout}
            />
        </View>
    );
};
export default AdminDashboard;