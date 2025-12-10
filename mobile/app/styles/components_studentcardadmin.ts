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

  studentImage: {
    width: 45,
    height: 45,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#00000074",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    justifyContent: "space-between",
  },

  infoCol: {
    flexDirection: "column",
    flexShrink: 1,
  },

  nameIdRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  studentName: {
    fontSize: 15,
    color: "#0A0F51",
    fontFamily: "DMSans-Bold",
    marginRight: 8,
  },

  studentId: {
    fontSize: 11,
    color: "#888",
    fontFamily: "DMSans-Regular",
  },

  studentDetails: {
    fontSize: 11,
    color: "#555",
    fontFamily: "DMSans-Regular",
    marginTop: 2,
  },

  editButton: {
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },

  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },

  orgLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: "#ccc",
  },

  orgName: {
    fontSize: 12,
    color: "#0A0F51",
    fontFamily: "DMSans-Medium",
    paddingRight: 20,
  },

  position: {
    fontSize: 10,
    color: "#33A0FF",
    fontFamily: "DMSans-Bold",
  },
});

export default styles;
