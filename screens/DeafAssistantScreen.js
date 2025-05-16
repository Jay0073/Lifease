import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
  Platform,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
import { WebView } from "react-native-webview";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

// Web Speech API HTML with dynamic language support
const WEB_SPEECH_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Speech Recognition</title>
</head>
<body>
  <script>
    let recognition = null;
    let isListening = false;
    let currentLang = 'en-US';

    function initializeRecognition() {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: 'speech_recognition_not_supported'
          }));
          return false;
        }
        recognition = new SpeechRecognition();
        recognition.lang = currentLang;
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event) => {
          let transcript = event.results[event.resultIndex][0].transcript;
          window.ReactNativeWebView.postMessage(JSON.stringify({ transcript }));
        };

        recognition.onerror = (event) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            error: event.error
          }));
        };

        recognition.onend = () => {
          if (isListening) {
            try {
              recognition.start();
            } catch (e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                error: 'restart_failed_' + e.message
              }));
            }
          }
        };

        return true;
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          error: 'initialization_failed_' + e.message
        }));
        return false;
      }
    }

    function startRecognition() {
      if (!recognition) {
        if (!initializeRecognition()) return;
      }
      try {
        isListening = true;
        recognition.start();
        window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'started' }));
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          error: 'start_failed_' + e.message
        }));
      }
    }

    function stopRecognition() {
      if (recognition && isListening) {
        isListening = false;
        recognition.stop();
        window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'stopped' }));
      }
    }

    function setLanguage(lang) {
      currentLang = lang;
      if (recognition) {
        recognition.lang = lang;
      }
    }
  </script>
