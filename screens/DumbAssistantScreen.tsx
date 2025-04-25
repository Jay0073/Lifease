// screens/DumbAssistantScreen.js - Voice Assistant (Text Input, AI Response, TTS Output)
// This code integrates the Google Generative AI to process text input,
// gets a text response, and prepares it for speech output.
// It also updates the UI to show a basic conversation history (chat interface).

import React, { useState, useEffect } from 'react'; // Added useEffect for auto-scrolling
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions, // Still useful for layout if needed
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, // Add ActivityIndicator for loading state
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'; // For icons

// Import the Google Generative AI library
// You need to install this library: npm install @google/generative-ai
// Note: This is primarily designed for Node.js/web, might require extra setup for React Native modules.
// A better approach for production might be a backend proxy or a React Native specific AI SDK if available.
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- !!! CRITICAL SECURITY WARNING !!! ---
// Hardcoding API keys directly in your app code is INSECURE and exposes your key.
// Anyone can view your app's source code and steal your API key, potentially incurring costs on your account.
// Replace "YOUR_API_KEY" with your actual API key.
// For production apps, store your API key SECURELY (e.g., environment variables, backend server, cloud functions).
// NEVER commit your API key directly to version control (like Git).
const API_KEY = "AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw"; // <<< REPLACE WITH YOUR REAL API KEY AND SECURE IT PROPERLY

// Initialize the Generative AI model
// Use a model name like 'gemini-pro' or another suitable model
// Ensure the model name you use is suitable for your needs and available.
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Use a specific model


// Example library for Text-to-Speech (install separately):
// import Tts from 'react-native-tts'; // You would use this library for actual speech output

const padding = 16; // General padding used for consistent spacing


// Define types for messages to structure the conversation history
type Message = {
    text: string;
    sender: 'user' | 'ai'; // 'user' for user input, 'ai' for AI response
    timestamp: Date; // Optional: Add timestamp for each message
};

