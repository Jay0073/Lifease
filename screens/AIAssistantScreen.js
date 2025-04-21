// screens/AIAssistantScreen.js - With Feature Dropdown
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  // Removed UIManager, findNodeHandle as not strictly needed for basic scrollToEnd
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker'; // Import Picker

// Placeholder for conversation messages
const initialMessages = [
    { id: 1, text: "Hello there! I'm your AI Assistant. I'm here to help with information, creativity, and tasks.", sender: 'ai' },
    { id: 2, text: "Select a feature from the dropdown below or type your question to get started.", sender: 'ai' }, // Updated greeting
];

// Define the list of AI features
const aiFeatures = [
    { label: 'Select a Feature', value: null }, // Default option
    { label: 'Generate Text', value: 'generate_text' },
    { label: 'Analyze Image', value: 'analyze_image' },
    { label: 'Code Help', value: 'code_help' },
    { label: 'Translate', value: 'translate' },
    { label: 'Summarize', value: 'summarize' },
    // Add more features here
];


const AIAssistantScreen = ({ navigation }) => {
    const [messages, setMessages] = useState(initialMessages);
    const [inputText, setInputText] = useState('');
    const [selectedFeature, setSelectedFeature] = useState(aiFeatures[0].value); // State for selected feature
    const scrollViewRef = useRef(null);

    const scrollToBottom = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    };

    const handleSend = () => {
        if (inputText.trim()) {
            const newUserMessage = { id: messages.length + 1, text: inputText.trim(), sender: 'user' };
            setMessages(prevMessages => [...prevMessages, newUserMessage]);
            setInputText('');
             setTimeout(scrollToBottom, 50);

            // TODO: Integrate with AI API here - send inputText
            // Once you get the AI response:
            // const aiResponse = { id: messages.length + 2, text: "This is a placeholder AI response.", sender: 'ai' };
            // setMessages(prevMessages => [...prevMessages, aiResponse]);
            // setTimeout(scrollToBottom, 50);
        }
    };

     const handleFeatureSelect = (itemValue) => {
         setSelectedFeature(itemValue);
         console.log(`Feature selected: ${itemValue}`);
         if (itemValue) { // If a valid feature is selected (not the default 'Select...')
             // TODO: Trigger action based on selected feature
             // You might clear input, prompt the user for specific input related to the feature,
             // or navigate to a different screen/modal for that feature.
             // Example: If 'generate_text' is selected, maybe show a text input specifically for generation prompts.
         }
     };

    // Placeholder for the AI Persona icon and text
    const AIPersona = () => (
        <View style={styles.aiPersonaContainer}>
             <Ionicons name="sparkles-outline" size={30} color="#3498db" style={{ marginRight: 8 }}/>
            <Text style={styles.aiPersonaText}>AI Assistant</Text>
        </View>
    );

    // Placeholder for a single message bubble
    const MessageBubble = ({ text, sender }) => (
        <View style={[
            styles.messageBubble,
            sender === 'user' ? styles.userMessage : styles.aiMessage
        ]}>
            <Text style={[
                styles.messageText,
                sender === 'user' ? styles.userMessageText : styles.aiMessageText
            ]}>{text}</Text>
        </View>
    );


  return (
    <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
        <View style={styles.container}>

          {/* --- AI Persona/Greeting Area --- */}
          <AIPersona />

          {/* --- Conversation/Message Area --- */}
          <ScrollView
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            ref={scrollViewRef}
            onContentSizeChange={scrollToBottom}
          >
              {messages.map(message => (
                  <MessageBubble key={message.id} text={message.text} sender={message.sender} />
              ))}
          </ScrollView>

          {/* --- Feature Selection (Dropdown Picker) --- */}
           <View style={styles.featurePickerContainer}>
               {/* Optional: Add a label for the picker */}
               {/* <Text style={styles.pickerLabel}>Select a Feature:</Text> */}
               <Picker
                   selectedValue={selectedFeature}
                   onValueChange={(itemValue, itemIndex) => handleFeatureSelect(itemValue)}
                   style={styles.featurePicker}
                    itemStyle={styles.featurePickerItem} // Style for individual items (iOS only)
               >
                   {aiFeatures.map(feature => (
                       <Picker.Item key={feature.value} label={feature.label} value={feature.value} />
                   ))}
               </Picker>
           </View>


        </View>
        {/* --- Input Area (Fixed at Bottom) --- */}
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.textInput}
                placeholder="Type a message or ask a question..."
                placeholderTextColor="#7f8c8d"
                value={inputText}
                onChangeText={setInputText}
                multiline={true}
                keyboardAppearance="default"
                returnKeyType="send"
                enablesReturnKeyAutomatically={true}
                blurOnSubmit={false}
                onSubmitEditing={handleSend}
                 accessibilityLabel="Message input"
                 accessibilityHint="Type your message or question for the AI assistant."
            />
            {/* Send or Mic Button */}
            <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                 disabled={!inputText.trim()}
                 accessibilityLabel={inputText.trim() ? "Send message" : "Start voice input"}
                 accessibilityHint={inputText.trim() ? "Sends your typed message." : "Begins recording your voice input."}
            >
                 {/* Show send icon if text exists, otherwise show mic icon */}
                <Ionicons
                    name={inputText.trim() ? "send" : "mic-outline"}
                    size={24}
                    color="#fff"
                />
            </TouchableOpacity>
        </View>
      </SafeAreaView>
     </KeyboardAvoidingView>
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
    paddingHorizontal: 15,
    paddingTop: 10,
    justifyContent: 'flex-start',
  },
  aiPersonaContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     marginBottom: 15,
     paddingBottom: 10,
     borderBottomWidth: 1,
     borderBottomColor: '#cfd8dc',
  },
  aiPersonaText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#2c3e50',
  },
  messageList: {
      flex: 1,
  },
   messageListContent: {
       paddingVertical: 10,
   },
   messageBubble: {
       padding: 12,
       borderRadius: 20,
       marginBottom: 10,
       maxWidth: '85%',
       elevation: 1,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 1 },
       shadowOpacity: 0.08,
       shadowRadius: 1,
   },
   userMessage: {
       backgroundColor: '#3498db',
       alignSelf: 'flex-end',
       borderBottomRightRadius: 5,
   },
   aiMessage: {
       backgroundColor: '#ecf0f1',
       alignSelf: 'flex-start',
       borderBottomLeftRadius: 5,
   },
   messageText: {
       fontSize: 16,
       lineHeight: 22,
   },
    userMessageText: {
        color: '#fff',
    },
    aiMessageText: {
        color: '#2c3e50',
    },
   // Feature Selection (Dropdown) Styles
   featurePickerContainer: {
       marginBottom: 10, // Space below the picker
       backgroundColor: '#fff', // White background for picker
       borderRadius: 8,
       borderWidth: 1,
       borderColor: '#cfd8dc',
       overflow: 'hidden', // Ensures border radius is applied to children
   },
   featurePicker: {
       height: 50, // Fixed height for the picker
       width: '100%', // Take full width of container
       color: '#2c3e50', // Text color
   },
   featurePickerItem: {
       // Styles for individual items (iOS only)
        fontSize: 16,
        color: '#2c3e50',
   },
  // Input Area Styles (Fixed Bottom)
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#bdc3c7',
     elevation: 10,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: -5 },
     shadowOpacity: 0.05,
     shadowRadius: 5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
    paddingHorizontal: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    marginRight: 10,
    minHeight: 40,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AIAssistantScreen;