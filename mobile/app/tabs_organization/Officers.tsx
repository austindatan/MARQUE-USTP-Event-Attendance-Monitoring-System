// @ts-nocheck
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, ActivityIndicator, Modal, Pressable, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/page_admin_dashboard";
import Header from "../components/Header_Admin";
import StudentLinear from "../components/OrgSide_Card_StudentLinear";
import { BASE_URL } from "../../config";

const ManageOfficers = () => {
    const [localStudentNumber, setLocalStudentNumber] = useState<string | null>(null);
    const [isIdLoading, setIsIdLoading] = useState(true);

    const [menuVisible, setMenuVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [roleModalVisible, setRoleModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newRole, setNewRole] = useState<"Manager" | "Committee" | null>(null);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    // ----------------------------------------------------
    // 1. ASYNC NUMBER FETCH EFFECT (Runs once on mount)
    // ----------------------------------------------------
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
    
    // --------------------
    // Fetch Students
    // --------------------
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
            setStudents(data);
        } catch (err) {
            console.error("[FETCH STUDENTS EXCEPTION]", err);
            setError(err.message || "Failed to load student data.");
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    };

    // ----------------------------------------------------
    // 2. EFFECT TO TRIGGER DATA FETCH
    // ----------------------------------------------------
    useEffect(() => {
        if (!isIdLoading && localStudentNumber) {
            fetchStudents(activeTab);
        } else if (!isIdLoading && !localStudentNumber) {
            setIsLoading(false); 
        }
    }, [activeTab, isIdLoading, localStudentNumber]);

    const safeImage = (img) =>
        typeof img === "string" && img.trim() !== "" ? { uri: img } : require("../../assets/images/marque/crk.jpg");

    // --------------------
    // Invite (sends student_number instead of _id)
    // --------------------
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
            return; // stop further processing
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


    // --------------------
    // Cancel Invite
    // --------------------
    const handleCancelInvite = async (student) => {
        if (!student.pendingInviteRole) return;

        try {
            const senderOrgIdRes = await fetch(`${BASE_URL}/api/memberships/org-id/${localStudentNumber}`);
            const orgData = await senderOrgIdRes.json();
            const orgId = orgData.orgId;
            if (!orgId) {
                alert("Cannot cancel invite: sender organization not found.");
                return;
            }

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

    // --------------------
    // Change Role and Remove User
    // --------------------
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

    // --------------------
    // Render Students
    // --------------------
    const renderStudents = () => {
        if (isLoading) return <ActivityIndicator size="large" color="#0A0F51" style={{ marginTop: 50 }} />;
        if (error) return <Text style={{ color: "red", textAlign: "center", marginTop: 20 }}>{error}</Text>;

        const filteredStudents = students.filter(
            (s) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredStudents.length === 0)
            return <Text style={{ textAlign: "center", marginTop: 20 }}>No students found for "{searchTerm}"</Text>;

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

    // --------------------
    // Initial Loading/Error Render Check
    // --------------------
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

    // --------------------
    // Main Render
    // --------------------
    return (
        <View style={styles.container}>
            <Header onMenuPress={openMenu} />

            <View style={styles.content}>
                <View style={styles.searchAndAddRow}>
                    <View style={styles.searchContainerRow}>
                        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search students..."
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>

                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="filter" size={24} color="#fff" />
                    </TouchableOpacity>
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

                <ScrollView showsVerticalScrollIndicator={false} style={styles.eventList}>
                    {renderStudents()}
                </ScrollView>
            </View>

            {/* Change Role Modal */}
            <Modal visible={roleModalVisible} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
                    <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>Change Role</Text>

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
                                <Text style={{ color: newRole === role ? "#fff" : "#000", fontWeight: "bold" }}>{role}</Text>
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
                                <Text style={{ color: "#fff", fontWeight: "bold" }}>Cancel</Text>
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
                                <Text style={{ color: "#fff", fontWeight: "bold" }}>Confirm</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ManageOfficers;