const DumbAssistantScreen = ({ navigation }) => {
    // State for the list of messages in the conversation history
    const [messages, setMessages] = useState<Message[]>([]); // Initialize as an empty array
    // State for the text currently being typed by the user in the input field
    const [inputText, setInputText] = useState('');
    // State to manage the status message displayed (e.g., "Ready.", "AI thinking...", "Speaking...")
    const [assistantStatus, setAssistantStatus] = useState("Ready.");
     // State to manage the loading state (true when waiting for AI response)
    const [isLoading, setIsLoading] = useState(false);

     // Optional: Scroll to the bottom of the conversation when new messages are added
     // Create a ref for the ScrollView to control scrolling
     const scrollViewRef = React.useRef<ScrollView>(null);

     // Effect that runs whenever the messages state changes
     useEffect(() => {
         // Use a timeout to allow the layout to update after a new message is added
         const timer = setTimeout(() => {
             // Scroll to the end of the ScrollView with a smooth animation
             scrollViewRef.current?.scrollToEnd({ animated: true });
         }, 100); // Small delay to ensure scrolling happens after rendering

         // Cleanup function to clear the timer if the component unmounts or effect re-runs
         return () => clearTimeout(timer);
     }, [messages]); // This effect depends on the 'messages' state array


    // --- Text-to-Speech (TTS) Functionality Placeholder ---
    // This function is responsible for making the device speak the given text.
    // You MUST integrate a Text-to-Speech library (like 'react-native-tts') here for it to work.
    const speakText = (text: string) => {
        // Check if there is text to speak and it's not just whitespace
        if (!text || !text.trim()) {
             setAssistantStatus("Nothing to speak aloud.");
            return; // Exit if no valid text
        }
        setAssistantStatus("Speaking..."); // Update status while speaking

        // TODO: Integrate your chosen TTS library here (e.g., react-native-tts)
        // Example using react-native-tts (you would need to handle Tts initialization elsewhere):
        // Tts.speak(text, {
        //     iosVoiceId: 'com.apple.ttsbundle.Samantha-compact', // Example iOS voice (replace or remove)
        //     rate: 0.5, // Example speaking rate (adjust as needed)
        // });

        console.log("TTS (placeholder):", text); // Log the text to the console for debugging

        // Simulate speaking duration and reset the status.
        // In a real implementation, you would use Tts event listeners (like 'tts-finish')
        // to know exactly when speaking is finished and then reset the status.
        const speechDuration = text.length * 40; // Rough estimate of speaking time (adjust based on rate/voice)
         setTimeout(() => {
             // Reset status after the simulated duration.
             // Check isLoading in case the AI is already thinking about the next turn from a previous prompt.
             setAssistantStatus(isLoading ? "AI thinking..." : "Ready.");
         }, speechDuration > 800 ? speechDuration : 800); // Ensure a minimum feedback duration to avoid status flickering
    };

    // Function to send the user's text input to the AI model and handle the response
    const askAI = async (text: string) => {
        // Don't send messages that are empty or only contain whitespace
        if (!text.trim()) return;

        setIsLoading(true); // Set the loading state to true at the start of the AI call
        setAssistantStatus("Sending to AI..."); // Update status message

        // Create a message object for the user's input
        const newUserMessage: Message = { text: text.trim(), sender: 'user', timestamp: new Date() };
        // Use the functional update form of setMessages to add the new message to the existing array
        setMessages(prevMessages => [...prevMessages, newUserMessage]);

        // Clear the input field immediately after the user sends the message
        setInputText('');
        setAssistantStatus("AI thinking..."); // Update status message while waiting for AI

        try {
             // --- Call the Google Generative AI Model ---
             console.log("Asking AI:", text); // Log the user's prompt to the console
             // Call the model's generateContent method with the user's text
             const result = await model.generateContent(text);
             // Extract the text content from the AI's response
             const aiResponse = result.response.text();

             console.log("AI responded:", aiResponse); // Log the AI's response to console

             // Create a message object for the AI's response
             const newAiMessage: Message = { text: aiResponse, sender: 'ai', timestamp: new Date() };
             // Use the functional update form to add the AI's message to the array
             setMessages(prevMessages => [...prevMessages, newAiMessage]);

             // Speak the AI's response aloud using the speakText function
             speakText(aiResponse);

        } catch (error) {
             // Handle any errors that occur during the AI API call (e.g., network issues, API errors)
             console.error("Error calling AI:", error);
             // Define a user-friendly error message to display and speak
             const errorMessage = "Sorry, I encountered an error while getting a response. Please check your API key or network connection and try again.";
             // Add the error message as an AI message to the conversation history
             const errorMessageObj: Message = { text: errorMessage, sender: 'ai', timestamp: new Date() };
             setMessages(prevMessages => [...prevMessages, errorMessageObj]);
             // Speak the error message aloud
             speakText(errorMessage);
             setAssistantStatus("Error."); // Update status to indicate an error occurred

        } finally {
            // This block runs after either the try or catch block completes
            setIsLoading(false); // Reset the loading state to false
             // Reset status if not currently speaking or in an error state.
             // The speakText function or its TTS event listeners will handle resetting to "Ready." after speaking finishes.
             if (assistantStatus !== "Speaking." && assistantStatus !== "Error.") {
                  setAssistantStatus("Ready."); // Reset status to Ready
             }
        }
    };


    // Handler for the "Send" button press in the input area
    const handleSendButtonPress = () => {
        askAI(inputText); // Call the askAI function with the current text from the input field
    };

     // Handler for predefined action button presses (Quick Actions)
     // These buttons now trigger the AI with specific predefined prompts.
     const handleQuickAction = (action: string) => {
         console.log(`Quick action pressed: ${action}`);
         let prompt = ""; // Variable to hold the AI prompt for the action

         // Determine the AI prompt based on the action type
         if (action === 'time') {
             prompt = "Tell me the current time."; // AI prompt for Time
         } else if (action === 'weather') {
              // AI prompt for Weather - Note: AI might not know the user's location directly.
              // You might need to integrate a Geolocation API and pass the location to the AI or handle it separately.
               prompt = "What is the weather like in my current location? (Assume a generic location if mine is unknown)";
         } else if (action === 'read_text') {
             // Repurposing this action to ask the AI about its text reading capability
             prompt = "Explain how you can read text aloud for me."; // AI prompt about reading text
         }
         // Add other quick actions and their corresponding AI prompts here...
         // Example: if (action === 'define') { prompt = "Define the term [User enters term]"; }

         // If a prompt was defined for the action, send it to the AI
         if (prompt) {
              askAI(prompt); // Call the askAI function with the predefined prompt
         } else {
              console.warn(`No AI prompt defined for action: ${action}`);
              // Optionally, provide feedback to the user via speakText or status
              // speakText("I'm not sure how to handle that quick action yet.");
         }
     };


  return (
     // KeyboardAvoidingView helps prevent the TextInput from being covered by the on-screen keyboard
    <KeyboardAvoidingView
        style={styles.safeArea} // Apply styles to the KeyboardAvoidingView itself
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on platform (iOS needs padding, Android can often use height)
        // Adjust the offset based on your header height and any other fixed elements above the input area
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70} // Example offset (Header height + buffer) - Adjust as needed
    >
      {/* SafeAreaView ensures content is not hidden by notches or status bars */}
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
        {/* ScrollView allows the main content areas to be scrollable */}
        {/* contentContainerStyle ensures padding and allows content to dictate scroll height */}
        <ScrollView contentContainerStyle={styles.scrollContainer} ref={scrollViewRef}> {/* Attach the ref here */}
          {/* Main container for the screen content - Provides horizontal padding */}
          <View style={styles.container}>

             {/* --- Status Message Area --- */}
             {/* This area displays the current status of the assistant */}
            <View style={styles.statusContainer}>
                 {/* Status text and optional loading indicator */}
                 <Text style={styles.assistantStatusText} accessibilityLiveRegion="polite">{assistantStatus}</Text> {/* Use accessibilityLiveRegion="polite" for screen readers to announce status changes */}
                 {isLoading && <ActivityIndicator size="small" color="#3498db" style={{ marginLeft: 10 }} />} {/* Show loading indicator when AI is thinking */}
            </View>

            {/* --- Conversation History / Output Area --- */}
             {/* This area displays the list of messages (user input and AI responses) */}
            <View style={styles.conversationHistory}>
                 {/* Check if there are any messages to display */}
                 {messages.length === 0 ? (
                     // Display an initial message when the conversation is empty
                     <Text style={styles.initialMessage}>Start the conversation by typing a message below or using a Quick Action!</Text>
                 ) : (
                     // Map through the messages array and render a bubble for each message
                     messages.map((message, index) => (
                         <View
                            key={index} // Use index as key (OK if messages aren't reordered/deleted)
                            style={[ // Apply general bubble style and sender-specific style
                             styles.messageBubble,
                             message.sender === 'user' ? styles.userMessageBubble : styles.aiMessageBubble
                            ]}
                            accessibilityLabel={`${message.sender} says: ${message.text}`} // Accessibility label for screen readers to read the message
                         >
                             {/* Display the text content of the message */}
                             <Text style={styles.messageText} accessibilityRole="text">{message.text}</Text>
                              {/* Optional: Display timestamp or sender name */}
                             {/* <Text style={styles.timestamp}>
                                {message.sender === 'user' ? 'You' : 'AI'} - {message.timestamp.toLocaleTimeString()}
                             </Text> */}
                         </View>
                     ))
                 )}
                 {/* The useEffect hook attached to scrollViewRef will handle scrolling */}
            </View>


            {/* --- Quick Actions Section --- */}
             {/* This View groups the predefined action buttons */}
             <View style={styles.actionsContainer}>
                 {/* Title for the quick actions section */}
                 {/* <Text style={styles.actionsTitle} accessibilityRole="heading" accessibilityLevel={2}>Quick Actions:</Text> Use heading role and level for accessibility structure */}
                 {/* Row container to arrange action buttons side-by-side */}
                 <View style={styles.actionButtonsRow}>
                     {/* Tell Time Button - Triggers AI with a 'time' prompt */}
                     <TouchableOpacity
                         style={styles.actionButton} // Apply styles to the touchable area
                         onPress={() => handleQuickAction('time')} // Call handler with action type
                         activeOpacity={0.8} // Visual feedback
                         // Accessibility props
                         accessibilityLabel="Quick action: Tell Current Time"
                         accessibilityHint="Sends a request to the assistant to tell the current time."
                         accessible={true}
                         accessibilityRole="button"
                     >
                          {/* Icon and Text within the button */}
                         <Ionicons name="time-outline" size={30} color="#2c3e50" /> {/* Time icon */}
                         <Text style={styles.actionButtonText}>Time</Text> {/* Button text */}
                     </TouchableOpacity>

                     {/* Tell Weather Button - Triggers AI with a 'weather' prompt */}
                     <TouchableOpacity
                         style={styles.actionButton} // Apply styles
                         onPress={() => handleQuickAction('weather')} // Call handler
                         activeOpacity={0.8} // Visual feedback
                         // Accessibility props
                         accessibilityLabel="Quick action: Get Weather Information"
                         accessibilityHint="Sends a request to the assistant for the current weather."
                         accessible={true}
                         accessibilityRole="button"
                     >
                          {/* Icon and Text */}
                         <Ionicons name="cloud-outline" size={30} color="#2c3e50" /> {/* Weather icon */}
                         <Text style={styles.actionButtonText}>Weather</Text> {/* Button text */}
                     </TouchableOpacity>

                      {/* About Reading Button - Triggers AI with a 'read_text' prompt */}
                     <TouchableOpacity
                         style={styles.actionButton} // Apply styles
                          onPress={() => handleQuickAction('read_text')} // Call handler
                         activeOpacity={0.8} // Visual feedback
                         // Accessibility props
                         accessibilityLabel="Quick action: Explain text reading capability"
                         accessibilityHint="Sends a request asking the assistant to explain how it can read text aloud."
                         accessible={true}
                         accessibilityRole="button"
                     >
                          {/* Icon and Text */}
                         <Ionicons name="document-text-outline" size={30} color="#2c3e50" /> {/* Document/Read icon */}
                         <Text style={styles.actionButtonText}>About Reading</Text> {/* Updated button text */}
                     </TouchableOpacity>
                     {/* TODO: Add more Quick Action Buttons */}
                 </View>
             </View>


            {/* --- Input Area (Text Input & Send Button) --- */}
             {/* This container holds the TextInput field and the Send button */}
             {/* Placed below Quick Actions in the scrollable content */}
            <View style={styles.inputAreaContainer}>
                 {/* Text Input Field */}
                 <TextInput
                    style={styles.inputAreaTextInput} // Style for the text input itself
                    placeholder="Type your message here..." // Placeholder text
                    placeholderTextColor="#7f8c8d" // Muted color for placeholder
                    value={inputText} // Bind input value to the inputText state
                    onChangeText={setInputText} // Update inputText state when text changes
                    multiline={true} // Allow multi-line input
                    keyboardAppearance="default" // Keyboard style
                    returnKeyType="send" // Change return key to 'send'
                    // onSubmitEditing={handleSendButtonPress} // Optional: Send when return key is pressed
                     blurOnSubmit={false} // Keep keyboard open after submitting via return key
                     // Accessibility props for the input field
                     accessibilityLabel="Message input field"
                     accessibilityHint="Type the message you want to send to the assistant."
                     accessibilityRole="none" // Updated accessibility role to a valid value
                />
                {/* Send Button */}
                <TouchableOpacity
                     style={styles.sendButton} // Style for the send button touchable area
                     onPress={handleSendButtonPress} // Call the send handler when pressed
                     activeOpacity={0.8} // Visual feedback
                     // Disable the button if input is empty/whitespace or if AI is currently loading
                     disabled={!inputText.trim() || isLoading}
                     // Accessibility props for the send button
                     accessibilityLabel="Send message"
                     accessibilityHint="Sends your typed message to the assistant."
                     accessible={true}
                     accessibilityRole="button"
                >
                    {/* Send icon - Changes to loading indicator style icon when loading */}
                    <Ionicons
                         name={isLoading ? "ellipsis-horizontal-circle-outline" : "send-outline"}
                         size={28} // Icon size
                         color={!inputText.trim() || isLoading ? "#bdc3c7" : "#3498db"} // Color changes based on disabled/loading state
                    />
                </TouchableOpacity>
            </View>


          </View>
        </ScrollView>
      </SafeAreaView>
     </KeyboardAvoidingView>
  );
};

