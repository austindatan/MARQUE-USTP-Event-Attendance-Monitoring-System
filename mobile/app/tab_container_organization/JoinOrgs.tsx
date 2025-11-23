// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import EventCard from "../components/Card_Teams";
import JoinModal from "../components/JoinModal";
import appeffects from "../styles/effects_app";

const JoinOrgs = ({ scrollY, handleScroll, initialScroll = 0 }) => {
  const scrollRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState("");

  const handleCardPress = (orgName) => {
    console.log("Pressed:", orgName);
    setSelectedOrg(orgName);
    setModalVisible(true);
  };

  const handleJoin = () => {
    console.log("Join request sent to", selectedOrg);
    setModalVisible(false);
  };

  const containerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  useEffect(() => {
    if (scrollRef.current && initialScroll > 0) {
      const t = setTimeout(() => {
        const node = scrollRef.current?.getNode
          ? scrollRef.current.getNode()
          : scrollRef.current;

        if (node && node.scrollTo) {
          node.scrollTo({ y: initialScroll, animated: false });
        }
      }, 0);
      return () => clearTimeout(t);
    }
  }, [initialScroll]);

  return (
    <>
      {/* MAIN CONTENT */}
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
            backgroundColor: "transparent",
            paddingTop: 5,
            paddingBottom: 80,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={appeffects.pageStarter}>
            <Text style={appeffects.pageTitle}>Join Organizations</Text>
          </View>

          <View style={appeffects.eventList}>
            <EventCard
              image={require("../../assets/images/marque/crtcg1.png")}
              title="Society of Information Technology Enthusiasts"
              description="Empowering Students, Building Leaders."
              onPress={() =>
                handleCardPress("Society of Information Technology Enthusiasts")
              }
            />

            <EventCard
              image={require("../../assets/images/marque/crtcg1.png")}
              title="Student Council of Information Technology and Computing"
              description="We raise the howl."
              onPress={() =>
                handleCardPress(
                  "Student Council of Information Technology and Computing"
                )
              }
            />
          </View>
        </Animated.ScrollView>
      </Animated.View>

      {/* MODAL (placed outside to ensure it overlays properly) */}
      <JoinModal
        visible={modalVisible}
        orgName={selectedOrg}
        onClose={() => setModalVisible(false)}
        onJoin={handleJoin}
      />
    </>
  );
};

export default JoinOrgs;