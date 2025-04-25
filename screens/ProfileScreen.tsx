// screens/ProfileScreen.js - Enhanced Accessible User Profile Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  // Consider importing AccessibilityInfo or other accessibility APIs if needed
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Placeholder for user data (replace with actual data fetching later)
const userData = {
    name: "Lifease User", // Replace with user's name
    email: "user.lifease@example.com", // Replace with user's email
    profilePictureUrl: null, // Set to a string URL for a real image
    userType: "Accessibility User", // Example: could indicate primary focus
    // Add more user-specific accessibility preferences here if stored per user
    prefersLargeText: true, // Example preference
};

const ProfileScreen = ({ navigation }) => {

    // Placeholder handlers for profile actions
    const handleEditProfile = () => {
        console.log('Edit Profile pressed');
        // TODO: Navigate to Edit Profile screen or show modal
        // Ensure navigation action has accessibility feedback (e.g., screen reader announcement on arrival)
    };

    const handleChangePassword = () => {
        console.log('Change Password pressed');
        // TODO: Navigate to Change Password screen or show modal
    };

     const handleAccessibilitySettings = () => {
        console.log('Accessibility Settings pressed');
        // Navigate to Accessibility Settings screen (e.g., the main Settings screen)
        // Ensure 'Settings' screen name is correct in your App.js Stack Navigator
         navigation.navigate('Settings'); // Example: Navigate to the main Settings screen
         // Add accessibility announcement for screen readers about navigating
    };

    const handleLogout = () => {
        console.log('Logout pressed');
        // TODO: Implement secure logout logic (clear authentication state, navigate to Auth screen)
        // Consider adding an "Are you sure?" confirmation modal for accessibility
         // Add accessibility announcement for screen readers on successful logout
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ScrollView allows the content to be scrollable if it exceeds screen height */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Main container for the screen content */}
        <View style={styles.container}>

          {/* --- Profile Header Area (Avatar & Basic Info) --- */}
           {/* Visually prominent area for user identity */}
          <View style={styles.profileHeader}>
            {/* Profile Picture or Placeholder (Large size for visibility) */}
            {userData.profilePictureUrl ? (
              <Image
                 source={{ uri: userData.profilePictureUrl }}
                 style={styles.avatar}
                 accessibilityLabel={`${userData.name}'s profile picture`} // Accessibility for screen readers
                 accessible={true} // Make image accessible
              />
            ) : (
              // Placeholder View if no profile picture URL (Large and clear)
              <View style={styles.avatarPlaceholder} accessible={true} accessibilityLabel="User avatar placeholder">
                <Ionicons name="person-circle-outline" size={120} color="#bdc3c7" /> {/* Larger placeholder icon */}
              </View>
            )}

            {/* User Info (Clear, high-contrast text) */}
            <Text style={styles.userName} accessibilityRole="text">{userData.name}</Text>
            <Text style={styles.userEmail} accessibilityRole="text">{userData.email}</Text>
             {userData.userType ? (
                 <Text style={styles.userType} accessibilityRole="text">{userData.userType}</Text>
             ) : null}
          </View>

          {/* --- Account Settings Card --- */}
           {/* Grouping related account options */}
           <View style={styles.card}>
               <Text style={styles.cardTitle}>Account Settings</Text>

               {/* Edit Profile Option (Large touch target) */}
               {/* Use a helper component for repetitive option items */}
               <ProfileOptionButton
                   iconName="create-outline"
                   label="Edit Profile"
                   onPress={handleEditProfile}
                   accessibilityLabel="Edit Profile Information"
                   accessibilityHint="Opens the screen to update your profile details."
               />
                {/* Separator */}
               <View style={styles.separator} />

               {/* Change Password Option (Large touch target) */}
               <ProfileOptionButton
                   iconName="lock-closed-outline"
                   label="Change Password"
                   onPress={handleChangePassword}
                   accessibilityLabel="Change Account Password"
                   accessibilityHint="Opens the screen to change your password."
               />
                {/* Separator (if more items in this card) */}
               {/* <View style={styles.separator} /> */}

               {/* TODO: Add other account options like Linked Services */}
               {/* <ProfileOptionButton
                    iconName="link-outline"
                    label="Linked Services"
                    onPress={() => console.log('Linked Services')}
                    accessibilityLabel="View and manage linked services"
                    accessibilityHint="Opens the screen to manage external services connected to your account."
                /> */}
           </View>

           {/* --- Accessibility Settings Card --- */}
            {/* Dedicated card for accessibility options */}
           <View style={styles.card}>
                <Text style={styles.cardTitle}>Accessibility</Text>

                {/* Accessibility Settings Option (Large touch target) */}
               <ProfileOptionButton
                   iconName="accessibility-outline"
                   label="Accessibility Settings"
                   onPress={handleAccessibilitySettings}
                   accessibilityLabel="Access Accessibility Settings"
                   accessibilityHint="Navigates to the screen where you can adjust accessibility preferences."
               />
                {/* Separator (if more items in this card) */}
                {/* <View style={styles.separator} /> */}
                {/* TODO: Add more direct accessibility preferences here if relevant */}
                {/* Example: Toggle Large Text (if not handled by OS) */}
                {/* <View style={styles.optionButtonRow}>
                    <Ionicons name="text-outline" size={24} color="#3498db" style={styles.optionIcon} />
                    <Text style={styles.optionText}>Use Large Text</Text>
                     <Switch
                         value={userData.prefersLargeText} // Bind to user data/state
                         onValueChange={(newValue) => {
                             console.log('Toggle Large Text:', newValue);
                             // TODO: Update user preference and apply theme/styles
                         }}
                         trackColor={{ false: "#767577", true: "#81b0ff" }}
                         thumbColor={userData.prefersLargeText ? "#3498db" : "#f4f3f4"}
                         accessibilityLabel="Toggle Large Text"
                         accessibilityHint="Enables or disables larger font sizes throughout the app."
                     />
                </View> */}

           </View>

           {/* --- Action Button Card (Logout) --- */}
            {/* Making the Logout button stand out */}
           <View style={styles.card}>
               {/* Logout Option (Large touch target, distinct color) */}
               <ProfileOptionButton
                   iconName="log-out-outline"
                   label="Logout"
                   onPress={handleLogout}
                   iconColor="#e74c3c" // Red icon color
                   textColor="#e74c3c" // Red text color
                   accessibilityLabel="Log out of your account"
                   accessibilityHint="Signs you out of the application."
                   hideArrow={true} // Don't show the arrow for logout
               />
           </View>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper component for consistent Profile Option Button styling
const ProfileOptionButton = ({ iconName, label, onPress, iconColor = '#3498db', textColor = '#34495e', accessibilityLabel, accessibilityHint, hideArrow = false }) => (
    <TouchableOpacity
        style={styles.optionButton}
        onPress={onPress}
        activeOpacity={0.8} // Visual feedback on press
        // Accessibility props
        accessibilityLabel={accessibilityLabel || label} // Use provided label or default
        accessibilityHint={accessibilityHint}
        accessible={true} // Ensure the whole touchable is accessible
    >
        {/* Icon */}
        <Ionicons name={iconName} size={24} color={iconColor} style={styles.optionIcon} />
        {/* Text Label */}
        <Text style={[styles.optionText, { color: textColor }]}>{label}</Text>
        {/* Arrow Icon (unless hidden) */}
        {hideArrow ? null : <Ionicons name="chevron-forward-outline" size={24} color="#bdc3c7" />}
    </TouchableOpacity>
);


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Light background
  },
  scrollContainer: {
    flexGrow: 1, // Allows content to grow vertically
    paddingBottom: 20, // Add padding at the bottom
  },
  container: {
    flex: 1, // Takes up space below header
    backgroundColor: '#f0f4f8', // Match safe area background
    paddingHorizontal: 20, // Horizontal padding
    paddingTop: 20, // Padding at the top below header
    alignItems: 'center', // Center content horizontally
  },
  // Profile Header Area
  profileHeader: {
      alignItems: 'center', // Center items inside
      marginBottom: 30, // Space below header section
      paddingBottom: 20, // Padding inside header section
      borderBottomWidth: 1, // Separator line
      borderBottomColor: '#cfd8dc', // Light separator color
      width: '100%', // Take full width for separator
  },
  avatarPlaceholder: {
      width: 120, // Size of the placeholder
      height: 120,
      borderRadius: 60, // Half of size for circle
      backgroundColor: '#ecf0f1', // Light gray background
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15, // Space below avatar
       // Optional shadow
       elevation: 3,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.1,
       shadowRadius: 3,
  },
    avatar: { // If using actual Image component
       width: 120,
       height: 120,
       borderRadius: 60,
       marginBottom: 15,
        // Optional shadow
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
  userName: {
      fontSize: 24, // Larger font size
      fontWeight: 'bold',
      color: '#2c3e50', // Dark text (good contrast)
      marginBottom: 5, // Space below name
  },
  userEmail: {
      fontSize: 16, // Standard font size
      color: '#7f8c8d', // Muted text
      marginBottom: 10, // Space below email
  },
   userType: {
       fontSize: 16, // Standard font size
       color: '#3498db', // Accent color
       fontStyle: 'italic',
       marginTop: 5, // Space above user type
   },
    // Card Styles for Grouping Options
   card: {
       width: '100%', // Take full width
       backgroundColor: '#fff', // White background for cards
       borderRadius: 10, // Rounded corners
       marginBottom: 20, // Space below each card
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        overflow: 'hidden', // Hide separator lines outside border radius
   },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34495e',
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 10, // Space below title
        // Add a subtle line below title if desired
        // borderBottomWidth: 1,
        // borderBottomColor: '#cfd8dc',
    },
  // Profile Option Button Styling (Used by ProfileOptionButton component)
  optionButton: {
      flexDirection: 'row', // Arrange icon, text, arrow horizontally
      alignItems: 'center', // Vertically align content
      paddingVertical: 15, // Vertical padding inside button (Increases touch target size)
      paddingHorizontal: 20, // Horizontal padding inside button
      backgroundColor: '#fff', // White background
      minHeight: 48, // Ensure minimum touch target size (Accessibility)
  },
  optionIcon: {
      marginRight: 15, // Space between icon and text
  },
  optionText: {
      flex: 1, // Allow text to take up available space
      fontSize: 18, // Standard font size (ensure good size)
      color: '#34495e', // Darker text color (good contrast)
  },
   separator: {
       height: 1, // Height of the separator line
       backgroundColor: '#cfd8dc', // Light gray color
       marginLeft: 20, // Start line after the icon space
       marginRight: 20, // End line before the arrow space
   },
   // Special style for Logout button (handled in ProfileOptionButton component via props)
});

// Export the main screen component
export default ProfileScreen;