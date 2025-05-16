import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
} from "react-native";
import * as Speech from "expo-speech";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  FontAwesome5,
  Feather,
  FontAwesome6,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const API_KEY = "AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw";
const genAI = new GoogleGenerativeAI(API_KEY);

const TextToSpeechScreen = () => {
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState("Greetings");
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [fontSize, setFontSize] = useState(20); // Default font size

  const languages = [
    { label: "English", code: "en-US" },
    { label: "Hindi", code: "hi-IN" },
    { label: "Tamil", code: "ta-IN" },
    { label: "Telugu", code: "te-IN" },
    { label: "Bengali", code: "bn-IN" },
    { label: "Marathi", code: "mr-IN" },
    { label: "Kannada", code: "kn-IN" },
  ];

  const quickPhrases = {
    Greetings: ["Hello", "Good morning", "How are you?", "Goodbye"],
    Needs: ["I need help", "Water please", "Bathroom", "Food"],
    Emotions: ["I am happy", "I am sad", "I am tired", "I am okay"],
  };

  const speakText = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      if (text.trim() !== "") {
        let textToSpeak = text;
        Speech.speak(textToSpeak, {
          language: selectedLanguage,
          rate: speechRate,
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
        setIsSpeaking(true);
        if (!history.includes(text)) {
          setHistory([text, ...history.slice(0, 4)]);
          setHistoryIndex(-1);
        }
      } else {
        Alert.alert("No Text", "Please enter text to speak.");
      }
    }
  };

  const translateText = async (text, targetLanguage) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Translate the following text to the language corresponding to the locale ${targetLanguage}. Return only the translated text. Text: "${text.trim()}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return await response.text();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to translate text.");
      return text;
    }
  };

  const enhanceText = async () => {
    if (text.trim() === "") {
      Alert.alert("No Text", "Please enter text to enhance.");
      return;
    }

    try {
      setLoading(true);

      // Combine the history context with the current text
      const context =
        history.length > 0 ? `Context: ${history.join(" ")}\n` : "";

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.2,
          topK: 1,
          topP: 1,
          maxOutputTokens: 400,
        },
      });

      const prompt = `${context}You are a deaf assistant. Rewrite the following text to make it clear, concise, and easy to comprehend. Return only the improved text without explanations. Text: "${text.trim()}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = await response.text();

      setText(enhancedText.trim());
      console.log("Enhanced Text:", enhancedText.trim());
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to enhance text.");
    } finally {
      setLoading(false);
    }
  };

  const processImage = async (image) => {
    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `Extract text from the provided image and return it as plain text. If no text is found, return "No text detected."`;
      const imageData = {
        inlineData: {
          data: image.base64,
          mimeType: "image/jpeg",
        },
      };

      const result = await model.generateContent([prompt, imageData]);
      const response = await result.response;
      const extractedText = await response.text();

      setText(extractedText.trim());
      console.log("Extracted Text:", extractedText.trim());
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to process image.");
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets) {
      await processImage(result.assets[0]);
    }
  };

  const cyclePreviousPhrase = () => {
    if (history.length === 0) return;
    const newIndex = historyIndex + 1 < history.length ? historyIndex + 1 : 0;
    setHistoryIndex(newIndex);
    setText(history[newIndex] || "");
    Haptics.selectionAsync();
  };

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
    Haptics.selectionAsync();
  };

  const adjustFontSize = (change) => {
    setFontSize((prevSize) => Math.max(10, prevSize + change));
  };

  return (
    <View style={styles.container}>
      <BlurView
        intensity={Platform.OS === "ios" ? 80 : 100}
        style={styles.inputContainer}
      >
        <TextInput
          style={[styles.input, { fontSize }]}
          placeholder="Enter your text here..."
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={styles.languageButton}
          onPress={toggleLanguageDropdown}
        >
          <FontAwesome5 name="globe" size={23} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clearButtonOverlay}
          onPress={() => setText("")}
        >
          <FontAwesome5 name="trash" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: history.length === 0 ? "transparent" : "#007AFF",
              position: "absolute",
              bottom: 10,
              right: 10,
            },
          ]}
          onPress={cyclePreviousPhrase}
          disabled={history.length === 0}
        >
          <Feather
            name="arrow-left"
            size={24}
            color={history.length === 0 ? "transparent" : "#FFF"}
          />
        </TouchableOpacity>
      </BlurView>

      {showLanguageDropdown && (
        <View style={styles.languageDropdown}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageChip,
                selectedLanguage === lang.code && styles.selectedLanguageChip,
              ]}
              onPress={async () => {
                setSelectedLanguage(lang.code);
                setShowLanguageDropdown(false);

                // Translate the text when the language is selected
                if (text.trim() !== "" && lang.code !== null) {
                  const translatedText = await translateText(text, lang.code);
                  setText(translatedText); // Update the input box with the translated text
                }
              }}
            >
              <Text style={styles.languageText}>{lang.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.accessibilityOptions}>
        <TouchableOpacity onPress={() => adjustFontSize(-2)}>
          <Text style={styles.accessibilityButton}>Font -</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => adjustFontSize(2)}>
          <Text style={styles.accessibilityButton}>Font +</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickTextContainer}>
        <Text style={styles.sectionTitle}>Commonly Used Phrases</Text>
        <View style={styles.categorySelector}>
          {Object.keys(quickPhrases).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.phraseGrid}>
          {quickPhrases[selectedCategory].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickTextChip}
              onPress={() => setText(item)}
            >
              <Text style={styles.quickText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <View style={styles.bottomControl}>
          <TouchableOpacity style={styles.sideButton} onPress={enhanceText}>
            <LinearGradient
              colors={["#FF6F61", "#FF9A76"]}
              style={styles.buttonGradient}
            >
              <FontAwesome6 name="wand-magic-sparkles" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.speakButton} onPress={speakText}>
            <LinearGradient
              colors={
                isSpeaking ? ["#FF5252", "#FF8A80"] : ["#00DDEB", "#6B73FF"]
              }
              style={styles.speakButtonGradient}
            >
              <FontAwesome5
                name={isSpeaking ? "stop" : "volume-up"}
                size={36}
                color="#FFF"
              />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton} onPress={openCamera}>
            <LinearGradient
              colors={["#40C4FF", "#81D4FA"]}
              style={styles.buttonGradient}
            >
              <MaterialIcons name="photo-camera" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  inputContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    minHeight: "50%",
    position: "relative",
  },
  input: {
    flex: 1,
    padding: 12,
    paddingTop: 36,
    fontSize: 20,
    fontWeight: "500",
    color: "#333",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    textAlignVertical: "top",
    minHeight: 100,
  },
  languageButton: {
    position: "absolute",
    top: 10,
    right: 50,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  languageDropdown: {
    position: "absolute",
    top: 50,
    left: "60%",
    right: 26,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    zIndex: 1000,
    width: 120,
  },
  languageChip: {
    backgroundColor: "#E5E5EA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 4,
  },
  selectedLanguageChip: {
    backgroundColor: "#007AFF",
  },
  languageText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  clearButtonOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    padding: 6,
    elevation: 2,
    shadowColor: "#000",
  },
  historyContainer: {
    backgroundColor: "#E8F0FE",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    width: 40,
    height: 40,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  historyList: {
    paddingVertical: 2,
  },
  historyChip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  historyText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  quickTextContainer: {
    backgroundColor: "#E8F0FE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  categorySelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
    marginTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  categoryChip: {
    backgroundColor: "#D1D1D6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 9,
    borderWidth: 1,
    borderColor: "#C0C0C0",
  },
  selectedCategoryChip: {
    backgroundColor: "#007AFF",
    borderColor: "#005BB5",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  phraseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickTextChip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    margin: 4,
    width: "45%",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  quickText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
  loader: {
    marginVertical: 16,
  },
  bottomControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 6,
    marginBottom: 20,
  },
  speakButton: {
    width: 90,
    height: 90,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    overflow: "hidden",
    transform: [{ scale: 1 }],
  },
  speakButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  sideButton: {
    width: 70,
    height: 70,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    overflow: "hidden",
    transform: [{ scale: 1 }],
  },
  buttonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  accessibilityOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  accessibilityButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    paddingHorizontal: 10,
  },
});

export default TextToSpeechScreen;
