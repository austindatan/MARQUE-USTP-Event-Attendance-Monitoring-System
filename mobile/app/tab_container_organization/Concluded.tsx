// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import EventCard from "../components/Card_Teams";
import JoinModal from "../components/JoinModal";
import appeffects from "../styles/effects_app";

const Concluded = ({ scrollY, handleScroll, initialScroll = 0 }) => {
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
            <Text style={appeffects.pageTitle}>Concluded Organizations</Text>
          </View>

          <View style={appeffects.eventList}>
            <EventCard
              image={require("../../assets/images/marque/crtcg1.png")}
              title="Alumni Association"
              description="Celebrating our legacy and achievements."
              onPress={() => handleCardPress("Alumni Association")}
            />

            <EventCard
              image={require("../../assets/images/marque/crtcg1.png")}
              title="Past Student Council"
              description="Our journey, our story."
              onPress={() => handleCardPress("Past Student Council")}
            />

            <EventCard
              image={require("../../assets/images/marque/crtcg1.png")}
              title="Coding Legends Club"
              description="Honoring the top coders."
              onPress={() => handleCardPress("Coding Legends Club")}
            />

            <EventCard
              image={require("../../assets/images/marque/crtcg1.png")}
              title="Robotics Veterans Society"
              description="Experience meets innovation."
              onPress={() => handleCardPress("Robotics Veterans Society")}
            />
          </View>
        </Animated.ScrollView>
      </Animated.View>

      <JoinModal
        visible={modalVisible}
        orgName={selectedOrg}
        onClose={() => setModalVisible(false)}
        onJoin={handleJoin}
      />
    </>
  );
};

export default Concluded;