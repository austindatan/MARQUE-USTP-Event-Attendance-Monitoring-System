import { Button } from "@react-navigation/elements";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },

  logo: {
    width: 150,
    height: 150,
  },

  text: {
    fontSize: 13,
    color: "#000",
    fontFamily: "DMSans-Regular",
    textAlign: "center",
    width: 200,
  },

  button: {
    width: 150,
    height: 40,
    borderRadius: 15,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0F51",
  },

  activeText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "DMSans-Bold",
  },


});

export default styles;
