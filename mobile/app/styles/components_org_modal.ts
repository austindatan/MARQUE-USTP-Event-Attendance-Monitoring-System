import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginTop: 40,
  },

  roundImageWrapper: {
    position: "absolute",
    top: -30,
    zIndex: 10,
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 50,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  roundImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  shadowWrapper: {
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 4,
  },

  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    marginTop: 30,
  },

  imageContainer: {
    width: "100%",
    height: 150,
  },

  eventPoster: {
    width: "100%",
    height: "100%",
  },

  details: {
    padding: 15,
  },

  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },

  orgName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },

  desc: {
    fontSize: 14,
    color: "#333",
  },
});

export default styles;