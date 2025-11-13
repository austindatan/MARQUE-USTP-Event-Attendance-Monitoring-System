// @ts-nocheck
import React, { useEffect , useRef } from "react";
import { View, Text, Animated } from "react-native";
import EventCard from "../components/Card_Event";
import appeffects from "../styles/effects_app";

const Incoming = ({ scrollY, handleScroll, initialScroll = 0 }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && typeof initialScroll === "number" && initialScroll > 0) {
      const t = setTimeout(() => {
        const node = scrollRef.current?.getNode ? scrollRef.current.getNode() : scrollRef.current;
        if (node && node.scrollTo) {
          node.scrollTo({ y: initialScroll, animated: false });
        }
      }, 0);
      return () => clearTimeout(t);
    }
  }, [initialScroll]);

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
      >
        <View style={appeffects.pageStarter}>
          <Text style={appeffects.pageTitle}>Incoming Events</Text>
        </View>

        <View style={appeffects.eventListEX}>
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
    </Animated.View>
  );
};

export default Incoming;