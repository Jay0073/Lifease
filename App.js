// App.js - Integrated Navigation and Latest Styling
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Necessary imports for header icons and components
import { TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import ALL your screens
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen'; // Required for Settings icon navigation
import VisualAssistantScreen from './screens/VisualAssistantScreen';
import DumbAssistantScreen from './screens/DumbAssistantScreen'; // Remember naming note
import DeafAssistantScreen from './screens/DeafAssistantScreen';
import AIAssistantScreen from './screens/AIAssistantScreen';
import ProfileScreen from './screens/ProfileScreen'; // Keep Profile screen definition

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">

        {/* Home Screen Definition with provided Header Styling */}
        <Stack.Screen
          name="Home" // Screen name used for navigation
          component={HomeScreen} // Component to render for this screen
          options={({ navigation }) => ({
            title: 'LifeEasy', // Header Title
            // --- Header Styling from your latest App.js ---
            headerStyle: {
              backgroundColor: '#ffffff', // White header background
            },
            headerTitleStyle: {
              fontWeight: 'bold', // Bold title
              fontSize: 22, // Slightly larger than default
              color: '#000000', // Black text
            },
            headerTitleAlign: 'center', // Center align the title
            headerShadowVisible: true, // Add shadow for depth (optional)
            // --- End Header Styling ---
            headerLeft: () => (
              // Hamburger Icon for left header button
              <TouchableOpacity
                onPress={() => {
                  console.log('Hamburger Pressed');
                  // TODO: Implement opening a Drawer Navigator here later
                }}
                style={{ marginLeft: 20 }} // Spacing from the left edge
              >
                <Ionicons name="menu" size={28} color="#000" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              // Settings Icon for right header button
              <TouchableOpacity
                onPress={() => {
                   console.log('Navigate to Settings Screen');
                   navigation.navigate('Settings'); // Navigate to 'Settings' screen
                }}
                style={{ marginRight: 20 }} // Spacing from the right edge
              >
                <Ionicons name="settings-outline" size={24} color="#000" />
              </TouchableOpacity>
            ),
          })}
        />

        {/* --- Define ALL Other Screens in the Navigator --- */}
        {/* These screens will be pushed onto the stack when navigated to */}

        {/* Settings Screen */}
        <Stack.Screen
          name="Settings" // Name used for navigation (e.g., navigation.navigate('Settings'))
          component={SettingsScreen}
          options={{ title: 'Settings' }} // Header title for this screen
        />

        {/* Visual Assistant Screen */}
        <Stack.Screen
          name="VisualAssistant"
          component={VisualAssistantScreen}
          options={{ title: 'Visual Assistant' }}
        />

        {/* Dumb Assistant Screen (Consider renaming) */}
        <Stack.Screen
          name="DumbAssistant"
          component={DumbAssistantScreen}
          options={{ title: 'Dumb Assistant' }}
        />

        {/* Deaf Assistant Screen */}
        <Stack.Screen
          name="DeafAssistant"
          component={DeafAssistantScreen}
          options={{ title: 'Deaf Assistant' }}
        />

        {/* AI Assistant Screen */}
        <Stack.Screen
          name="AIAssistant"
          component={AIAssistantScreen}
          options={{ title: 'AI Assistant' }}
        />

        {/* Profile Screen - Include if needed elsewhere */}
        <Stack.Screen
           name="Profile"
           component={ProfileScreen}
           options={{ title: 'My Profile' }}
        />


      </Stack.Navigator>
    </NavigationContainer>
  );
}