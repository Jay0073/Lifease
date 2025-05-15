import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PopupMenu } from "./PopupMenu";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import CustomHeader from "./CustomHeader";
import VisualAssistantScreen from "../screens/VisualAssistantScreen";
import DumbAssistantScreen from "../screens/DumbAssistantScreen";
import DeafAssistantScreen from "../screens/DeafAssistantScreen";
import AIAssistantScreen from "../screens/AIAssistantScreen";
import ProfileScreen from "../screens/ProfileScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import HelpScreen from "../screens/HelpScreen";
import DeafMuteAssistantScreen from "../screens/DeafMuteAssistantScreen";

function StackNavigator({ navigation }) {
  const Stack = createNativeStackNavigator();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    checkUserData();
  }, []);

  const checkUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userDetails");
      setUserExists(!!userData);
    } catch (error) {
      console.error("Error checking user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // or a loading component
  }

  // Base screen options
  const screenOptions = {
    headerStyle: { backgroundColor: "#ffffff" },
    headerTitleAlign: "left",
    headerShadowVisible: true,
    headerRight: () => <CustomHeader />,
  };

  // Home screen specific options
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

  // Other screens options
  const otherScreenOptions = {
    ...screenOptions,
    headerTitleStyle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#000",
    },
    headerBackTitleVisible: false,
  
    // Remove or reduce margins here
    headerLeftContainerStyle: {
      marginLeft: 0, // Try setting to 0 or remove entirely
    },
    headerTitleContainerStyle: {
      marginLeft: 0, // Try setting to 0 or remove entirely
    },
  };
  

  return (
    <>
      <PopupMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />

      <Stack.Navigator>
        {!userExists ? (
          <Stack.Screen
            name="OnboardingScreen"
            component={OnboardingScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
        ) : (
          <>
            <Stack.Screen
              name="HomeScreen"
              component={HomeScreen}
              options={{
                ...homeScreenOptions,
                title: "Lifeasee",
                headerLeft: () => null,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="VisualAssistant"
              component={VisualAssistantScreen}
              options={{
                ...otherScreenOptions,
                title: "Blind Assistant",
              }}
            />
            <Stack.Screen
              name="DumbAssistant"
              component={DumbAssistantScreen}
              options={{
                ...otherScreenOptions,
                title: "Voice Assistant",
              }}
            />
            <Stack.Screen
              name="DeafAssistant"
              component={DeafAssistantScreen}
              options={{
                ...otherScreenOptions,
                title: "Hearing Assistant",
              }}
            />
            <Stack.Screen
              name="DeafMuteAssistantScreen"
              component={DeafMuteAssistantScreen}
              options={{
                ...otherScreenOptions,
                title: "Deaf & Mute Assistant",
              }}
              />
            <Stack.Screen
              name="AIAssistant"
              component={AIAssistantScreen}
              options={{
                ...otherScreenOptions,
                title: "AI Assistant",
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                ...otherScreenOptions,
                title: "Profile",
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                ...otherScreenOptions,
                title: "Settings",
              }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{
                ...otherScreenOptions,
                title: "History",
              }}
            />
            <Stack.Screen
              name="Help"
              component={HelpScreen}
              options={{
                ...otherScreenOptions,
                title: "Help Center",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </>
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

export default StackNavigator;