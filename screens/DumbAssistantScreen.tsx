import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';

const API_KEY = "AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw";
const genAI = new GoogleGenerativeAI(API_KEY);

const TextToSpeechScreen = () => {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const speakText = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      if (text.trim() !== '') {
        Speech.speak(text, {
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
        setIsSpeaking(true);
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
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.2,
          topK: 1,
          topP: 1,
          maxOutputTokens: 400,
        }
      });

      const prompt = `You are a professional speech writer. 
Rewrite the following text to make it clear, concise, and professional for speech delivery. 
Return only the improved text without explanations.

Text: "${text.trim()}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = await response.text();

      setText(enhancedText.trim());
      // Alert.alert('Success', 'Text enhanced successfully.');
      console.log('Enhanced Text:', enhancedText.trim());
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to enhance text.');
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

    await ImagePicker.launchCameraAsync();
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
        <TouchableOpacity
          style={styles.clearButtonOverlay}
          onPress={() => setText('')}
        >
          <FontAwesome5 name="trash" size={20} color="#666" />
        </TouchableOpacity>
      </BlurView>

      <View style={styles.quickTextContainer}>
        {['Hello', 'Good morning', 'How are you?', 'good', 'Thank you'].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickTextChip}
            onPress={() => setText(item)}
          >
            <Text style={styles.quickText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <View style={styles.bottomControl}>
          <TouchableOpacity style={styles.sideButton} onPress={enhanceText}>
            <LinearGradient
              colors={['#FF6F61', '#FF9A76']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="edit-2" size={20} color="#FFFF" />
              {/* <Text style={styles.sideButtonText}>Enhance</Text> */}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.speakButton}
            onPress={speakText}
          >
            <LinearGradient
              colors={isSpeaking ? ['#FF5252', '#FF8A80'] : ['#00DDEB', '#6B73FF']}
              style={styles.speakButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome5 name={isSpeaking ? 'stop' : 'volume-up'} size={40} color="#FFF" />
              {/* <Text style={styles.speakButtonText}>{isSpeaking ? 'Stop' : 'Speak'}</Text> */}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton} onPress={openCamera}>
            <LinearGradient
              colors={['#40C4FF', '#81D4FA']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="photo-camera" size={20} color="#FFF" />
              {/* <Text style={styles.sideButtonText}>Camera</Text> */}
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
    minHeight: 450,
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
  quickTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
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
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16,
  },
  speakButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    overflow: 'hidden',
  },
  speakButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  speakButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  sideButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    overflow: 'hidden',
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 6,
    // borderWidth: 10,
    // borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
 
  },
  sideButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default TextToSpeechScreen;