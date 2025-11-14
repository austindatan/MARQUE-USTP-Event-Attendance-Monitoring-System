// @ts-nocheck
import { StyleSheet, Dimensions, PixelRatio, Platform } from "react-native";

const { width, height } = Dimensions.get('window');

const baseWidth = 375; 
const scale = width / baseWidth;

const scaleSize = (size) => Math.round(size * scale);
const normalize = (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

const appeffects = StyleSheet.create({
    container: {
        bottom: 0,
        flex: 1, 
        backgroundColor: "#fff" 
    },

    pageStarter: {
        marginTop: scaleSize(-10),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    pageTitle: { 
        padding: scaleSize(20),
        fontSize: normalize(18), 
        fontFamily: "DMSans-Bold",
    },

    pageSubtitle: {
        padding: scaleSize(20),
        fontSize: normalize(11),
        fontFamily: "DMSans-Regular",
    },

    eventList: {
        paddingRight: scaleSize(20),
        paddingLeft: scaleSize(20),
        bottom: scaleSize(6),
    },

    eventListEX: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingRight: scaleSize(20),
        paddingLeft: scaleSize(20),
        bottom: scaleSize(6),
    },

    eventListORG: {
        paddingTop: scaleSize(20),
        paddingRight: scaleSize(20),
        paddingLeft: scaleSize(20),
        bottom: scaleSize(6),
    },
    
});

export default appeffects;