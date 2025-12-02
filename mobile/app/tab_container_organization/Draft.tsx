import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ImageBackground,
  ScrollView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

// --- BACKGROUND IMAGE & FILTER LOGO ---
const BackgroundImage = require('../../assets/images/marque/BlueBackground.png');
const FILTER_LOGO_IMAGE = require('../../assets/images/marque/LogoImage.jpg');

// --- COLORS AND CONSTANTS ---
const COLORS = {
  headerText: '#FFFFFF',
  inputBackground: 'rgba(255, 255, 255, 0.15)',
  inputPlaceholder: '#787b9d',
  inputText: '#FFFFFF',
  filterButton: '#222762',
  logBackground: '#FFFFFF',
  contentBackground: '#FFFFFF',
  separator: '#DDDDDD',
};

const FONT_SIZES = {
  header: 20,
  search: 20,
  filters: 14,
};

const SPACING = {
  paddingHorizontal: 20,
};

// --- MOCK ATTENDANCE DATA ---
interface LogEntry {
  name: string;
  time: string;
  studentId: string;
}

const attendanceLog: LogEntry[] = [
  { name: 'Nikka Rodriguez', time: '2025-10-10 10:34 AM', studentId: '2023300204' },
  { name: 'Zyrile Retuertas', time: '2025-10-10 10:33 AM', studentId: '2023300181' },
  { name: 'Vonzelle Puray', time: '2025-10-10 10:34 AM', studentId: '2023300111' },
  { name: 'Sabrina Aryan', time: '2025-10-10 10:34 AM', studentId: '2023300222' },
  { name: 'Austin Datan', time: '2025-10-10 10:34 AM', studentId: '2023300209' },
  { name: 'Angelo Binonggo', time: '2025-10-10 10:34 AM', studentId: '2023300304' },
  { name: 'Finnah Bajas', time: '2025-10-10 10:34 AM', studentId: '2023300207' },
  { name: 'Sabrina Carpenter', time: '2025-10-10 10:34 AM', studentId: '2023303021' },
  { name: 'John Doe', time: '2025-10-10 10:35 AM', studentId: '2023300400' },
  { name: 'Jane Smith', time: '2025-10-10 10:36 AM', studentId: '2023300500' },
];

// --- LOG ITEM COMPONENT ---
const LogItem: React.FC<LogEntry> = ({ name, time, studentId }) => (
  <View>
    <View style={styles.logItem}>
      <View style={styles.logDetails}>
        <Text style={styles.logName}>{name}</Text>
        <Text style={styles.logTime}>{time}</Text>
      </View>
      <Text style={styles.logId}>{studentId}</Text>
    </View>
    <View style={styles.separator} />
  </View>
);

// --- MAIN COMPONENT ---
const AttendanceHistoryScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={BackgroundImage}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => console.log('Go back')}>
              <Ionicons name="arrow-back" size={24} color={COLORS.headerText} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Attendance Log</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search"
                size={24}
                color={COLORS.inputPlaceholder}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Search..."
                placeholderTextColor={COLORS.inputPlaceholder}
              />
              <TouchableOpacity style={styles.filtersButton}>
                <Image
                  source={FILTER_LOGO_IMAGE}
                  style={styles.filterImage}
                  resizeMode="contain"
                />
                <Text style={styles.filtersText}>Filters</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Attendance List */}
          <View style={styles.contentArea}>
            <ScrollView contentContainerStyle={styles.logList}>
              {attendanceLog.map((log, index) => (
                <LogItem key={index} {...log} />
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, paddingTop: 10 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.paddingHorizontal,
    paddingBottom: 20,
  },
  headerTitle: {
    color: COLORS.headerText,
    fontSize: FONT_SIZES.header,
    fontWeight: '600',
    fontFamily: 'DM Sans',
    marginLeft: 10,
    flex: 1,
    textAlign: 'center',
    transform: [{ translateX: -12 }],
  },

  // Search
  searchContainer: { paddingHorizontal: SPACING.paddingHorizontal, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 50,
    height: 40,
    paddingHorizontal: 15,
  },
  searchIcon: { marginRight: 10 },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.inputText,
    fontSize: FONT_SIZES.search,
    paddingVertical: 0,
    fontFamily: 'DM Sans',
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.filterButton,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 10,
    height: 30,
  },
  filterImage: { width: 16, height: 16, marginRight: 5 },
  filtersText: {
    color: COLORS.headerText,
    fontSize: FONT_SIZES.filters,
    fontWeight: '600',
    fontFamily: 'DM Sans',
  },

  // Attendance List
  contentArea: {
    flex: 1,
    backgroundColor: COLORS.contentBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  logList: { paddingTop: 0 },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 30,
    backgroundColor: COLORS.logBackground,
  },
  logDetails: { flex: 1 },
  logName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
    fontFamily: 'DM Sans',
  },
  logTime: { fontSize: 12, color: '#888888', fontFamily: 'DM Sans' },
  logId: { fontSize: 16, fontWeight: '400', color: '#000', marginLeft: 10, fontFamily: 'DM Sans' },
  separator: {
    height: 1,
    backgroundColor: COLORS.separator,
    marginHorizontal: 25,
  },
});

export default AttendanceHistoryScreen;