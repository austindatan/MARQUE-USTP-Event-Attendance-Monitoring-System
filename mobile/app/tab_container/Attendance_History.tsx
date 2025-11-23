import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AttendanceHistoryProps {
  onBack: () => void;
}

export default function AttendanceHistory({ onBack }: AttendanceHistoryProps) {
  const [attendanceLog, setAttendanceLog] = useState<any[]>([]);

  useEffect(() => {
    loadAttendanceLog();
  }, []);

  const loadAttendanceLog = async () => {
    try {
      const saved = await AsyncStorage.getItem('attendanceLog');
      if (saved) {
        setAttendanceLog(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading attendance log:', error);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all attendance history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setAttendanceLog([]);
            await AsyncStorage.removeItem('attendanceLog');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.historyContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.historyHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.historyHeaderText}>
          <Text style={styles.historyTitle}>Attendance History</Text>
          <Text style={styles.historyCount}>Total Records: {attendanceLog.length}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.historyContent}>
        {attendanceLog.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No attendance records yet</Text>
          </View>
        ) : (
          <>
            {attendanceLog.map((record, index) => (
              <View key={index} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordName}>{record.name || 'N/A'}</Text>
                  <Text style={styles.recordDate}>
                    {record.timestamp ? new Date(record.timestamp).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
                <View style={styles.recordDetails}>
                  <Text style={styles.recordText}><Text style={styles.recordLabel}>ID: </Text>{record.studentId || 'N/A'}</Text>
                  <Text style={styles.recordText}><Text style={styles.recordLabel}>Program: </Text>{record.program || 'N/A'}</Text>
                  <Text style={styles.recordTime}>{record.timestamp ? new Date(record.timestamp).toLocaleTimeString() : ''}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory} activeOpacity={0.8}>
              <Text style={styles.clearButtonText}>Clear All History</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  historyContainer: { flex: 1, backgroundColor: '#fff' },
  historyHeader: { backgroundColor: '#6366f1', flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 16 },
  backButton: { padding: 8, marginRight: 16 },
  historyHeaderText: { flex: 1 },
  historyTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  historyCount: { fontSize: 14, color: '#c7d2fe', marginTop: 4 },
  historyContent: { flex: 1, padding: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyStateText: { fontSize: 16, color: '#6b7280', marginTop: 16 },
  recordCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  recordName: { fontSize: 18, fontWeight: '600', color: '#1f2937', flex: 1 },
  recordDate: { fontSize: 12, color: '#6b7280' },
  recordDetails: { gap: 4 },
  recordText: { fontSize: 14, color: '#4b5563' },
  recordLabel: { fontWeight: '500' },
  recordTime: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  clearButton: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, marginTop: 16, marginBottom: 32 },
  clearButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
