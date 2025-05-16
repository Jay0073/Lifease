import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HeaderMenu({ setIsUserOnboarded }) {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const menuItems = [
    { label: "Home", icon: "home-outline", screen: "HomeScreen" },
    { label: "Profile", icon: "person-outline", screen: "Profile" },
    { label: "Settings", icon: "settings-outline", screen: "Settings" },
    { label: "History", icon: "time-outline", screen: "History" },
    { label: "Help Center", icon: "help-circle-outline", screen: "Help" },
    { label: "Tutorial", icon: "book-outline", screen: "Help" },
    { label: "Feedback", icon: "chatbubble-ellipses-outline", screen: "Help" },
    { label: "Logout", icon: "log-out-outline", screen: null }, // No screen for logout
  ];

  const handleNavigate = (screen) => {
    setVisible(false);
    if (screen) {
      navigation.navigate(screen);
    }
  };

  const handleLogout = async () => {
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
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          console.log("menu clicked");
          setVisible(true);
        }}
        style={{ paddingHorizontal: 10 }}
      >
        <Ionicons name="menu" size={28} color="black" />
      </TouchableOpacity>

      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}
          activeOpacity={0.7}
        >
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
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    zIndex: 3000,
  },
  popup: {
    marginTop: 55,
    marginRight: 16,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    minWidth: 200,
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