// Stylesheet for the Voice Assistant Screen
const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensures SafeAreaView takes up the full screen
    backgroundColor: '#f0f4f8', // Light background color for consistency
  },
  scrollContainer: {
    flexGrow: 1, // Allows the content within the ScrollView to dictate its height and enable scrolling if content is taller than the screen
    paddingBottom: 20, // Add padding at the very bottom of the scrollable content
    justifyContent: 'flex-end', // Align content to the bottom (like a chat)
  },
  container: {
    flexGrow: 1, // Allows the container to grow and push content up (important with justifyContent: 'flex-end' on scrollContainer)
    backgroundColor: '#f0f4f8', // Match the safe area background
    paddingHorizontal: padding, // Apply horizontal padding to the content
    paddingTop: padding, // Apply padding at the top of the content
    // Removed alignItems: 'center' from here
  },
   // Status message container (above conversation history)
  statusContainer: {
      flexDirection: 'row', // Arrange status text and loading indicator horizontally
      alignItems: 'center', // Vertically align
      marginBottom: padding, // Space below status
      justifyContent: 'center', // Center status horizontally
  },
  assistantStatusText: {
      fontSize: 18, // Slightly smaller than previous status size
      fontWeight: 'bold',
      color: '#555', // Muted color
  },
   initialMessage: {
       fontSize: 18,
       color: '#7f8c8d',
       textAlign: 'center',
       marginTop: 20, // Space from the top if no messages
   },
   // Conversation History Area Styles (Replaced outputArea)
   conversationHistory: {
       flex: 1, // Allows the conversation history to take up available vertical space
       // backgroundColor: '#fff', // Background is on bubbles
       // borderRadius: 10, // Handled by bubbles
       // padding: padding, // Padding is on bubbles
       marginBottom: padding, // Space below the conversation history
       justifyContent: 'flex-end', // Align messages to the bottom within this container
   },
    // Message Bubble Styles
    messageBubble: {
        padding: 12, // Increased padding inside bubbles
        borderRadius: 18, // More rounded bubbles
        marginBottom: 8, // Space between bubbles
        maxWidth: '85%', // Slightly wider max width for bubbles
        // minHeight: 40, // Ensure minimum height for accessibility
        justifyContent: 'center', // Center text vertically in bubble
    },
    userMessageBubble: {
        alignSelf: 'flex-end', // Align user messages to the right
        backgroundColor: '#007bff', // Example: Blue bubble for user
        color: '#fff', // White text for user bubble
        borderBottomRightRadius: 4, // Make bottom corner less rounded
    },
    aiMessageBubble: {
        alignSelf: 'flex-start', // Align AI messages to the left
        backgroundColor: '#e9e9eb', // Example: Light gray bubble for AI
        color: '#000', // Black text for AI bubble
        borderWidth: 1, // Subtle border
        borderColor: '#cfd8dc',
        borderBottomLeftRadius: 4, // Make bottom corner less rounded
    },
    messageText: {
        fontSize: 16, // Standard font size for message text
        // color is set by the bubble style
    },
     timestamp: { // Optional timestamp style
         fontSize: 10,
         color: '#999',
         marginTop: 5,
         textAlign: 'right', // Align timestamp within bubble
     },

   // Quick Actions Section Styles (Kept similar)
   actionsContainer: {
       width: '100%',
       backgroundColor: '#fff',
       borderRadius: 10,
       padding: padding,
       marginBottom: padding, // Space below quick actions
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
   },
    actionsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34495e',
        marginBottom: 15,
        textAlign: 'center',
    },
   actionButtonsRow: {
       flexDirection: 'row',
       justifyContent: 'space-around', // Or 'space-evenly'
       alignItems: 'center',
   },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
         paddingVertical: 10, // Increased vertical padding
         paddingHorizontal: 15, // Increased horizontal padding
         minHeight: 48, // Ensured minimum touch target
         flex: 1, // Allow buttons to take equal space
         marginHorizontal: 4, // Add horizontal margin between buttons (slightly less)
         backgroundColor: '#ecf0f1', // Subtle background
         borderRadius: 8,
         elevation: 1,
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 1 },
         shadowOpacity: 0.05,
         shadowRadius: 1,
    },
    actionButtonText: {
        fontSize: 13, // Slightly smaller font size for more compact buttons
        color: '#34495e',
        marginTop: 4, // Space between icon and text
        fontWeight: 'bold',
        textAlign: 'center',
    },

    // Input Area Container (Combines TextInput and Send Button)
    // This container sits at the bottom of the scrollable area
    inputAreaContainer: {
        flexDirection: 'row', // Arrange text input and button horizontally
        alignItems: 'flex-end', // Align items to the bottom (useful for multi-line input)
        backgroundColor: '#fff', // White background for the input bar
        borderRadius: 25, // Pill shape container
        paddingHorizontal: 15,
        paddingVertical: 10, // Add some vertical padding to the container
        // marginBottom: padding, // Removed bottom margin here if it's the last element
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
         // No fixed positioning here, it's part of the scrollable content
    },
    inputAreaTextInput: {
        flex: 1, // Allow text input to take up most of the space
        fontSize: 16,
        color: '#2c3e50',
        maxHeight: 100, // Max height before becoming fully scrollable (adjust as needed)
        paddingTop: 0, // Adjust internal padding
        paddingBottom: 0, // Adjust internal padding
        paddingHorizontal: 0, // No horizontal padding inside the text input itself
        textAlignVertical: 'center', // Center text vertically initially for single line, bottom for multiline
    },
    sendButton: {
        marginLeft: 10, // Space between text input and button
        paddingVertical: 8, // Increased vertical padding for touch area
        paddingHorizontal: 8, // Increased horizontal padding for touch area
        // No background or border here, just the icon is visible
         minHeight: 44, // Minimum touch target size
         justifyContent: 'center', // Center icon
         alignItems: 'center', // Center icon
    },
});

export default DumbAssistantScreen;