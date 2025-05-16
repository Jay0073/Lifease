import React, { useCallback } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import VisualAssistantScreen from "../screens/VisualAssistantScreen";
import DumbAssistantScreen from "../screens/DumbAssistantScreen";
import DeafAssistantScreen from "../screens/DeafAssistantScreen";
import AIAssistantScreen from "../screens/AIAssistantScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import HelpScreen from "../screens/HelpScreen";
import HeaderMenu from '../components/HeaderMenu';
import DeafAndMuteAssistantScreen from "../screens/DeafMuteAssistantScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator({ setIsUserOnboarded }) {
  const screenOptions = {
    headerStyle: { backgroundColor: "#ffffff" },
    headerTitleAlign: "left",
    headerShadowVisible: true,
  };

  const homeScreenOptions = {
    ...screenOptions,
    headerTitle: ({ children }) => (
      <View style={styles.headerTitleContainer}>
        <Ionicons
          name="leaf"
          size={26}
          color="#000"
          style={{ marginRight: 8, marginLeft: 8 }}
        />
        <Text style={styles.headerTitleText}>{children}</Text>
      </View>
    ),
  };

  const otherScreenOptions = {
    ...screenOptions,
    headerTitleStyle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#000",
    },
    headerBackTitleVisible: false,
    headerLeftContainerStyle: {
      marginLeft: 0,
    },
    headerTitleContainerStyle: {
      marginLeft: 0,
    },
  };

  const screenOptionsWithHeaderMenu = useCallback((title) => ({
    ...otherScreenOptions,
    title,
    headerRight: () => (
      <View style={{ marginRight: 10, zIndex: 1000 }}>
        <HeaderMenu setIsUserOnboarded={setIsUserOnboarded} />
      </View>
    ),
  }), [setIsUserOnboarded]);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        options={{
          ...homeScreenOptions,
          title: "Lifeasee",
          headerLeft: () => null,
          gestureEnabled: false,
          headerRight: () => (
            <View style={{ marginRight: 10, zIndex: 1000 }}>
              <HeaderMenu setIsUserOnboarded={setIsUserOnboarded} />
            </View>
          ),
        }}
      >
        {({ route, navigation }) => (
          <HomeScreen
            route={route}
            navigation={navigation}
            setIsUserOnboarded={setIsUserOnboarded}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="VisualAssistant" options={screenOptionsWithHeaderMenu("Blind Assistant")}>
        {({ route, navigation }) => (
          <VisualAssistantScreen
            route={route}
            navigation={navigation}
            setIsUserOnboarded={setIsUserOnboarded}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="DumbAssistant" options={screenOptionsWithHeaderMenu("Voice Assistant")}>
        {({ route, navigation }) => (
          <DumbAssistantScreen
            route={route}
            navigation={navigation}
            setIsUserOnboarded={setIsUserOnboarded}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="DeafAssistant" options={screenOptionsWithHeaderMenu("Hearing Assistant")}>
        {({ route, navigation }) => (
          <DeafAssistantScreen
            route={route}
            navigation={navigation}
            setIsUserOnboarded={setIsUserOnboarded}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="AIAssistant" options={screenOptionsWithHeaderMenu("AI Assistant")}>
        {({ route, navigation }) => (
          <AIAssistantScreen
            route={route}
            navigation={navigation}
            setIsUserOnboarded={setIsUserOnboarded}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen name="DeafMuteAssistantScreen" options={screenOptionsWithHeaderMenu("Deaf & Mute Assistant")}>
        {({ route, navigation }) => (
          <DeafAndMuteAssistantScreen
            route={route}
            navigation={navigation}
            setIsUserOnboarded={setIsUserOnboarded}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Profile" options={screenOptionsWithHeaderMenu("Profile")}>
        {({ route, navigation }) => (
          <ProfileScreen
            route={route}
            navigation={navigation}
            setIsUserOnboarded={setIsUserOnboarded}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Settings" options={screenOptionsWithHeaderMenu("Settings")}>
        {({ route, navigation }) => (
          <SettingsScreen
            route={route}
            navigation={navigation}
            setIsUserOnboarded={setIsUserOnboarded}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="History" options={screenOptionsWithHeaderMenu("History")}>
        {({ route, navigation }) => (
          <HistoryScreen
            route={route}
            navigation={navigation}
            setIsUserOnboarded={setIsUserOnboarded}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Help" options={screenOptionsWithHeaderMenu("Help Center")}>
        {({ route, navigation }) => (
          <HelpScreen
            route={route}
            navigation={navigation}
            setIsUserOnboarded={setIsUserOnboarded}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
});