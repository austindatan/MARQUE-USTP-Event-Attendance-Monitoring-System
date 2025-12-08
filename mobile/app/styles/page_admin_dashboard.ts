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
        padding: scaleSize(10),
        flex: 1,
    },
    contentDashboard: {
        padding: scaleSize(20),
        flex: 1,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginHorizontal: 15,
        marginTop: 10,
        marginBottom: 15,
        height: 45,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
        elevation: 2,
        justifyContent: 'center',
    },
    searchContainerRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginRight: 10,
        height: 45,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
        elevation: 2,
    },
    addButton: {
        backgroundColor: '#fff',
        width: scaleSize(45),
        height: scaleSize(45),
        borderRadius: scaleSize(8),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 3,
        marginRight: 10,
    },
    addButtonOrg: {
        backgroundColor: '#fff',
        width: scaleSize(45),
        height: scaleSize(45),
        borderRadius: scaleSize(8),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 3,
    },
    searchAndAddRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginTop: 10,
        marginBottom: 15
    },
    searchAndFilterRow: { 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginTop: 10,
        marginBottom: 15,
    },
    filterButton: {
        backgroundColor: '#0A0F51',
        width: 45,
        height: 45,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 8,
        fontFamily: "DMSans-Regular",
    },
    categoryButtonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginBottom: 15,
        paddingBottom: 0,
        borderBottomWidth: 0,
        borderBottomColor: 'transparent',
        justifyContent: 'center',
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    categoryButtonActive: {
        backgroundColor: '#0A0F51',
    },
    categoryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    categoryButtonTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
    eventList: {
        paddingHorizontal: 15, 
        flex: 1,
    },
    activeButtonEX: {
        backgroundColor: "#FFD100",
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 2,
    },
    inactiveButtonEX: {
        backgroundColor: "#C7C7C7",
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 2,
    },
    activeText: {
        color: "#fff",
        fontSize: 14,
        fontFamily: "DMSans-Regular",
    },
    inactiveText: {
        color: "#fff",
        fontSize: 14,
        fontFamily: "DMSans-Regular",
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        marginTop: 50,
        minHeight: 200,
    }, 
    emptyStateText: {
        fontSize: 18,
        color: '#0A0F51',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: "DMSans-Bold",
    },
    emptyStateSubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: "DMSans-Regular",
    },
});

export default styles;
