import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const scale = width / 390;
const SHRINK = 0.9; // make everything 80% the original size

export default StyleSheet.create({
  shadowWrapper: {
    borderRadius: 10 * scale * SHRINK,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    marginBottom: 15 * SHRINK,
  },

  card: {
    flex: 1,
    flexDirection: "row",
    minHeight: 110 * scale * SHRINK,
    borderRadius: 10 * scale * SHRINK,
    overflow: "hidden",
    position: "relative",
  },

  imageContainer: {
    width: "50%",
    height: "100%",
    padding: 10 * SHRINK,
  },

  eventPoster: {
    width: "100%",
    height: "100%",
    borderRadius: 10 * scale * SHRINK,
  },

  dateTag: {
    position: "absolute",
    top: 12 * SHRINK,
    left: 12 * SHRINK,
    backgroundColor: "#fff",
    borderRadius: 10 * scale * SHRINK,
    paddingVertical: 5 * SHRINK,
    paddingHorizontal: 8 * SHRINK,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  dateDay: {
    color: "#0C1445",
    fontSize: 15 * SHRINK,
    fontWeight: "700",
    fontFamily: "Inter",
  },

  dateMonth: {
    color: "#0C1445",
    fontSize: 10 * SHRINK,
    fontWeight: "600",
    textTransform: "uppercase",
    fontFamily: "Inter",
  },

  details: {
    flex: 1,
    paddingRight: 12 * SHRINK,
    paddingBottom: 12 * SHRINK,
    paddingTop: 12 * SHRINK,
    justifyContent: "space-around",
  },

  eventTitle: {
    fontSize: 18 * SHRINK,
    color: "#000",
    fontFamily: "Inter",
  },

  orgDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6 * SHRINK,
  },

  organizationLogo: {
    width: 25 * SHRINK,
    height: 25 * SHRINK,
    borderRadius: 25 * SHRINK,
  },

  orgRow: {
    flex: 1,
    marginLeft: 7 * SHRINK,
  },

  orgText: {
    paddingRight: 10,
    fontSize: 10 * SHRINK,
    color: "#555",
    fontFamily: "Inter",
  },

  subText: {
    fontSize: 9 * SHRINK,
    color: "#777",
    fontFamily: "DMSans-Regular",
  },

  desc: {
    marginTop: 8 * SHRINK,
    fontSize: 13 * SHRINK,
    color: "#555",
    fontFamily: "DMSans-Regular",
  },
});
