// JoinModalStyles.ts
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },

  iconContainer: {
    backgroundColor: "#14235b",
    width: 75,
    height: 75,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#fff",
    position: "absolute",
    top: -37,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
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
    color: "#0C1445",
    textAlign: "center",
    fontFamily: "Inter",
  },

  desc: {
    marginTop: 8,
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "DMSans-Regular",
  },
});

export default styles;