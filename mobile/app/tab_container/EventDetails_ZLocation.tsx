//@ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, PanResponder, Animated, Dimensions, TouchableOpacity, Text, } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Header from "../components/Header_Normal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MAP_WIDTH = 2500;
const MAP_HEIGHT = 2203;

const markerList = [
    { id: 47, top: 658, left: 598, name: "Cafeteria Hall" },
    { id: 45, top: 850, left: 387, name: "Main Auditorium" },
    { id: 52, top: 677, left: 358, name: "College Building 23" },
    { id: 36, top: 1053, left: 471, name: "Test Building" },
];

export default function EventDetails_ZLocation() {
    const { markerId } = useLocalSearchParams();
    const initialId = Number(markerId) || null;

    const [selectedId, setSelectedId] = useState(initialId);
    const selectedMarker = markerList.find((m) => m.id === selectedId);

    const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
                useNativeDriver: false,
            }),
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value,
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderRelease: () => {
                pan.flattenOffset();
            },
        })
    ).current;

    useEffect(() => {
        if (!selectedMarker) return;

        const centerX = selectedMarker.left - SCREEN_WIDTH / 2;
        const centerY = selectedMarker.top - (SCREEN_HEIGHT - 100) / 2;

        Animated.timing(pan, {
            toValue: { x: -centerX, y: -centerY },
            duration: 600,
            useNativeDriver: false,
        }).start();
    }, [selectedMarker]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.mapWrapper,
                    { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
                ]}
                {...panResponder.panHandlers}
            >
                <Image
                    source={require("../../assets/images/marque/MARQUEMAP2.png")}
                    style={styles.mapImage}
                />

                {markerList.map((marker) => (
                    <TouchableOpacity
                        key={marker.id}
                        onPress={() => setSelectedId(marker.id)}
                        style={[
                            styles.marker,
                            {
                                top: marker.top,
                                left: marker.left,
                                backgroundColor:
                                    selectedId === marker.id ? "#FF3B30" : "#232323",
                                borderColor: selectedId === marker.id ? "#fff" : "#666",
                                transform: [{ scale: selectedId === marker.id ? 1.4 : 1 }],
                            },
                        ]}
                    >
                        <Text style={styles.markerLabel}>{marker.id}</Text>
                    </TouchableOpacity>
                ))}
            </Animated.View>

            <View style={styles.bottomBar}>
                <View style={styles.containter2}>
                    <Text style={styles.locationName}>
                        {selectedMarker ? selectedMarker.name : "Select a Building"}
                    </Text>

                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>VIEW DETAILS</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#e6e6e6" },

    mapWrapper: {
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        position: "absolute",
    },

    mapImage: {
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        resizeMode: "cover",
    },

    marker: {
        position: "absolute",
        width: 35,
        height: 35,
        borderRadius: 25,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
    },

    markerLabel: {
        color: "#fff",
        fontSize: 12,
        fontFamily: "DMSans-Bold",
        textAlign: "center",
    },

    containter2: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 25,
    },

    bottomBar: {
        position: "absolute",
        bottom: 15,
        left: 0,
        right: 0,
        width: "100%",
        paddingHorizontal: 10,
        elevation: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        flexDirection: "column",
        paddingVertical: 0,
    },

    locationName: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
        paddingHorizontal: 18,
    },

    actionButton: {
        backgroundColor: "#0A0F51",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 14,
        borderRadius: 30,
    },

    actionButtonText: {
        color: "#fff",
        marginRight: 8,
        fontSize: 14,
        fontFamily: "DMSans-Medium",
        fontWeight: "normal",
    },
});
