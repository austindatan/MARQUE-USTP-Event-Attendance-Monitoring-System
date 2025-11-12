import { StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0A0F51",
    borderBottomLeftRadius: moderateScale(33),
    borderBottomRightRadius: moderateScale(33),
    paddingTop: verticalScale(40),
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(20),
    zIndex: 8,
  },

  headerfirst: {
    backgroundColor: "#0A0F51",
    paddingTop: verticalScale(40),
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(20),
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(10),
    zIndex: 10,
  },

  logo: {
    width: moderateScale(100),
    height: verticalScale(40),
  },

  notif: {
    backgroundColor: "#222762",
    borderRadius: moderateScale(30),
    width: moderateScale(36),
    height: moderateScale(36),
    justifyContent: "center",
    alignItems: "center"
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
    borderRadius: moderateScale(30),
    width: moderateScale(26),
    height: moderateScale(26),
    justifyContent: "center",
    alignItems: "center"
  },
  
  filterButton: {
    backgroundColor: "#222762",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(8),
  },
  
  filterText: {
    color: "#fff",
    fontSize: moderateScale(13),
    marginLeft: moderateScale(5),
    fontFamily: "DMSans-Regular",
  },

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: verticalScale(-20),
    zIndex: 9,
  },

  activeButton: {
    backgroundColor: "#FFD100",
    borderRadius: moderateScale(30),
    paddingHorizontal: moderateScale(25),
    paddingVertical: verticalScale(10),
    marginHorizontal: moderateScale(5),
  },

  inactiveButton: {
    backgroundColor: "#C7C7C7",
    borderRadius: moderateScale(30),
    paddingHorizontal: moderateScale(25),
    paddingVertical: verticalScale(10),
    marginHorizontal: moderateScale(5),
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
