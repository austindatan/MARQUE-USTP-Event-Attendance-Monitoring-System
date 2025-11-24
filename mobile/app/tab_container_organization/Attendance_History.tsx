// AttendanceHistory.tsx
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, 
  StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from "../../config";

// -------------------------------
// Optional: uncomment for testing without passing eventId
 const DEFAULT_EVENT_ID = "6923517772c7b61301a4e31f"; 
// -------------------------------

export default function AttendanceHistory({ eventId, onBack }: { eventId?: string, onBack: () => void }) {
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      let usedEventId = eventId;

      // -------------------------------
      // Optional testing: use default event if none provided
       if (!usedEventId) {
         console.warn("⚠️ No event_id provided — using DEFAULT event for testing.");
         usedEventId = DEFAULT_EVENT_ID;
       }
      

      if (!usedEventId) {
        Alert.alert('Error', 'No event ID provided');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/attendance/history/${usedEventId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        const history = data.history || [];
        setAttendanceLog(history);
      } else {
        console.log("Fetch error:", data.message);
        Alert.alert('Error', data.message || 'Unable to fetch attendance history');
      }
    } catch (error) {
      console.log("Error fetching attendance history:", error);
      Alert.alert('Network Error', 'Unable to fetch attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "This will only clear your local device history (not database). Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => setAttendanceLog([]),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.historyContainer}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.historyHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.historyHeaderText}>
          <Text style={styles.historyTitle}>Attendance History</Text>
          <Text style={styles.historyCount}>
            Total Records: {attendanceLog.length}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.historyContent}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={{ color: '#6366f1', marginTop: 16 }}>Loading attendance...</Text>
          </View>
        ) : attendanceLog.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>No attendance records yet</Text>
          </View>
        ) : (
          <>
            {attendanceLog.map((record, index) => (
              <View key={index} style={styles.recordCard}>
                <Text style={styles.recordName}>{record.name}</Text>

                <Text style={styles.recordText}>
                  <Text style={styles.recordLabel}>Student #: </Text>
                  {record.student_number}
                </Text>

                <Text style={styles.recordText}>
                  <Text style={styles.recordLabel}>Program: </Text>
                  {record.program}
                </Text>

                <Text style={styles.recordText}>
                  <Text style={styles.recordLabel}>Date: </Text>
                  {new Date(record.time_in).toLocaleDateString()}
                </Text>

                <Text style={styles.recordText}>
                  <Text style={styles.recordLabel}>Time: </Text>
                  {new Date(record.time_in).toLocaleTimeString()}
                </Text>
              </View>
            ))}

            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={handleClearHistory}
            >
              <Text style={styles.clearButtonText}>Clear Local History</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  historyContainer: { flex: 1, backgroundColor: "#fff" },
  historyHeader: { backgroundColor: "#6366f1", flexDirection: "row", alignItems: "center", padding: 24, paddingTop: 16 },
  backButton: { padding: 8, marginRight: 16 },
  historyHeaderText: { flex: 1 },
  historyTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  historyCount: { fontSize: 14, color: "#c7d2fe", marginTop: 4 },
  historyContent: { flex: 1, padding: 16 },
  emptyState: { alignItems: "center", paddingVertical: 48 },
  emptyStateText: { fontSize: 16, color: "#6b7280", marginTop: 16 },
  recordCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  recordName: { fontSize: 18, fontWeight: "600", color: "#1f2937", flex: 1, marginBottom: 4 },
  recordText: { fontSize: 14, color: "#4b5563", marginBottom: 2 },
  recordLabel: { fontWeight: "500" },
  clearButton: { backgroundColor: "#ef4444", padding: 16, borderRadius: 12, marginTop: 16, marginBottom: 32 },
  clearButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
});
