// screens/DumbAssistantScreen.js - Voice Assistant (Text Input, TTS Output)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TextInput, // Import TextInput
  KeyboardAvoidingView, // To handle keyboard
  Platform, // To handle keyboard
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'; // For icons
// Example library for Text-to-Speech (install separately):
// import Tts from 'react-native-tts';

// Note: This component uses the file name "DumbAssistantScreen" as requested.
// In the UI, we will use "Voice Assistant".

const { width } = Dimensions.get('window');
const padding = 20; // General padding

const DumbAssistantScreen = ({ navigation }) => { // Component name as requested
    // State to manage the status message displayed (e.g., "Ready...", "Speaking...")
    const [assistantStatus, setAssistantStatus] = useState("Ready to speak.");
    // State to hold the text the assistant might display (e.g., the response text)
    const [outputText, setOutputText] = useState(""); // Text that is being spoken or was last spoken
     // State to hold the text entered by the user
    const [textToSpeak, setTextToSpeak] = useState('');


    // --- Placeholder/Example Text-to-Speech (TTS) Functionality ---
    // You would need to install and configure react-native-tts for actual speech output.

    // Function to make the assistant "speak" text
    const speakText = (text) => {
        if (!text.trim()) {
            setAssistantStatus("Nothing to speak.");
            setOutputText("");
            return;
        }
        setOutputText(text); // Display text that will be spoken
        setAssistantStatus("Speaking...");
        // TODO: Use Tts.speak(text) here with a TTS library
        console.log("Speaking:", text); // Log for now

        // Simulate speaking duration and then reset status
        const speechDuration = text.length * 50; // Estimate duration based on text length
        setTimeout(() => {
            setAssistantStatus("Ready to speak.");
        }, speechDuration > 1000 ? speechDuration : 1000); // Minimum 1 sec duration
    };

    // Handler for the "Speak" button
    const handleSpeakButtonPress = () => {
        speakText(textToSpeak); // Speak the text from the input field
        // Optionally clear the input field after speaking:
        // setTextToSpeak('');
    };

     // Example function to handle predefined action button presses
     const handlePredefinedAction = (action) => {
         console.log(`Predefined action pressed: ${action}`);
         setAssistantStatus(`Getting ${action}...`);
         setOutputText(""); // Clear previous output

         // TODO: Implement logic for predefined actions and call speakText
         if (action === 'time') {
             const now = new Date();
             const timeString = now.toLocaleTimeString();
             setAssistantStatus("Speaking Time...");
             speakText(`The current time is ${timeString}.`); // Speak the time
         } else if (action === 'weather') {
              // TODO: Get weather data (requires Location API and Weather API)
               setAssistantStatus("Speaking Weather...");
              speakText("Please tell me your location to get the weather."); // Placeholder response
         } else if (action === 'read_text') {
              // In this mode (Text Input -> TTS), this action could mean:
              // 1. Read the content of the text input area.
              // 2. Read text from clipboard.
              // Let's assume it reads the current text input for now.
              setAssistantStatus("Reading Input Text...");
              speakText(textToSpeak.trim() ? textToSpeak : "There is no text in the input field to read."); // Speak input text
         }
         // Add other predefined actions here
     };


  return (
    <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70} // Adjust offset
    >
        {/* KeyboardAvoidingView to prevent input from being covered */}
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
        {/* ScrollView allows the main content areas to scroll */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Main container for the screen content */}
          <View style={styles.container}>

            {/* --- Status/Output Area --- */}
             {/* Displays current status and text being/has been spoken */}
            <View style={styles.outputArea}>
               {/* Assistant Status Message */}
               <Text style={styles.assistantStatusText}>{assistantStatus}</Text>
               {/* Spoken Output Text Display (Only shown if outputText is not empty) */}
               {outputText ? (
                   <Text style={styles.outputText}>{outputText}</Text>
               ) : null}
               {/* TODO: Add visual indicators for speaking */}
            </View>

            {/* --- Text Input Area --- */}
             {/* Area where the user types text */}
            <View style={styles.textInputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Type text for the assistant to speak..."
                    placeholderTextColor="#7f8c8d"
                    value={textToSpeak} // Bind to state
                    onChangeText={setTextToSpeak} // Update state on change
                    multiline={true} // Allow multiple lines
                    keyboardAppearance="default"
                    returnKeyType="default" // Default return key
                    blurOnSubmit={false}
                     accessibilityLabel="Text to speak input"
                     accessibilityHint="Enter the text you want the assistant to read aloud."
                />
            </View>

             {/* --- Speak Button --- */}
              {/* Button to trigger Text-to-Speech */}
             <View style={styles.speakButtonContainer}>
                <TouchableOpacity
                  style={styles.speakButton}
                  onPress={handleSpeakButtonPress} // Call handler on press
                  activeOpacity={0.8}
                   disabled={!textToSpeak.trim()} // Disable if input is empty
                   accessibilityLabel="Speak typed text"
                   accessibilityHint="Makes the assistant read the entered text aloud."
                >
                    <Ionicons name="volume-high-outline" size={30} color="#fff" style={{ marginRight: 5 }}/> {/* Speak icon */}
                    <Text style={styles.speakButtonText}>Speak Text</Text>
                </TouchableOpacity>
             </View>


            {/* --- Predefined Actions Section --- */}
             {/* Buttons for common, quick actions (still relevant, will use speakText) */}
             <View style={styles.actionsContainer}>
                 {/* Title for the quick actions section */}
                 <Text style={styles.actionsTitle}>Quick Actions:</Text>
                 {/* Row container for action buttons */}
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

                      {/* Read Input Text Button (repurposed) */}
                     <TouchableOpacity
                         style={styles.actionButton}
                          onPress={() => handlePredefinedAction('read_text')} // Call handler with action type
                         activeOpacity={0.8}
                         accessibilityLabel="Read Input Text Aloud"
                         accessibilityHint="Reads the text in the input field aloud."
                     >
                         <Ionicons name="document-text-outline" size={30} color="#2c3e50" />
                         <Text style={styles.actionButtonText}>Read Input</Text> {/* Updated text */}
                     </TouchableOpacity>
                 </View>
             </View>


          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Light background
  },
  scrollContainer: {
    flexGrow: 1, // Allows content to grow vertically
    // paddingBottom: padding, // Add bottom padding if needed
  },
  container: {
    flex: 1, // Ensures the container takes up available space below the header
    backgroundColor: '#f0f4f8', // Match safe area background
    padding: padding, // Apply general padding around content
    // alignItems: 'center', // Removed center alignment from main container
  },
  // Status/Output Area Styling
  outputArea: {
     width: '100%', // Take full width
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
  // Text Input Area Styling
  textInputContainer: {
      width: '100%', // Take full width
      marginBottom: 15, // Space below input
      backgroundColor: '#fff', // White background for input area
      borderRadius: 10,
       elevation: 2,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 1 },
       shadowOpacity: 0.08,
       shadowRadius: 2,
       paddingHorizontal: 15, // Padding inside container
       paddingVertical: 10,
  },
  textInput: {
      fontSize: 16,
      color: '#2c3e50',
      minHeight: 80, // Make text input area larger for typing
      textAlignVertical: 'top', // Align text to the top on Android
       padding: 0, // Remove default text input padding
  },
  // Speak Button Styling
  speakButtonContainer: {
      width: '100%', // Button container takes full width
      alignItems: 'center', // Center the button horizontally
      marginBottom: padding, // Space below the button
  },
  speakButton: {
      flexDirection: 'row', // Arrange icon and text horizontally
      alignItems: 'center', // Vertically align icon and text
      backgroundColor: '#3498db', // Blue button color
      borderRadius: 25, // Pill shape
      paddingVertical: 12,
      paddingHorizontal: 30,
       elevation: 4,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.2,
       shadowRadius: 4,
  },
  speakButtonText: {
      color: '#fff', // White text
      fontSize: 18,
      fontWeight: 'bold',
  },
   // Predefined Actions Section Styling (Kept similar, adjusted spacing)
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

export default DumbAssistantScreen; // Keep component name as requested