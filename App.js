import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./navigators/AuthNavigator";
import AppNavigator from "./navigators/AppNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [isUserOnboarded, setIsUserOnboarded] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const userData = await AsyncStorage.getItem("userDetails");
      setIsUserOnboarded(!!userData);
    };
    checkUser();
  }, []);

  if (isUserOnboarded === null) return null; // optional splash/loading screen

  return (
    <NavigationContainer>
      {isUserOnboarded ? (
        <AppNavigator setIsUserOnboarded={setIsUserOnboarded} />
      ) : (
        <AuthNavigator setIsUserOnboarded={setIsUserOnboarded} />
      )}
    </NavigationContainer>
  );
}
