// screens/DumbAssistantScreen.js - Voice Assistant Layout and Styling
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView, // Use ScrollView in case output gets long
  SafeAreaView,
  Dimensions // To potentially size elements based on screen
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'; // For icons
// Example libraries for voice functionality (install separately):
// import Tts from 'react-native-tts'; // For Text-to-Speech (speaking text aloud)
// import Voice from '@react-native-community/voice'; // For Speech-to-Text (listening to user)

// Note: This component uses the file name "DumbAssistantScreen" as requested.
// In the UI, we will use "Voice Assistant".

const { width } = Dimensions.get('window');
const padding = 20; // General padding

const DumbAssistantScreen = ({ navigation }) => { // Component name as requested
    // State to manage the status message displayed (e.g., "Tap to speak", "Listening...")
    const [assistantStatus, setAssistantStatus] = useState("Tap the microphone to speak.");
    // State to hold the text the assistant might display (e.g., the response text)
    const [outputText, setOutputText] = useState(""); // Text to be potentially read aloud

    // --- Placeholder/Example Voice Functionality ---
    // You would need to install and configure react-native-tts and/or
    // @react-native-community/voice libraries for actual voice features.

    // Example function to make the assistant "speak" text
    const speakText = (text) => {
        setOutputText(text); // Display text that will be spoken
        // TODO: Use Tts.speak(text) here with a TTS library
        console.log("Speaking:", text); // Log for now
    };

    // Example function to handle microphone button press (start listening)
    const handleMicButtonPress = () => {
        console.log('Microphone button pressed');
        setAssistantStatus("Listening..."); // Update status
        setOutputText(""); // Clear previous output text

        // TODO: Use Voice.start() here with a STT library to begin listening
        // For now, simulate a response after a delay
        setTimeout(() => {
            const exampleResponse = "Hello! How can I help you today?";
            setAssistantStatus("Speaking...");
            speakText(exampleResponse); // Call speakText placeholder
             // After speaking finishes (you'd use TTS event listeners for this),
             // reset status: setAssistantStatus("Tap the microphone to speak.");
        }, 1500); // Simulate processing delay
    };

     // Example function to handle predefined action button presses
     const handlePredefinedAction = (action) => {
         console.log(`Predefined action pressed: ${action}`);
         setAssistantStatus(`Processing ${action}...`);
         setOutputText(""); // Clear previous output

         // TODO: Implement logic for predefined actions
         if (action === 'time') {
             const now = new Date();
             const timeString = now.toLocaleTimeString();
             setAssistantStatus("Speaking...");
             speakText(`The current time is ${timeString}.`); // Speak the time
         } else if (action === 'weather') {
              // TODO: Get weather data (requires Location API and Weather API)
               setAssistantStatus("Speaking...");
              speakText("Please tell me your location to get the weather."); // Placeholder response
         } else if (action === 'read_text') {
              // TODO: Implement text reading (e.g., read text from clipboard or a dedicated input field)
               setAssistantStatus("Speaking...");
              speakText("I can read text. Please provide the text you want me to read aloud."); // Placeholder response
         }
         // Add other predefined actions here
     };


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ScrollView allows the output area to scroll if content overflows */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Main container for the screen content */}
        <View style={styles.container}>

          {/* --- Status/Output Area --- */}
           {/* Displays current status and output text */}
          <View style={styles.outputArea}>
             {/* Assistant Status Message */}
             <Text style={styles.assistantStatusText}>{assistantStatus}</Text>
             {/* Spoken Output Text Display (Only shown if outputText is not empty) */}
             {outputText ? (
                 <Text style={styles.outputText}>{outputText}</Text>
             ) : null}
             {/* TODO: Add visual indicators for listening/speaking (e.g., animated icon) */}
          </View>

          {/* --- Voice Input Button --- */}
           {/* A large, prominent button to initiate voice interaction */}
          <View style={styles.micButtonContainer}>
              <TouchableOpacity
                style={styles.micButton}
                onPress={handleMicButtonPress} // Call the handler on press
                activeOpacity={0.8} // Visual feedback on press
                 // Accessibility for screen readers
                 accessibilityLabel="Tap to Speak with Voice Assistant"
                 accessibilityHint="Activates the microphone for voice input."
              >
                  {/* Very Large Microphone Icon */}
                  <Ionicons name="mic-circle-outline" size={120} color="#fff" />
                  {/* Text label below the icon */}
                  <Text style={styles.micButtonText}>Tap to Speak</Text>
              </TouchableOpacity>
          </View>

          {/* --- Predefined Actions Section --- */}
           {/* A section with buttons for common, quick actions */}
           <View style={styles.actionsContainer}>
               {/* Title for the quick actions section */}
               <Text style={styles.actionsTitle}>Quick Actions:</Text>
               {/* Row container for action buttons to be side-by-side */}
               <View style={styles.actionButtonsRow}>
                   {/* Tell Time Button */}
                   <TouchableOpacity
                       style={styles.actionButton}
                       onPress={() => handlePredefinedAction('time')} // Call handler with action type
                       activeOpacity={0.8}
                       accessibilityLabel="Tell Current Time"
                       accessibilityHint="Asks the assistant to tell the current time."
                   >
                       <Ionicons name="time-outline" size={30} color="#2c3e50" />
                       <Text style={styles.actionButtonText}>Time</Text>
                   </TouchableOpacity>

                   {/* Tell Weather Button */}
                   <TouchableOpacity
                       style={styles.actionButton}
                       onPress={() => handlePredefinedAction('weather')} // Call handler with action type
                       activeOpacity={0.8}
                       accessibilityLabel="Get Weather Information"
                       accessibilityHint="Asks the assistant for the current weather."
                   >
                       <Ionicons name="cloud-outline" size={30} color="#2c3e50" />
                       <Text style={styles.actionButtonText}>Weather</Text>
                   </TouchableOpacity>

                    {/* Read Text Aloud Button */}
                   <TouchableOpacity
                       style={styles.actionButton}
                        onPress={() => handlePredefinedAction('read_text')} // Call handler with action type
                       activeOpacity={0.8}
                       accessibilityLabel="Read Text Aloud"
                       accessibilityHint="Asks the assistant to read text aloud."
                   >
                       <Ionicons name="document-text-outline" size={30} color="#2c3e50" />
                       <Text style={styles.actionButtonText}>Read Text</Text>
                   </TouchableOpacity>
               </View>
           </View>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Light background for the safe area
  },
  scrollContainer: {
    flexGrow: 1, // Allows content to grow vertically if needed
    // paddingBottom: padding, // Add bottom padding if content might touch the bottom edge
  },
  container: {
    flex: 1, // Ensures the container takes up available space below the header
    backgroundColor: '#f0f4f8', // Match safe area background
    padding: padding, // Apply general padding around content
    alignItems: 'center', // Center main items horizontally (output area, mic button, actions)
  },
  // Status/Output Area Styling
  outputArea: {
     width: '100%', // Make the output area take full width
     flex: 1, // Allow it to take up flexible vertical space
     backgroundColor: '#fff', // White background for the display area
     borderRadius: 10, // Rounded corners
     padding: padding, // Inner padding
     marginBottom: padding, // Space below this section
     // Add subtle shadow for depth
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
  },
  assistantStatusText: {
      fontSize: 20, // Larger font size
      fontWeight: 'bold',
      color: '#34495e', // Darker text color for status
      marginBottom: 10, // Space below status
  },
   outputText: {
       fontSize: 18, // Font size for the output text
       color: '#555', // Muted color for output text
       lineHeight: 26, // Improved readability with line height
   },
  // Voice Input Button Styling
  micButtonContainer: {
      // This container helps in centering the circular button
      marginBottom: padding, // Space below the mic button section
  },
  micButton: {
    width: 160, // Fixed width for a large touchable area
    height: 160, // Fixed height to make it circular
    borderRadius: 80, // Half of width/height to make it circular
    backgroundColor: '#2ecc71', // Bright green color for the microphone button
    justifyContent: 'center', // Center icon and text vertically
    alignItems: 'center', // Center icon and text horizontally
     // Prominent shadow for a main action button
     elevation: 6,
     shadowColor: '#2ecc71', // Shadow color matching the button
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.4,
     shadowRadius: 6,
     borderWidth: 5, // Add a border
     borderColor: '#27ae60', // Darker green border
  },
  micButtonText: {
      color: '#fff', // White text
      fontSize: 18, // Larger font size for the label
      fontWeight: 'bold',
      marginTop: 5, // Space between the icon and the text label
  },
   // Predefined Actions Section Styling
   actionsContainer: {
       width: '100%', // Take full width
       backgroundColor: '#fff', // White background for the actions box
       borderRadius: 10, // Rounded corners
       padding: padding, // Inner padding
       marginBottom: padding, // Space below this section
        // Add subtle shadow
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
   },
    actionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34495e', // Darker text color for title
        marginBottom: 15, // Space below title
        textAlign: 'center', // Center the title
    },
   actionButtonsRow: {
       flexDirection: 'row', // Arrange buttons horizontally in a row
       justifyContent: 'space-around', // Distribute space evenly between buttons
       alignItems: 'center', // Align buttons vertically in the row
   },
    actionButton: {
        alignItems: 'center', // Center icon and text vertically within the button
        justifyContent: 'center', // Center icon and text horizontally within the button
         padding: 5, // Inner padding for the touchable area
    },
    actionButtonText: {
        fontSize: 14,
        color: '#34495e', // Darker text color for button labels
        marginTop: 5, // Space between icon and text
        fontWeight: 'bold',
        textAlign: 'center', // Center the text label
    },
});

export default DumbAssistantScreen; // Component name as requested