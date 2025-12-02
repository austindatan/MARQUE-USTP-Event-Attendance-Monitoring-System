// @ts-nocheck
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

/* ---------------------------------------------
   Small Component: Dashed Placeholder Box
--------------------------------------------- */
const DashedPlaceholder = ({ style, onPress }: { style?: any; onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={[styles.dashedBox, style]}>
      <MaterialCommunityIcons name="plus" size={24} color="#7F5AF0" />
    </View>
  </TouchableOpacity>
);

/* ---------------------------------------------
   Main Component
--------------------------------------------- */
const EditEvents: React.FC = () => {
  const handleMainImagePress = () => {
    console.log('Main image placeholder pressed');
  };

  const handleSmallImagePress = (index: number) => {
    console.log(`Small placeholder ${index + 1} pressed`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* -------- Header -------- */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Event</Text>
        </View>

        {/* -------- Image Upload Section -------- */}
        <View style={styles.imageUploadArea}>
          <TouchableOpacity style={styles.mainImagePlaceholder} onPress={handleMainImagePress}>
            <MaterialCommunityIcons name="plus" size={30} color="#7F5AF0" />
          </TouchableOpacity>

          <View style={styles.smallImageRow}>
            {[...Array(4)].map((_, index) => (
              <DashedPlaceholder
                key={index}
                style={styles.smallPlaceholder}
                onPress={() => handleSmallImagePress(index)}
              />
            ))}
          </View>
        </View>

        {/* -------- Form Title -------- */}
        <Text style={styles.formSectionTitle}>Event Details</Text>

        {/* Event Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Event Name<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Type your event name"
            placeholderTextColor="#C1C1C1"
          />
        </View>

        {/* Event Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Event Type<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Choose event type"
            placeholderTextColor="#C1C1C1"
            editable={false}
          />
        </View>

        {/* Date / Time Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Select Date and Time<Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.dateInputContainer}>
            <TextInput
              style={[styles.textInput, styles.dateInput]}
              placeholder="Choose event date"
              placeholderTextColor="#C1C1C1"
              editable={false}
            />
            <MaterialCommunityIcons
              name="calendar-month"
              size={24}
              color="#7F5AF0"
              style={styles.calendarIcon}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Event Description<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textInput, styles.descriptionInput]}
            placeholder="Type your event description..."
            placeholderTextColor="#C1C1C1"
            multiline
            textAlignVertical="top"
          />
        </View>

      </ScrollView>

      {/* -------- Floating Submit Button -------- */}
      <TouchableOpacity style={styles.publishButton}>
        <Text style={styles.publishButtonText}>Publish Event</Text>
        <MaterialCommunityIcons
          name="send-outline"
          size={20}
          color="#000"
          style={styles.sendIcon}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EditEvents;

/* ---------------------------------------------
   Styles (Merged)
--------------------------------------------- */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  /* ------ Header ------ */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },

  backButton: {},

  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginLeft: 15,
  },

  /* ------ Image Upload ------ */
  imageUploadArea: {
    marginBottom: 30,
  },

  mainImagePlaceholder: {
    height: width * 0.45,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#F0E5FF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4FD',
    overflow: 'hidden',
    marginBottom: 10,
  },

  smallImageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dashedBox: {
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4FD',
    borderColor: '#FFD180',
  },

  smallPlaceholder: {
    width: (width - 40 - 15 * 3) / 4,
    borderColor: '#F0E5FF',
  },

  /* ------ Form ------ */
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },

  required: {
    color: 'red',
  },

  textInput: {
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateInput: {
    flex: 1,
    paddingRight: 50,
  },

  calendarIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
    backgroundColor: '#FFEBEE',
    borderRadius: 5,
    borderColor: '#FFD180',
    borderWidth: 1,
  },

  descriptionInput: {
    height: 120,
    paddingTop: 14,
  },

  /* ------ Floating Button ------ */
  publishButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFD700',
    borderRadius: 15,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5.46,
    elevation: 9,
  },

  publishButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginRight: 10,
  },

  sendIcon: {
    transform: [{ rotate: '45deg' }],
  },
});