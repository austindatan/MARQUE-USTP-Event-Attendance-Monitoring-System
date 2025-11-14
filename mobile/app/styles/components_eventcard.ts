import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
    marginBottom: 15,
  },

  card: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },

  imageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },

  eventPoster: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },

  dateTag: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  dateDay: {
    color: "#0C1445",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter",
  },

  dateMonth: {
    color: "#0C1445",
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "Inter",
    bottom: 2,
  },

  details: {
    paddingRight: 15,
    paddingLeft: 15,
    paddingBottom: 15,
    paddingTop: 8,
  },

  eventTitle: {
    fontSize: 18,
    color: "#000",
    fontFamily: "Inter",
  },

  orgDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  organizationLogo: {
    width: 25,
    height: 25,
    borderRadius: 25,
  },

  orgRow: {
    flexDirection: "column",
    marginLeft: 8,
  },

  orgText: {
    fontSize: 10,
    color: "#555",
    fontFamily: "Inter",
  },

  subText: {
    fontSize: 9,
    color: "#777",
    fontFamily: "DMSans-Regular",
  },

  desc: {
    marginTop: 8,
    fontSize: 13,
    color: "#555",
    fontFamily: "DMSans-Regular",
  },

  bold: {
    fontWeight: "700",
  },
});

export default styles;
