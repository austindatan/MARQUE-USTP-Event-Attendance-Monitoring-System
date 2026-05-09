import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    scrollContent: {
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontFamily: "DMSans-Bold",
        fontSize: 18,
        marginBottom: 10,
        color: "#222762",
    },
    loadingIndicator: {
        height: 50,
        justifyContent: 'center',
    },
    chipWrappingContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    applyButton: {
        marginTop: 20,
        backgroundColor: "#f5c20a",
        paddingVertical: 13,
        borderRadius: 30,
        alignItems: "center",
    },
    applyButtonText: {
        fontFamily: "DMSans-Bold",
        color: "#000",
        fontSize: 16,
    },
});

export default styles;