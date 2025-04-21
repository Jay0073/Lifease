// screens/VisualAssistantScreen.js - Layout Below Header
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView // Use SafeAreaView for padding
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'; // For icons
import HapticFeedback from 'react-native-haptic-feedback'; // For haptic feedback

// Get screen height for percentage calculations
const { height: screenHeight } = Dimensions.get('window');
const padding = 16; // Spacing between sections

// Optional: Configure haptic feedback (choose one type)
const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};


const VisualAssistantScreen = ({ navigation }) => {

  // Function to trigger haptic feedback
  const triggerHaptic = () => {
      HapticFeedback.trigger('impactLight', options); // Or 'selection', 'impactMedium', etc.
  };

  // Placeholder functions for button presses
  const handleCameraPress = () => {
    triggerHaptic();
    console.log('Camera area tapped');
    // TODO: Implement camera capture or description logic
  };

  const handleLastImagePress = () => {
    triggerHaptic();
    console.log('Last Image button pressed');
    // TODO: Implement view last image logic
  };

  const handleLocationPress = () => {
    triggerHaptic();
    console.log('Location button pressed');
    // TODO: Implement get location logic
  };

  const handleReadTextPress = () => {
    triggerHaptic();
    console.log('Read Text button pressed');
    // TODO: Implement OCR/read text logic
  };

   const handleVoiceAssistantPress = () => {
       // Haptic feedback for hold is usually different, often managed by gesture handler
       console.log('Voice Assistant button pressed (Hold)');
       // TODO: Implement hold-to-talk logic (requires gesture handler)
   }


  return (
    // SafeAreaView for content below the header and above any bottom bar
    // We'll use flex: 1 for the main container to take up remaining space below header
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* --- Camera Section (40% Height) --- */}
        <TouchableOpacity
          style={styles.cameraSection}
          onPress={handleCameraPress}
          activeOpacity={0.8} // Reduce opacity change on press
          // Accessibility
          accessibilityLabel="Tap anywhere to capture or describe surroundings"
          accessibilityHint="Triggers image capture or visual description."
        >
          <View style={styles.cameraContent}>
            <Ionicons name="camera-outline" size={80} color="#2c3e50" />
            {/* Ensure text is wrapped in <Text> */}
            <Text style={styles.cameraText}>
              Tap anywhere to capture{'\n'}or describe surroundings
            </Text>
             {/* TODO: Add voice guidance hook here */}
          </View>
        </TouchableOpacity>

        {/* --- Quick Actions Bar (80dp Height) --- */}
        <View style={styles.quickActionsBar}>
          {/* Last Image Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLastImagePress}
            activeOpacity={0.8}
            accessibilityLabel="View Last Image"
            accessibilityHint="Opens the last captured image."
          >
            <Ionicons name="image-outline" size={30} color="#2c3e50" />
            <Text style={styles.actionButtonText}>Last Image</Text>
          </TouchableOpacity>

          {/* Location Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLocationPress}
            activeOpacity={0.8}
             accessibilityLabel="Get Current Location"
             accessibilityHint="Provides your current location details."
          >
            <Ionicons name="location-outline" size={30} color="#2c3e50" />
            <Text style={styles.actionButtonText}>Location</Text>
          </TouchableOpacity>

          {/* Read Text Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReadTextPress}
            activeOpacity={0.8}
            accessibilityLabel="Read Text from Image"
            accessibilityHint="Analyzes the last image or camera feed for text."
          >
            <Ionicons name="document-text-outline" size={30} color="#2c3e50" />
            <Text style={styles.actionButtonText}>Read Text</Text>
          </TouchableOpacity>
        </View>

        {/* --- Voice Assistant Section (180dp Height) --- */}
        {/* Note: Implementing "Hold to Talk" requires react-native-gesture-handler */}
        <TouchableOpacity
          style={styles.voiceAssistantSection}
          onPressIn={handleVoiceAssistantPress} // Use onPressIn/Out or long press for hold
           onPressOut={() => console.log('Hold released')} // Placeholder
           activeOpacity={0.8}
           accessibilityLabel="Hold to Talk with Assistant"
           accessibilityHint="Press and hold to speak to the assistant."
        >
           <View style={styles.voiceAssistantContent}>
               <Ionicons name="mic-outline" size={80} color="#2c3e50" />
               {/* Ensure text is wrapped in <Text> */}
               <Text style={styles.voiceAssistantText}>
                   Hold to Talk with Assistant
               </Text>
           </View>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
      flex: 1,
      backgroundColor: '#f0f4f8', // Background for the screen
  },
  container: {
    flex: 1, // Container takes up remaining space below the header
    backgroundColor: '#f0f4f8', // Match safe area background
    padding: padding, // Apply padding around the main content
    justifyContent: 'space-between', // Distribute space if flex items don't fill
  },
  // Camera Section
  cameraSection: {
    height: screenHeight * 0.40, // 40% of total screen height
    backgroundColor: '#ecf0f1', // Light gray background
    borderRadius: 10,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    marginBottom: padding, // Spacing below this section
     // Optional: Add shadow
     elevation: 3,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 3,
  },
   cameraContent: {
       alignItems: 'center', // Center icon and text within the touchable area
   },
  cameraText: {
    fontSize: 18,
    color: '#34495e', // Darker text color
    textAlign: 'center',
    marginTop: 10, // Space between icon and text
  },
  // Quick Actions Bar
  quickActionsBar: {
    height: 80, // Fixed height
    flexDirection: 'row', // Arrange items horizontally
    justifyContent: 'space-around', // Distribute space evenly
    alignItems: 'center', // Center items vertically
    backgroundColor: '#fff', // White background
    borderRadius: 10,
    marginBottom: padding, // Spacing below this section
     // Optional: Add shadow
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      paddingHorizontal: padding, // Add padding inside the bar
  },
  actionButton: {
    alignItems: 'center', // Center icon and text vertically
    justifyContent: 'center', // Center icon and text horizontally
    // flex: 1, // Optional: make buttons take equal space
    padding: 5, // Padding inside button touchable area
  },
  actionButtonText: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 5, // Space between icon and text
    fontWeight: 'bold', // Make text bold
  },
  // Voice Assistant Section
  voiceAssistantSection: {
    height: 180, // Fixed height
    backgroundColor: '#3498db', // A distinct color (e.g., blue)
    borderRadius: 10,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
     // Optional: Add shadow
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
  },
  voiceAssistantContent: {
      alignItems: 'center', // Center icon and text within the touchable area
  },
  voiceAssistantText: {
    fontSize: 18,
    color: '#fff', // White text color
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default VisualAssistantScreen;