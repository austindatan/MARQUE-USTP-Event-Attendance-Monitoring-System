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

  const [data, setData] = useState<AttendanceLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleBack = () => router.back();

  const fetchData = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const endpoint = activeTab === 'pending' ? 'pending' : 'history';
      const response = await axios.get<AttendanceLogItem[]>(
        `${BASE_URL}/api/attendance/photoproofs/${endpoint}/${eventId}`
      );
      setData(response.data);
    } catch (error) {
      console.error(`Error fetching ${activeTab} proofs:`, error);
      Alert.alert("Fetch Error", `Failed to load ${activeTab} photo proofs.`);
    } finally {
      setLoading(false);
    }
  }, [eventId, activeTab]);

  // --- Handle Approve / Reject ---
  const handleAction = async (logId: string, action: 'verified' | 'rejected') => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const token = await AsyncStorage.getItem('token');

      await axios.post(
        `${BASE_URL}/api/attendance/verify-photoproof`,
        { attendanceLogId: logId, status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setData(prev => prev.filter(log => log._id !== logId));
      Alert.alert("Success", `Photo proof ${action} successfully.`);
    } catch (error) {
      console.error(`Error ${action} photo proof:`, error);
      Alert.alert("Error", `Failed to ${action} photo proof. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderProofItem = ({ item }: ListRenderItemInfo<AttendanceLogItem>) => {
    const studentName = `${item.user_id?.firstname || 'N/A'} ${item.user_id?.lastname || 'Student'}`;
    const studentNumber = item.student_number || 'N/A';

    return (
      <View style={styles.proofCard}>
        <Text style={styles.studentName}>{studentName}</Text>
        <Text style={styles.studentNumber}>Student No: {studentNumber}</Text>

        <TouchableOpacity style={{ width: '100%' }} onPress={() => { setSelectedImage(item.photoproof_url); setModalVisible(true); }}>
          <Image
            source={{ uri: item.photoproof_url }}
            style={styles.proofImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {activeTab === 'pending' ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleAction(item._id, 'verified')}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleAction(item._id, 'rejected')}
            >
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.statusBox, item.photoproof_status === 'verified' ? styles.bgGreen : styles.bgRed]}>
            <Text style={styles.statusText}>
              {item.photoproof_status.toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <Header title="Verify Photo Proofs" showBackButton={true} backAction={handleBack} />

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'pending' && styles.tabButtonActive]} onPress={() => setActiveTab('pending')}>
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]} onPress={() => setActiveTab('history')}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0A0F51" />
          <Text style={styles.loadingText}>Loading {activeTab} proofs...</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="images-outline" size={50} color="#0A0F51" />
          <Text style={styles.emptyText}>No {activeTab} photo proofs for this event.</Text>
          <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id}
          renderItem={renderProofItem}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchData}
          numColumns={3}
        />
      )}

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
  listContainer: { padding: 10, alignItems: 'flex-start' },
  proofCard: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 8, 
    margin: 5, 
    elevation: 3, 
    width: (width - 20) / 3 - 10,
    alignItems: 'center'
  },
  studentName: { fontSize: 12, fontWeight: 'bold', color: '#0A0F51', marginBottom: 2, textAlign: 'center' },
  studentNumber: { fontSize: 10, color: '#666', marginBottom: 5, textAlign: 'center' },
  proofImage: { width: '100%', height: 120, borderRadius: 6, marginBottom: 8, backgroundColor: '#eee' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 5, width: '100%' },
  actionButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 6 },
  approveButton: { backgroundColor: '#4CAF50' },
  rejectButton: { backgroundColor: '#F44336' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabButtonActive: { borderBottomWidth: 3, borderBottomColor: '#0A0F51' },
  tabText: { fontSize: 16, color: '#666', fontFamily: 'DMSans-Medium' },
  tabTextActive: { color: '#0A0F51', fontFamily: 'DMSans-Bold' },
  statusBox: { marginTop: 5, paddingVertical: 5, borderRadius: 5, width: '100%', alignItems: 'center' },
  bgGreen: { backgroundColor: '#4CAF50' },
  bgRed: { backgroundColor: '#F44336' },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: width * 0.95, height: height * 0.8 },
  modalCloseButton: { position: 'absolute', top: 40, right: 20, zIndex: 2 },
});

export default PhotoProofVerification;
