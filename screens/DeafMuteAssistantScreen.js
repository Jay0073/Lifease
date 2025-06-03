import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Secure Gemini API Key
const API_KEY = "AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw";
const genAI = new GoogleGenerativeAI(API_KEY);

// Web Speech API HTML
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
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
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
  </script>
</body>
</html>
`;

const DeafAndMuteAssistantScreen = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [history, setHistory] = useState([]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const webViewRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("Greetings");
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Language options
  const languages = [
    { label: 'English', code: 'en-US' },
    { label: 'Hindi', code: 'hi-IN' },
    { label: 'Spanish', code: 'es-ES' },
  ];

  const [fontSize, setFontSize] = useState(20);
  // Quick phrases
   const quickPhrases = {
    Greetings: ["Hello", "Good morning", "How are you?", "Goodbye"],
    Needs: ["I need help", "Water please", "Bathroom", "Food"],
    Emotions: ["I am happy", "I am sad", "I am tired", "I am okay"],
  };

  // Button press animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
    ]).start();
  };

  // Request microphone permissions
  const requestMicrophonePermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Microphone Permission Required',
        'Please enable microphone access in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Handle WebView messages
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.transcript) {
        setText(data.transcript);
        saveToHistory(data.transcript);
      } else if (data.error) {
        if (isListening) {
          setIsListening(false);
          Alert.alert(
            'Speech Recognition Error',
            data.error.includes('not_supported')
              ? 'Speech recognition is not supported on this device. Please type or use quick phrases.'
              : 'Failed to recognize speech. Please try again or type.',
            [{ text: 'OK' }]
          );
        }
      } else if (data.status) {
        console.log('Recognition status:', data.status);
      }
    } catch (error) {
      console.error('WebView message parsing error:', error);
    }
  };

  // Start speech recognition
  const startListening = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateButton();
    setIsListening(true);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('startRecognition();');
    }
  };

  // Stop speech recognition
  const stopListening = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateButton();
    setIsListening(false);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('stopRecognition();');
    }
  };

  // Handle speak button
  const handleSpeak = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateButton();
    if (text.trim() === '') {
      Alert.alert('No Text', 'Please enter text to speak.');
      return;
    }

    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(text, {
        language: selectedLanguage,
        rate: 1.0,
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onError: (error) => {
          console.error('TTS error:', error);
          setIsSpeaking(false);
          Alert.alert('Error', 'Failed to speak text.');
        },
      });
      saveToHistory(text);
    }
  };

  // Enhance text with Gemini
  const enhanceText = async () => {
    if (!text.trim()) {
      Alert.alert('No Text', 'Please enter text to enhance.');
      return;
    }

    try {
      animateButton();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Rewrite the following text to make it clear, concise, and easy to comprehend for deaf and mute users. Return only the improved text. Text: "${text.trim()}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = await response.text();
      setText(enhancedText);
      saveToHistory(enhancedText);
    } catch (error) {
      console.error('Text enhancement error:', error);
      Alert.alert('Error', 'Failed to enhance text.');
    }
  };

  // Save to conversation history
  const saveToHistory = (newText) => {
    if (newText && !history.includes(newText)) {
      setHistory([newText, ...history.slice(0, 4)]);
    }
  };

  // Insert quick phrase
  const insertQuickPhrase = (phrase) => {
    setText(phrase);
    Haptics.selectionAsync();
    animateButton();
    saveToHistory(phrase);
  };

  // Clear text
  const clearText = () => {
    setText('');
    Haptics.selectionAsync();
    animateButton();
  };

  // Toggle language dropdown
  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
    Haptics.selectionAsync();
    animateButton();
  };

  const adjustFontSize = (increment) => {
    setFontSize((prev) => Math.max(16, Math.min(30, prev + increment)));
  };

  return (
    <View style={styles.container}>
      {/* Hidden WebView for Web Speech API */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: WEB_SPEECH_HTML }}
          onMessage={handleWebViewMessage}
          style={{ flex: 1 }}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>

      {/* Text Box with Gradient Border */}
      <LinearGradient
        colors={['#007AFF', '#6B73FF']}
        style={styles.textInputContainer}
      >
       <TextInput
          style={[styles.textInput, { fontSize }]}
          value={text}
          onChangeText={setText}
          placeholder="Type or listen to text..."
          placeholderTextColor="#888"
          multiline
          accessibilityLabel="Text input for speech or typing"
        />
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearText}
          accessibilityLabel="Clear text"
        >
          <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.accessibilityOptions}>
        <TouchableOpacity onPress={() => adjustFontSize(-2)}>
          <Text style={styles.accessibilityButton}>Font -</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => adjustFontSize(2)}>
          <Text style={styles.accessibilityButton}>Font +</Text>
        </TouchableOpacity>
      </View>
      {/* Language Selection
      <TouchableOpacity
        style={styles.languageButton}
        onPress={toggleLanguageDropdown}
      >
        <Text style={styles.languageButtonText}>
          {languages.find((lang) => lang.code === selectedLanguage)?.label ||
            'Select Language'}
        </Text>
        <Ionicons
          name={showLanguageDropdown ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
      {showLanguageDropdown && (
        <View style={styles.languageDropdown}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={styles.languageOption}
              onPress={() => {
                setSelectedLanguage(lang.code);
                setShowLanguageDropdown(false);
                Haptics.selectionAsync();
              }}
            >
              <Text style={styles.languageOptionText}>{lang.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )} */}

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

      {/* Conversation History */}
      {/* <View style={styles.historyContainer}>
        {history.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.historyItem}
            onPress={() => {
              setText(item);
              Haptics.selectionAsync();
            }}
          >
            <Text style={styles.historyText}>
              {item.length > 20 ? `${item.slice(0, 17)}...` : item}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}

      {/* Buttons at Bottom */}
      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.button, isListening ? styles.stopButton : styles.listenButton]}
            onPress={isListening ? stopListening : startListening}
            accessibilityLabel={isListening ? 'Stop listening' : 'Start listening'}
          >
            <LinearGradient
              colors={isListening ? ['#FF5252', '#FF8A80'] : ['#007AFF', '#6B73FF']}
              style={styles.buttonGradient}
            >
              <Ionicons
                name={isListening ? 'stop-outline' : 'mic-outline'}
                size={40}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.button, isSpeaking ? styles.stopButton : styles.speakButton]}
            onPress={handleSpeak}
            accessibilityLabel={isSpeaking ? 'Stop speaking' : 'Speak text'}
          >
            <LinearGradient
              colors={isSpeaking ? ['#FF5252', '#FF8A80'] : ['#4CAF50', '#81C784']}
              style={styles.buttonGradient}
            >
              <Ionicons
                name={isSpeaking ? 'stop-outline' : 'volume-medium-outline'}
                size={46}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.button, styles.enhanceButton]}
            onPress={enhanceText}
            accessibilityLabel="Enhance text"
          >
            <LinearGradient
              colors={['#FF6F61', '#FF9A76']}
              style={styles.buttonGradient}
            >
              <Ionicons name="sparkles-outline" size={38} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  webViewContainer: {
    height: 0,
    width: 0,
    position: 'absolute',
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
  textInputContainer: {
    borderRadius: 12,
    padding: 2,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  textInput: {
    flex: 0,
    height: 310, // Increased height for bigger text box
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    fontSize: 20, // Larger font size
    color: '#333',
    textAlignVertical: 'top',
    elevation: 2,
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 5,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  languageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  languageDropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 10,
    padding: 5,
  },
  languageOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
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
  historyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  historyItem: {
    backgroundColor: '#E8F0FE',
    padding: 8,
    borderRadius: 8,
    margin: 5,
    elevation: 2,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  button: {
    width: 90,
    height: 90,
    borderRadius: 50,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  listenButton: {},
  speakButton: {},
  enhanceButton: {},
  stopButton: {},
  buttonGradient: {
    flex: 1,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});

export default DeafAndMuteAssistantScreen;