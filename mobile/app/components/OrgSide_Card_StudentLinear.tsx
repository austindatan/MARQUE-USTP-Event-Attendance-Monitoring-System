// @ts-nocheck
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/components_studentcardadmin";

const StudentLinear = ({
  studentImage,
  name,
  studentId,
  department,
  course,
  orgLogo,
  orgName,
  position,
  activeTab,
  pendingInviteRole,
  onInvite,
  onCancelInvite,
  onChangeRole,
  onRemove,
}) => {
  const [selectedRole, setSelectedRole] = useState<"Manager" | "Committee" | null>(null);

  const handleRoleToggle = (role: "Manager" | "Committee") => {
    setSelectedRole(selectedRole === role ? null : role);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image source={studentImage} style={styles.studentImage} />
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <View style={styles.nameIdRow}>
              <Text style={styles.studentName}>{name}</Text>
              <Text style={styles.studentId}>{studentId}</Text>
            </View>
            <Text style={styles.studentDetails} numberOfLines={1} ellipsizeMode="tail">{department}</Text>
            <Text style={styles.studentDetails} numberOfLines={1} ellipsizeMode="tail">{course}</Text>

            {orgName && (
              <View style={styles.roleContainer}>
                <Image source={orgLogo} style={styles.orgLogo} />
                <View>
                  <Text style={styles.orgName} numberOfLines={1} ellipsizeMode="tail">{orgName}</Text>
                  <Text style={styles.position} numberOfLines={1} ellipsizeMode="tail">{position}</Text>
                </View>
              </View>
            )}

            {/* Invite / Pending Invite Buttons */}
            {!position && (
              <View style={{ marginTop: 8 }}>
                {pendingInviteRole ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontFamily: "DMSans-Regular" }}>Already invited as {pendingInviteRole}</Text>
                    <TouchableOpacity
                      onPress={onCancelInvite}
                      style={{
                        marginLeft: 10,
                        padding: 6,
                        backgroundColor: "#f55",
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "#fff", fontFamily: "DMSans-Regular" }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={{ flexDirection: "row" }}>
                      {["Manager", "Committee"].map((role) => (
                        <TouchableOpacity
                          key={role}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            marginRight: 8,
                            borderRadius: 6,
                            backgroundColor: selectedRole === role ? "#0A0F51" : "#ccc",
                          }}
                          onPress={() => handleRoleToggle(role as "Manager" | "Committee")}
                        >
                          <Text style={{ color: selectedRole === role ? "#fff" : "#000", fontFamily: "DMSans-Regular" }}>{role}</Text>
                        </TouchableOpacity>
                      ))}

                      <TouchableOpacity
                        disabled={!selectedRole}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 6,
                          opacity: selectedRole ? 1 : 0.5,
                        }}
                        onPress={() => onInvite(selectedRole)}
                      >
                        <Ionicons name="add-circle-outline" size={28} color="#0A0F51" />
                        <Text style={{ marginLeft: 6 }}></Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}

            {activeTab === "roles" && position && (
              <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
                <TouchableOpacity
                  onPress={onChangeRole}
                  style={{
                    marginRight: 12,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    backgroundColor: "#ccc",
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontFamily: "DMSans-Bold" }}>Change role</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onRemove}>
                  <Ionicons name="person-remove-outline" size={28} color="#0A0F51" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default StudentLinear;
