// JoinModalStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: 300,
    paddingTop: 45,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    alignItems: "center",
    position: "relative",
  },

  iconContainer: {
    backgroundColor: "#14235b",
    width: 75,
    height: 75,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#ffffff",
    position: "absolute",
    top: -15,
    overflow: "hidden",
  },

  iconImage: {
    width: 45,
    height: 45,
    resizeMode: "contain",
  },

  title: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },

  desc: {
    marginTop: 0,
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    lineHeight: 20,
  },
});
