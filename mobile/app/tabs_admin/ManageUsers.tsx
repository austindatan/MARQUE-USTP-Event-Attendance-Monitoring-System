// @ts-nocheck
import React from 'react';
import { View, Text } from 'react-native';
import { page_admin_dashboard } from '../styles/page_admin_dashboard';

const ManageUsers = () => {
    const [menuVisible, setMenuVisible] = useState(false);

    return (
    <View style={page_admin_dashboard.container}>
      <Header title="Manage Users" onMenuPress={() => setMenuVisible(true)} />
      <Text style={page_admin_dashboard.title}>Manage Users</Text>
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <SidebarMenuAdmin isVisible={menuVisible} onClose={() => setMenuVisible(false)} />
      </Modal>
    </View>
    );
};

export default ManageUsers;
