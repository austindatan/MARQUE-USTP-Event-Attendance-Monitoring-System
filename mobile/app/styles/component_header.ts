import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0A0F51",
    borderBottomLeftRadius: 33,
    borderBottomRightRadius: 33,
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  logo: {
    width: 100,
    height: 40,
  },

  notif: {
    backgroundColor: "#222762",
    borderRadius: 30,
    width: 36,
    height: 36,
    textAlign: "center",
    textAlignVertical: "center",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  searchInput: {
    flex: 1,
    width: "100%",
    height: 40,
    fontSize: 16,
    color: "#333",
    fontFamily: "DMSans-Regular",
  },

  filterB: {
    backgroundColor: "#fff",
    borderRadius: 30,
    width: 24,
    height: 24,
    textAlign: "center",
    textAlignVertical: "center",
  },
  
  filterButton: {
    backgroundColor: "#222762",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  
  filterText: {
    color: "#fff",
    fontSize: 13,
    marginLeft: 5,
    fontFamily: "DMSans-Regular",
  },

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: -20,
  },

  activeButton: {
    backgroundColor: "#FFD100",
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginHorizontal: 5,
  },

  inactiveButton: {
    backgroundColor: "#C7C7C7",
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginHorizontal: 5,
  },

  activeText: {
    color: "#fff",    
    fontSize: 14,
    fontFamily: "DMSans-Regular",
  },
  
  inactiveText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "DMSans-Regular",
  },
});

export default styles;