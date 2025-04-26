// screens/AIAssistantScreen.js
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
  Modal,
  FlatList,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GoogleGenerativeAI } from "@google/generative-ai";

const initialMessages = [
  {
    id: 1,
    text: "Hello there! I'm your AI Assistant. I'm here to help with information, creativity, and tasks.",
    sender: "ai",
  },
  {
    id: 2,
    text: "Select a feature from the dropdown below or type your question to get started.",
    sender: "ai",
  },
];

const genAI = new GoogleGenerativeAI("AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw");

const aiFeatures = [
  { label: "Generate Text", value: "generate_text", icon: "text" },
  { label: "Analyze Image", value: "analyze_image", icon: "image" },
  { label: "Code Help", value: "code-slash", icon: "code-slash" },
  { label: "Translate", value: "language", icon: "language" },
  { label: "Summarize", value: "document-text", icon: "document-text" },
];

const AIAssistantScreen = ({ navigation }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState("");
  const [selectedFeature, setSelectedFeature] = useState(aiFeatures[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSend = async () => {
    if (inputText.trim()) {
      const newUserMessage = {
        id: messages.length + 1,
        text: inputText.trim(),
        sender: "user",
      };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInputText("");
      setTimeout(scrollToBottom, 50);

      const aiResponseText = await callGeminiAPI(inputText);

      const aiResponse = {
        id: messages.length + 2,
        text: aiResponseText,
        sender: "ai",
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
    setModalVisible(false);
    console.log(`Feature selected: ${feature.value}`);
  };

  const callGeminiAPI = async (inputText) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `You are a helpful ai assistant. Please respond to the following input in a simple, clear, and friendly manner: "${inputText}"`;
      const result = await model.generateContent([prompt]);
      const response = result?.response?.text()?.trim();
      console.log("Gemini API Response:", response);
      return response || "Sorry, I couldn't process your request.";
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "An error occurred while processing your request.";
    }
  };

  const MessageBubble = ({ text, sender }) => (
    <View
      style={[
        styles.messageBubble,
        sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          sender === "user" ? styles.userMessageText : styles.aiMessageText,
        ]}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
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
              />
            ))}
          </ScrollView>

          {/* --- Feature Selection Custom Dropdown --- */}
          <View style={styles.featurePickerContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setModalVisible(true)}
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
                name="chevron-down"
                size={20}
                color="#3498db"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>

            <Modal
              visible={modalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setModalVisible(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPressOut={() => setModalVisible(false)}
              >
                <View style={styles.modalContent}>
                  <FlatList
                    data={aiFeatures}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => handleFeatureSelect(item)}
                      >
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color="#3498db"
                          style={{ marginRight: 10 }}
                        />
                        <Text style={styles.modalItemText}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        </View>

        {/* --- Input Area --- */}
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
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
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
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: "85%",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  userMessage: {
    backgroundColor: "#3498db",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  aiMessage: {
    backgroundColor: "#ecf0f1",
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
  featurePickerContainer: {
    marginBottom: 10,
    marginTop: 10,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cfd8dc",
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#bdc3c7",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    paddingVertical: Platform.OS === "ios" ? 10 : 5,
    paddingHorizontal: 15,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    marginRight: 10,
    minHeight: 40,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: "#3498db",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AIAssistantScreen;
