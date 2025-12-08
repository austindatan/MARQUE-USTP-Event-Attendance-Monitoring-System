// @ts-nocheck
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
  orgLogo,
  orgName,
  position,
  onEditPress,
  onPress
}) => {
  return (
    <TouchableOpacity activeOpacity={0.6} style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Image
          source={
            typeof studentImage === 'number' 
              ? studentImage
              : { uri: studentImage || "https://via.placeholder.com/40" }
          }
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

            {orgName && (
              <View style={styles.roleContainer}>
                <Image
                  source={
                    typeof orgLogo === 'number' 
                      ? orgLogo
                      : { uri: orgLogo || "https://via.placeholder.com/20" }
                  }
                  style={styles.orgLogo}
                />
                <View>
                  <Text style={styles.orgName} numberOfLines={1}>
                    {orgName}
                  </Text>
                  <Text style={styles.position} numberOfLines={1}>
                    {position}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={onEditPress}
          >
            <Ionicons name="create-outline" size={24} color="#0A0F51" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default StudentLinear;
