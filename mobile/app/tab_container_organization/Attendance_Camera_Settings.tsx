import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, ScrollView, Alert, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY_COLOR = '#0a0f4c';
const SECONDARY_COLOR = '#fecb20';

interface SettingsScreenProps {
  onClose: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  
  const [apiBaseUrl, setApiBaseUrl] = useState('https://your-api.com');
  const [scanDelay, setScanDelay] = useState('2000');
  const [vibrateOnScan, setVibrateOnScan] = useState(true);
  const [defaultEventId, setDefaultEventId] = useState('6923517772c7b61301a4e31f');

  const handleSave = () => {
    Alert.alert('Settings Saved', 'Your configuration has been updated.');
    onClose();
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all local attendance logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          Alert.alert('Done', 'Local cache cleared.');
        }},
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Scanner Settings</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionTitle}>Network & Event</Text>
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>API Base URL</Text>
          <TextInput
            style={styles.textInput}
            value={apiBaseUrl}
            onChangeText={setApiBaseUrl}
            placeholder="e.g., https://api.example.com"
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Default Event ID</Text>
          <TextInput
            style={styles.textInput}
            value={defaultEventId}
            onChangeText={setDefaultEventId}
          />
        </View>
        
        <Text style={styles.sectionTitle}>Scanner Behavior</Text>
        
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Scan Delay (ms)</Text>
          <TextInput
            style={styles.textInput}
            value={scanDelay}
            onChangeText={setScanDelay}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Vibrate on Scan</Text>
          <Switch
            trackColor={{ false: '#767577', true: PRIMARY_COLOR }}
            thumbColor={vibrateOnScan ? SECONDARY_COLOR : '#f4f3f4'}
            onValueChange={setVibrateOnScan}
            value={vibrateOnScan}
          />
        </View>

        <Text style={styles.sectionTitle}>Data & Maintenance</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
          <Text style={styles.actionButtonText}>Clear Local Cache</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App Version: v1.0.0</Text>
        </View>

      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Apply & Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: PRIMARY_COLOR,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: SECONDARY_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  settingGroup: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  settingLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  versionText: {
    color: '#999',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default SettingsScreen;