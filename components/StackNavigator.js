import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PopupMenu } from './PopupMenu'; // Assume you saved PopupMenu here

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import VisualAssistantScreen from '../screens/VisualAssistantScreen';
import DumbAssistantScreen from '../screens/DumbAssistantScreen';
import DeafAssistantScreen from '../screens/DeafAssistantScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
// ... other imports as needed

const Stack = createNativeStackNavigator();

function StackNavigator({ navigation }) {
  // Local state to control popup visibility
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      {/* Render the PopupMenu, passing current navigation */}
      <PopupMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTitleAlign: 'left',
          headerShadowVisible: true,
          // Replace headerRight with a custom button to toggle popup
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setMenuVisible(!menuVisible)}
              style={{ marginRight: 20 }}
            >
              <Ionicons name="menu" size={28} color="#000" />
            </TouchableOpacity>
          ),
          headerTitle: ({ children }) => (
            <View style={styles.headerTitleContainer}>
              <Ionicons name="leaf-outline" size={24} color="#000" style={{ marginRight: 8 }} />
              <Text style={styles.headerTitleText}>{children}</Text>
            </View>
          ),
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
          }}
        />
        <Stack.Screen
        name="VisualAssistant"
        component={VisualAssistantScreen}
        options={({ navigation }) => ({
          title: 'Visual Assistant',
          headerRight: () => <SettingsHelpHeaderRight navigation={navigation} />,
        })}
      />
      <Stack.Screen
        name="DumbAssistant"
        component={DumbAssistantScreen}
        options={({ navigation }) => ({
          title: 'Voice Assistant',
          headerRight: () => <SettingsHelpHeaderRight navigation={navigation} />,
        })}
      />
      <Stack.Screen
        name="DeafAssistant"
        component={DeafAssistantScreen}
        options={({ navigation }) => ({
          title: 'Deaf Assistant',
          headerRight: () => <SettingsHelpHeaderRight navigation={navigation} />,
        })}
      />
      <Stack.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={({ navigation }) => ({
          title: 'AI Assistant',
          headerRight: () => <SettingsHelpHeaderRight navigation={navigation} />,
        })}
      />
        {/* Add your other screens as required */}
      </Stack.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default StackNavigator;
