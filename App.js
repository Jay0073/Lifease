// App.js - Corrected Drawer/Stack Navigators with Headers
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import all screens
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import VisualAssistantScreen from './screens/VisualAssistantScreen';
import DumbAssistantScreen from './screens/DumbAssistantScreen';
import DeafAssistantScreen from './screens/DeafAssistantScreen';
import AIAssistantScreen from './screens/AIAssistantScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Header Title Component
const CustomHeaderTitle = ({ children }) => (
  <View style={styles.headerTitleContainer}>
    <Ionicons name="leaf-outline" size={24} color="#000" style={{ marginRight: 8 }} />
    <Text style={styles.headerTitleText}>{children}</Text>
  </View>
);

// Common Header Right Icons Component for Settings and Help
const SettingsHelpHeaderRight = ({ navigation }) => (
  <View style={{ flexDirection: 'row', marginRight: 15 }}>
    {/* Settings Icon */}
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings')}
      style={{ marginLeft: 15 }}
      accessibilityLabel="Settings"
      accessibilityHint="Adjust application settings."
    >
      <Ionicons name="settings-outline" size={24} color="#000" />
    </TouchableOpacity>
    {/* Help Icon */}
    <TouchableOpacity
      onPress={() => {
        console.log('Help icon pressed');
        /* TODO: Implement navigation to Help screen or show help modal */
      }}
      style={{ marginLeft: 15 }}
      accessibilityLabel="Help"
      accessibilityHint="Get help with the application."
    >
      <Ionicons name="information-circle-outline" size={24} color="#000" />
    </TouchableOpacity>
  </View>
);

// Stack Navigator
function StackNavigator({ navigation }) {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerShadowVisible: true,
        headerTintColor: '#000',
        headerTitle: (props) => <CustomHeaderTitle {...props} />,
        headerTitleAlign: 'left',
      }}
    >
      {/* Home Screen */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Home',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={{ marginLeft: 20 }}
              accessibilityLabel="Open drawer"
              accessibilityHint="Opens the navigation sidebar."
            >
              <Ionicons name="menu" size={28} color="#000" />
            </TouchableOpacity>
          ),
          headerRight: () => <SettingsHelpHeaderRight navigation={navigation} />,
        })}
      />
      {/* Visual Assistant Screen */}
      <Stack.Screen
        name="VisualAssistant"
        component={VisualAssistantScreen}
        options={({ navigation }) => ({
          title: 'Visual Assistant',
          headerRight: () => <SettingsHelpHeaderRight navigation={navigation} />,
        })}
      />
      {/* Voice Assistant Screen (DumbAssistant) */}
      <Stack.Screen
        name="DumbAssistant"
        component={DumbAssistantScreen}
        options={({ navigation }) => ({
          title: 'Voice Assistant',
          headerRight: () => <SettingsHelpHeaderRight navigation={navigation} />,
        })}
      />
      {/* Deaf Assistant Screen */}
      <Stack.Screen
        name="DeafAssistant"
        component={DeafAssistantScreen}
        options={({ navigation }) => ({
          title: 'Deaf Assistant',
          headerRight: () => <SettingsHelpHeaderRight navigation={navigation} />,
        })}
      />
      {/* AI Assistant Screen */}
      <Stack.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={({ navigation }) => ({
          title: 'AI Assistant',
          headerRight: () => <SettingsHelpHeaderRight navigation={navigation} />,
        })}
      />
      {/* Settings Screen */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={({ navigation }) => ({
          title: 'Settings',
          headerRight: () => <SettingsHelpHeaderRight navigation={navigation} />,
        })}
      />
      {/* Profile Screen */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'My Profile',
          headerRight: () => <SettingsHelpHeaderRight navigation={navigation} />,
        })}
      />
    </Stack.Navigator>
  );
}

// Drawer Navigator (Main App Entry)
export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="HomeStack"
        screenOptions={{
          headerShown: false, // Hide the Drawer's own header
          drawerActiveTintColor: '#2196F3',
          drawerInactiveTintColor: 'gray',
          drawerLabelStyle: { fontSize: 16 },
          drawerContentStyle: { paddingTop: 20 },
        }}
      >
        <Drawer.Screen
          name="HomeStack"
          component={StackNavigator}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
            title: 'Home',
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
            title: 'Profile',
          }}
        />
        <Drawer.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
            title: 'Settings',
          }}
        />
        <Drawer.Screen
          name="Feedback"
          component={SettingsScreen} // Placeholder
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-outline" size={size} color={color} />
            ),
            title: 'Feedback',
          }}
        />
        <Drawer.Screen
          name="About"
          component={SettingsScreen} // Placeholder
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="information-circle-outline" size={size} color={color} />
            ),
            title: 'About',
          }}
        />
        <Drawer.Screen
          name="Help Center"
          component={SettingsScreen} // Placeholder
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="help-circle-outline" size={size} color={color} />
            ),
            title: 'Help Center',
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// Styles for the custom header title
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