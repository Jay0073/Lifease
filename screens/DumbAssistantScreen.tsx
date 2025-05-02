import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const API_KEY = 'AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw';
const genAI = new GoogleGenerativeAI(API_KEY);

const TextToSpeechScreen = () => {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [history, setHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Greetings');

  const quickPhrases = {
    Greetings: ['Hello', 'Good morning', 'How are you?', 'Goodbye'],
    Needs: ['I need help', 'Water please', 'Bathroom', 'Food'],
    Emotions: ['I am happy', 'I am sad', 'I am tired', 'I am okay'],
  };

  const speakText = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      if (text.trim() !== '') {
        Speech.speak(text, {
          rate: speechRate,
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
        setIsSpeaking(true);
        if (!history.includes(text)) {
          setHistory([text, ...history.slice(0, 4)]);
        }
      } else {
        Alert.alert('No Text', 'Please enter text to speak.');
      }
    }
  };

  const enhanceText = async () => {
    if (text.trim() === '') {
      Alert.alert('No Text', 'Please enter text to enhance.');
      return;
    }

    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: { temperature: 0.2, topK: 1, topP: 1, maxOutputTokens: 400 },
      });

      const prompt = `You are a professional speech writer. Rewrite the following text to make it clear, concise, and professional for speech delivery. Return only the improved text without explanations. Text: "${text.trim()}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = await response.text();

      setText(enhancedText.trim());
      console.log('Enhanced Text:', enhancedText.trim());
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to enhance text.');
    } finally {
      setLoading(false);
    }
  };

  const processImage = async (image) => {
    try {
      setLoading(true);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `Extract text from the provided image and return it as plain text. If no text is found, return "No text detected."`;
      const imageData = {
        inlineData: {
          data: image.base64,
          mimeType: 'image/jpeg',
        },
      };

      const result = await model.generateContent([prompt, imageData]);
      const response = await result.response;
      const extractedText = await response.text();

      setText(extractedText.trim());
      console.log('Extracted Text:', extractedText.trim());
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to process image.');
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required.');
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

  const adjustSpeechRate = (increment) => {
    const newRate = Math.min(Math.max(speechRate + increment, 0.5), 2.0);
    setSpeechRate(newRate);
    Haptics.selectionAsync();
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your text here..."
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.clearButtonOverlay} onPress={() => setText('')}>
          <FontAwesome5 name="trash" size={20} color="#666" />
        </TouchableOpacity>
      </BlurView>

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Recent Phrases</Text>
        <FlatList
          data={history}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.historyChip} onPress={() => setText(item)}>
              <Text style={styles.historyText}>{item.length > 20 ? item.slice(0, 20) + '...' : item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.quickTextContainer}>
        <View style={styles.categorySelector}>
          {Object.keys(quickPhrases).map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, selectedCategory === category && styles.selectedCategoryChip]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.phraseContainer}>
          {quickPhrases[selectedCategory].map((item, index) => (
            <TouchableOpacity key={index} style={styles.quickTextChip} onPress={() => setText(item)}>
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
            <LinearGradient colors={['#FF6F61', '#FF9A76']} style={styles.buttonGradient}>
              <Feather name="edit-2" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.speakButton} onPress={speakText}>
            <LinearGradient
              colors={isSpeaking ? ['#FF5252', '#FF8A80'] : ['#00DDEB', '#6B73FF']}
              style={styles.speakButtonGradient}
            >
              <FontAwesome5 name={isSpeaking ? 'stop' : 'volume-up'} size={36} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton} onPress={openCamera}>
            <LinearGradient colors={['#40C4FF', '#81D4FA']} style={styles.buttonGradient}>
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
    backgroundColor: '#F5F5F5',
  },
  inputContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    minHeight: 350,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  clearButtonOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 6,
    elevation: 2,
    shadowColor: '#000',
  },
  historyContainer: {
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  historyChip: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  quickTextContainer: {
    marginBottom: 16,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  selectedCategoryChip: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  phraseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickTextChip: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    margin: 4,
  },
  quickText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  loader: {
    marginVertical: 16,
  },
  bottomControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    marginTop: 16,
  },
  speakButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    overflow: 'hidden',
    transform: [{ scale: 1 }],
  },
  speakButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  sideButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    overflow: 'hidden',
    transform: [{ scale: 1 }],
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});

export default TextToSpeechScreen;