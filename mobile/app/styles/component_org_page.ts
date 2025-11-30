import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

// Color Palette
export const COLORS = {
  primaryNavy: '#0c113b',
  accentBlue: '#2a7de1',
  background: '#FFFFFF',
  cardBg: '#f3f4f6',
  textDark: '#101010',
  textGray: '#666666',
  white: '#FFFFFF',
  shadow: '#000',
};

export const STYLES = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
  headerContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  headerImageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  navRow: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
  },

  // Profile Section
  profileSectionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: -50,
  },

  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 15,
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff1f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },

  // Org Info
  orgTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 15,
  },

  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 25,
  },

  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff1f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // About Section
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'justify',
  },

  // Events Section
  eventsTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 10,
  },

  // OLD TAB STYLES (no longer used)
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e6e8eb',
    borderRadius: 50,
    padding: 4,
    marginBottom: 25,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: 'center',
  },
  activeTabOld: {
    backgroundColor: COLORS.primaryNavy,
  },
  inactiveTabOld: {
    backgroundColor: 'transparent',
  },

  // Event Card
  cardContainer: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 100,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  dateBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'transparent',
  },
  fabCircle: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primaryNavy,
    justifyContent: 'center',
    alignItems: 'center',
  },
    
  /* -------------------------------------------------
  * NEW: Separated Tabs (Incoming / Concluded)
  * ------------------------------------------------- */
  tabWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  singleTab: {
    flex: 1,
    paddingVertical: 12,   // controls tab height
    marginHorizontal: 5,
    borderRadius: 50,      // pill shape
    alignItems: 'center',
    justifyContent: 'center', // vertically center text
    minWidth: 120,          // ensures oblong width
  },
  activeTab: {
    backgroundColor: COLORS.primaryNavy,
    borderRadius: 50,
  },
  inactiveTab: {
    backgroundColor: '#d3d3d3',
    borderRadius: 50,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.white,
  },
  inactiveTabText: {
    color: COLORS.textDark,
  },
  bannerGradient: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '50%',
  zIndex: 5,
},

  /* -------------------------------------------------
   * NEW: Placeholder Content Block
   * ------------------------------------------------- */
  contentPlaceholder: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textGray,
  },
});
