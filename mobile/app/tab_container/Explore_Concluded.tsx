// @ts-nocheck
import React, { useEffect , useRef } from "react";
import { View, Text, Animated } from "react-native";
import EventCardSL from "../components/Card_EventSL";
import appeffects from "../styles/effects_app";
import Card_Blank from "../components/Card_Blank";

const Concluded = ({ scrollY, handleScroll, initialScroll = 0 }) => {
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
          <Text style={appeffects.pageTitle}>Concluded Events</Text>
        </View>

        <View style={appeffects.eventListEX}>
          <EventCardSL
            image={require("../../assets/images/marque/crtcg1.png")}
            title="Last Cookie Standing!"
            organization="Cookie Run Kingdom"
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
          /><EventCardSL
            image={require("../../assets/images/marque/crtcg1.png")}
            title="Last Cookie Standing!"
            organization="Cooking Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            dateDay="17"
            dateMonth="NOV"
          /><EventCardSL
            image={require("../../assets/images/marque/crtcg1.png")}
            title="Last Cookie Standing!"
            organization="Cooking Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            dateDay="17"
            dateMonth="NOV"
          /><EventCardSL
            image={require("../../assets/images/marque/crtcg1.png")}
            title="Last Cookie Standing!"
            organization="Cooking Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            dateDay="17"
            dateMonth="NOV"
          /><EventCardSL
            image={require("../../assets/images/marque/crtcg1.png")}
            title="Last Cookie Standing!"
            organization="Cooking Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            dateDay="17"
            dateMonth="NOV"
          /><EventCardSL
            image={require("../../assets/images/marque/crtcg1.png")}
            title="Last Cookie Standing!"
            organization="Cooking Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            dateDay="17"
            dateMonth="NOV"
          /><EventCardSL
            image={require("../../assets/images/marque/crtcg1.png")}
            title="Last Cookie Standing!"
            organization="Cooking Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            dateDay="17"
            dateMonth="NOV"
          /><EventCardSL
            image={require("../../assets/images/marque/crtcg1.png")}
            title="Last Cookie Standing!"
            organization="Cooking Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            dateDay="17"
            dateMonth="NOV"
          /><EventCardSL
            image={require("../../assets/images/marque/crtcg1.png")}
            title="Last Cookie Standing!"
            organization="Cooking Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            dateDay="17"
            dateMonth="NOV"
          />
          <Card_Blank />
        
        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default Concluded;