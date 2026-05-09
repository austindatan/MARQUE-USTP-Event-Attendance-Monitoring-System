import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.8; 

const styles = StyleSheet.create({
  sidebarContainer: {
    width: "70%",
    height: height,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  sidebarContainerAdmin: {
    width: "70%",
    height: "100%",
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  profileContainer: {
    marginBottom: 8,
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
    paddingVertical: 13,
    paddingHorizontal: 5,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
    fontFamily: "DMSans-Bold",
  },

  organizationsButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#FFC844",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  organizationsText: {
    fontSize: 16,
    color: "white",
    marginLeft: 12,
    fontFamily: "DMSans-Bold",
  },
});

export default styles;