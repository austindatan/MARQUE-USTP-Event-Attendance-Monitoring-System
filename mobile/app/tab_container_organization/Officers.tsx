// @ts-nocheck
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Animated, TextInput, ActivityIndicator, Modal, Pressable, TouchableOpacity, Image, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/page_admin_dashboard";
import StudentLinear from "../components/OrgSide_Card_StudentLinear";
import Skeleton_Officers from "../components/Skeleton_Officers";
import { BASE_URL } from "../../config";
import { useRoute } from '@react-navigation/native';
import { apiFetch } from "../../utils/apiFetch";
import joinModalStyles from "../styles/components_joinmodal";

const ManageOfficers = ({ scrollY, handleScroll }) => {
    const route = useRoute(); // <- NEW
    const { orgId } = route.params; // <- NEW

    const [localStudentNumber, setLocalStudentNumber] = useState(null);
    const [isIdLoading, setIsIdLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [roleModalVisible, setRoleModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newRole, setNewRole] = useState(null);
    const [isRoleChanging, setIsRoleChanging] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [inviteRolePending, setInviteRolePending] = useState(null);
    const [inviteTargetStudent, setInviteTargetStudent] = useState(null);

    // --- SAFEGUARD if orgId is missing
    if (!orgId) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: "red", textAlign: "center", padding: 20 }}>
                    🛑 Organization ID not found. Please go back and select an organization.
                </Text>
            </View>
        );
    }

    // ASYNC NUMBER FETCH EFFECT
    useEffect(() => {
        const fetchAuthNumber = async () => {
            try {
                const number = await AsyncStorage.getItem("student_number");
                if (number) {
                    setLocalStudentNumber(number);
                } else {
                    console.error("[AUTH ERROR] Student NUMBER not found in AsyncStorage.");
                    setError("Authentication failed: Sender's ID/Number missing.");
                }
            } catch (err) {
                console.error("[AUTH EXCEPTION] Error retrieving number:", err);
                setError("Error accessing local storage.");
            } finally {
                setIsIdLoading(false);
            }
        };

        fetchAuthNumber();
    }, []);

    // FETCH OUTSTANDING INVITES FOR THIS ORG
    const fetchOutstandingInvites = async () => {
        if (!orgId) return {};

        try {
            const res = await fetch(`${BASE_URL}/api/memberships/outstanding-invites/${orgId}`);
            const data = await res.json();
            return data; // Should be { student_id: role } map
        } catch (err) {
            console.error("[FETCH OUTSTANDING INVITES ERROR]", err);
            return {};
        }
    };

    // Fetch Students - ENHANCED WITH ERROR LOGGING
    const fetchStudents = async (tab) => {
        if (isIdLoading) return;

        setIsLoading(true);
        setError(null);
        const filterParam = tab === "roles" ? "roles" : "all";

        try {
            console.log(`[DEBUG] Attempting fetch students: ${BASE_URL}/api/student/officers/all?filter=${filterParam}&orgId=${orgId}`);
            const res = await fetch(`${BASE_URL}/api/student/officers/all?filter=${filterParam}&orgId=${orgId}`);

            // Log the network status immediately
            console.log(`[DEBUG] Fetch response status: ${res.status}`);

            const text = await res.text();

            // Log the raw response text before parsing
            console.log(`[DEBUG] Raw response text: ${text.substring(0, 200)}...`);

            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error("[PARSE ERROR] Failed to parse JSON. Raw text returned:", text);
                data = { message: "Failed to parse server response as JSON." };
            }

            if (!res.ok) {
                console.error("====================================================");
                console.error("[FETCH STUDENTS ERROR] Request Failed.");
                console.error(`Status: ${res.status} (${res.statusText})`);
                console.error(`Filter: ${filterParam}, OrgID: ${orgId}`);
                console.error("Server Body:", data);
                console.error("====================================================");
                throw new Error(data.message || `Server Error (${res.status}): Failed to retrieve data.`);
            }

            // Log successful data structure
            console.log("====================================================");
            console.log("[FETCH STUDENTS SUCCESS]");
            console.log(`Received ${data.length} student records for filter: ${filterParam}`);
            console.log("Example student record:", data.length > 0 ? data[0] : "No records.");
            console.log("====================================================");

            // FETCH AND MAP OUTSTANDING INVITES
            const inviteMap = await fetchOutstandingInvites();
            const studentsWithInvites = data.map(student => ({
                ...student,
                pendingInviteRole: inviteMap[student.id] || inviteMap[student._id] || null
            }));

            setStudents(studentsWithInvites);
        } catch (err) {
            console.error("[FETCH STUDENTS EXCEPTION] Catch block hit:", err.message);
            setError(err.message || "Failed to load student data.");
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    };

    // EFFECT TO TRIGGER DATA FETCH
    useEffect(() => {
        if (isIdLoading) return;
        if (!localStudentNumber) {
            setIsLoading(false);
            return;
        }
        if (!orgId) return;
        fetchStudents(activeTab);
    }, [activeTab, isIdLoading, localStudentNumber, orgId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStudents(activeTab);
        setRefreshing(false);
    };

    const safeImage = (img) =>
        typeof img === "string" && img.trim() !== "" ? { uri: img } : require("../../assets/images/marque/MARQUE_singlelogo.png");

    // --------------------
    // Invite flow (single-org)
    // --------------------
    const handleInvite = async (student, role) => {
        if (!role) return;
        if (!localStudentNumber) {
            alert("Authentication Error: Cannot send invite without a valid sender number.");
            return;
        }

        try {
            const body = {
                sender_student_number: localStudentNumber,
                target_student_id: student.id,
                role,
                organization_id: orgId
            };

            const data = await apiFetch(`/api/memberships/invite`, {
                method: "POST",
                body: JSON.stringify(body),
            });

            console.log("[INVITE SUCCESS]", { student, role, response: data });
            alert(`Invite sent to ${student.name} as ${role}`);

            setStudents(prev =>
                prev.map(s => s.id === student.id ? { ...s, pendingInviteRole: role } : s)
            );
        } catch (err) {
            if (err.message?.includes("pending invitation")) {
                const existingRole = "Manager";
                setStudents(prev =>
                    prev.map(s => s.id === student.id ? { ...s, pendingInviteRole: existingRole } : s)
                );
                alert(`Student already has a pending invite as ${existingRole}`);
                return;
            }
            console.error("[INVITE EXCEPTION]", err);
            alert(`Error sending invite: ${err.message || 'check terminal for details.'}`);
        }
    };

    const handleCancelInvite = async (student) => {
        if (!student.pendingInviteRole) return;

        try {
            await apiFetch(`/api/memberships/cancel-invite`, {
                method: "DELETE",
                body: JSON.stringify({ target_student_id: student.id, orgId }),
            });

            setStudents(prev =>
                prev.map(s => {
                    if (s.id === student.id) {
                        const copy = { ...s };
                        delete copy.pendingInviteRole;
                        return copy;
                    }
                    return s;
                })
            );

            alert(`Invite to ${student.name} cancelled successfully.`);
        } catch (err) {
            console.error("[CANCEL INVITE EXCEPTION]", err);
            alert(`Error cancelling invite: ${err.message || 'check terminal for details.'}`);
        }
    };

    // --------------------
    // Role change & remove
    // --------------------
    const openRoleModal = (student) => {
        setSelectedStudent(student);
        setNewRole(null);
        setRoleModalVisible(true);
    };

    const confirmRoleChange = async () => {
        if (!newRole || !selectedStudent) return;

        try {
            setRoleModalVisible(false);
            setIsRoleChanging(true);
            const data = await apiFetch(`/api/memberships/change-role`, {
                method: "PUT",
                body: JSON.stringify({ student_id: selectedStudent.id, new_role: newRole }),
            });

            console.log("[CHANGE ROLE SUCCESS]", { student: selectedStudent, newRole, response: data });
            alert(`Role changed to ${newRole} for ${selectedStudent.name}`);
            fetchStudents(activeTab);
        } catch (err) {
            console.error("[CHANGE ROLE EXCEPTION]", err);
            alert(`Error changing role: ${err.message || 'check terminal for details.'}`);
        } finally {
            setIsRoleChanging(false);
        }
    };

    const handleRemove = async (student) => {
        try {
            await apiFetch(`/api/memberships/remove`, {
                method: "DELETE",
                body: JSON.stringify({ student_id: student.id }),
            });

            console.log("[REMOVE USER SUCCESS]", { student });
            alert(`${student.name} removed from organization`);
            fetchStudents(activeTab);
        } catch (err) {
            console.error("[REMOVE USER EXCEPTION]", err);
            alert(`Error removing student: ${err.message || 'check terminal for details.'}`);
        }
    };

    // --------------------
    // Render Students
    // --------------------
    const renderStudents = () => {
        if (!isLoading) {
            console.log(`[RENDER DEBUG] Displaying ${students.length} students (before search filter).`);
        }

        if (isLoading) return <Skeleton_Officers embedded={true} />;
        if (error) return <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>{error}</Text>;

        const filteredStudents = students.filter(
            (s) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredStudents.length === 0)
            return <Text style={{ textAlign: "center", marginTop: 20, fontFamily: "DMSans-Regular" }}>No students found for "{searchTerm}"</Text>;

        return filteredStudents.map((student) => (
            <StudentLinear
                key={student.id}
                activeTab={activeTab}
                studentImage={safeImage(student.studentImage)}
                name={student.name}
                studentId={student.studentId}
                department={student.department}
                course={student.course}
                orgName={student.orgName}
                orgLogo={safeImage(student.orgLogo)}
                position={student.position}
                pendingInviteRole={student.pendingInviteRole}
                onInvite={(role) => handleInvite(student, role)}
                onCancelInvite={() => handleCancelInvite(student)}
                onChangeRole={() => openRoleModal(student)}
                onRemove={() => handleRemove(student)}
            />
        ));
    };

    // Initial Loading/Error Render
    if (isIdLoading) {
        return <Skeleton_Officers />;
    }

    if (!localStudentNumber) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: "red", textAlign: "center", padding: 20 }}>
                    🛑 Fatal Error: Cannot load sender authentication. Please log in again.
                </Text>
            </View>
        );
    }

    // Main Render
    return (
        <View style={styles.container}>
            <Animated.ScrollView
                style={{ flex: 1, marginTop: -110 }}
                contentContainerStyle={{ paddingTop: 160, paddingBottom: 0, alignItems: 'center' }}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[0]}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false, listener: handleScroll }
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        progressViewOffset={50}
                        colors={["#0A0F51"]}
                        tintColor="#0A0F51"
                    />
                }
            >
                <View style={{ width: '100%', alignItems: 'center', zIndex: 100 }}>
                    <View style={{ height: 105, backgroundColor: 'transparent' }} />
                    <View style={{ width: '100%', backgroundColor: '#F5F5F5', alignItems: 'center', paddingBottom: 5 }}>
                        <View style={[styles.searchAndAddRow, { width: '90%' }]}>
                            <View style={styles.searchContainerStud}>
                                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChangeText={setSearchTerm}
                                />
                            </View>
                        </View>

                        <View style={styles.categoryButtonContainer}>
                            <TouchableOpacity
                                style={activeTab === "all" ? styles.activeButtonEX : styles.inactiveButtonEX}
                                onPress={() => setActiveTab("all")}
                            >
                                <Text style={activeTab === "all" ? styles.activeText : styles.inactiveText}>Students</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={activeTab === "roles" ? styles.activeButtonEX : styles.inactiveButtonEX}
                                onPress={() => setActiveTab("roles")}
                            >
                                <Text style={activeTab === "roles" ? styles.activeText : styles.inactiveText}>Students w/ Roles</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={[styles.content, { width: '100%', padding: 0 }]}>
                    <View style={styles.eventList}>
                        {renderStudents()}
                    </View>
                </View>
            </Animated.ScrollView>

            {/* ===== ROLE CHANGE MODAL ===== */}
            <Modal visible={roleModalVisible} transparent animationType="fade" onRequestClose={() => setRoleModalVisible(false)}>
                <TouchableOpacity
                    style={joinModalStyles.overlay}
                    onPress={() => setRoleModalVisible(false)}
                    activeOpacity={1}
                >
                    <View style={joinModalStyles.modalBox}>
                        <View style={joinModalStyles.iconContainer}>
                            <Image
                                source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
                                style={joinModalStyles.iconImage}
                            />
                        </View>
                        <Text style={joinModalStyles.title}>Change Role</Text>
                        <Text style={joinModalStyles.desc}>
                            Select a new role for {selectedStudent?.name}.
                        </Text>

                        {["Manager", "Committee"].map((role) => (
                            <TouchableOpacity
                                key={role}
                                onPress={() => setNewRole(role)}
                                style={{
                                    width: "100%",
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    marginTop: 10,
                                    backgroundColor: newRole === role ? "#0A0F51" : "#f0f0f0",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: newRole === role ? "#fff" : "#333", fontFamily: "DMSans-Bold", fontSize: 15 }}>
                                    {role}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <View style={{ flexDirection: "row", marginTop: 20, width: "100%" }}>
                            <TouchableOpacity
                                style={{ flex: 1, backgroundColor: "#0a0f51", paddingVertical: 12, borderRadius: 25, alignItems: "center", marginRight: 6 }}
                                onPress={() => setRoleModalVisible(false)}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={!newRole}
                                style={{ flex: 1, backgroundColor: newRole ? "#fecb20" : "#ccc", paddingVertical: 12, borderRadius: 25, alignItems: "center", marginLeft: 6 }}
                                onPress={confirmRoleChange}
                                activeOpacity={0.7}
                            >
                                <Text style={{ color: "#fff", fontSize: 16, fontFamily: "DMSans-Bold" }}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* ===== ROLE CHANGING LOADING MODAL ===== */}
            <Modal visible={isRoleChanging} transparent animationType="fade" onRequestClose={() => { }}>
                <View style={joinModalStyles.overlay}>
                    <View style={joinModalStyles.modalBox}>
                        <View style={joinModalStyles.iconContainer}>
                            <Image
                                source={require("../../assets/images/marque/MARQUE_whitelogo.png")}
                                style={joinModalStyles.iconImage}
                            />
                        </View>
                        <Text style={joinModalStyles.title}>Updating Role</Text>
                        <Text style={joinModalStyles.desc}>Please wait while we apply the changes.</Text>
                        <View style={{ marginTop: 18 }}>
                            <ActivityIndicator size="large" color="#0A0F51" />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ManageOfficers;
