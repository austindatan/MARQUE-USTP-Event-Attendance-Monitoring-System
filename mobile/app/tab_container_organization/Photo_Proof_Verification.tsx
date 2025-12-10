// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  Dimensions,
  ListRenderItemInfo,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; 
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header_Normal";

interface User {
  _id: string;
  firstname: string;
  lastname: string;
}

interface AttendanceLogItem {
  _id: string;
  event_id: string;
  user_id: User;
  student_number: string;
  photoproof_url: string;
  photoproof_status: 'pending' | 'verified' | 'rejected';
  photoproof_submitted_at: Date;
}

const PhotoProofVerification: React.FC = () => {
  const router = useRouter(); 
  const { eventId: rawEventId } = useLocalSearchParams();
  const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

  const [pendingProofs, setPendingProofs] = useState<AttendanceLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleBack = () => router.back();

  const fetchPendingProofs = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get<AttendanceLogItem[]>(
        `${BASE_URL}/api/attendance/photoproofs/pending/${eventId}`
      );
      setPendingProofs(response.data); 
    } catch (error) {
      console.error("Error fetching pending proofs:", error);
      Alert.alert("Fetch Error", "Failed to load pending photo proofs.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // --- Handle Approve / Reject ---
  const handleAction = async (logId: string, action: 'verified' | 'rejected') => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const token = await AsyncStorage.getItem('userToken');

      await axios.post(
        `${BASE_URL}/api/attendance/verify-photoproof`,
        { attendanceLogId: logId, status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingProofs(prev => prev.filter(log => log._id !== logId));
      Alert.alert("Success", `Photo proof ${action} successfully.`);
    } catch (error) {
      console.error(`Error ${action} photo proof:`, error);
      Alert.alert("Error", `Failed to ${action} photo proof. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchPendingProofs();
  }, [fetchPendingProofs]);

  const renderProofItem = ({ item }: ListRenderItemInfo<AttendanceLogItem>) => {
    const studentName = `${item.user_id?.firstname || 'N/A'} ${item.user_id?.lastname || 'Student'}`;
    const studentNumber = item.student_number || 'N/A';

    return (
      <View style={styles.proofCard}>
        <Text style={styles.studentName}>{studentName}</Text>
        <Text style={styles.studentNumber}>Student No: {studentNumber}</Text>

        <TouchableOpacity onPress={() => { setSelectedImage(item.photoproof_url); setModalVisible(true); }}>
          <Image 
            source={{ uri: item.photoproof_url }} 
            style={styles.proofImage} 
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleAction(item._id, 'verified')}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleAction(item._id, 'rejected')}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={styles.safeArea}>
      <Header title="Verify Photo Proofs" showBackButton={true} backAction={handleBack} />
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0A0F51" />
        <Text style={styles.loadingText}>Loading pending proofs...</Text>
      </View>
    </View>
  );

  if (pendingProofs.length === 0) return (
    <View style={styles.safeArea}>
      <Header title="Verify Photo Proofs" showBackButton={true} backAction={handleBack} />
      <View style={styles.centerContainer}>
        <Ionicons name="checkmark-circle-outline" size={50} color="#0A0F51" />
        <Text style={styles.emptyText}>No pending photo proofs for this event.</Text>
        <TouchableOpacity onPress={fetchPendingProofs} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <Header title="Verify Photo Proofs" showBackButton={true} backAction={handleBack} />

      <FlatList
        data={pendingProofs}
        keyExtractor={(item) => item._id}
        renderItem={renderProofItem}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchPendingProofs}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 35 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
  emptyText: { marginTop: 15, fontSize: 18, textAlign: 'center', color: '#555' },
  refreshButton: { marginTop: 20, backgroundColor: '#0A0F51', padding: 10, borderRadius: 8 },
  refreshText: { color: '#fff', fontWeight: 'bold' },
  listContainer: { padding: 10 },
  proofCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 5 },
  studentName: { fontSize: 18, fontWeight: 'bold', color: '#0A0F51', marginBottom: 5 },
  studentNumber: { fontSize: 14, color: '#666', marginBottom: 10 },
  proofImage: { width: '100%', height: 350, borderRadius: 8, marginBottom: 15, backgroundColor: '#eee' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
  approveButton: { backgroundColor: '#4CAF50' },
  rejectButton: { backgroundColor: '#F44336' },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 5 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: width * 0.95, height: height * 0.8 },
  modalCloseButton: { position: 'absolute', top: 40, right: 20, zIndex: 2 },
});

export default PhotoProofVerification;
