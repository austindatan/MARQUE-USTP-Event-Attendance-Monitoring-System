import { StyleSheet, Dimensions, PixelRatio, Platform } from "react-native";

const { width, height } = Dimensions.get('window');

const baseWidth = 375; 
const scale = width / baseWidth;

const scaleSize = (size: number) => Math.round(size * scale);
const normalize = (size: number) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: "#F5F5F5" 
    },
    content: {
        padding: scaleSize(20),
    },
    title: {
        fontSize: normalize(24),
        fontFamily: "DMSans-Bold",
        color: "#0A0F51",
        marginBottom: scaleSize(20),
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        marginBottom: scaleSize(15),
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: normalize(16),
        fontFamily: "DMSans-Bold",
        color: "#0A0F51",
        textAlign: 'center',
        padding: scaleSize(20),
    },
    sidebarContainer: {
    width: "70%",
    height: height,
    backgroundColor: "#fff",
    paddingTop: 50, 
    paddingHorizontal: 20,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    },

    profileContainer: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30, 
        marginBottom: 10,
        backgroundColor: "#ccc",
    },
    profileName: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
        marginBottom: 2,
        fontFamily: "DMSans-Bold",
    },
    profileTitle: {
        fontSize: 15,
        color: "#666",
        marginBottom: 2,
        fontFamily: "DMSans-Medium",
    },
    profileEmail: {
        fontSize: 14,
        color: "#888",
        fontFamily: "DMSans-Regular",
    },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 5,
    },
    menuText: {
        fontSize: 16,
        marginLeft: 15,
        color: "#333",
        fontFamily: "DMSans-Bold",
    },
    adminButton: {
        marginTop: 5,
        marginBottom: 5,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    adminContainer: {
        marginBottom: 5,
        paddingBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: "#edededff",
    },
    adminText: {
        fontSize: 16,
        color: "#0A0F51",
        marginLeft: 12,
        fontFamily: "DMSans-Bold",
    },
    organizationsButton: {
        marginTop: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: "#FFC844",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    organizationsText: {
        fontSize: 16,
        color: "red",
        marginLeft: 12,
        fontFamily: "DMSans-Bold",
    },
});

export default styles;