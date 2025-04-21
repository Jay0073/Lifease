// screens/DumbAssistantScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Note: Consider a more inclusive name like Voice Assistant or Non-Visual Assistant
const DumbAssistantScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dumb Assistant Screen</Text>
      {/* Add dumb assistant features here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
  },
});

export default DumbAssistantScreen;