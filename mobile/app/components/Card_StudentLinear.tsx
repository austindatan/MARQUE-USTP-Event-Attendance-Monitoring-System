//@ts-nocheck
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import styles from "../styles/components_studentcardadmin";

const StudentLinear = ({
  studentImage,
  name = "",
  studentId = "",
  department = "",
  course = "",
  allRoles = [],
  orgLogo,
  orgName,
  position,
  onEditPress,
  onDeletePress, // <-- ADDED PROP
  onPress
}) => {

  // Function to render a single role block
  const renderRole = (role, index) => {
    // We must use safeImage here as well since it's a new variable scope
    const safeImage = (img) =>
      typeof img === "string" && img.trim() !== "" ? { uri: img } : require("../../assets/images/marque/MARQUE_singlelogo.png");

    return (
      // 🚨 The key is crucial when mapping an array
      <View key={index} style={styles.roleContainer}>
        <Image
          source={safeImage(role.orgLogo)}
          style={styles.orgLogo}
        />
        <View>
          <Text style={styles.orgName} numberOfLines={1}>
            {role.orgName}
          </Text>
          <Text style={styles.position} numberOfLines={1}>
            {role.position}
          </Text>
        </View>
      </View>
    );
  };


  return (
    <TouchableOpacity activeOpacity={0.6} style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Image
          source={studentImage}
          style={styles.studentImage}
        />

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <View style={styles.nameIdRow}>
              <Text style={styles.studentName} numberOfLines={1}>{name}</Text>
              <Text style={styles.studentId}>{studentId}</Text>
            </View>

            <Text style={styles.studentDetails} numberOfLines={1} ellipsizeMode="tail">
              {department}
            </Text>
            <Text style={styles.studentDetails} numberOfLines={1} ellipsizeMode="tail">
              {course}
            </Text>

            {/* 🚨 CRITICAL CHANGE: Iterate over allRoles */}
            {allRoles.map(renderRole)}
          </View>

          <View style={[styles.editButton, { flexDirection: 'column', alignItems: 'center' }]}>

            <TouchableOpacity
              onPress={onEditPress}
            >
              <Ionicons name="create-outline" size={24} color="#0A0F51" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDeletePress}
            >
              <Ionicons name="trash-outline" size={20} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StudentLinear;