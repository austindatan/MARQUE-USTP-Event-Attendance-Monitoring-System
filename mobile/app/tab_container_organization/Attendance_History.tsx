// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, 
  StatusBar, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from "../../config";

export default function AttendanceHistory({ onBack }) {
  const [attendanceLog, setAttendanceLog] = useState([]);

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      const studentId = await AsyncStorage.getItem("studentId");

      if (!studentId) {
        console.log("No studentId found.");
        return;
      }

      const response = await fetch(`${BASE_URL}/api/attendance/${studentId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        setAttendanceLog(data.attendance || []);
      } else {
        console.log("Fetch error:", data.message);
      }
    } catch (error) {
      console.log("Error fetching attendance history:", error);
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
                  <Text style={styles.recordName}>{record.eventName}</Text>
                  <Text style={styles.recordDate}>
                    {new Date(record.timestamp).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.recordDetails}>
                  <Text style={styles.recordText}>
                    <Text style={styles.recordLabel}>Status: </Text>
                    {record.status}
                  </Text>

                  <Text style={styles.recordTime}>
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
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
  recordHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  recordName: { fontSize: 18, fontWeight: "600", color: "#1f2937", flex: 1 },
  recordDate: { fontSize: 12, color: "#6b7280" },
  recordDetails: { gap: 4 },
  recordText: { fontSize: 14, color: "#4b5563" },
  recordLabel: { fontWeight: "500" },
  recordTime: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  clearButton: { backgroundColor: "#ef4444", padding: 16, borderRadius: 12, marginTop: 16, marginBottom: 32 },
  clearButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
});
