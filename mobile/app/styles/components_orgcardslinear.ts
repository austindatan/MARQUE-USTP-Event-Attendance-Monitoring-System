import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 13,
    shadowColor: "#505588",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
    marginBottom: 15,
    position: "relative",
    paddingTop: 13,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 13,
  },

  organizationLogo: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },

  orgCol: {
    flexDirection: "row",
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  orgCol2: {
    flexDirection: "column",
  },

  orgName: {
    fontSize: 13,
    color: "#555",
    fontFamily: "DMSans-Bold",
    marginVertical: 0,
  },

  orgDesc: {
    width: 180,
    fontSize: 8,
    color: "#555",
    fontFamily: "DMSans-Regular",
  },

  button: {
    width: 52,
    height: 27,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "hsla(232, 100%, 96%, 1.00)",
  },

  followText: {
    color: "#5669FF",
    fontSize: 11,
    fontFamily: "DMSans-Regular",
  },

});

export default styles;
