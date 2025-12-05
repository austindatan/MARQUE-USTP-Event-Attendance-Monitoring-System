import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#fff" 
    },
    headerContentWrapper: {
        flexDirection: 'row',       
        alignItems: 'center',       
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        marginBottom: 10,           
    },
    backButtonTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonIcon: {
        marginRight: 4, 
    },
    backButtonTitleText: { 
        fontSize: 18, 
        fontWeight: "700", 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    noResultsText: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#444',
    },
    noResultsSubtext: {
        fontSize: 14,
        color: '#888',
    },
    titleText: { 
        fontSize: 18, 
        fontWeight: "700", 
    },
    resultCount: {
        fontSize: 14,
        color: "#888",
        fontWeight: "500",
    },
    scrollView: { 
        flex: 1, 
        paddingHorizontal: 20, 
    },
    bottomSpacer: {
        height: 60 
    }
});

export default styles;