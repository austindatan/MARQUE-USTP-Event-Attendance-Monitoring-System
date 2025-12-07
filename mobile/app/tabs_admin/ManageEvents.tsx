// @ts-nocheck
import React from 'react';
import { View, Text } from 'react-native';
import { page_admin_dashboard } from '../styles/page_admin_dashboard';

const ManageEvents = () => {
    const [menuVisible, setMenuVisible] = useState(false);

    return (
    <View style={page_admin_dashboard.container}>
      <Text style={page_admin_dashboard.title}>Manage Events</Text>
    </View>
    );
};

export default ManageEvents;
