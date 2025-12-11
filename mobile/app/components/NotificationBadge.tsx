// @ts-nocheck
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface NotificationBadgeProps {
    show: boolean;
    size?: number;
    top?: number;
    right?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
    show,
    size = 10,
    top = 0,
    right = 0
}) => {
    if (!show) return null;

    return (
        <View
            style={[
                styles.badge,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    top,
                    right
                }
            ]}
        />
    );
};

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        backgroundColor: '#FF3B30',
        borderWidth: 2,
        borderColor: '#fff',
    },
});

export default NotificationBadge;
