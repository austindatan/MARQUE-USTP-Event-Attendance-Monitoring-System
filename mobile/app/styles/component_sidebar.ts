import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.8; 

const styles = StyleSheet.create({
  sidebarContainer: {
    width: "70%",
    height: height,
    backgroundColor: "#fff",
    paddingTop: 50, 
    paddingHorizontal: 20,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },

  profileContainer: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30, 
    marginBottom: 10,
    backgroundColor: "#ccc",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
    fontFamily: "DMSans-Bold",
  },
  profileTitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 2,
    fontFamily: "DMSans-Medium",
  },
  profileEmail: {
    fontSize: 14,
    color: "#888",
    fontFamily: "DMSans-Regular",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
    fontWeight: "500",
  },

  organizationsButton: {
    marginTop: 10,
    paddingVertical: 12, // slightly smaller to fit image nicely
    paddingHorizontal: 15, // add horizontal padding
    borderRadius: 10,
    backgroundColor: "#FFC844",
    flexDirection: "row",
    justifyContent: "flex-start", // aligns image and text to the left
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  organizationsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginLeft: 12, // spacing between image and text
  },
});

export default styles;