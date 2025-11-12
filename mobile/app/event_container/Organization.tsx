// @ts-nocheck
import React from "react";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import EventCard from "../components/EventCard";
import appeffects from "../styles/effects_app";
import EmptyCard from "../components/EmptyCard";

const Organizations = ({ scrollY }) => {
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

      <View style={appeffects.eventList}>
        <EmptyCard
          image={require("../../assets/images/marque/MARQUE_singlelogo.png")}
          text="Looks a little quiet here! Follow your favorite organizations to see their updates."
        />
      </View>
    </Animated.ScrollView>
  );
};

export default Organizations;
