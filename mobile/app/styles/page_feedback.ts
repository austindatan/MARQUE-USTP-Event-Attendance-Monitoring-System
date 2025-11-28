import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 22,
    fontFamily: "DMSans-Bold",
    marginTop: 30,
    paddingHorizontal: 20,
    color: "#111",
  },

  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 30,
  },

  label: {
    fontSize: 14,
    fontFamily: "DMSans-Bold",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
    color: "#111",
  },

  textbox: {
    backgroundColor: "#f4f4f4",
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 15,
    fontSize: 14,
    minHeight: 130,
    textAlignVertical: "top",
    fontFamily: "DMSans-Medium",
    color: "#333",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 10,
  },

  tagButton: {
    backgroundColor: "#0A0F51",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },

  tagText: {
    color: "#fff",
    fontFamily: "DMSans-Medium",
    fontSize: 12,
  },

  tagButtonSecondary: {
    backgroundColor: "#e5e7ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },

  tagTextSecondary: {
    color: "#0A0F51",
    fontFamily: "DMSans-Medium",
    fontSize: 12,
  },

  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    paddingHorizontal: 20,
  },

  submitButton: {
    backgroundColor: "#0A0F51",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontFamily: "DMSans-Bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default styles;