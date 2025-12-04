import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isSmall = width < 360;
const scale = width / 390;

export default StyleSheet.create({
  shadowWrapper: {
    borderRadius: 10 * scale,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    marginBottom: 15,
  },

  card: {
    flex: 1,
    borderRadius: 10 * scale,
    overflow: "hidden",
  },

  imageContainer: {
    width: "100%",
    height: 160 * scale,
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

  bookmarkIcon: {
    position: "absolute",
    right: isSmall ? 12 : 16,
    backgroundColor: "rgba(255, 255, 255, 0.99)",
    padding: 6,
    borderRadius: 10,
    top: isSmall ? 10 : 15,
    elevation: 3,
  },

  details: {
    paddingRight: isSmall ? 12 : 15,
    paddingLeft: isSmall ? 12 : 15,
    paddingBottom: isSmall ? 12 : 15,
    paddingTop: isSmall ? 6 : 8,
  },

  eventTitle: {
    fontSize: 18,
    fontFamily: "Inter",
    color: "#000",
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

  categoryTag: {
    marginTop: 2,
    fontSize: 10,
    color: "#FF6C9B",
    fontWeight: "600",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  locationText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 12,
  },

  savedText: {
    marginTop: 6,
    color: "#999",
    fontSize: 12,
  },

  removeBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#FFE4ED",
    alignSelf: "flex-start",
    borderRadius: 6,
  },

  removeText: {
    color: "#FF6C9B",
    fontWeight: "600",
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  backText: {
    marginLeft: 6,
    color: "#0A0F51",
    fontFamily: "DMSans-Medium",
    fontSize: 14,
  },
});
