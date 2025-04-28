// AIAssistantScreen.js

import React, { useState, useRef, useEffect } from "react";
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
  FlatList,
  Animated,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { Vibration } from "react-native";
import speechanimation from "../assets/typinganimation.json";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { GoogleGenerativeAI } from "@google/generative-ai";
import LottieView from "lottie-react-native";
import { Audio } from "expo-av";

const { height: screenHeight } = Dimensions.get("window");

const initialMessages = [
  {
    id: 1,
    text: "Hello! I'm your AI Assistant, ready to help with info, creativity, or tasks.",
    sender: "ai",
  },
  {
    id: 2,
    text: "Choose a feature, attach a file, or type your question to start.",
    sender: "ai",
  },
];

const genAI = new GoogleGenerativeAI("AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw");

const aiFeatures = [
  {
    label: "Text",
    value: "generate_text",
    icon: "text",
    prompt: "Generate a creative and concise response to the following input:",
  },
  {
    label: "Image",
    value: "analyze_image",
    icon: "image",
    prompt: "Analyze the following image and provide insights:",
  },
  {
    label: "Code",
    value: "code-slash",
    icon: "code-slash",
    prompt: "Provide coding assistance or debug the following code:",
  },
  {
    label: "Translate",
    value: "language",
    icon: "language",
    prompt: "Translate the following text into the desired language:",
  },
  {
    label: "Summary",
    value: "document-text",
    icon: "document-text",
    prompt: "Summarize the following text in a concise manner:",
  },
];

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const AIAssistantScreen = ({ navigation }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const [selectedFeature, setSelectedFeature] = useState(aiFeatures[0]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef(null);
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  let holdTimeout = null; // Timeout for detecting long press

  useEffect(() => {
    const requestPermissions = async () => {
      const permission = await Audio.requestPermissionsAsync();
      setHasMicrophonePermission(permission.status === "granted");
    };
    requestPermissions();
  }, []);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const onPressIn = () => {
    if (hasMicrophonePermission && !isProcessing) {
      holdTimeout = setTimeout(() => {
        startRecording();
        Vibration.vibrate([50, 80, 50]); // Vibrate when recording starts
      }, 100); // Start recording only if held for 100ms+
    }
  };

  const onPressOut = () => {
    clearTimeout(holdTimeout); // Cancel if released too soon
    if (isRecording) {
      stopRecording();
    }
  };

  const stopSpeech = () => {
    if (isSpeaking) {
      Speech.stop(); // Stop the ongoing speech
      Vibration.vibrate([100, 400, 100]); // Trigger a short vibration
      setIsSpeaking(false); // Reset the speaking state
      console.log("Speech stopped.");
    }
  };

  const toggleDropdown = () => {
    if (dropdownVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDropdownVisible(false));
    } else {
      setDropdownVisible(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile({
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          type: result.assets[0].mimeType,
        });
      } else {
        console.log("File picker cancelled");
      }
    } catch (err) {
      console.error("Error picking file:", err);
      alert("Failed to pick file. Please try again.");
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  const startRecording = async () => {
    try {
      console.log("Requesting permissions...");
      const permission = await Audio.requestPermissionsAsync();
  
      if (permission.status === "granted") {
        console.log("Checking for existing recording...");
        if (recording) {
          console.log("Stopping existing recording...");
          await recording.stopAndUnloadAsync();
          setRecording(null);
        }
  
        console.log("Starting new recording...");
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
  
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
        Vibration.vibrate([50, 80, 50]); // Vibrate when recording starts
        console.log("Recording started");
      } else {
        alert("Permission to access microphone is required!");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    console.log("Stopping recording...");
    setIsRecording(false);
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log("Recording stopped and stored at", uri);
        setRecording(null);
  
        // Send the audio file to the Gemini API
        handleAudioInput(uri);
      } catch (err) {
        console.error("Failed to stop recording", err);
      }
    }
  };


  // this is original
  // const callGeminiAPI = async (inputText, file) => {
  //   try {
  //     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  //     const parts = [];

  //     if (inputText.trim()) {
  //       parts.push({ text: inputText });
  //     }

  //     if (file) {
  //       const fileResponse = await fetch(file.uri);
  //       if (!fileResponse.ok)
  //         throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);

  //       const fileBlob = await fileResponse.blob();

  //       const fileBase64 = await new Promise((resolve, reject) => {
  //         const reader = new FileReader();
  //         reader.onerror = reject;
  //         reader.onloadend = () => resolve(reader.result.split(",")[1]);
  //         reader.readAsDataURL(fileBlob);
  //       });

  //       parts.push({
  //         inlineData: {
  //           data: fileBase64,
  //           mimeType: file.type,
  //         },
  //       });
  //     }

  //     const prompt = `You are a helpful AI assistant. Respond in a simple and friendly manner. ${
  //       selectedFeature.prompt
  //     } "${inputText || "No input provided"}"`;
  //     parts.unshift({ text: prompt });

  //     const result = await model.generateContent(parts);
  //     const response = result?.response?.text()?.trim();
  //     return response ? response.split(" ") : [];
  //   } catch (error) {
  //     console.error("Error calling Gemini API:", error);
  //     return ["An error occurred while processing your request."];
  //   }
  // };

  const callGeminiAPI = async (inputText, file) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const parts = [];
  
      // Include the last 5 messages in the prompt for context
      const conversationHistory = messages
        .slice(-5) // Limit to the last 5 messages
        .map((msg) => `${msg.sender === "user" ? "User" : "AI"}: ${msg.text}`)
        .join("\n");
  
      // Add the conversation history to the prompt
      const prompt = `
        You are a helpful AI assistant. Respond in a simple and friendly manner.
        Here is the conversation so far:
        ${conversationHistory}
        User: ${inputText || "No input provided"}
      `;
  
      parts.push({ text: prompt });
  
      if (file) {
        const fileResponse = await fetch(file.uri);
        if (!fileResponse.ok) {
          throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
        }
  
        const fileBlob = await fileResponse.blob();
        const fileBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = reject;
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(fileBlob);
        });
  
        parts.push({
          inlineData: {
            data: fileBase64,
            mimeType: file.type, // Ensure the MIME type is correct
          },
        });
      }
  
      const result = await model.generateContent(parts);
      const response = result?.response?.text()?.trim();
      return response ? response.split(" ") : [];
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return ["An error occurred while processing your request."];
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !selectedFile) return;
  
    setIsProcessing(true);
  
    const userMessageId = generateId();
    const typingMessageId = generateId();
    const aiMessageId = generateId();
  
    // Add the user's message
    const newUserMessage = {
      id: userMessageId,
      text: inputText.trim() || "",
      sender: "user",
      file: selectedFile || null,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setSelectedFile(null);
    setTimeout(scrollToBottom, 50);
  
    // Show typing indicator
    setMessages((prev) => [
      ...prev,
      { id: typingMessageId, typing: true, sender: "ai" },
    ]);
  
    // Call Gemini API
    const aiResponseChunks = await callGeminiAPI(inputText, selectedFile);
  
    // Remove typing indicator
    setMessages((prev) => prev.filter((msg) => msg.id !== typingMessageId));
  
    // Add AI message container
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, text: "", sender: "ai" },
    ]);
  
    // Stream in chunks (typing effect)
    for (const chunk of aiResponseChunks) {
      await new Promise((r) => setTimeout(r, 100));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, text: msg.text + " " + chunk }
            : msg
        )
      );
      scrollToBottom();
    }
  
    setIsProcessing(false);
  };

  const handleAudioInput = async (audioUri) => {
    try {
      const audioResponse = await fetch(audioUri);
      const audioBlob = await audioResponse.blob();
      const audioBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(audioBlob);
      });

      // Call the Gemini API with a transcription-specific prompt
      const transcriptionPrompt = `You are a transcriber who can understand the audio provided and transcribe it in the same language. 
      Do not mention any details about being an AI model. The response should only contain the transcribed text. 
      If the audio is unclear, try to fill in the context. If it is very unclear, indicate the unaudible parts with [inaudible].
      Here is the audio:`;
      const aiResponseChunks = await callGeminiAPI(transcriptionPrompt, {
        uri: audioUri,
        type: "audio/mpeg",
        data: audioBase64,
      });

      // Combine the chunks into a single transcription
      const transcribedText = aiResponseChunks.join(" ");

      // Add the transcribed text as a user's message
      const userMessageId = generateId();
      setMessages((prev) => [
        ...prev,
        { id: userMessageId, text: transcribedText, sender: "user" },
      ]);
      setTimeout(scrollToBottom, 50);

      // Call the Gemini API again with the transcribed text for further processing
      const aiResponseChunksForProcessing = await callGeminiAPI(
        transcribedText,
        {
          uri: audioUri,
          type: "audio/mpeg",
          data: audioBase64,
        }
      );

      // Process the AI response
      const aiMessageId = generateId();
      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, text: "", sender: "ai" },
      ]);

      for (const chunk of aiResponseChunksForProcessing) {
        await new Promise((r) => setTimeout(r, 100));
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, text: msg.text + " " + chunk }
              : msg
          )
        );
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error processing audio input:", error);
      alert("Failed to process audio input. Please try again.");
    }
  };

  const MessageBubble = ({ text, sender, typing, file }) => (
    <View
      style={[
        styles.messageBubble,
        sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {typing ? (
        <LottieView
          source={speechanimation}
          autoPlay
          loop
          style={styles.speechanimationmation}
        />
      ) : (
        <>
          <Text
            style={[
              styles.messageText,
              sender === "user" ? styles.userMessageText : styles.aiMessageText,
            ]}
          >
            {text}
          </Text>
          {file && (
            <View style={styles.fileContainer}>
              {file.type.startsWith("image/") ? (
                <Image
                  source={{ uri: file.uri }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.documentContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    style={styles.documentIcon}
                  />
                  <Text style={styles.fileNameText}>{file.name}</Text>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderFeatureItem = ({ item }) => (
    <TouchableOpacity
      style={styles.featureItem}
      onPress={() => handleFeatureSelect(item)}
    >
      <Ionicons
        name={item.icon}
        size={18}
        color="#3498db"
        style={styles.featureIcon}
      />
      <Text style={styles.featureItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
    toggleDropdown();
  };

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f4f8" }}>
        <View style={styles.container}>
          {/* --- Conversation Area --- */}
          <ScrollView
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            ref={scrollViewRef}
            onContentSizeChange={scrollToBottom}
          >
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                text={msg.text}
                sender={msg.sender}
                file={msg.file}
                typing={msg.typing}
              />
            ))}
          </ScrollView>

          {/* --- Feature Selection and File Picker --- */}
          <View style={styles.featurePickerContainer}>
            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={handleFilePick}
            >
              <Ionicons name="attach-outline" size={25} color="#3498db" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={toggleDropdown}
            >
              <Ionicons
                name={selectedFeature.icon}
                size={20}
                color="#3498db"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.dropdownButtonText}>
                {selectedFeature.label}
              </Text>
              <Ionicons
                name={dropdownVisible ? "chevron-down" : "chevron-up"}
                size={20}
                color="#3498db"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>

            {dropdownVisible && (
              <View style={styles.dropdownWrapper}>
                <Animated.View
                  style={[
                    styles.dropdownContent,
                    {
                      transform: [
                        {
                          translateY: dropdownAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-10, 0],
                          }),
                        },
                        {
                          scaleY: dropdownAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.95, 1],
                          }),
                        },
                      ],
                      opacity: dropdownAnim,
                    },
                  ]}
                >
                  <FlatList
                    data={aiFeatures}
                    renderItem={renderFeatureItem}
                    keyExtractor={(item) => item.value}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                  />
                </Animated.View>
              </View>
            )}
          </View>

          {/* --- File Selection Feedback --- */}
          {selectedFile && (
            <View style={styles.fileSelectionContainer}>
              <Text style={styles.fileSelectionText}>
                Attached: {selectedFile.name}
              </Text>
              <TouchableOpacity onPress={clearFile}>
                <Ionicons
                  name="close-circle-outline"
                  size={27}
                  color="#e74c3c"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* --- Input Area --- */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#7f8c8d"
              value={inputText}
              onChangeText={setInputText}
              multiline={true}
              keyboardAppearance="default"
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && !selectedFile && styles.sendButtonDisabled,
              ]}
              onPressIn={!inputText.trim() && !selectedFile ? onPressIn : null} // Start recording on press
              onPressOut={
                !inputText.trim() && !selectedFile ? onPressOut : null
              } // Stop recording on release
              onPress={inputText.trim() || selectedFile ? handleSend : null} // Send message if input or file exists
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons
                  name={
                    inputText.trim() || selectedFile ? "send" : "mic-outline"
                  } // Show mic or send icon
                  size={24}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 10,
    paddingBottom: 20,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: "80%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessage: {
    backgroundColor: "#3498db",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  aiMessage: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#fff",
  },
  aiMessageText: {
    color: "#2c3e50",
  },
  speechanimationmation: {
    width: 150,
    height: 50,
    alignSelf: "center",
  },
  fileContainer: {
    marginTop: 8,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  documentContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f5",
    borderRadius: 8,
    padding: 8,
    maxWidth: 200,
  },
  documentIcon: {
    marginRight: 8,
  },
  fileNameText: {
    fontSize: 14,
    color: "#2c3e50",
    flex: 1,
  },
  featurePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    zIndex: 100,
  },
  dropdownWrapper: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    right: 0,
    zIndex: 1001,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginLeft: 5,
  },
  filePickerButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  dropdownContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  featureItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    margin: 5,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    minWidth: "45%",
  },
  featureIcon: {
    marginRight: 8,
  },
  featureItemText: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  fileSelectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: "#f1f3f5",
    borderRadius: 8,
    marginBottom: 8,
  },
  fileSelectionText: {
    flex: 1,
    fontSize: 14,
    color: "#2c3e50",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderRadius: 12,
    borderTopColor: "#e0e0e0",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    paddingHorizontal: 15,
    backgroundColor: "#f1f3f5",
    borderRadius: 12,
    marginRight: 10,
    minHeight: 44,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#3498db",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "lightgreen",
  },
});

export default AIAssistantScreen;
