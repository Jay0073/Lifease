import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

const SettingsScreen = () => {
  const [largeText, setLargeText] = React.useState(false);
  const [highContrast, setHighContrast] = React.useState(false);

  const toggleLargeText = () => {
    Haptics.selectionAsync();
    setLargeText(!largeText);
    // TODO: Implement large text logic
  };

  const toggleHighContrast = () => {
    Haptics.selectionAsync();
    setHighContrast(!highContrast);
    // TODO: Implement high contrast logic
  };

  const SettingsOption = ({
    iconName,
    label,
    value,
    onToggle,
    accessibilityLabel,
    accessibilityHint,
  }) => (
    <View style={styles.optionButton}>
      <Ionicons name={iconName} size={24} color="#3498db" style={styles.optionIcon} />
      <Text style={styles.optionText}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? '#3498db' : '#f4f3f4'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Accessibility Settings</Text>
        <SettingsOption
          iconName="text-outline"
          label="Large Text"
          value={largeText}
          onToggle={toggleLargeText}
          accessibilityLabel="Toggle Large Text"
          accessibilityHint="Enables or disables larger font sizes throughout the app"
        />
        <View style={styles.separator} />
        <SettingsOption
          iconName="contrast-outline"
          label="High Contrast"
          value={highContrast}
          onToggle={toggleHighContrast}
          accessibilityLabel="Toggle High Contrast"
          accessibilityHint="Enables or disables high contrast mode for better visibility"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    color: '#34495e',
  },
  separator: {
    height: 1,
    backgroundColor: '#cfd8dc',
    marginLeft: 20,
    marginRight: 20,
  },
});

export default SettingsScreen;