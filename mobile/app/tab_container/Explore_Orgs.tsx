// @ts-nocheck
import React, { useEffect , useRef } from "react";
import { View, Text, Animated } from "react-native";
import OrgLinear from "../components/Card_OrgsLinear";
import appeffects from "../styles/effects_app";

const Orgs = ({ scrollY, handleScroll, initialScroll = 0 }) => {
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

        <View style={appeffects.eventListORG}>
          <OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          /><OrgLinear
            organization="Cookie Run Kingdom"
            orgLogo={require("../../assets/images/marque/crk.jpg")}
            text="As kings and queens, they ruled the Cookies, bringing in a golden age of peace and..."
          />

        </View>
      </Animated.ScrollView>
    </Animated.View>
  );
};

export default Orgs;