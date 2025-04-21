// // App.js
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { TouchableOpacity, Text } from 'react-native'; // Import TouchableOpacity and Text for header icons
// import Ionicons from '@expo/vector-icons/Ionicons'; // Import Ionicons for icons

// // Import your screens
// import HomeScreen from './screens/HomeScreen';
// import ProfileScreen from './screens/ProfileScreen'; // Keep Profile for now, maybe used later
// import SettingsScreen from './screens/SettingsScreen';
// import VisualAssistantScreen from './screens/VisualAssistantScreen';
// import DumbAssistantScreen from './screens/DumbAssistantScreen'; // Note on naming below
// import DeafAssistantScreen from './screens/DeafAssistantScreen';
// import AIAssistantScreen from './screens/AIAssistantScreen';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Home">

//         {/* Home Screen Definition */}
//         {/* Ensure there are no extra empty lines or characters directly here */}
//         <Stack.Screen
//           name="Home"
//           component={HomeScreen}
//           options={({ navigation }) => ({
//             title: 'LifeEasy', // App Name in Header
//             headerStyle: {
//               backgroundColor: '#f8f8f8', // Example header background
//             },
//             headerTitleStyle: {
//               fontWeight: 'bold',
//             },
//             headerLeft: () => (
//               // Hamburger Icon (Placeholder - typically for Drawer Nav)
//               <TouchableOpacity
//                 onPress={() => {
//                   // TODO: Implement opening a Drawer Navigator here later
//                   console.log('Hamburger Pressed');
//                   // Example: navigation.openDrawer(); if using Drawer Navigator
//                 }}
//                 style={{ marginLeft: 15 }}
//               >
//                  <Ionicons name="menu" size={28} color="#000" />
//               </TouchableOpacity>
//             ),
//             headerRight: () => (
//               // Settings Icon
//               <TouchableOpacity
//                 onPress={() => navigation.navigate('Settings')} // Navigate to Settings screen
//                 style={{ marginRight: 15 }}
//               >
//                 <Ionicons name="settings-outline" size={24} color="#000" />
//               </TouchableOpacity>
//             ),
//           })}
//         />

//         {/* Other Screens */}
//         {/* Ensure there are no extra empty lines or characters directly here */}
//         <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
//         {/* Ensure there are no extra empty lines or characters directly here */}
//         <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
//         {/* Ensure there are no extra empty lines or characters directly here */}
//         <Stack.Screen name="VisualAssistant" component={VisualAssistantScreen} options={{ title: 'Visual Assistant' }} />
//         {/* Ensure there are no extra empty lines or characters directly here */}
//         <Stack.Screen name="DumbAssistant" component={DumbAssistantScreen} options={{ title: 'Dumb Assistant' }} /> {/* Note on naming below */}
//         {/* Ensure there are no extra empty lines or characters directly here */}
//         <Stack.Screen name="DeafAssistant" component={DeafAssistantScreen} options={{ title: 'Deaf Assistant' }} />
//         {/* Ensure there are no extra empty lines or characters directly here */}
//         <Stack.Screen name="AIAssistant" component={AIAssistantScreen} options={{ title: 'AI Assistant' }} />
//         {/* Ensure there are no extra empty lines or characters directly here */}

//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }



// App.js - TEMPORARY SIMPLIFIED VERSION + Header Icons
// 


import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Uncomment these imports to use header icons
import { TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import only the HomeScreen as a starting point
import HomeScreen from './screens/HomeScreen';

// Uncomment and add other screens as needed
// import ProfileScreen from './screens/ProfileScreen';
// import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* Home Screen Definition */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'LifeEasy', // Header Title
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
            headerLeft: () => (
              // Hamburger Icon for left header button
              <TouchableOpacity
                onPress={() => {
                  console.log('Hamburger Pressed');
                }}
                style={{ marginLeft: 20 }}
              >
                <Ionicons name="menu" size={28} color="#000" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              // Settings Icon for right header button
              <TouchableOpacity
                onPress={() => {
                  console.log('Navigate to Settings Screen'); // Optionally navigate to 'Settings'
                  // navigation.navigate('Settings'); Ensure Settings screen exists in the stack
                }}
                style={{ marginRight: 20 }}
              >
                <Ionicons name="settings-outline" size={24} color="#000" />
              </TouchableOpacity>
            ),
          })}
        />

        {/* Define other screens here */}
        {/* Example:
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{title: 'Settings'}}
        />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
