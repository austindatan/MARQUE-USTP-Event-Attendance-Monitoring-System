import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
  TextInput, ScrollView, Modal, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import joinModalStyles from '../styles/components_joinmodal';

const PRIMARY = '#0A0F51';
const YELLOW  = '#FFD100';

interface SettingsScreenProps {
  onClose: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();

  const [scanDelay, setScanDelay] = useState('2000');
  const [vibrateOnScan, setVibrateOnScan] = useState(true);

  // Confirmation modal for clear cache
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [doneVisible, setDoneVisible] = useState(false);

  const handleClearCache = async () => {
    try {
      await AsyncStorage.removeItem('attendanceLog');
    } catch (e) {
      console.error('Clear cache error:', e);
    }
    setConfirmVisible(false);
    setDoneVisible(true);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Confirm Clear Modal ── */}
      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <TouchableOpacity style={joinModalStyles.overlay} activeOpacity={1} onPress={() => setConfirmVisible(false)}>
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image source={require('../../assets/images/marque/MARQUE_whitelogo.png')} style={joinModalStyles.iconImage} />
            </View>
            <Text style={joinModalStyles.title}>Clear Cache?</Text>
            <Text style={joinModalStyles.desc}>This will remove all local attendance logs. This action cannot be undone.</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnOutline]} onPress={() => setConfirmVisible(false)}>
                <Text style={[styles.modalBtnText, { color: PRIMARY }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ef4444' }]} onPress={handleClearCache}>
                <Text style={styles.modalBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Done Modal ── */}
      <Modal visible={doneVisible} transparent animationType="fade" onRequestClose={() => setDoneVisible(false)}>
        <TouchableOpacity style={joinModalStyles.overlay} activeOpacity={1} onPress={() => setDoneVisible(false)}>
          <View style={joinModalStyles.modalBox}>
            <View style={joinModalStyles.iconContainer}>
              <Image source={require('../../assets/images/marque/MARQUE_whitelogo.png')} style={joinModalStyles.iconImage} />
            </View>
            <Text style={joinModalStyles.title}>Cache Cleared</Text>
            <Text style={joinModalStyles.desc}>All local attendance logs have been removed.</Text>
            <TouchableOpacity style={styles.modalBtnFull} onPress={() => setDoneVisible(false)}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner Settings</Text>
        <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Scanner Behaviour ── */}
        <Text style={styles.sectionLabel}>Scanner Behaviour</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="timer-outline" size={20} color={PRIMARY} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Scan Delay</Text>
                <Text style={styles.rowSub}>Cooldown between scans (ms)</Text>
              </View>
            </View>
            <TextInput
              style={styles.inlineInput}
              value={scanDelay}
              onChangeText={setScanDelay}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="phone-portrait-outline" size={20} color={PRIMARY} />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Vibrate on Scan</Text>
                <Text style={styles.rowSub}>Haptic feedback when QR is read</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: '#ccc', true: PRIMARY }}
              thumbColor={vibrateOnScan ? YELLOW : '#f4f3f4'}
              onValueChange={setVibrateOnScan}
              value={vibrateOnScan}
            />
          </View>
        </View>

        {/* ── Maintenance ── */}
        <Text style={styles.sectionLabel}>Data & Maintenance</Text>

        <TouchableOpacity style={styles.dangerRow} onPress={() => setConfirmVisible(true)}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
          <Text style={styles.dangerText}>Clear Local Cache</Text>
          <Ionicons name="chevron-forward" size={16} color="#ef4444" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* ── Version ── */}
        <Text style={styles.version}>MARQUE Attendance  ·  v1.0.0</Text>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FB' },

  // Header
  header: {
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  closeBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },
  doneBtn: {
    paddingHorizontal: 4,
  },
  doneBtnText: {
    color: YELLOW,
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
  },

  content: { padding: 20, paddingBottom: 60 },

  sectionLabel: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    color: '#888',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Card rows
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 14, fontFamily: 'DMSans-Medium', color: '#111' },
  rowSub: { fontSize: 12, fontFamily: 'DMSans-Regular', color: '#888', marginTop: 1 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 16 },
  inlineInput: {
    backgroundColor: '#F4F6FB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: PRIMARY,
    minWidth: 70,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#dde1f5',
  },

  // Danger row
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  dangerText: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: '#ef4444',
  },

  version: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    marginTop: 36,
  },

  // Modal buttons
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: PRIMARY,
  },
  modalBtnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  modalBtnFull: {
    marginTop: 20,
    width: '100%',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: PRIMARY,
  },
  modalBtnText: {
    color: '#fff',
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
  },
});

export default SettingsScreen;