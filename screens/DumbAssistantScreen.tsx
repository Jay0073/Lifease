import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { GoogleGenerativeAI } from '@google/generative-ai';

const padding = 16;

// TODO: Move API key to a secure backend (e.g., Firebase, Node.js) to prevent exposure in production.
const API_KEY = 'AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

type Message = {
  text: string;
  sender: 'user' | 'ai' | 'transcribed';
  timestamp: Date;
  steps?: string[];
};

type Reminder = {
  id: string;
  task: string;
  time: string;
  isComplete: boolean;
};

// Simplification dictionary
const simplifyDictionary: { [key: string]: string } = {
  proceed: 'go',
  assistance: 'help',
  nearby: 'close',
  specify: 'say',
  configure: 'set up',
  location: 'place',
};

// Predictive suggestions
const predictiveSuggestions = [
  'hello',
  'help',
  'thank you',
  'where is',
  'set reminder',
  'goodbye',
  'bathroom',
  'doctor',
];

const DumbAssistantScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [assistantStatus, setAssistantStatus] = useState('Ready');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [predictiveText, setPredictiveText] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Predictive text
  useEffect(() => {
    if (!predictiveText || !inputText.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = predictiveSuggestions
      .filter((s) => s.toLowerCase().startsWith(inputText.toLowerCase()))
      .slice(0, 3);
    setSuggestions(filtered);
  }, [inputText, predictiveText]);

  // Reminder alerts
  useEffect(() => {
    const interval = setInterval(() => {
      reminders.forEach((reminder) => {
        if (reminder.isComplete) return;
        const now = new Date();
        const reminderTime = new Date(now.toDateString() + ' ' + reminder.time);
        if (now >= reminderTime) {
          Speech.speak(`Time to ${reminder.task}`, { rate: voiceSpeed });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setAssistantStatus(`Reminder: ${reminder.task}`);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [reminders, voiceSpeed]);

  // Speak text
  const speakText = (text: string) => {
    if (!text.trim()) {
      setAssistantStatus('Nothing to speak');
      return;
    }
    setIsSpeaking(true);
    setAssistantStatus('Speaking...');
    Speech.speak(text, {
      rate: voiceSpeed,
      onDone: () => {
        setIsSpeaking(false);
        setAssistantStatus(isLoading ? 'Thinking...' : 'Ready');
      },
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Simplify text
  const simplifyText = (text: string): string => {
    let simplified = text.toLowerCase();
    Object.keys(simplifyDictionary).forEach((key) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      simplified = simplified.replace(regex, simplifyDictionary[key]);
    });
    return simplified.replace(/[^\w\s.!?]/g, '').substring(0, 100);
  };

  // Call Google Generative AI
  const askGeminiAI = async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setAssistantStatus('Thinking...');
    const newUserMessage: Message = { text: text.trim(), sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, newUserMessage]);

    // Handle reminders
    if (text.toLowerCase().includes('remind me')) {
      const timeMatch = text.match(/\d{1,2}(:\d{2})?\s*(am|pm)/i);
      const task = text.replace(/remind me to/i, '').replace(timeMatch?.[0] || '', '').trim();
      if (timeMatch && task) {
        const reminder: Reminder = {
          id: Date.now().toString(),
          task,
          time: timeMatch[0],
          isComplete: false,
        };
        setReminders((prev) => [...prev, reminder]);
      }
    }

    try {
      const result = await model.generateContent(text);
      const aiText = result.response.text();
      // Split into steps if the response contains numbered or bulleted lists
      const steps = aiText.match(/(\d+\.\s[^\n]+|-\s[^\n]+)/g)?.map((s) => s.trim());
      const newAiMessage: Message = { text: aiText, sender: 'ai', timestamp: new Date(), steps };
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Gemini AI error:', error);
      const errorMessage = 'Sorry, I could not process that. Please try again.';
      const newAiMessage: Message = { text: errorMessage, sender: 'ai', timestamp: new Date() };
      setMessages((prev) => [...prev, newAiMessage]);
      speakText(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Speaker button
  const handleSpeakButtonPress = () => {
    speakText(inputText);
    askGeminiAI(inputText);
    setInputText('');
    setSuggestions([]);
  };

  // Mic button (STT placeholder)
  const handleMicButtonPress = () => {
    setAssistantStatus('Listening...');
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('STT placeholder: Initiating speech recognition...');
    // TODO: Integrate react-native-voice for real STT
    // Example integration:
    // import Voice from 'react-native-voice';
    // Voice.onSpeechResults = (e) => {
    //   const text = e.value[0];
    //   const newMessage: Message = { text, sender: 'transcribed', timestamp: new Date() };
    //   setMessages((prev) => [...prev, newMessage]);
    //   setAssistantStatus('Ready');
    //   setIsLoading(false);
    // };
    // await Voice.start('en-US');
    // Mock transcription for testing
    const mockTranscriptions = [
      'The store is two blocks away.',
      'The bus leaves in 10 minutes.',
      'Can you come back later?',
      'The menu is on the table.',
    ];
    setTimeout(() => {
      const randomTranscription =
        mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      const newMessage: Message = {
        text: randomTranscription,
        sender: 'transcribed',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setAssistantStatus('Ready');
      setIsLoading(false);
    }, 2000);
  };

  // Predictive suggestion
  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
    setSuggestions([]);
  };

  // Quick phrase
  const handleQuickPhrase = (phrase: string) => {
    speakText(phrase);
    askGeminiAI(phrase);
  };

  // Reminder actions
  const handleCompleteReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isComplete: true } : r))
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} ref={scrollViewRef}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerText, { fontSize: fontSize + 4 }]}>
                Lifeeasy Assistant
              </Text>
              <TouchableOpacity
                onPress={() => setShowSettings(true)}
                accessibilityLabel="Open settings"
                accessibilityRole="button"
              >
                <Ionicons name="settings-outline" size={24} color="#3498db" />
              </TouchableOpacity>
            </View>

            {/* Status Bar */}
            <View style={styles.statusContainer}>
              <Text
                style={[styles.assistantStatusText, { fontSize }]}
                accessibilityLiveRegion="polite"
              >
                {assistantStatus}
              </Text>
              {isLoading && <ActivityIndicator size="small" color="#3498db" />}
            </View>

            {/* Conversation Area */}
            <View style={styles.conversationHistory}>
              {messages.length === 0 ? (
                <Text style={[styles.initialMessage, { fontSize }]}>
                  Type to speak or listen to someone!kkkkkkkkkkkk
                </Text>
              ) : (
                messages.map((message, index) => (
                  <View
                    key={index}
                    style={[
                      styles.messageBubble,
                      message.sender === 'user'
                        ? styles.userMessageBubble
                        : message.sender === 'transcribed'
                        ? styles.transcribedMessageBubble
                        : styles.aiMessageBubble,
                    ]}
                    accessibilityLabel={`${message.sender} says: ${message.text}`}
                  >
                    {message.steps && !compactMode ? (
                      <View>
                        <Text style={[styles.messageText, { fontSize }]}>Steps:</Text>
                        {message.steps.map((step, i) => (
                          <Text
                            key={i}
                            style={[styles.messageText, { fontSize, marginLeft: 10 }]}
                          >
                            {step}
                          </Text>
                        ))}
                        <TouchableOpacity
                          onPress={() =>
                            setMessages((prev) =>
                              prev.map((m, i) =>
                                i === index ? { ...m, steps: undefined } : m
                              )
                            )
                          }
                          accessibilityLabel="Show full text"
                        >
                          <Text style={[styles.toggleText, { fontSize }]}>Show Full Text</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View>
                        <Text style={[styles.messageText, { fontSize }]}>
                          {message.text}
                        </Text>
                        {(message.sender === 'ai' || message.sender === 'transcribed') &&
                          !compactMode && (
                            <TouchableOpacity
                              onPress={() =>
                                setMessages((prev) =>
                                  prev.map((m, i) =>
                                    i === index
                                      ? { ...m, text: simplifyText(m.text) }
                                      : m
                                  )
                                )
                              }
                              accessibilityLabel="Simplify text"
                            >
                              <Text style={[styles.toggleText, { fontSize }]}>Simplify</Text>
                            </TouchableOpacity>
                          )}
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>

            {/* Reminders */}
            {!compactMode && reminders.length > 0 && (
              <View style={styles.remindersContainer}>
                <Text style={[styles.remindersTitle, { fontSize: fontSize + 2 }]}>
                  Reminders
                </Text>
                {reminders.map((reminder) => (
                  <View key={reminder.id} style={styles.reminderItem}>
                    <Text
                      style={[
                        styles.reminderText,
                        { fontSize, textDecorationLine: reminder.isComplete ? 'line-through' : 'none' },
                      ]}
                    >
                      {reminder.task} at {reminder.time}
                    </Text>
                    <View style={styles.reminderActions}>
                      {!reminder.isComplete && (
                        <TouchableOpacity
                          onPress={() => handleCompleteReminder(reminder.id)}
                          accessibilityLabel="Mark reminder complete"
                        >
                          <Ionicons name="checkmark-circle-outline" size={24} color="#3498db" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeleteReminder(reminder.id)}
                        accessibilityLabel="Delete reminder"
                      >
                        <Ionicons name="trash-outline" size={24} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Quick Phrases */}
              {!compactMode && (
                <View style={styles.quickPhrasesContainer}>
                <View style={styles.quickPhrasesRow}>
                  <TouchableOpacity
                  style={[styles.quickPhraseButton, { backgroundColor: '#2ecc71' }]}
                  onPress={handleMicButtonPress}
                  accessibilityLabel="Start listening"
                  accessibilityRole="button"
                  >
                  <Ionicons name="mic-outline" size={24} color="#fff" />
                  <Text style={[styles.quickPhraseText, { fontSize: fontSize - 2, color: '#fff' }]}>
                    Mic
                  </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                  style={[styles.quickPhraseButton, { backgroundColor: '#e74c3c' }]}
                  onPress={handleSpeakButtonPress}
                  accessibilityLabel="Start speaking"
                  accessibilityRole="button"
                  >
                  <Ionicons name="volume-high-outline" size={24} color="#fff" />
                  <Text style={[styles.quickPhraseText, { fontSize: fontSize - 2, color: '#fff' }]}>
                    Speaker
                  </Text>
                  </TouchableOpacity>
                </View>
                </View>
              )}

            {/* Predictive Text */}
            {predictiveText && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionButton}
                    onPress={() => handleSuggestionPress(suggestion)}
                    accessibilityLabel={`Suggestion: ${suggestion}`}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.suggestionText, { fontSize }]}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Input Area */}
            <View style={styles.inputAreaContainer}>
              <TextInput
                style={[styles.inputAreaTextInput, { fontSize }]}
                placeholder="Type to speak..."
                placeholderTextColor="#7f8c8d"
                value={inputText}
                onChangeText={setInputText}
                multiline
                returnKeyType="done"
                blurOnSubmit={false}
                accessibilityLabel="Type message to speak"
                accessibilityRole="text"
              />
              <TouchableOpacity
                style={styles.micButton}
                onPress={handleMicButtonPress}
                disabled={isLoading}
                accessibilityLabel="Listen to someone"
                accessibilityRole="button"
              >
                <Ionicons
                  name="mic-outline"
                  size={28}
                  color={isLoading ? '#bdc3c7' : '#3498db'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.speakButton}
                onPress={handleSpeakButtonPress}
                disabled={!inputText.trim() || isSpeaking || isLoading}
                accessibilityLabel="Speak typed message"
                accessibilityRole="button"
              >
                <Ionicons
                  name="volume-high-outline"
                  size={28}
                  color={!inputText.trim() || isSpeaking || isLoading ? '#bdc3c7' : '#3498db'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Settings Modal */}
        <Modal visible={showSettings} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { fontSize: fontSize + 4 }]}>Settings</Text>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { fontSize }]}>Font Size</Text>
                <View style={styles.fontSizeButtons}>
                  <TouchableOpacity
                    onPress={() => setFontSize((prev) => Math.max(12, prev - 2))}
                    accessibilityLabel="Decrease font size"
                  >
                    <Ionicons name="remove-circle-outline" size={24} color="#3498db" />
                  </TouchableOpacity>
                  <Text style={[styles.settingValue, { fontSize }]}>{fontSize}</Text>
                  <TouchableOpacity
                    onPress={() => setFontSize((prev) => Math.min(24, prev + 2))}
                    accessibilityLabel="Increase font size"
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#3498db" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { fontSize }]}>Compact Mode</Text>
                <TouchableOpacity
                  onPress={() => setCompactMode(!compactMode)}
                  accessibilityLabel="Toggle compact mode"
                >
                  <Ionicons
                    name={compactMode ? 'checkbox-outline' : 'square-outline'}
                    size={24}
                    color="#3498db"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { fontSize }]}>Predictive Text</Text>
                <TouchableOpacity
                  onPress={() => setPredictiveText(!predictiveText)}
                  accessibilityLabel="Toggle predictive text"
                >
                  <Ionicons
                    name={predictiveText ? 'checkbox-outline' : 'square-outline'}
                    size={24}
                    color="#3498db"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { fontSize }]}>Voice Speed</Text>
                <View style={styles.fontSizeButtons}>
                  <TouchableOpacity
                    onPress={() => setVoiceSpeed((prev) => Math.max(0.5, prev - 0.1))}
                    accessibilityLabel="Decrease voice speed"
                  >
                    <Ionicons name="remove-circle-outline" size={24} color="#3498db" />
                  </TouchableOpacity>
                  <Text style={[styles.settingValue, { fontSize }]}>
                    {voiceSpeed.toFixed(1)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setVoiceSpeed((prev) => Math.min(2.0, prev + 0.1))}
                    accessibilityLabel="Increase voice speed"
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#3498db" />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSettings(false)}
                accessibilityLabel="Close settings"
                accessibilityRole="button"
              >
                <Text style={[styles.closeButtonText, { fontSize }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    justifyContent: 'flex-end',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: padding,
    paddingTop: padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: padding,
  },
  headerText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: padding,
  },
  assistantStatusText: {
    fontWeight: 'bold',
    color: '#555',
  },
  initialMessage: {
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 20,
  },
  conversationHistory: {
    flex: 1,
    marginBottom: padding,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
    maxWidth: '85%',
  },
  userMessageBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    color: '#fff',
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e9e9eb',
    borderWidth: 1,
    borderColor: '#cfd8dc',
    borderBottomLeftRadius: 4,
  },
  transcribedMessageBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#d1ecf1',
    borderWidth: 1,
    borderColor: '#bee5eb',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#000',
  },
  toggleText: {
    color: '#3498db',
    marginTop: 8,
  },
  remindersContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: padding,
    marginBottom: padding,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  remindersTitle: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reminderText: {
    flex: 1,
    color: '#2c3e50',
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickPhrasesContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: padding,
    marginBottom: padding,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickPhrasesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  quickPhraseButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '45%',
    marginVertical: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    minHeight: 60,
  },
  quickPhraseText: {
    color: '#34495e',
    marginTop: 4,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  suggestionButton: {
    backgroundColor: '#ecf0f1',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  suggestionText: {
    color: '#34495e',
  },
  inputAreaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: padding,
  },
  inputAreaTextInput: {
    flex: 1,
    color: '#2c3e50',
    maxHeight: 120,
    minHeight: 60,
    paddingHorizontal: 0,
    textAlignVertical: 'top',
  },
  micButton: {
    padding: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  speakButton: {
    padding: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    color: '#2c3e50',
  },
  settingValue: {
    color: '#2c3e50',
    marginHorizontal: 8,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DumbAssistantScreen;