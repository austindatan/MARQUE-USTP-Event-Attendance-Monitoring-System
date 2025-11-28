// styles_eventcard_C.js  (OPTION C)
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isSmall = width < 360;
const scale = width / 390; // but use it only for spacing + container sizes

export default StyleSheet.create({
  shadowWrapper: {
    borderRadius: 10 * scale,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    marginBottom: isSmall ? 12 : 15,
  },

  card: {
    flex: 1,
    borderRadius: 10 * scale,
    overflow: "hidden",
    position: "relative",
  },

  imageContainer: {
    width: "100%",
    height: 160 * scale, // ONLY this scales
    paddingLeft: isSmall ? 8 : 10,
    paddingRight: isSmall ? 8 : 10,
    paddingTop: isSmall ? 8 : 10,
  },

  eventPoster: {
    width: "100%",
    height: "100%",
    borderRadius: 10 * scale,
  },

  dateTag: {
    position: "absolute",
    top: isSmall ? 10 : 15,
    left: isSmall ? 10 : 15,
    backgroundColor: "#fff",
    borderRadius: 10 * scale,
    paddingVertical: isSmall ? 5 : 6,
    paddingHorizontal: isSmall ? 6 : 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  dateDay: {
    color: "#0C1445",
    fontSize: isSmall ? 14 : 16,
    fontWeight: "700",
    fontFamily: "Inter",
  },

  dateMonth: {
    color: "#0C1445",
    fontSize: isSmall ? 9 : 10,
    fontWeight: "600",
    bottom: 2,
    textTransform: "uppercase",
    fontFamily: "Inter",
  },

  details: {
    paddingRight: isSmall ? 12 : 15,
    paddingLeft: isSmall ? 12 : 15,
    paddingBottom: isSmall ? 12 : 15,
    paddingTop: isSmall ? 6 : 8,
  },

  eventTitle: {
    fontSize: isSmall ? 16 : 18, // TEXT ONLY SLIGHTLY SCALES
    color: "#000",
    fontFamily: "Inter",
  },

  orgDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: isSmall ? 4 : 6,
  },

  organizationLogo: {
    width: isSmall ? 22 : 25,
    height: isSmall ? 22 : 25,
    borderRadius: isSmall ? 22 : 25,
  },

  orgRow: {
    marginLeft: isSmall ? 6 : 8,
  },

  orgText: {
    fontSize: isSmall ? 9 : 10,
    color: "#555",
    fontFamily: "Inter",
  },

  subText: {
    fontSize: isSmall ? 8 : 9,
    color: "#777",
    fontFamily: "DMSans-Regular",
  },

  desc: {
    marginTop: isSmall ? 6 : 8,
    fontSize: isSmall ? 12 : 13,
    color: "#555",
    fontFamily: "DMSans-Regular",
  },
});
