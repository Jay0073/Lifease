import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PopupMenu } from './PopupMenu';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import VisualAssistantScreen from '../screens/VisualAssistantScreen';
import DumbAssistantScreen from '../screens/DumbAssistantScreen';
import DeafAssistantScreen from '../screens/DeafAssistantScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HelpScreen from '../screens/HelpScreen';

const Stack = createNativeStackNavigator();

function StackNavigator({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const screenOptions = {
    headerStyle: { backgroundColor: '#ffffff' },
    headerTitleAlign: 'left',
    headerShadowVisible: true,
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
  };

  return (
    <>
      <PopupMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />
      <Stack.Navigator
        initialRouteName="OnboardingScreen"
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="OnboardingScreen"
          component={OnboardingScreen}
          options={{ title: 'Onboarding', headerShown: false }}
        />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="VisualAssistant" component={VisualAssistantScreen} options={{ title: 'Blind Assistant' }} />
        <Stack.Screen name="DumbAssistant" component={DumbAssistantScreen} options={{ title: 'Dumb Assistant' }} />
        <Stack.Screen name="DeafAssistant" component={DeafAssistantScreen} options={{ title: 'Deaf Assistant' }} />
        <Stack.Screen name="AIAssistant" component={AIAssistantScreen} options={{ title: 'AI Assistant' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
        <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help Center' }} />
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