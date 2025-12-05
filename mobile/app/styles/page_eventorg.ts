//@ts-nocheck
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const isSmall = width < 360;
const isLarge = width > 420;

const rs = (size) => {
  if (isSmall) return size * 0.85;
  if (isLarge) return size * 1.1;
  return size;
};

const AVATAR_SIZE = rs(24);
const OVERLAP_AMOUNT = rs(8);

const stylesINC = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  avatarStackContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: rs(6),
  },

  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: "#FFF",
    backgroundColor: "#FFF",
    overflow: "hidden",
  },

  overlappingAvatar: {
    marginLeft: -OVERLAP_AMOUNT,
  },

  goingAvatar: {
    width: "100%",
    height: "100%",
  },

  stickyNavContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
    justifyContent: "center",
    overflow: "hidden",
  },

  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  navRowContent: {
    paddingTop: rs(40),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(20),
    zIndex: 2,
  },

  bookmarkBtn: {
    padding: rs(4),
    borderRadius: rs(10),
    backgroundColor: "rgba(255, 255, 255, 0.39)",
  },

  headerImageBackground: {
    height: rs(200),
    flex: 1,
    paddingTop: rs(90),
  },

  headerImageBackgroundCon: {
    height: rs(200),
    flex: 1,
    marginBottom: 0,
    paddingTop: rs(90),
  },

  inviteRow: {
    position: "absolute",
    bottom: rs(-20),
    left: rs(20),
    right: rs(20),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  tabRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  navText: {
    fontSize: rs(16),
    fontWeight: "500",
    marginLeft: rs(10),
    color: "#111",
    fontFamily: "DMSans-Medium",
  },

  navTextORG: {
    fontSize: rs(16),
    marginLeft: rs(10),
    color: "#111",
    fontFamily: "DMSans-Medium",
  },


  goingContainer: {
    flexDirection: "row",
    width: isSmall ? 240 : 280,
    alignItems: "center",
    backgroundColor: "#fff",
    justifyContent: "space-between",
    paddingVertical: rs(6),
    paddingHorizontal: rs(10),
    borderRadius: rs(20),
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  goingText: {
    fontSize: rs(13),
    fontWeight: "600",
    fontFamily: "DMSans-Bold",
  },

  inviteButton: {
    backgroundColor: "#0A0F51",
    paddingHorizontal: rs(20),
    paddingVertical: rs(6),
    borderRadius: rs(20),
  },

  inviteText: {
    color: "#fff",
    fontFamily: "DMSans-Medium",
    fontSize: rs(13),
  },

  eventTitle: {
    fontSize: rs(20),
    color: "#111",
    marginTop: rs(20),
    paddingHorizontal: rs(20),
    fontFamily: "DMSans-Bold",
  },

  infoRow: {
    flexDirection: "row",
    paddingHorizontal: rs(20),
    marginTop: rs(14),
  },

  infoColumn: {
    flexDirection: "column",
    paddingHorizontal: rs(20),
    marginTop: rs(14),
    columnGap: rs(15),
  },

  iconBox: {
    width: rs(42),
    height: rs(42),
    borderRadius: rs(12),
    backgroundColor: "#d9ddffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: rs(12),
  },

  infoBox: {
    backgroundColor: "#0A0F51",
    flexDirection: "row",
    paddingHorizontal: rs(20),
    alignItems: "center",
    paddingVertical: rs(14),
    borderRadius: rs(15),
  },

  infoBoxAttendance: {
    backgroundColor: "#0A0F51",
    flexDirection: "row",
    paddingHorizontal: rs(20),
    alignItems: "center",
    paddingVertical: rs(14),
    justifyContent: "space-between",
    borderRadius: rs(15),
  },

  infoText: {
    color: "#fff",
    marginRight: rs(8),
    fontSize: rs(11),
    fontFamily: "DMSans-Medium",
  },

  infoTextAtt: {
    color: "#fff",
    marginRight: rs(8),
    fontSize: rs(11),
    fontFamily: "DMSans-Medium",
    width: isSmall ? 160 : 200,
  },

  infoPrimary: {
    fontSize: rs(15),
    color: "#111",
    fontFamily: "DMSans-Bold",
  },

  infoSecondary: {
    fontSize: rs(13),
    color: "#777",
    fontFamily: "DMSans-Medium",
  },

  sectionTitle: {
    fontSize: rs(16),
    paddingHorizontal: rs(20),
    marginTop: rs(22),
    marginBottom: rs(8),
    fontFamily: "DMSans-Bold",
  },

  aboutText: {
    fontSize: rs(13),
    lineHeight: rs(20),
    color: "#444",
    paddingHorizontal: rs(20),
    fontFamily: "DMSans-Medium",
  },

  organizerCard: {
    marginTop: rs(24),
    paddingHorizontal: rs(20),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  organizerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  organizerLogo: {
    width: rs(50),
    height: rs(50),
    borderRadius: rs(12),
    marginRight: rs(12),
  },

  organizerName: {
    fontSize: rs(14),
    fontFamily: "DMSans-Medium",
  },

  organizerLabel: {
    fontSize: rs(12),
    color: "#666",
    fontFamily: "DMSans-Medium",
  },

  followButton: {
    backgroundColor: "#d9ddffff",
    paddingHorizontal: rs(18),
    paddingVertical: rs(6),
    borderRadius: rs(16),
  },

  followText: {
    color: "#4A58E1",
    fontSize: rs(13),
    fontFamily: "DMSans-Medium",
  },

  organizerDesc: {
    paddingHorizontal: rs(20),
    marginTop: rs(10),
    fontSize: rs(13),
    color: "#444",
    lineHeight: rs(20),
    textAlign: 'justify',
    fontFamily: "DMSans-Medium",
  },

  bottomButtonContainer: {
    position: "absolute",
    bottom: rs(20),
    width: "100%",
    paddingHorizontal: rs(20),
  },

  registerButton: {
    backgroundColor: "#0A0F51",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: rs(14),
    borderRadius: rs(30),
  },

  registerText: {
    color: "#fff",
    marginRight: rs(8),
    fontSize: rs(14),
    fontFamily: "DMSans-Medium",
  },

  
});

export default stylesINC;
