import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator({ setIsUserOnboarded }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OnboardingScreen"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {({ route, navigation }) => (
          <OnboardingScreen
            route={route}
            navigation={navigation}
            setIsUserOnboarded={setIsUserOnboarded}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
