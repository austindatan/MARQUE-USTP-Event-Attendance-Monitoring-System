import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  logoContainer: {
    position: "absolute",
    top: "40%",
    alignItems: "center",
  },

  logo: {
    width: 280,
    height: 134,
    resizeMode: "contain",
  },

  loginContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "60%",
    backgroundColor: "#0A0E59",
    borderTopLeftRadius: 33,
    borderTopRightRadius: 33,
    paddingVertical: 50,
    paddingHorizontal: 50,
  },

  title: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    fontFamily: "DMSans-Bold",
  },

  input: {
    width: "100%",
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    fontFamily: "DMSans-Regular",
  },

  loginButton: {
    backgroundColor: "#FFCB05",
    borderRadius: 25,
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },

  loginText: {
    fontWeight: "600",
    color: "#0A0E59",
    fontFamily: "DMSans-Bold",
  },

  footerText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    alignItems: "center",
  },
});

export default styles;
