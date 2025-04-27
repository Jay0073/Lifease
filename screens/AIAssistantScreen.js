import React, { useState, useRef } from "react";
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
import speechanimation from "../assets/speechanimation.json";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { GoogleGenerativeAI } from "@google/generative-ai";
import LottieView from "lottie-react-native";

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
  { label: "Text", value: "generate_text", icon: "text" },
  { label: "Image", value: "analyze_image", icon: "image" },
  { label: "Code", value: "code-slash", icon: "code-slash" },
  { label: "Translate", value: "language", icon: "language" },
  { label: "Summary", value: "document-text", icon: "document-text" },
];

const AIAssistantScreen = ({ navigation }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const [selectedFeature, setSelectedFeature] = useState(aiFeatures[0]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollViewRef = useRef(null);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
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

  const handleSend = async () => {
    if (!inputText.trim() && !selectedFile) return;
  
    setIsProcessing(true);
    const newUserMessage = {
      id: messages.length + 1,
      text: inputText.trim() || "",
      sender: "user",
      file: selectedFile || null,
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputText("");
    setSelectedFile(null);
    setTimeout(scrollToBottom, 50);
  
    // Add typing indicator
    const typingMessageId = messages.length + 2;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: typingMessageId, typing: true, sender: "ai" }, // Add typing flag
    ]);
  
    // Start streaming the AI response
    const aiResponseChunks = await callGeminiAPI(inputText, selectedFile);
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.id !== typingMessageId)
    );
  
    const aiMessageId = messages.length + 3;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: aiMessageId, text: "", sender: "ai" },
    ]);
  
    for (const chunk of aiResponseChunks) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Delay for typing effect
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, text: msg.text + " " + chunk }
            : msg
        )
      );
      scrollToBottom();
    }
    setIsProcessing(false);
  };

  const callGeminiAPI = async (inputText, file) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const parts = [];
  
      // Add text input if present
      if (inputText.trim()) {
        parts.push({ text: inputText });
      }
  
      // Add file if present
      if (file) {
        const fileResponse = await fetch(file.uri);
        if (!fileResponse.ok)
          throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
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
            mimeType: file.type,
          },
        });
      }
  
      // Construct prompt
      const prompt = `
        You are a helpful AI assistant. Respond to the following input in a simple, clear, and friendly manner.
        - If a file is provided, describe its content (e.g., for images, describe the scene; for documents, extract key text or summarize).
        - If text is provided, answer the query or follow the instructions, considering the file if present.
        Input text: "${inputText || "No text provided"}"
      `;
      parts.unshift({ text: prompt });
  
      const result = await model.generateContent(parts);
      const response = result?.response?.text()?.trim();
      console.log("Gemini API Response:", response);
  
      // Return the response as chunks for streaming
      return response ? response.split(" ") : [];
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return ["An error occurred while processing your request."];
    }
  };

  const MessageBubble = ({ text, sender, typing }) => (
    <View
      style={[
        styles.messageBubble,
        sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {typing ? (
        <LottieView
          source={speechanimation} // Use the imported animation
          autoPlay
          loop
          style={styles.speechanimationmation}
        />
      ) : (
        <Text
          style={[
            styles.messageText,
            sender === "user" ? styles.userMessageText : styles.aiMessageText,
          ]}
        >
          {text}
        </Text>
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
    console.log(`Feature selected: ${feature.value}`);
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
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                text={message.text}
                sender={message.sender}
                file={message.file}
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
                            outputRange: [-10, 0], // Animate upward
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
              placeholder="Type a message or attach a file..."
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
              onPress={handleSend}
              disabled={(!inputText.trim() && !selectedFile) || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons
                  name={
                    inputText.trim() || selectedFile ? "send" : "mic-outline"
                  }
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
    width: 400, // Adjust the width of the GIF
    height: 800, // Adjust the height of the GIF
    alignSelf: "center", // Center the GIF horizontally
  },
  fileContainer: {
    marginTop: 8, // Space between text and file
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
    flex: 1, // Allow text to take remaining space
  },
  featurePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    zIndex: 100,
  },
  dropdownWrapper: {
    position: "absolute",
    bottom: "100%", // Position above the dropdown button
    left: 0,
    right: 0,
    zIndex: 1001, // Ensure dropdown is above other elements
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
    paddingVertical: 2,
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