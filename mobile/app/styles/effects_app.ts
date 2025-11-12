// @ts-nocheck
import { StyleSheet } from "react-native";
import { event } from "react-native/types_generated/Libraries/Animated/AnimatedExports";

const appeffects = StyleSheet.create({
    container: {
        bottom: 0,
        flex: 1, 
        backgroundColor: "#fff" 
    },

    pageStarter: {
        marginTop: -10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    pageTitle: { 
        padding: 20,
        fontSize: 16,
        fontFamily: "DMSans-Bold",
    },

    pageSubtitle: {
        padding: 20,
        fontSize: 11,
        fontFamily: "DMSans-Regular",
    },

    eventList: {
        paddingRight: 20,
        paddingLeft: 20,
        bottom: 6,
    },
});

export default appeffects;
