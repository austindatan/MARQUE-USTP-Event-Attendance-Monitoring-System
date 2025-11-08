import React from "react";
import { View, Text } from "react-native";
import Header from "../components/Header";

const Explore = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />
      <Text style={{ padding: 20 }}>Upcoming Events...</Text>
    </View>
  );
};

export default Explore;