</body>
</html>
`;

const API_KEY = "AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw";
const genAI = new GoogleGenerativeAI(API_KEY);

const DeafAssistantScreen = () => {
  const [mode, setMode] = useState("audioToText");
  const [isRecording, setIsRecording] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [responseText, setResponseText] = useState("");
  const [connectionError, setConnectionError] = useState(null);
  const webViewRef = useRef(null);
  const [fontSize, setFontSize] = useState(18);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const languages = [
    { label: "English", code: "en-US" },
    { label: "Hindi", code: "hi-IN" },
    { label: "Tamil", code: "ta-IN" },
    { label: "Telugu", code: "te-IN" },
    { label: "Bengali", code: "bn-IN" },
    { label: "Marathi", code: "mr-IN" },
    { label: "Kannada", code: "kn-IN" },
  ];

  // Update WebView language when selectedLanguage changes
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`setLanguage('${selectedLanguage}');`);
    }
  }, [selectedLanguage]);

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

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
    Haptics.selectionAsync();
  };

  const adjustFontSize = (change) => {
    setFontSize((prevSize) => Math.max(10, prevSize + change));
    Haptics.selectionAsync();
  };

  const clearText = () => {
    setResponseText("");
    Haptics.selectionAsync();
  };

  // Request microphone permissions
  const requestMicrophonePermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Microphone Permission Required",
        "Please enable microphone access in your device settings.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  // Handle WebView messages
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("WebView message:", data);
      if (data.transcript) {
        setResponseText(data.transcript);
      } else if (data.error) {
        console.error("WebView error:", data.error);
        setConnectionError(
          data.error.includes("not_supported")
            ? "Speech recognition is not supported on this device."
            : `Speech recognition error: ${data.error}`
        );
        if (isRecording) {
          setIsRecording(false);
          stopPulse();
          Alert.alert(
            "Speech Recognition Error",
            data.error.includes("not_supported")
              ? "Speech recognition is not supported on this device."
              : "Failed to recognize speech. Please try again.",
            [{ text: "OK" }]
          );
        }
      } else if (data.status) {
        console.log("Recognition status:", data.status);
      }
    } catch (error) {
      console.error("WebView message parsing error:", error);
      setConnectionError("Failed to process speech recognition data.");
    }
  };

  // Start speech recognition
  const startRecordingLogic = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    setResponseText("");
    startPulse();
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript("startRecognition();");
    }
  };

  // Stop speech recognition
  const stopRecordingLogic = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(false);
    setResponseText("");
    stopPulse();
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript("stopRecognition();");
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecordingLogic();
    } else {
      startRecordingLogic();
    }
  };

  const startPulse = () => {
    console.log("Starting pulse animation...");
    pulseAnim.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  };

  const stopPulse = () => {
    console.log("Stopping pulse animation...");
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleOutsideMode = () => {
    console.log("Outside Mode button pressed - (Not implemented)");
  };

  const handleToggleMode = () => {
    console.log("Toggling mode...");
    setMode((prevMode) =>
      prevMode === "audioToSign" ? "audioToText" : "audioToSign"
    );
    setResponseText("");
    console.log(
      "Mode toggled to:",
      mode === "audioToSign" ? "audioToText" : "audioToSign"
    );
    if (isRecording) {
      stopRecordingLogic();
    }
  };

  // --- Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Hidden WebView for Web Speech API */}
        <View style={styles.webViewContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: WEB_SPEECH_HTML }}
            onMessage={handleWebViewMessage}
            style={{ flex: 1 }}
            originWhitelist={["*"]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>

        {/* Display Area */}
        <View style={styles.displayArea}>
          <View style={styles.topRightButtons}>
            <TouchableOpacity onPress={clearText}>
              <Ionicons name="trash" size={26} color="#e74c3c" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleLanguageDropdown}>
              <Ionicons name="globe" size={27} color="#3498db" />
            </TouchableOpacity>
          </View>

          {showLanguageDropdown && (
            <View style={styles.languageDropdown}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageChip,
                    selectedLanguage === lang.code &&
                      styles.selectedLanguageChip,
                  ]}
                  onPress={async () => {
                    setSelectedLanguage(lang.code);
                    setShowLanguageDropdown(false);
                    if (responseText.trim() !== "" && lang.code !== null) {
                      const translatedText = await translateText(
                        responseText,
                        lang.code
                      );
                      setResponseText(translatedText);
                    }
                  }}
                >
                  <Text style={styles.languageText}>{lang.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {connectionError ? (
            <Text style={[styles.displayText, styles.errorText]}>
              {connectionError}
            </Text>
          ) : mode === "audioToSign" ? (
            <View style={styles.signArea}>
              <Ionicons name="hand-left-outline" size={120} color="#7f8c8d" />
              <Text style={styles.displayText}>
                Sign Output (Not Implemented)
              </Text>
            </View>
          ) : (
            <View style={styles.signArea}>
              {responseText ? (
                <Text style={[styles.largeResponseText, { fontSize }]}>
                  {responseText}
                </Text>
              ) : isRecording ? (
                <Text style={styles.displayText}>Listening...</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Font Adjustment and Other Buttons */}
        <View style={styles.accessibilityOptions}>
          <TouchableOpacity onPress={() => adjustFontSize(-2)}>
            <Text style={styles.accessibilityButton}>Font -</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => adjustFontSize(2)}>
            <Text style={styles.accessibilityButton}>Font +</Text>
          </TouchableOpacity>
        </View>

        {/* Button Bar */}
        <View style={styles.buttonBar}>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={handleOutsideMode}
            activeOpacity={0.7}
            accessibilityRole="button"
            disabled={isRecording}
          >
            <Ionicons name="navigate-circle-outline" size={30} color="white" />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.largeButton}
              onPress={handleRecordToggle}
              activeOpacity={0.7}
              accessibilityRole="button"
              disabled={!!connectionError}
            >
              <Ionicons
                name={isRecording ? "stop-circle" : "mic-circle"}
                size={70}
                color="white"
              />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={handleToggleMode}
            activeOpacity={0.7}
            accessibilityRole="button"
            disabled={isRecording}
          >
            <Ionicons
              name={mode === "audioToSign" ? "text" : "hand-left-outline"}
              size={30}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  webViewContainer: {
    height: 0,
    width: 0,
    position: "absolute",
  },
  displayArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signArea: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "100%",
  },
  displayText: {
    fontSize: 18,
    color: "#34495e",
    marginTop: 10,
    textAlign: "left",
    paddingHorizontal: 10,
  },
  errorText: {
    color: "#e74c3c",
    fontWeight: "bold",
  },
  largeResponseText: {
    fontSize: 32,
    color: "#34495e",
    textAlign: "left",
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  buttonBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  smallButton: {
    backgroundColor: "#3498db",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  largeButton: {
    backgroundColor: "#e74c3c",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#e74c3c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  accessibilityOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 12,
  },
  accessibilityButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    paddingHorizontal: 10,
  },
  topRightButtons: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    gap: 10,
  },
  languageDropdown: {
    position: "absolute",
    top: 50,
    right: 10,
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
});

export default DeafAssistantScreen;