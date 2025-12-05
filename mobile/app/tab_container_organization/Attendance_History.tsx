import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Image, ActivityIndicator, } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BASE_URL } from '../../config';

const BackgroundImage = require('../../assets/images/marque/BlueBackground.png');
const FILTER_IMAGE = require('../../assets/images/marque/Filters.png');
const SEARCH_IMAGE = require('../../assets/images/marque/Search.png');

interface LogEntry {
    name: string;
    date: string;
    time: string;
    student_number: string;
    program: string;  
}

const LogItem: React.FC<LogEntry> = ({ name, date, time, student_number, program }) => (
    <View>
        <View style={styles.logItem}>
            <View style={styles.logDetails}>
                <Text style={styles.logName}>{name}</Text>
                <Text style={styles.logTime}>{date}  {time}</Text>
            </View>
            <View style={styles.logDetails}>
                <Text style={styles.logId}>{student_number}</Text>
                <Text style={styles.logProgram}>{program}</Text>
            </View>
        </View>
        <View style={styles.separator} />
    </View>
);

interface AttendanceHistoryProps {
    onBack: () => void;
    eventId: string;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ onBack, eventId }) => {
    const [attendanceLog, setAttendanceLog] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');

    const searchTimeout = useRef<number | null>(null);

    const fetchAttendance = async (query?: string) => {
        try {
            setLoading(true);
            const url = query
                ? `${BASE_URL}/api/attendance/search/${eventId}?q=${encodeURIComponent(query)}`
                : `${BASE_URL}/api/attendance/history/${eventId}`;

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok && Array.isArray(data.history)) {
                setAttendanceLog(data.history);
            } else {
                console.warn("Failed to retrieve attendance history", data);
                setAttendanceLog([]);
            }
        } catch (error) {
            console.error("Network error:", error);
            setAttendanceLog([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [eventId]);

    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        searchTimeout.current = setTimeout(() => {
            fetchAttendance(searchText.trim());
        }, 500); // 500ms delay
    }, [searchText]);

    const filteredLogs = attendanceLog.filter(
        log =>
            log.name.toLowerCase().includes(searchText.toLowerCase()) ||
            log.student_number.includes(searchText)
    );

    return (
        <View style={styles.safeArea}>
            <ImageBackground source={BackgroundImage} style={styles.background} resizeMode="cover">
                <View style={styles.container}>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.headerText} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Attendance Log</Text>
                    </View>

                    <View style={styles.searchContainer}>
                        <View style={styles.searchBar}>
                            <Image source={SEARCH_IMAGE} style={styles.searchImage} resizeMode="contain" />
                            <TextInput
                                style={styles.input}
                                placeholder="Search..."
                                placeholderTextColor="rgba(120,123,157,0.7)"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            <TouchableOpacity style={styles.filtersButton}>
                                <Image source={FILTER_IMAGE} style={styles.filterImage} resizeMode="contain" />
                                <Text style={styles.filtersText}>Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.contentArea}>
                        {loading ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#10b981" />
                            </View>
                        ) : (
                            <ScrollView contentContainerStyle={styles.logList}>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log, index) => (
                                        <LogItem
                                            key={index}
                                            name={log.name}
                                            date={log.date}
                                            time={log.time}
                                            student_number={log.student_number}
                                            program={log.program}
                                        />
                                    ))
                                ) : (
                                    <Text style={{ textAlign: 'center', marginTop: 20 }}>
                                        No records found.
                                    </Text>
                                )}
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        )}
                    </View>

                </View>
            </ImageBackground>
        </View>
    );
};

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
    search: 18,
    filterText: 14,
};

const SPACING = {
    paddingHorizontal: 25,
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, paddingTop: 10 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.paddingHorizontal,
    paddingBottom: 20,
    paddingTop: 20,
  },
  headerTitle: {
    color: COLORS.headerText,
    fontSize: FONT_SIZES.header,
    fontWeight: '700',
    fontFamily: 'DM Sans',
    marginLeft: 10,
    flex: 1,
    textAlign: 'center',
    transform: [{ translateX: -12 }],
  },

  searchContainer: {
    paddingHorizontal: SPACING.paddingHorizontal,
    marginBottom: 15,
    marginTop: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchImage: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  filterImage: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  filtersText: {
    color: COLORS.headerText,
    fontSize: FONT_SIZES.filterText,
    fontWeight: '600',
    fontFamily: 'DM Sans',
  },

  contentArea: {
    flex: 1,
    backgroundColor: COLORS.contentBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  logList: {
    paddingTop: 15,
    paddingBottom: 20,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
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
  logTime: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'DM Sans',
  },
  logId: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    marginLeft: 10,
    fontFamily: 'DM Sans',
  },
  logProgram: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'DM Sans',
    textAlign: 'right',
},
  separator: {
    height: 1,
    backgroundColor: COLORS.separator,
    marginHorizontal: 25,
  },
});

export default AttendanceHistory;
