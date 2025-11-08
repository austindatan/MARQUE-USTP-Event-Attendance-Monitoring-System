import { StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0A0F51",
    borderBottomLeftRadius: scale(33),
    borderBottomRightRadius: scale(33),
    paddingTop: verticalScale(45),
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(25),
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(10),
  },

  logo: {
    width: scale(100),
    height: verticalScale(40),
  },

  notif: {
    backgroundColor: "#222762",
    borderRadius: scale(30),
    width: scale(36),
    height: verticalScale(36),
    textAlign: "center",
    textAlignVertical: "center",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(10),
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  searchInput: {
    flex: 1,
    width: "100%",
    height: verticalScale(40),
    fontSize: moderateScale(16),
    color: "#333",
    fontFamily: "DMSans-Regular",
  },

  filterB: {
    backgroundColor: "#fff",
    borderRadius: scale(30),
    width: scale(24),
    height: verticalScale(24),
    textAlign: "center",
    textAlignVertical: "center",
  },
  
  filterButton: {
    backgroundColor: "#222762",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(25),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
  },
  
  filterText: {
    color: "#fff",
    fontSize: moderateScale(13),
    marginLeft: scale(5),
    fontFamily: "DMSans-Regular",
  },

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(-20),
  },

  activeButton: {
    backgroundColor: "#FFD100",
    borderRadius: scale(30),
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(10),
    marginHorizontal: scale(5),
  },

  inactiveButton: {
    backgroundColor: "#C7C7C7",
    borderRadius: scale(30),
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(10),
    marginHorizontal: scale(5),
  },

  activeText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontFamily: "DMSans-Regular",
  },
  
  inactiveText: {
    color: "#fff",
    fontSize: moderateScale(14),
    fontFamily: "DMSans-Regular",
  },
});

export default styles;
