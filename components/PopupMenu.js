import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export function PopupMenu({ visible, onClose }) {
  const navigation = useNavigation(); // Use hook to get navigation

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
      <TouchableOpacity 
        style={styles.overlay} 
        onPress={onClose}
        activeOpacity={0.7}
      >
        <View style={styles.popup}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={() => {
                onClose();
                navigation.navigate(item.screen);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={22} color="#333" />
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
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  popup: {
    marginTop: 55,
    marginRight: 16,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
  },
  lastMenuItem: {
    marginBottom: 0,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
    fontWeight: '500',
  },
});