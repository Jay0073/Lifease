import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export function PopupMenu({ visible, onClose, navigation }) {
  // List of items to show in menu
  const menuItems = [
    { label: 'Home', icon: 'home-outline', screen: 'Home' },
    { label: 'Profile', icon: 'person-outline', screen: 'Profile' },
    { label: 'Settings', icon: 'settings-outline', screen: 'Settings' },
    { label: 'Tutorial', icon: 'book-outline', screen: 'Settings' },
    { label: 'Feedback', icon: 'chatbubble-ellipses-outline', screen: 'Settings' },
    { label: 'Help Center', icon: 'help-circle-outline', screen: 'Settings' },
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
    // Transparent overlay covering the screen
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  popup: {
    marginTop: 45, // Increased vertical positioning below the header
    marginRight: 15, // Increased horizontal positioning
    backgroundColor: '#fff',
    paddingVertical: 15, // Increased vertical padding inside the popup
    paddingHorizontal: 10, // Increased horizontal padding inside the popup
    borderRadius: 12, // Slightly more rounded corners
    elevation: 6, // Enhanced Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Increased vertical padding for each menu item
    paddingLeft: 20,
    paddingRight: 30, // Added horizontal padding for each menu item
    marginBottom: 10, // Added spacing between menu items
    borderRadius: 8, // Added slight rounding for menu items
    backgroundColor: '#f1f1f1', // Light background for menu items
    gap: 10, // Added gap between icon and text
  },
  menuItemText: {
    fontSize: 18, // Slightly larger font size
    marginLeft: 12, // Increased spacing between icon and text
    color: '#333', // Slightly darker text color for better readability
  },
});