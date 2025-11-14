import { StyleSheet } from "react-native";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const styles = StyleSheet.create({
  card: {
    width: scale(102),
    height: verticalScale(145),
    backgroundColor: "#fff",
    borderRadius: moderateScale(10),
    shadowColor: "#505588",
    shadowOpacity: 0.03,
    shadowRadius: moderateScale(6),
    elevation: 3,
    overflow: "hidden",
    marginBottom: verticalScale(15),
    position: "relative",
  },

  imageContainer: {
    position: "relative",
    width: scale(100),
    height: verticalScale(100),
    paddingLeft: moderateScale(5),
    paddingRight: moderateScale(5),
    paddingTop: moderateScale(5),
  },

  eventPoster: {
    width: scale(92),
    height: verticalScale(92),
    borderRadius: moderateScale(10),
  },

  dateTag: {
    position: "absolute",
    top: verticalScale(10),
    left: scale(10),
    width: scale(30),
    height: verticalScale(30),
    backgroundColor: "#ffffffdf",
    borderRadius: moderateScale(8),
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(3),
    elevation: 2,
  },

  dateDay: {
    color: "#0C1445",
    fontSize: moderateScale(11),
    fontWeight: "700",
    fontFamily: "Inter",
    top: verticalScale(3),
  },

  dateMonth: {
    color: "#0C1445",
    fontSize: moderateScale(8),
    fontWeight: "600",
    fontFamily: "Inter",
    bottom: verticalScale(1),
  },

  details: {
    paddingRight: 0,
    paddingLeft: moderateScale(8),
    paddingBottom: verticalScale(15),
    paddingTop: verticalScale(2),
  },

  eventTitle: {
    width: scale(80),
    fontSize: moderateScale(10),
    color: "#000",
    fontFamily: "DMSans-SemiBold",
  },

  orgDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(1),
  },

  organizationLogo: {
    width: scale(11),
    height: scale(11),
    borderRadius: moderateScale(65),
  },

  orgRow: {
    flexDirection: "column",
    marginLeft: moderateScale(3),
  },

  orgText: {
    fontSize: moderateScale(7),
    color: "#858585",
    fontFamily: "DIN",
    flexShrink: 1,
  },
});

export default styles;
