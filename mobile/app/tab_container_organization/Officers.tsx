// @ts-nocheck
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Animated, TextInput, ActivityIndicator, Modal, Pressable, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/page_admin_dashboard";
import StudentLinear from "../components/OrgSide_Card_StudentLinear";
import { BASE_URL } from "../../config";

const ManageOfficers = ({ scrollY, handleScroll }) => {
    const [localStudentNumber, setLocalStudentNumber] = useState(null);
    const [isIdLoading, setIsIdLoading] = useState(true);
    const [orgId, setOrgId] = useState(null);

    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [roleModalVisible, setRoleModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newRole, setNewRole] = useState(null);


    // ASYNC NUMBER FETCH EFFECT (Runs once on mount)
    useEffect(() => {
        const fetchAuthNumber = async () => {
            try {
                const number = await AsyncStorage.getItem("student_number");
                if (number) {
                    setLocalStudentNumber(number);
                    // Also fetch the org ID for this user
                    await fetchOrgId(number);
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

    // FETCH ORG ID FOR CURRENT USER
    const fetchOrgId = async (studentNumber) => {
        try {
            const res = await fetch(`${BASE_URL}/api/memberships/org-id/${studentNumber}`);
            const data = await res.json();
            if (data.orgId) {
                setOrgId(data.orgId);
            }
        } catch (err) {
            console.error("[FETCH ORG ID ERROR]", err);
        }
    };

    // FETCH OUTSTANDING INVITES FOR THIS ORG
    const fetchOutstandingInvites = async (orgIdToUse) => {
        if (!orgIdToUse) return {};

        try {
            const res = await fetch(`${BASE_URL}/api/memberships/outstanding-invites/${orgIdToUse}`);
            const data = await res.json();
            return data; // Should be { student_id: role } map
        } catch (err) {
            console.error("[FETCH OUTSTANDING INVITES ERROR]", err);
            return {};
        }
    };

    // Fetch Students
    const fetchStudents = async (tab) => {
        if (isIdLoading) return;

        setIsLoading(true);
        setError(null);
        const filterParam = tab === "roles" ? "roles" : "all";

        try {
            console.log(`[DEBUG] Fetching students with filter: ${filterParam}`);
            const res = await fetch(`${BASE_URL}/api/student/all?filter=${filterParam}`);
            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch { data = text; }

            if (!res.ok) {
                console.error("[FETCH STUDENTS ERROR]", {
                    status: res.status,
                    statusText: res.statusText,
                    body: data,
                    filterParam,
                });
                throw new Error(data.message || "Network response was not ok");
            }

            console.log("[FETCH STUDENTS SUCCESS]", data);

            // FETCH AND MAP OUTSTANDING INVITES
            const inviteMap = await fetchOutstandingInvites(orgId);
            const studentsWithInvites = data.map(student => ({
                ...student,
                pendingInviteRole: inviteMap[student.id] || null
            }));

            setStudents(studentsWithInvites);
        } catch (err) {
            console.error("[FETCH STUDENTS EXCEPTION]", err);
            setError(err.message || "Failed to load student data.");
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    };

    // EFFECT TO TRIGGER DATA FETCH
    useEffect(() => {
        if (!isIdLoading && localStudentNumber && orgId) {
            fetchStudents(activeTab);
        } else if (!isIdLoading && !localStudentNumber) {
            setIsLoading(false);
        }
    }, [activeTab, isIdLoading, localStudentNumber, orgId]);

    const safeImage = (img) =>
        typeof img === "string" && img.trim() !== "" ? { uri: img } : require("../../assets/images/marque/crk.jpg");

    // Invite (sends student_number instead of _id)
    const handleInvite = async (student, role) => {
        if (!role) return;
        if (!localStudentNumber) {
            alert("Authentication Error: Cannot send invite without a valid sender number.");
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/memberships/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender_student_number: localStudentNumber,
                    target_student_id: student.id,
                    role,
                }),
            });

            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch { data = text; }

            // Handle already pending invite
            if (res.status === 409 && data?.message?.includes("pending invitation")) {
                const existingRole = data.role || "Manager";
                setStudents(prev =>
                    prev.map(s => s.id === student.id ? { ...s, pendingInviteRole: existingRole } : s)
                );
                return;
            }

            if (!res.ok) {
                console.error("[INVITE ERROR]", { status: res.status, body: data });
                alert(`Error sending invite: ${data.message || 'check terminal for details.'}`);
                return;
            }

            console.log("[INVITE SUCCESS]", { student, role, response: data });
            alert(`Invite sent to ${student.name} as ${role}`);

            // Update state
            setStudents(prev =>
                prev.map(s => s.id === student.id ? { ...s, pendingInviteRole: role } : s)
            );

        } catch (err) {
            console.error("[INVITE EXCEPTION]", err);
            alert("Error sending invite — check terminal for details.");
        }
    };

    // Cancel Invite
    const handleCancelInvite = async (student) => {
        if (!student.pendingInviteRole) return;

        try {
            const res = await fetch(`${BASE_URL}/api/memberships/cancel-invite`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target_student_id: student.id, orgId }),
            });

            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch { data = text; }

            if (!res.ok) {
                console.error("[CANCEL INVITE ERROR]", { student, body: data });
                alert(`Error cancelling invite: ${data.message || 'check terminal for details.'}`);
                return;
            }

            // Update student state locally
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
            alert("Error cancelling invite — check terminal for details.");
        }
    };

    // Change Role and Remove User
    const openRoleModal = (student) => {
        setSelectedStudent(student);
        setNewRole(null);
        setRoleModalVisible(true);
    };

    const confirmRoleChange = async () => {
        if (!newRole || !selectedStudent) return;

        try {
            const res = await fetch(`${BASE_URL}/api/memberships/change-role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ student_id: selectedStudent.id, new_role: newRole }),
            });

            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch { data = text; }

            if (!res.ok) {
                console.error("[CHANGE ROLE ERROR]", { selectedStudent, newRole, body: data });
                alert(`Error changing role: ${data.message || 'check terminal for details.'}`);
                return;
            }

            console.log("[CHANGE ROLE SUCCESS]", { student: selectedStudent, newRole, response: data });
            alert(`Role changed to ${newRole} for ${selectedStudent.name}`);
            setRoleModalVisible(false);
            fetchStudents(activeTab);
        } catch (err) {
            console.error("[CHANGE ROLE EXCEPTION]", err);
            alert("Error changing role — check terminal for details.");
        }
    };

    const handleRemove = async (student) => {
        try {
            const res = await fetch(`${BASE_URL}/api/memberships/remove`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ student_id: student.id }),
            });

            const text = await res.text();
            let data;
            try { data = JSON.parse(text); } catch { data = text; }

            if (!res.ok) {
                console.error("[REMOVE USER ERROR]", { student, body: data });
                alert(`Error removing student: ${data.message || 'check terminal for details.'}`);
                return;
            }

            console.log("[REMOVE USER SUCCESS]", { student, response: data });
            alert(`${student.name} removed from organization`);
            fetchStudents(activeTab);
        } catch (err) {
            console.error("[REMOVE USER EXCEPTION]", err);
            alert("Error removing student — check terminal for details.");
        }
    };

    // Render Students
    const renderStudents = () => {
        if (isLoading) return <ActivityIndicator size="large" color="#0A0F51" style={{ marginTop: 50 }} />;
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

    // Initial Loading/Error Render Check
    if (isIdLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#0A0F51" />
                <Text style={{ marginTop: 10, color: '#333' }}>Authenticating user ID...</Text>
            </View>
        );
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
            >
                {/* 
                    STICKY HEADER INDEX 0 
                    - Top Spacer (80px): Occupies space for the Collapsed Header so content doesn't stick under it.
                    - Search & Tabs: The actual sticky content.
                */}
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

                {/* SCROLLABLE LIST INDEX 1 */}
                <View style={[styles.content, { width: '100%', padding: 0 }]}>
                    <View style={styles.eventList}>
                        {renderStudents()}
                    </View>
                </View>

            </Animated.ScrollView>

            <Modal visible={roleModalVisible} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
                    <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" }}>
                        <Text style={{ fontFamily: "DMSans-Bold", fontSize: 18, marginBottom: 12 }}>Change Role</Text>

                        {["Manager", "Committee"].map((role) => (
                            <Pressable
                                key={role}
                                onPress={() => setNewRole(role)}
                                style={{
                                    padding: 12,
                                    marginVertical: 6,
                                    width: "100%",
                                    borderRadius: 6,
                                    backgroundColor: newRole === role ? "#0A0F51" : "#ccc",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: newRole === role ? "#fff" : "#000", fontFamily: "DMSans-Bold" }}>{role}</Text>
                            </Pressable>
                        ))}

                        <View style={{ flexDirection: "row", marginTop: 16, width: "100%", justifyContent: "space-between" }}>
                            <Pressable
                                onPress={() => setRoleModalVisible(false)}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    backgroundColor: "#888",
                                    borderRadius: 6,
                                    alignItems: "center",
                                    marginRight: 8,
                                }}
                            >
                                <Text style={{ color: "#fff", fontFamily: "DMSans-Bold" }}>Cancel</Text>
                            </Pressable>

                            <Pressable
                                disabled={!newRole}
                                onPress={confirmRoleChange}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    backgroundColor: newRole ? "#0A0F51" : "#aaa",
                                    borderRadius: 6,
                                    alignItems: "center",
                                    marginLeft: 8,
                                }}
                            >
                                <Text style={{ color: "#fff", fontFamily: "DMSans-Bold" }}>Confirm</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ManageOfficers;