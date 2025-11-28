import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 13,
    shadowColor: "#505588",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    padding: 13,
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  organizationLogo: {
    width: 40,
    height: 40,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#00000074",
  },

  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    justifyContent: "space-between",
  },

  orgInfoCol: {
    flexDirection: "column",
    flexShrink: 1,
  },

  orgName: {
    fontSize: 13,
    color: "#444",
    fontFamily: "DMSans-Bold",
  },

  orgDesc: {
    fontSize: 9,
    color: "#555",
    fontFamily: "DMSans-Regular",
  },

  button: {
    width: 55,
    height: 28,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "hsla(232, 100%, 96%, 1)",
  },

  buttonFollowing: {
    backgroundColor: "#e5e5e561",
  },

  followText: {
    color: "#5669FF",
    fontSize: 11,
    fontFamily: "DMSans-Regular",
  },

  followingText: {
    color: "#444444ac",
    fontSize: 10,
  },
});

export default styles;
