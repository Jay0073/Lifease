// screens/DeafAssistantScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DeafAssistantScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deaf Assistant Screen</Text>
      {/* Add deaf assistant features here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d0d0d0',
  },
  title: {
    fontSize: 24,
  },
});

export default DeafAssistantScreen;