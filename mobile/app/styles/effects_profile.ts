//@ts-nocheck
import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = size => (width / guidelineBaseWidth) * size;
const vScale = size => (height / guidelineBaseHeight) * size;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  navBar: {
    height: vScale(90),
    backgroundColor: "#0A0F51",
    paddingHorizontal: scale(20),
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: vScale(15),
    zIndex: 10,
  },

  navTitle: {
    color: "#fff",
    marginLeft: scale(10),
    fontSize: scale(16),
    fontFamily: "DMSans-Bold",
  },

  profileHeader: {
    alignItems: "center",
    paddingVertical: vScale(20),
    backgroundColor: "#f4f6ff",
  },

  profileImage: {
    width: scale(95),
    height: scale(95),
    borderRadius: scale(50),
    backgroundColor: "#ddd",
    marginBottom: vScale(10),
  },

  name: {
    fontSize: scale(18),
    fontFamily: "DMSans-Bold",
    color: "#111",
  },

  department: {
    fontSize: scale(13),
    color: "#666",
    fontFamily: "DMSans-Medium",
  },

  course: {
    fontSize: scale(13),
    color: "#666",
    fontFamily: "DMSans-Medium",
    marginTop: vScale(2),
  },

  infoBlock: {
    paddingHorizontal: scale(20),
    marginTop: vScale(20),
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: vScale(12),
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },

  label: {
    fontSize: scale(14),
    color: "#666",
    fontFamily: "DMSans-Medium",
  },

  value: {
    fontSize: scale(14),
    color: "#111",
    fontFamily: "DMSans-Bold",
  },

  sectionTitle: {
    fontSize: scale(16),
    fontFamily: "DMSans-Bold",
    paddingHorizontal: scale(20),
    marginTop: vScale(28),
    marginBottom: vScale(8),
  },

  attendanceCard: {
    marginHorizontal: scale(20),
    backgroundColor: "#0A0F51",
    borderRadius: scale(18),
    paddingVertical: vScale(18),
  },

  cardContainer: {
    paddingHorizontal: scale(20),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: vScale(10),
  },

  attItem: {
    alignItems: "center",
  },

  attValue: {
    color: "#fff",
    fontSize: scale(20),
    fontFamily: "DMSans-Bold",
  },

  attLabel: {
    color: "#dfe6ff",
    fontSize: scale(12),
    fontFamily: "DMSans-Medium",
  },

  settingsBlock: {
    marginTop: vScale(10),
    paddingHorizontal: scale(20),
  },

  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: vScale(14),
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },

  settingLabel: {
    fontSize: scale(14),
    marginLeft: scale(10),
    fontFamily: "DMSans-Medium",
    color: "#111",
  },

  containerCh: {
    flex: 1,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: scale(18),
    fontFamily: "DMSans-Bold",
    paddingHorizontal: scale(20),
    marginTop: vScale(20),
    marginBottom: vScale(12),
    color: "#111",
  },

  formCard: {
    marginHorizontal: scale(20),
    backgroundColor: "#f4f6ff",
    borderRadius: scale(16),
    padding: scale(18),
  },

  inputGroup: {
    marginBottom: vScale(18),
  },

  labelCh: {
    fontSize: scale(14),
    fontFamily: "DMSans-Medium",
    color: "#444",
    marginBottom: vScale(6),
  },

  inputGroup2: {},

  label2: {
    fontSize: scale(14),
    fontFamily: "DMSans-Medium",
    color: "#444",
    marginBottom: vScale(6),
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: scale(10),
    padding: scale(12),
    borderWidth: 1,
    borderColor: "#ddd",
    fontFamily: "DMSans-Regular",
    color: "#111",
  },

  saveBtn: {
    backgroundColor: "#0A0F51",
    marginHorizontal: scale(20),
    borderRadius: scale(14),
    paddingVertical: vScale(14),
    alignItems: "center",
    marginTop: vScale(25),
  },

  saveBtnText: {
    color: "#fff",
    fontFamily: "DMSans-Bold",
    fontSize: scale(15),
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: vScale(20),
    paddingHorizontal: scale(20),
  },

  backText: {
    marginLeft: scale(6),
    color: "#0A0F51",
    fontFamily: "DMSans-Medium",
    fontSize: scale(14),
  },
  
  centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#0A0F51'
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    buttonClose: {
        backgroundColor: "#ccc",
    },
    buttonSave: {
        backgroundColor: "#0A0F51",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    }
});

export default styles;
