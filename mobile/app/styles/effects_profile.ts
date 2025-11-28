import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  navBar: {
    height: 90,
    backgroundColor: "#0A0F51",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 15,
    zIndex: 10,
  },

  navTitle: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    fontFamily: "DMSans-Bold",
  },

  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#f4f6ff",
  },

  profileImage: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: "#ddd",
    marginBottom: 10,
  },

  name: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    color: "#111",
  },

  department: {
    fontSize: 13,
    color: "#666",
    fontFamily: "DMSans-Medium",
  },

  course: {
    fontSize: 13,
    color: "#666",
    fontFamily: "DMSans-Medium",
    marginTop: 2,
  },

  infoBlock: {
    paddingHorizontal: 20,
    marginTop: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },

  label: {
    fontSize: 14,
    color: "#666",
    fontFamily: "DMSans-Medium",
  },

  value: {
    fontSize: 14,
    color: "#111",
    fontFamily: "DMSans-Bold",
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 8,
  },

  attendanceCard: {
    marginHorizontal: 20,
    backgroundColor: "#0A0F51",
    borderRadius: 18,
    paddingVertical: 18,
  },

  cardContainer: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  attItem: {
    alignItems: "center",
  },

  attValue: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "DMSans-Bold",
  },

  attLabel: {
    color: "#dfe6ff",
    fontSize: 12,
    fontFamily: "DMSans-Medium",
  },

  settingsBlock: {
    marginTop: 10,
    paddingHorizontal: 20,
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },

  settingLabel: {
    fontSize: 14,
    marginLeft: 10,
    fontFamily: "DMSans-Medium",
    color: "#111",
  },









  containerCh: {
    flex: 1,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    color: "#111",
  },

  formCard: {
    marginHorizontal: 20,
    backgroundColor: "#f4f6ff",
    borderRadius: 16,
    padding: 18,
  },

  inputGroup: {
    marginBottom: 18,
  },

  labelCh: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#444",
    marginBottom: 6,
  },

  inputGroup2: {
  },

  label2: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#444",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    fontFamily: "DMSans-Regular",
    color: "#111",
  },

  saveBtn: {
    backgroundColor: "#0A0F51",
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 25,
  },

  saveBtnText: {
    color: "#fff",
    fontFamily: "DMSans-Bold",
    fontSize: 15,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },

  backText: {
    marginLeft: 6,
    color: "#0A0F51",
    fontFamily: "DMSans-Medium",
    fontSize: 14,
  },
});

export default styles;