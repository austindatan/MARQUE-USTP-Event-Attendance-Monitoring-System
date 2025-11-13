import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    width: 102,
    height: 135,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#505588",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
    marginBottom: 15,
    position: "relative",
  },

  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
  },

  eventPoster: {
    width: 92,
    height: 92,
    borderRadius: 10,
  },

  dateTag: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 30,
    height: 30,
    backgroundColor: "#ffffffdf",
    borderRadius: 8,
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  dateDay: {
    color: "#0C1445",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Inter",
    top: 3,
  },

  dateMonth: {
    color: "#0C1445",
    fontSize: 8,
    fontWeight: "600",
    fontFamily: "Inter",
    bottom:1,
  },

  details: {
    paddingRight: 0,
    paddingLeft: 8,
    paddingBottom: 15,
    paddingTop: 2,
  },

  eventTitle: {
    width: 1000,
    fontSize: 8,
    color: "#000",
    fontFamily: "DMSans-SemiBold",
  },

  orgDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  organizationLogo: {
    width: 10,
    height: 10,
    borderRadius: 65,
  },

  orgRow: {
    flexDirection: "column",
    marginLeft: 3,
  },

  orgText: {
    fontSize: 6,
    color: "#858585",
    fontFamily: "DMSans-Regular",
  },
});

export default styles;
