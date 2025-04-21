// screens/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native'; // Added ScrollView

const SettingsScreen = () => {
  return (
    // Use ScrollView if your settings list might exceed screen height
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings Screen</Text>

        {/* Add your settings options here */}
        {/* Example: */}
        {/* <View style={styles.settingItem}>
          <Text style={styles.settingText}>Language</Text>
          {/* Add a picker or button for language selection */}
        {/* </View>
        <View style={styles.settingItem}>
           <Text style={styles.settingText}>Notifications</Text>
           {/* Add a toggle switch */}
        {/* </View> */}
        {/* Add more settings items as needed */}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center', // Center horizontally
    padding: 20,
    backgroundColor: '#f9f9f9', // Light background
  },
  title: {
    fontSize: 28, // Slightly larger title
    fontWeight: 'bold',
    marginBottom: 30, // More space below title
    color: '#333',
  },
  // Example styles for future setting items
  settingItem: {
    width: '100%', // Take full width
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row', // Optional: for items with toggles/buttons
    justifyContent: 'space-between', // Optional
    alignItems: 'center', // Optional
  },
  settingText: {
    fontSize: 18,
    color: '#555',
  },
});

export default SettingsScreen;