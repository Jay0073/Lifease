import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';

const DeafMuteAssistantScreen = () => {
  const [textDisplay, setTextDisplay] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [quickPhrases, setQuickPhrases] = useState([]);
  const [fontSize, setFontSize] = useState(20);

  const API_KEY = 'AIzaSyDUMx_QeHw5mcovnOPmArVz-7VutmSzyh0'; 
  const API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

  useEffect(() => {
    const fetchData = async () => {
      setQuickPhrases(['Yes', 'No', 'Thank you', 'Please', 'Help']);
      setConversationHistory([]);
    };

    fetchData();

    // Voice event listeners
    Voice.onSpeechStart = () => {
      setTextDisplay('Listening...');
    };
    Voice.onSpeechResults = (event) => {
      const text = event.value[0];
      setTextDisplay(text);
    };
    Voice.onSpeechEnd = () => {
      setIsListening(false);
      saveConversation(textDisplay);
      Vibration.vibrate(500);
    };
    Voice.onSpeechError = (error) => {
      console.error('Speech error:', error);
      setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const saveConversation = async (newEntry) => {
    const updatedHistory = [...conversationHistory, newEntry];
    setConversationHistory(updatedHistory);
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start('en-US');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Voice start error:', error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Voice stop error:', error);
    }
  };

  const handleReply = () => {
    setIsTyping(true);
    setTextDisplay('');
  };

  const convertTextToSpeech = async (text) => {
    try {
      const response = await axios.post(API_URL, {
        input: { text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        audioConfig: { audioEncoding: 'MP3' },
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      const audioContent = response.data.audioContent;
      const audioBuffer = Buffer.from(audioContent, 'base64');
      const audioUri = URL.createObjectURL(new Blob([audioBuffer]));

      Speech.speak(text, {
        language: 'en',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });

    } catch (error) {
      console.error("Error with Google Cloud Text-to-Speech API:", error);
    }
  };

  const handleSpeak = () => {
    if (typedMessage) {
      convertTextToSpeech(typedMessage); // Use Google Cloud TTS
      saveConversation(`User: ${typedMessage}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsTyping(false);
      setTypedMessage('');
      setTextDisplay('Message sent.');
    }
  };

  const insertQuickPhrase = (phrase) => {
    setTypedMessage(phrase);
    setTextDisplay(phrase);
  };

  const adjustFontSize = (increment) => {
    setFontSize((prev) => Math.max(16, Math.min(30, prev + increment)));
  };

  return (
    <View style={styles.container}>
      {!conversationHistory.length && (
        <Text style={styles.onboardingText}>
          Press "Listen" to hear others, type your reply, then press "Speak".
        </Text>
      )}

      <TextInput
        style={[styles.textDisplay, { fontSize }]}
        value={textDisplay}
        onChangeText={setTextDisplay}
        placeholder={isTyping ? "Type your message..." : "Waiting for speech..."}
        placeholderTextColor="#888"
        multiline
        editable={isTyping || !isListening}
        accessibilityLabel="Conversation display"
      />

      <View style={styles.accessibilityOptions}>
        <TouchableOpacity onPress={() => adjustFontSize(-2)}>
          <Text style={styles.accessibilityButton}>Font -</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => adjustFontSize(2)}>
          <Text style={styles.accessibilityButton}>Font +</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickPhrases}>
        {quickPhrases.map((phrase, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickPhraseButton}
            onPress={() => insertQuickPhrase(phrase)}
            accessibilityLabel={`Quick phrase: ${phrase}`}
          >
            <Text style={styles.quickPhraseText}>{phrase}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        {!isTyping && !isListening && (
          <TouchableOpacity style={styles.listenButton} onPress={startListening} accessibilityLabel="Listen to speech">
            <Text style={styles.buttonText}>Listen</Text>
          </TouchableOpacity>
        )}

        {!isTyping && isListening && (
          <TouchableOpacity style={styles.replyButton} onPress={stopListening} accessibilityLabel="Stop listening">
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        )}

        {!isTyping && !isListening && textDisplay && (
          <TouchableOpacity style={styles.replyButton} onPress={handleReply} accessibilityLabel="Reply to message">
            <Text style={styles.buttonText}>Reply</Text>
          </TouchableOpacity>
        )}

        {isTyping && (
          <TouchableOpacity style={styles.speakButton} onPress={handleSpeak} accessibilityLabel="Speak message">
            <Text style={styles.buttonText}>Speak</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  onboardingText: { fontSize: 16, color: '#1E88E5', textAlign: 'center', marginBottom: 10 },
  textDisplay: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    borderColor: '#1E88E5',
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    color: '#000000',
    textAlignVertical: 'top',
  },
  accessibilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  accessibilityButton: {
    fontSize: 16,
    color: '#1E88E5',
    padding: 10,
    backgroundColor: '#BBDEFB',
    borderRadius: 5,
  },
  quickPhrases: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quickPhraseButton: {
    backgroundColor: '#1E88E5',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  quickPhraseText: { color: '#FFFFFF', fontSize: 16 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  listenButton: {
    backgroundColor: '#1E88E5',
    padding: 15,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  replyButton: {
    backgroundColor: '#FFCA28',
    padding: 15,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  speakButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' },
});

export default DeafMuteAssistantScreen;
