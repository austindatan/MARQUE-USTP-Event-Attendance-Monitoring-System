// components_edit_event.ts
// @ts-nocheck
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for the floating button
  },

  // --- Header Styles ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },

  backButton: {
    // Optional: add padding for better tap target
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginLeft: 15,
  },

  // --- Image Upload Area ---
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
    position: 'relative',
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
    width: (width - 40 - 15 * 3) / 4, // 4 items layout
    borderColor: '#F0E5FF',
  },

  // --- Form Section ---
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

  // --- Publish Button ---
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

export default styles;