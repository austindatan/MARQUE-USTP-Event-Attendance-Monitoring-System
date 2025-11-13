// @ts-nocheck
import React from "react";
import { View, Text, Animated } from "react-native";
import EventCardSL from "../components/Card_EventSL";
import appeffects from "../styles/effects_app";

const Concluded = ({ scrollY }) => {
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
        <Text style={appeffects.pageTitle}>Concluded Events</Text>
        <Text style={appeffects.pageSubtitle}>Filtered by Dept.</Text>
      </View>

      <View style={appeffects.eventListEX}>
        <EventCardSL
          image={require("../../assets/images/marque/crtcg1.png")}
          title="Last Cookie Standing!"
          organization="Cooking Run Kingdom"
          orgLogo={require("../../assets/images/marque/crk.jpg")}
          dateDay="17"
          dateMonth="NOV"
        />

        <EventCardSL
          image={require("../../assets/images/marque/crtcg1.png")}
          title="Last Cookie Standing!"
          organization="Cooking Run Kingdom"
          orgLogo={require("../../assets/images/marque/crk.jpg")}
          dateDay="17"
          dateMonth="NOV"
        />

        <EventCardSL
          image={require("../../assets/images/marque/crtcg1.png")}
          title="Last Cookie Standing!"
          organization="Cooking Run Kingdom"
          orgLogo={require("../../assets/images/marque/crk.jpg")}
          dateDay="17"
          dateMonth="NOV"
        />

        <EventCardSL
          image={require("../../assets/images/marque/crtcg1.png")}
          title="Last Cookie Standing!"
          organization="Cooking Run Kingdom"
          orgLogo={require("../../assets/images/marque/crk.jpg")}
          dateDay="17"
          dateMonth="NOV"
        />
      </View>
    </Animated.ScrollView>
  );
};

export default Concluded;
