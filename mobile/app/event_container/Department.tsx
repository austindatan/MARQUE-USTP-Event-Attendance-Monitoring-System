// @ts-nocheck
import React from "react";
import { View, Text, Animated } from "react-native";
import EventCard from "../components/EventCard";
import appeffects from "../styles/effects_app";

const Departments = ({ scrollY }) => {
  return (
    <Animated.ScrollView
      style={{ flex: 1, marginTop: -120 }}
        contentContainerStyle={{ 
        paddingTop: 125,
        paddingBottom: 40 
    }}

      showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      scrollEventThrottle={16}
    >

      <View style={appeffects.pageStarter}>
        <Text style={appeffects.pageTitle}>Upcoming Events</Text>
        <Text style={appeffects.pageSubtitle}>Filtered by Dept.</Text>
      </View>

      <View style={appeffects.eventList}>
        <EventCard
          image={require("../../assets/images/marque/crtcg1.png")}
          title="Last Cookie Standing!"
          organization="Cooking Run Kingdom"
          orgLogo={require("../../assets/images/marque/crk.jpg")}
          orgDate="November 10"
          dateDay="17"
          dateMonth="NOV"
          description="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
        />
      </View>
    </Animated.ScrollView>
  );
};

export default Departments;
