// screens/DeafAssistantScreen.js - Layout and Styling
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView // Added ScrollView in case content needs scrolling
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'; // For icons

const { width } = Dimensions.get('window');
const padding = 20; // General padding
const buttonGap = 15; // Gap between side-by-side buttons
const optionButtonWidth = (width - padding * 2 - buttonGap) / 2; // Width for side-by-side buttons


const DeafAssistantScreen = ({ navigation }) => {

  // Placeholder functions for button presses
  const handleTextToSign = () => {
    console.log('Text to Sign button pressed');
    // TODO: Implement Text to Sign functionality
    // Maybe navigate to a screen for text input?
  };

  const handleAudioToSign = () => {
    console.log('Audio to Sign button pressed');
    // TODO: Implement Audio to Sign functionality
    // Requires microphone access and speech-to-text
  };

  const handleRecordButton = () => {
    console.log('Record button pressed');
    // TODO: Implement sign language recording functionality
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Use ScrollView for scrollability if content exceeds screen height */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>

          {/* --- Avatar Section (Sign Language Display) --- */}
          {/* This section will take up the remaining space */}
          <View style={styles.avatarSection}>
            {/* Placeholder for Avatar/Sign Language Display */}
            <View style={styles.avatarPlaceholder}>
                 {/* You might put a video component or image here */}
                 <Ionicons name="person-circle-outline" size={100} color="#bdc3c7" /> {/* Placeholder Icon */}
                 <Text style={styles.avatarPlaceholderText}>
                     Sign Language Display Area
                 </Text>
                 {/* TODO: Integrate a video player or image sequence for sign language */}
            </View>
          </View>

          {/* --- Options Section (Text/Audio to Sign) --- */}
          <View style={styles.optionsContainer}>
            {/* Text to Sign Button */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleTextToSign}
              activeOpacity={0.8}
              // Accessibility
              accessibilityLabel="Text to Sign"
              accessibilityHint="Convert written text into sign language."
            >
              <Ionicons name="text-outline" size={30} color="#fff" />
              <Text style={styles.optionButtonText}>Text to Sign</Text>
            </TouchableOpacity>

            {/* Audio to Sign Button */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleAudioToSign}
              activeOpacity={0.8}
              accessibilityLabel="Audio to Sign"
              accessibilityHint="Convert spoken audio into sign language."
            >
              <Ionicons name="volume-high-outline" size={30} color="#fff" />
              <Text style={styles.optionButtonText}>Audio to Sign</Text>
            </TouchableOpacity>
          </View>

          {/* --- Record Button --- */}
          <View style={styles.recordButtonContainer}>
              <TouchableOpacity
                style={styles.recordButton}
                onPress={handleRecordButton}
                activeOpacity={0.8}
                 accessibilityLabel="Record Sign Language"
                 accessibilityHint="Start or stop recording sign language input."
              >
                  <Ionicons name="mic-circle-outline" size={60} color="#fff" /> {/* Larger Record/Mic Icon */}
                  <Text style={styles.recordButtonText}>Record Sign</Text>
              </TouchableOpacity>
          </View>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e0e0e0', // Light background
  },
  scrollContainer: {
    flexGrow: 1, // Allow content to grow
    // paddingBottom: padding, // Add bottom padding if not covered by Safe Area or fixed footer
  },
  container: {
    flex: 1, // Container takes up available space below header
    backgroundColor: '#e0e0e0', // Match safe area background
    padding: padding, // Apply padding around the content
  },
  // Avatar Section
  avatarSection: {
    flex: 1, // Takes up remaining space
    backgroundColor: '#f5f5f5', // Light grey background for avatar area
    borderRadius: 10,
    marginBottom: padding, // Space below this section
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
     // Optional shadow
     elevation: 3,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 3,
  },
   avatarPlaceholder: {
       alignItems: 'center',
   },
   avatarPlaceholderText: {
       fontSize: 18,
       color: '#7f8c8d',
       marginTop: 10,
   },
  // Options Section (Text/Audio to Sign)
  optionsContainer: {
    flexDirection: 'row', // Arrange buttons side-by-side
    justifyContent: 'space-between', // Space between buttons
    marginBottom: padding, // Space below this section
  },
  optionButton: {
    width: optionButtonWidth, // Calculated width
    height: 100, // Fixed height for option buttons
    backgroundColor: '#3498db', // Blue button color
    borderRadius: 10,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
     // Optional shadow
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
  },
  optionButtonText: {
    color: '#fff', // White text
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8, // Space between icon and text
    textAlign: 'center',
  },
  // Record Button Section
  recordButtonContainer: {
    // Use this container for styling/positioning the single button
    alignItems: 'center', // Center the button horizontally
    marginBottom: padding, // Space below the button (optional, depending on layout)
  },
  recordButton: {
    width: 120, // Fixed width for the button
    height: 120, // Fixed height
    borderRadius: 60, // Make it circular
    backgroundColor: '#e74c3c', // Red color for record
    justifyContent: 'center',
    alignItems: 'center',
     // More pronounced shadow for a prominent button
     elevation: 6,
     shadowColor: '#e74c3c', // Shadow matching button color
     shadowOffset: { width: 0, height: 3 },
     shadowOpacity: 0.4,
     shadowRadius: 5,
     borderWidth: 5, // Add a border
     borderColor: '#c0392b', // Darker red border
  },
  recordButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 5, // Space below icon (if icon is inside)
      // Note: Icon and text might need specific arrangement inside a View if both are children
      display: 'none', // Hide the text for a simple circular icon button
  },
});

export default DeafAssistantScreen;