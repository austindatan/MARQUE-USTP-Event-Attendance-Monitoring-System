// NotificationCardOrg.js (New Component - With Buttons)

// @ts-nocheck
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/components_notification'; // Assumed path

const NotificationCardOrg = ({
    orgLogo,
    orgName,
    message,
    timeAgo,
    showRoleActions,
    onAcceptRole,
    onDenyRole,
    style,
    // ⭐️ NEW PROPS ⭐️
    status,
    role
}) => {

    // Logic for handled status message
    let statusMessage = '';
    let statusColor = '#666';
    let statusBgColor = '#F0F0F0';
    let statusIcon = 'information-circle-outline';

    if (status === 'accepted') {
        statusMessage = `You successfully accepted the role of ${role || 'member'}.`;
        statusColor = '#006400'; // Dark Green
        statusBgColor = '#E0F7E0'; // Light Green
        statusIcon = 'checkmark-circle';
    } else if (status === 'rejected') {
        statusMessage = `You declined the invitation.`;
        statusColor = '#C84C4C'; // Dark Red
        statusBgColor = '#FFEDED'; // Light Red
        statusIcon = 'close-circle';
    }

    const showStatusMessage = status === 'accepted' || status === 'rejected';

    return (
        <View style={[styles.cardContainer, style]}>
            {/* Org Info Row */}
            <View style={styles.contentRow}>
                <Image source={orgLogo} style={styles.imageOrg} resizeMode="contain" />
                <View style={styles.textContainer}>
                    <Text style={styles.primaryText} numberOfLines={2}>
                        {message}
                    </Text>
                    <View style={styles.orgInfo}>
                        <Ionicons name="business-outline" size={14} color="#888" />
                        <Text style={styles.orgName} numberOfLines={1} ellipsizeMode='tail'> {orgName}</Text>
                    </View>
                    <Text style={styles.secondaryText}>{timeAgo}</Text>
                </View>
            </View>


            {/* ⭐️ STATUS MESSAGE BLOCK: Appears if accepted/rejected ⭐️ */}
            {showStatusMessage && (
                <View
                    // Reuse actionArea styling structure, but customize for status message
                    style={[
                        styles.actionArea,
                        {
                            backgroundColor: statusBgColor,
                            justifyContent: 'flex-start',
                            paddingHorizontal: 15
                        }
                    ]}
                >
                    <Ionicons name={statusIcon} size={16} color={statusColor} style={{ marginRight: 8 }} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusMessage}
                    </Text>
                </View>
            )}

            {/* ROLE ACTIONS BLOCK: Appears if pending */}
            {
                showRoleActions && (
                    <View style={styles.actionArea}>
                        {/* Accept Button */}
                        <TouchableOpacity
                            style={[styles.actionButton, styles.acceptButton]}
                            onPress={onAcceptRole}
                        >
                            <Ionicons name="person-add-outline" size={18} color="#fff" />
                            <Text style={styles.actionText}>Accept Role</Text>
                        </TouchableOpacity>
                        {/* Deny Button */}
                        <TouchableOpacity
                            style={[styles.actionButton, styles.denyButton]}
                            onPress={onDenyRole}
                        >
                            <Ionicons name="person-remove-outline" size={18} color="#666" />
                            <Text style={styles.denyText}>Deny</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
        </View >
    );
};

export default NotificationCardOrg;