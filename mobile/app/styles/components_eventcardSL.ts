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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
    marginBottom: WP(4),
  },

  card: {
    flex: 1,
    borderRadius: WP(2.5),
    overflow: "hidden",
    position: "relative",
  },

  imageContainer: {
    position: "relative",
    width: IMAGE_SIZE + WP(1.5),
    height: IMAGE_SIZE + WP(1.5),
    paddingLeft: WP(1.2),
    paddingRight: WP(1.2),
    paddingTop: WP(1.2),
  },

  eventPoster: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: WP(2.5),
  },

  dateTag: {
    position: "absolute",
    flexDirection: "column",
    top: WP(2.5),
    left: WP(2.5),
    width: WP(8),
    height: WP(8),
    backgroundColor: "#ffffffea",
    borderRadius: WP(2),
    alignItems: "center",
    rowGap: 0,
    
    justifyContent: 'center', 
    
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  dateDay: {
    color: "#0C1445",
    fontSize: WP(3), 
    fontWeight: "700",
    fontFamily: "Inter",
    marginVertical: 0, 
    lineHeight: WP(3) * 1.1,
  },

  dateMonth: {
    color: "#0C1445",
    fontSize: WP(2.5),
    fontWeight: "600",
    fontFamily: "Inter",
    marginVertical: 0, 
    lineHeight: WP(2) * 1.1,
  },

  details: {
    paddingRight: 0,
    paddingLeft: WP(2),
    paddingBottom: WP(4),
    paddingTop: WP(0.5),
  },

  eventTitle: {
    width: CARD_WIDTH - WP(4),
    fontSize: WP(2.9),
    color: "#000",
    fontFamily: "DMSans-SemiBold",
  },

  orgDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: WP(0.5),
  },

  organizationLogo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
  },

  orgRow: {
    flexDirection: "column",
    marginLeft: WP(0.8),
  },

  orgText: {
    fontSize: WP(1.9),
    color: "#858585",
    fontFamily: "DIN",
  },
});

export default styles;