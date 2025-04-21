// screens/VisualAssistantScreen.js - Haptics Commented Out
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'; // For icons
// import HapticFeedback from 'react-native-haptic-feedback'; // COMMENTED OUT

// Get screen height for percentage calculations
const { height: screenHeight } = Dimensions.get('window');
const padding = 16; // Spacing between sections

// Optional: Configure haptic feedback (choose one type) - COMMENTED OUT
// const options = {
//   enableVibrateFallback: true,
//   ignoreAndroidSystemSettings: false,
// };


const VisualAssistantScreen = ({ navigation }) => {

  // Function to trigger haptic feedback - COMMENTED OUT
  const triggerHaptic = () => {
     // HapticFeedback.trigger('impactLight', options);
  };

  // Placeholder functions for button presses - REMOVED HAPTIC CALLS
  const handleCameraPress = () => {
    // triggerHaptic(); // REMOVED CALL
    console.log('Camera area tapped');
    // TODO: Implement camera capture or description logic
  };

  const handleLastImagePress = () => {
    // triggerHaptic(); // REMOVED CALL
    console.log('Last Image button pressed');
    // TODO: Implement view last image logic
  };

  const handleLocationPress = () => {
    // triggerHaptic(); // REMOVED CALL
    console.log('Location button pressed');
    // TODO: Implement get location logic
  };

  const handleReadTextPress = () => {
    // triggerHaptic(); // REMOVED CALL
    console.log('Read Text button pressed');
    // TODO: Implement OCR/read text logic
  };

   const handleVoiceAssistantPress = () => {
       // Haptic feedback for hold is usually different, often managed by gesture handler
        // triggerHaptic(); // REMOVED CALL (or use a different haptic type if needed for pressIn/Out)
       console.log('Voice Assistant button pressed (Hold)');
       // TODO: Implement hold-to-talk logic (requires gesture handler)
   }


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* --- Camera Section (40% Height) --- */}
        <TouchableOpacity
          style={styles.cameraSection}
          onPress={handleCameraPress}
          activeOpacity={0.8}
          // Accessibility
          accessibilityLabel="Tap anywhere to capture or describe surroundings"
          accessibilityHint="Triggers image capture or visual description."
        >
          <View style={styles.cameraContent}>
            <Ionicons name="camera-outline" size={80} color="#2c3e50" />
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
            onPress={handleLastImagePress} // Haptic trigger moved/removed
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
            onPress={handleLocationPress} // Haptic trigger moved/removed
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
            onPress={handleReadTextPress} // Haptic trigger moved/removed
            activeOpacity={0.8}
            accessibilityLabel="Read Text from Image"
            accessibilityHint="Analyzes the last image or camera feed for text."
          >
            <Ionicons name="document-text-outline" size={30} color="#2c3e50" />
            <Text style={styles.actionButtonText}>Read Text</Text>
          </TouchableOpacity>
        </View>

        {/* --- Voice Assistant Section (180dp Height) --- */}
        <TouchableOpacity
          style={styles.voiceAssistantSection}
          onPressIn={handleVoiceAssistantPress} // Haptic trigger moved/removed
           onPressOut={() => console.log('Hold released')}
           activeOpacity={0.8}
           accessibilityLabel="Hold to Talk with Assistant"
           accessibilityHint="Press and hold to speak to the assistant."
        >
           <View style={styles.voiceAssistantContent}>
               <Ionicons name="mic-outline" size={50} color="#2c3e50" />
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
      backgroundColor: '#f0f4f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: padding,
    justifyContent: 'space-between',
  },
  cameraSection: {
    height: screenHeight * 0.55,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: padding,
     elevation: 3,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 3,
  },
   cameraContent: {
       alignItems: 'center',
   },
  cameraText: {
    fontSize: 18,
    color: '#34495e',
    textAlign: 'center',
    marginTop: 10,
  },
  quickActionsBar: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: padding,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      paddingHorizontal: padding,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 5,
    fontWeight: 'bold',
  },
  voiceAssistantSection: {
    height: 120,
    backgroundColor: '#3498db',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
  },
  voiceAssistantContent: {
      alignItems: 'center',
  },
  voiceAssistantText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
   //  marginBottom: 10,
  },
});

export default VisualAssistantScreen;