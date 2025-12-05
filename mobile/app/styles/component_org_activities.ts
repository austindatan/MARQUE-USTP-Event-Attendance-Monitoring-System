import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 15,
    marginBottom: 15,
  },

  card: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },

  details: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  eventTitle: {
    fontSize: 17,
    color: "#000",
    fontFamily: "Inter",
    fontWeight: "600",
  },

  orgDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  organizationLogo: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },

  orgRow: {
    marginLeft: 12,
    flex: 1,
  },

  orgText: {
    fontSize: 13,
    color: "#333",
    fontFamily: "Inter",
    fontWeight: "500",
  },

  desc: {
    marginTop: 1,
    fontSize: 13,
    color: "#555",
    fontFamily: "DMSans-Regular",
    lineHeight: 17,
  },
});

export default styles;