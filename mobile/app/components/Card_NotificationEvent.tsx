// @ts-nocheck
import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/components_notification';

const NotificationCardEvent = ({
  eventImage,
  eventName,
  orgLogo,
  orgName,
  timeStatus,
  showConfirmation,
  confirmationMessage,
  onConfirmAttendance,
  onRejectAttendance,
}) => {
  const getStatusColor = (status) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('concluded')) return '#C84C4C';
    if (lowerStatus.includes('hour')) return '#0A0F51';
    return '#E97200';
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.contentRow}>
        <Image source={eventImage} style={styles.image} resizeMode="cover" />
        <View style={styles.textContainer}>
          <Text style={styles.primaryTextEvent} numberOfLines={1}>{eventName}</Text>
          <View style={styles.orgInfo}>
            <Image source={orgLogo} style={styles.orgLogo} resizeMode="contain" />
            <Text style={styles.orgName} numberOfLines={1} ellipsizeMode='tail'>{orgName}</Text>
          </View>
          <Text style={[styles.timeStatus, { color: getStatusColor(timeStatus.toLowerCase()) }]}>
            {timeStatus}
          </Text>
        </View>
      </View>

      {showConfirmation && (
        <View style={styles.attendanceContainer}>
          <Text style={styles.attendanceMessage}>
            {confirmationMessage || "You have confirmed your attendance for this event."}
          </Text>
        </View>
      )}
    </View>
  );
};

export default NotificationCardEvent;
