import { StyleSheet } from "react-native";

const AVATAR_SIZE = 24;
const OVERLAP_AMOUNT = 8;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  avatarStackContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
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
    paddingTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 2,
  },

  bookmarkBtn: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.39)",
  },

  headerImageBackground: {
    height: 200,
    flex: 1,
    marginBottom: 10,
    paddingTop: 90,
  },

  inviteRow: {
    position: "absolute",
    bottom: -20,
    left: 20,
    right: 20,
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
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
    color: "#111", // Changed to dark
    fontFamily: "DMSans-Medium",
  },

  goingContainer: {
    flexDirection: "row",
    width: 280,
    alignItems: "center",
    backgroundColor: "#fff",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  goingText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "DMSans-Bold",
  },

  inviteButton: {
    backgroundColor: "#0A0F51",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },

  inviteText: {
    color: "#fff",
    fontFamily: "DMSans-Medium",
    fontSize: 13,
  },

  eventTitle: {
    fontSize: 20,
    color: "#111",
    marginTop: 20,
    paddingHorizontal: 20,
    fontFamily: "DMSans-Bold",
  },

  infoRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 14,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#d9ddffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoPrimary: {
    fontSize: 15,
    color: "#111",
    fontFamily: "DMSans-Bold",
  },

  infoSecondary: {
    fontSize: 13,
    color: "#777",
    fontFamily: "DMSans-Medium",
  },

  sectionTitle: {
    fontSize: 16,
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 8,
    fontFamily: "DMSans-Bold",
  },

  aboutText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#444",
    paddingHorizontal: 20,
    fontFamily: "DMSans-Medium",
  },

  organizerCard: {
    marginTop: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  organizerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  organizerLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },

  organizerName: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
  },

  organizerLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: "DMSans-Medium",
  },

  followButton: {
    backgroundColor: "#d9ddffff",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
  },

  followText: {
    color: "#4A58E1",
    fontSize: 13,
    fontFamily: "DMSans-Medium",
  },

  organizerDesc: {
    paddingHorizontal: 20,
    marginTop: 10,
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    fontFamily: "DMSans-Medium",
  },

  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    paddingHorizontal: 20,
  },

  registerButton: {
    backgroundColor: "#0A0F51",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 30,
  },

  registerText: {
    color: "#fff",
    marginRight: 8,
    fontSize: 14,
    fontFamily: "DMSans-Medium",
  },
});

export default styles;

