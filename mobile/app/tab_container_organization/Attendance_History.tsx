import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Modal, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../config';
import { apiFetch } from '../../utils/apiFetch';

interface LogEntry {
  name: string;
  date: string;
  time: string;
  student_number: string;
  program: string;
}

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
      const path = query
        ? `/api/attendance/search/${eventId}?q=${encodeURIComponent(query)}`
        : `/api/attendance/history/${eventId}`;

      const data = await apiFetch(path);

      if (Array.isArray(data.history)) {
        setAttendanceLog(data.history);
      } else {
        setAttendanceLog([]);
      }
    } catch (error) {
      console.error('Network error:', error);
      setAttendanceLog([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [eventId]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchAttendance(searchText.trim());
    }, 500);
  }, [searchText]);

  const filteredLogs = attendanceLog.filter(
    log =>
      log.name.toLowerCase().includes(searchText.toLowerCase()) ||
      log.student_number.includes(searchText)
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F51" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Log</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredLogs.length}</Text>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── List ── */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#0A0F51" />
            <Text style={styles.centerStateText}>Loading records...</Text>
          </View>
        ) : filteredLogs.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.centerStateText}>
              {searchText ? 'No matching records found.' : 'No attendance records yet.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
          >
            {filteredLogs.map((log, index) => (
              <View key={index} style={styles.card}>
                {/* Left: avatar initial */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {log.name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>

                {/* Center: name + date/time */}
                <View style={styles.cardCenter}>
                  <Text style={styles.cardName} numberOfLines={1}>{log.name}</Text>
                  <Text style={styles.cardMeta}>{log.date}  ·  {log.time}</Text>
                </View>

                {/* Right: ID + program */}
                <View style={styles.cardRight}>
                  <Text style={styles.cardId}>{log.student_number}</Text>
                  <View style={styles.programBadge}>
                    <Text style={styles.programText}>{log.program}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FB' },

  // Header
  header: {
    backgroundColor: '#0A0F51',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backBtn: { padding: 4, marginRight: 10 },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
  },
  countBadge: {
    backgroundColor: '#FFD100',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    color: '#0A0F51',
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
  },

  // Search
  searchWrapper: {
    backgroundColor: '#0A0F51',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    paddingVertical: 0,
  },

  // List area
  listContainer: {
    flex: 1,
    backgroundColor: '#F4F6FB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -12,
    overflow: 'hidden',
    paddingTop: 12,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
    gap: 12,
  },
  centerStateText: {
    color: '#999',
    fontSize: 15,
    fontFamily: 'DMSans-Regular',
  },

  // Cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#505588',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0A0F51',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#FFD100',
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
  },
  cardCenter: { flex: 1 },
  cardName: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: '#111',
    marginBottom: 3,
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: '#888',
  },
  cardRight: { alignItems: 'flex-end', flexShrink: 0 },
  cardId: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: '#0A0F51',
    marginBottom: 4,
  },
  programBadge: {
    backgroundColor: '#EEF0FF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  programText: {
    fontSize: 11,
    fontFamily: 'DMSans-Bold',
    color: '#0A0F51',
  },
});

export default AttendanceHistory;
