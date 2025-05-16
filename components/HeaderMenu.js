import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HeaderMenu = React.memo(({ setIsUserOnboarded }) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0); // For fade animation

  const menuItems = [
    { label: "Home", icon: "home-outline", screen: "HomeScreen" },
    { label: "Profile", icon: "person-outline", screen: "Profile" },
    { label: "Settings", icon: "settings-outline", screen: "Settings" },
    { label: "History", icon: "time-outline", screen: "History" },
    { label: "Help Center", icon: "help-circle-outline", screen: "Help" },
    { label: "Tutorial", icon: "book-outline", screen: "Help" },
    { label: "Feedback", icon: "chatbubble-ellipses-outline", screen: "Help" },
    { label: "Logout", icon: "log-out-outline", screen: null },
  ];

  const handleNavigate = useCallback((screen) => {
    console.log("Navigating to:", screen);
    setVisible(false);
    if (screen) {
      navigation.navigate(screen);
    }
  }, [navigation]);

  const handleLogout = useCallback(async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("userDetails");
            setIsUserOnboarded(false);
            setVisible(false);
            navigation.navigate("OnboardingScreen");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
          }
        },
      },
    ]);
  }, [navigation, setIsUserOnboarded]);

  const toggleMenu = useCallback((newState) => {
    console.log("Menu visibility changing to:", newState);
    setVisible(newState);
  }, []);

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          console.log("Menu button pressed");
          toggleMenu(true);
        }}
        onPressIn={() => console.log("Menu button press started")}
        style={styles.menuButton}
        activeOpacity={0.7}
      >
        {/* <Ionicons name="menu" size={28} color="black" />     a big bug is there we will fix that later */}
      </TouchableOpacity>

      {visible && (
        <Animated.View style={[styles.customModal, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={() => toggleMenu(false)}
            activeOpacity={1}
          />
          <View style={styles.popup}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.lastMenuItem,
                ]}
                onPress={() =>
                  item.label === "Logout"
                    ? handleLogout()
                    : handleNavigate(item.screen)
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.label === "Logout" ? "#e74c3c" : "#333"}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    item.label === "Logout" && styles.logoutText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    padding: 15,
  },
  customModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1001,
  },
  popup: {
    position: "absolute",
    top: Platform.OS === "web" ? 50 : 30, // Simplified positioning
    right: 10,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    minWidth: 220,
    maxHeight: "50%",
    zIndex: 1002,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
  },
  lastMenuItem: {
    marginBottom: 0,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
    fontWeight: "500",
  },
  logoutText: {
    color: "#e74c3c",
  },
});

export default HeaderMenu;