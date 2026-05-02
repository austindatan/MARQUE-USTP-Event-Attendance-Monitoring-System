// @ts-nocheck
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, Animated, ActivityIndicator, Alert, RefreshControl } from "react-native";
import OrgLinear from "../components/Card_OrgsLinear";
import Card_BlankOrg from "../components/Card_BlankOrg";
import appeffects from "../styles/effects_app";
import { BASE_URL } from "../../config";
import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

const Orgs = ({ scrollY, handleScroll, initialScroll = 0 }) => {
    const router = useRouter();
    const scrollRef = useRef(null);
    const [organizations, setOrganizations] = useState([]);
    const [followedOrgIds, setFollowedOrgIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const getOptimizedUrl = (url) => {
        if (!url || typeof url !== 'string') return url;
        if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
            return url.replace('/upload/', '/upload/w_200,q_auto,f_auto/');
        }
        return url;
    };

    const fetchOrganizations = async () => {
        try {
            const res = await fetch(`${BASE_URL}/exploreorgs/all`);
            const data = await res.json();
            setOrganizations(data);
        } catch (err) {
            console.log("Error fetching organizations:", err);
            setOrganizations([]);
        }
    };

    const fetchStudentId = async () => {
        try {
            const studentNumber = await AsyncStorage.getItem("student_number");
            if (!studentNumber) return null;

            const res = await fetch(`${BASE_URL}/api/student/id/${studentNumber}`);
            if (!res.ok) return null;

            const data = await res.json();
            setUserId(data._id); // Assuming backend returns Student Object with ._id
            return data._id;
        } catch (error) {
            console.error("Error fetching student ID:", error);
            return null;
        }
    };

    const fetchFollowedIds = async (currentUserId) => {
        if (!currentUserId) return;

        try {
            const res = await fetch(
                `${BASE_URL}/api/followed-orgs/${currentUserId}/ids`
            );
            const data = await res.json();
            setFollowedOrgIds(data);
        } catch (err) {
            console.log("Error fetching followed IDs:", err);
            setFollowedOrgIds([]);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const id = await fetchStudentId();
            const promises = [fetchOrganizations()];
            if (id) promises.push(fetchFollowedIds(id));

            await Promise.all(promises);
            setIsLoading(false);
        };

        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        const id = await fetchStudentId();
        const promises = [fetchOrganizations()];
        if (id) promises.push(fetchFollowedIds(id));
        await Promise.all(promises);
        setRefreshing(false);
    };

    const handleFollowToggle = async (orgId, isCurrentlyFollowed) => {
        if (!userId) {
            Alert.alert("Authentication Required", "Please log in to follow organizations.");
            return;
        }

        const action = isCurrentlyFollowed ? "unfollow" : "follow";

        try {
            const res = await fetch(`${BASE_URL}/api/followed-orgs/${action}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    organizationId: orgId,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Failed to ${action} organization`);
            }

            if (isCurrentlyFollowed) {
                setFollowedOrgIds((prev) => prev.filter((id) => id !== orgId));
            } else {
                setFollowedOrgIds((prev) => [...prev, orgId]);
            }
        } catch (error) {
            console.error("Follow/Unfollow error:", error);
            Alert.alert("Error", error.message);
        }
    };

    const handleOrgPress = (orgId) => {
        router.push({
            pathname: "../tab_container_organization/ProfileSTU",
            params: { orgId: orgId },
        });
    };

    useEffect(() => {
        if (scrollRef.current && initialScroll > 0) {
            const t = setTimeout(() => {
                const node = scrollRef.current?.getNode ? scrollRef.current.getNode() : scrollRef.current;
                node?.scrollTo?.({ y: initialScroll, animated: false });
            }, 0);

            return () => clearTimeout(t);
        }
    }, [initialScroll]);

    const containerTranslateY = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [0, -40],
        extrapolate: "clamp",
    });

    const renderOrganizations = () => {
        if (isLoading) {
            return (
                <View style={{ flex: 1 }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Card_BlankOrg key={`skeleton-orgs-${i}`} />
                    ))}
                </View>
            );
        }

        if (organizations.length === 0) {
            return (
                <View style={{ flex: 1, paddingTop: 50, alignItems: "center" }}>
                    <Text style={appeffects.pageSubtitle}>No organizations found.</Text>
                </View>
            );
        }

        return organizations.map((org) => {
            const isFollowed = followedOrgIds.includes(org._id);

            return (
                <OrgLinear
                    key={org._id}
                    organization={org.org_name}
                    orgLogo={{ uri: getOptimizedUrl(org.pfp) }}
                    text={org.description}
                    isFollowed={isFollowed}
                    onToggleFollow={() => handleFollowToggle(org._id, isFollowed)}
                    onPress={() => handleOrgPress(org._id)}
                />
            );
        });
    };

    return (
        <Animated.View
            style={{
                flex: 1,
                backgroundColor: "transparent",
                transform: [{ translateY: containerTranslateY }],
            }}
        >
            <Animated.ScrollView
                ref={scrollRef}
                style={{
                    flex: 1,
                    marginTop: -120,
                    backgroundColor: "transparent",
                }}
                contentContainerStyle={{
                    backgroundColor: "transparent",
                    paddingTop: 125,
                    paddingBottom: 40,
                }}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={120} />
                }
            >
                <View style={appeffects.eventListORG}>{renderOrganizations()}</View>
                <View style={{ height: 0 }} />
            </Animated.ScrollView>
        </Animated.View>
    );
};

export default Orgs;