import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export function PopupMenu({ visible, onClose, navigation }) {
  const menuItems = [
    { label: 'Home', icon: 'home-outline', screen: 'HomeScreen' },
    { label: 'Profile', icon: 'person-outline', screen: 'Profile' },
    { label: 'Settings', icon: 'settings-outline', screen: 'Settings' },
    { label: 'History', icon: 'time-outline', screen: 'History' },
    { label: 'Help Center', icon: 'help-circle-outline', screen: 'Help' },
    { label: 'Tutorial', icon: 'book-outline', screen: 'Help' },
    { label: 'Feedback', icon: 'chatbubble-ellipses-outline', screen: 'Help' },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.popup}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => {
                onClose();
                navigation.navigate(item.screen);
              }}
            >
              <Ionicons name={item.icon} size={20} color="#005" />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  popup: {
    marginTop: 45,
    marginRight: 15,
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 30,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
    gap: 10,
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 12,
    color: '#333',
  },
});