//@ts-nocheck
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const isSmall = width < 360;
const isLarge = width > 420;

const rs = (size) => {
  if (isSmall) return size * 0.85;
  if (isLarge) return size * 1.1;
  return size;
};

const AVATAR_SIZE = rs(24);
const OVERLAP_AMOUNT = rs(8);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },

  backButton: {},

  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 15,
    fontFamily: "DMSans-Bold",
  },

  containerEvents: {
    backgroundColor: "#fff",
    paddingHorizontal: rs(20),
    paddingTop: rs(10),
  },

  avatarStackContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: rs(6),
  },

  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: "#FFF",
    backgroundColor: "#FFF",
    overflow: "hidden",
  },

  formSectionTitle: {
    fontSize: 18,
    color: '#000',
    marginBottom: rs(10),
    fontFamily: "DMSans-Bold",
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
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
    fontFamily: "DMSans-Medium",
  },

  pickerContainer: { 
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#F7F7F7',
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    fontFamily: "DMSans-Medium",
  },
  
  picker: {
    width: '100%',
    height: 50,
    color: '#000000',
    fontFamily: "DMSans-Medium",
  },

  dropdownInput: {
  backgroundColor: '#F7F7F7',
  borderRadius: 10,
  paddingHorizontal: 15,
  paddingVertical: 14,
  borderWidth: 1,
  borderColor: '#EFEFEF',
  },

  dropdownText: {
    fontSize: 16,
    color: '#333',
    fontFamily: "DMSans-Medium",
  },

  /* Modal Overlay */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  /* Bottom Sheet */
  modalSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: "DMSans-Bold",
    marginBottom: 15,
    color: "#000",
  },

  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  modalItemText: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
    color: "#333",
  },

  row: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 12,
  },

  halfInput: {
    width: "48%",
  },

  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    height: 50,
  },

  dateInput: {
    flex: 1,
    paddingVertical: 0,
    borderWidth: 0,
  },

  stickyNavContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
    justifyContent: "center",
    overflow: "hidden",
  },

  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  navRowContent: {
    paddingTop: rs(40),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(20),
    zIndex: 2,
  },

  bookmarkBtn: {
    padding: rs(4),
    borderRadius: rs(10),
  },

  headerImageBackground: {
    height: rs(200),
    flex: 1,
    marginBottom: rs(10),
    paddingTop: rs(90),
  },

  headerImageBackgroundCon: {
    height: rs(200),
    flex: 1,
    marginBottom: 0,
    paddingTop: rs(90),
  },

  imageUploadArea: {
  },

  mainImagePlaceholder: {
    height: width * 0.45,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#F0E5FF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    overflow: 'hidden',
    marginBottom: 10,
  },

  bottomButtonContainer: {
    position: "absolute",
    bottom: rs(20),
    width: "100%",
    paddingHorizontal: rs(20),
  },

  registerButton: {
    backgroundColor: "#0A0F51",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: rs(14),
    borderRadius: rs(30),
  },

  registerText: {
    color: "#fff",
    marginRight: rs(8),
    fontSize: rs(14),
    fontFamily: "DMSans-Medium",
  },
  
});

export default styles;
