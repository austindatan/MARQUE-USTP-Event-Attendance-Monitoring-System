// @ts-nocheck
import React, { useEffect, useRef } from "react";
import { View, Image, ScrollView, Text, Animated } from "react-native";
import appeffects from "../styles/effects_app";

const YourOrg = ({ scrollY: externalScrollY, handleScroll, initialScroll = 0 }) => {
  const scrollRef = useRef<ScrollView>(null);

  // Use external scrollY if passed, otherwise local
  const scrollY = externalScrollY || useRef(new Animated.Value(0)).current;

  // Scroll to previous position on mount
  useEffect(() => {
    if (scrollRef.current && typeof initialScroll === "number" && initialScroll > 0) {
      const timeout = setTimeout(() => {
        const node = scrollRef.current?.getNode ? scrollRef.current.getNode() : scrollRef.current;
        if (node && node.scrollTo) {
          node.scrollTo({ y: initialScroll, animated: false });
        }
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [initialScroll]);

  // Animate container for header collapse
  const containerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

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
        style={{ flex: 1, backgroundColor: "transparent" }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",  // start from top
          alignItems: "center",
          paddingTop: 150,               // move content lower
          paddingBottom: 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={
          handleScroll ||
          Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
          })
        }
        scrollEventThrottle={16}
      >
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../assets/images/marque/NoOrganizationFound.png")}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
          />
          <Text
            style={{
              paddingTop: 20,
              fontSize: 20,
              color: "gray",
              fontFamily: "DMSans-Bold",
            }}
          >
            No Organization Found
          </Text>
          <Text
            style={{
              paddingTop: 5,
              color: "gray",
              fontFamily: "DMSans-Regular",
              textAlign: "center",
            }}
          >
            Try to adjust your filters to see more organizations.
          </Text>
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default YourOrg;