import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export function PopupMenu({ visible, onClose, navigation }) {
  // List of items to show in menu
  const menuItems = [
    { label: 'Home', icon: 'home-outline', screen: 'Home' },
    { label: 'Profile', icon: 'person-outline', screen: 'Profile' },
    { label: 'Settings', icon: 'settings-outline', screen: 'Settings' },
    // Add any other items as needed
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
              <Ionicons name={item.icon} size={20} color="#000" />
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
    // Transparent overlay covering the screen
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  popup: {
    marginTop: 60, // Adjust this for vertical positioning below header
    marginRight: 10, // Adjust for horizontal positioning
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#000',
  },
});
