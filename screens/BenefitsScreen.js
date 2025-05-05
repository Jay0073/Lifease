// screens/BenefitsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BenefitsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Benefits Screen</Text>
      {/* Add benefits content here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  title: {
    fontSize: 24,
  },
});

export default BenefitsScreen;