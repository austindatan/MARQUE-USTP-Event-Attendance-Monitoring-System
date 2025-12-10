// components_notification.js (Revised Stylesheet)

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    // --- Card & Layout ---
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 13,
        marginBottom: 15,
        overflow: 'hidden',
        shadowColor: "#505588",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    contentRow: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
    },
    image: {
        width: 75,
        height: 75,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#eee',
    },
    imageOrg: {
        width: 50,
        height: 50,
        borderRadius: 50,
        marginRight: 10,
        backgroundColor: '#eee',
    },
    orgLogo: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 5,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    // --- Text Styles (Branding) ---
    primaryText: {
        fontSize: 15,
        color: '#0A0F51', // Primary brand color
        fontFamily: "DMSans-Bold",
        marginBottom: 2,
    },
    primaryTextEvent: {
        fontSize: 18,
        color: '#0A0F51', // Primary brand color
        fontFamily: "DMSans-Bold",
        marginBottom: 2,
    },
    secondaryText: {
        fontSize: 11,
        color: '#666',
        fontFamily: "DMSans-Regular",
    },
    orgInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        marginBottom: 2,
        paddingRight: 20,
    },
    orgName: {
        fontSize: 12,
        color: '#888',
        fontFamily: "DMSans-Medium",
    },
    timeStatus: {
        fontSize: 12,
        fontFamily: "DMSans-Medium",
        color: '#E97200', // Default Orange for time status
        marginTop: 4,
    },
    // --- Event Confirmation Section (NO BUTTONS) ---
    attendanceContainer: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    attendanceMessage: {
        fontSize: 12,
        color: '#0A0F51',
        fontFamily: 'DMSans-Regular',
        textAlign: 'center',
    },
    // --- Org Action Button Area (ONLY FOR Org Card) ---
    actionArea: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '45%',
    },
    acceptButton: {
        backgroundColor: '#0A0F51', // Primary Brand Color
    },
    denyButton: {
        backgroundColor: '#ccc',
    },
    actionText: {
        color: '#fff',
        fontFamily: "DMSans-Medium",
        marginLeft: 5,
    },
    denyText: {
        color: '#666',
        fontFamily: "DMSans-Medium",
        marginLeft: 5,
    },
    statusText: {
        fontFamily: "DMSans-Medium",
        fontSize: 11,
    },
});

export default styles;