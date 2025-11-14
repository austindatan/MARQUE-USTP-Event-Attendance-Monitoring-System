// @ts-nocheck
import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const WP = (percentage) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(value);
};

const HP = (percentage) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(value);
};

const CARD_WIDTH = WP(28.1); 
const CARD_HEIGHT = WP(41); 
const IMAGE_SIZE = WP(25.8);
const LOGO_SIZE = WP(4);

const styles = StyleSheet.create({
  shadowWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: WP(2.5),
    backgroundColor: "#fff",
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    marginBottom: WP(4),
  },
});

export default styles;