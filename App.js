import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import ALL your screens
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import VisualAssistantScreen from './screens/VisualAssistantScreen';
import DumbAssistantScreen from './screens/DumbAssistantScreen';
import DeafAssistantScreen from './screens/DeafAssistantScreen';
import AIAssistantScreen from './screens/AIAssistantScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Define the Stack Navigator
function StackNavigator({ navigation }) {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleAlign: 'left', // Align the title to the left
        headerShadowVisible: true,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()} // Open the drawer
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
          title: 'Home', // Title for the Home screen
        }}
      />
      <Stack.Screen
        name="VisualAssistant"
        component={VisualAssistantScreen}
        options={{
          title: 'Visual Assistant', // Title for the Visual Assistant screen
        }}
      />
      <Stack.Screen
        name="DumbAssistant"
        component={DumbAssistantScreen}
        options={{
          title: 'Voice Assistant', // Title for the Voice Assistant screen
        }}
      />
      <Stack.Screen
        name="DeafAssistant"
        component={DeafAssistantScreen}
        options={{
          title: 'Deaf Assistant', // Title for the Deaf Assistant screen
        }}
      />
      <Stack.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{
          title: 'AI Assistant', // Title for the AI Assistant screen
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings', // Title for the Settings screen
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'My Profile', // Title for the Profile screen
        }}
      />
    </Stack.Navigator>
  );
}

// Define the Drawer Navigator
export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="HomeStack"
        screenOptions={{
          headerShown: false, // Disable the Drawer header
          drawerActiveTintColor: '#2196F3',
          drawerInactiveTintColor: 'gray',
          drawerLabelStyle: { fontSize: 16 },
          drawerContentStyle: { paddingTop: 20 }, // Add padding to the top of the sidebar items
        }}
      >
        <Drawer.Screen
          name="HomeStack"
          component={StackNavigator}
          options={{
            drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
            title: 'Home',
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="Feedback"
          component={SettingsScreen}
          options={{
            drawerIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="About"
          component={SettingsScreen}
          options={{
            drawerIcon: ({ color, size }) => <Ionicons name="information-circle-outline" size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="Help Center"
          component={SettingsScreen}
          options={{
            drawerIcon: ({ color, size }) => <Ionicons name="help-circle-outline" size={size} color={color} />,
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// Styles for the header title
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