// TextToSpeechScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import { GoogleGenerativeAI } from "@google/generative-ai";

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
        Alert.alert('No Text', 'Please type something to speak.');
      }
    }
  };

  const enhanceText = async () => {
    if (text.trim() === '') {
      Alert.alert('No Text', 'Please type something to enhance.');
      return;
    }
  
    try {
      setLoading(true);
  
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash", // Updated model name
        generationConfig: {
          temperature: 0.2,
          topK: 1,
          topP: 1,
          maxOutputTokens: 400,
        }
      });
  
      const prompt = `You are a speech writer and communication expert. 
  Rewrite the following text to make it sound clear, natural, and easy to speak out loud.
  Focus on making it simple, smooth, and understandable for listeners, without changing the original meaning.
  Avoid complicated words and long sentences. 
  Speak as if explaining to someone hearing it for the first time.
  
  Here is the text:
  
  "${text.trim()}"`;
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let enhancedText = await response.text();
  
      // ✨ New logic to remove unwanted intro text
      const firstNewlineIndex = enhancedText.indexOf('\n');
      if (firstNewlineIndex !== -1) {
        enhancedText = enhancedText.slice(firstNewlineIndex + 1); // take text after first newline
      }
  
      setText(enhancedText.trim());
      Alert.alert('Success', 'Text has been enhanced!');
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
      Alert.alert('Permission Denied', 'Camera access is needed to open the camera.');
      return;
    }

    await ImagePicker.launchCameraAsync();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type your text here..."
        value={text}
        onChangeText={setText}
        multiline
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      ) : (
        <>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: isSpeaking ? '#F44336' : '#4CAF50' }]}
              onPress={speakText}
            >
              <Text style={styles.buttonText}>
                {isSpeaking ? 'Stop' : 'Speak'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: '#2196F3' }]} onPress={enhanceText}>
              <Text style={styles.buttonText}>Enhance</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#FF5722' }]} onPress={openCamera}>
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    backgroundColor: 'white',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TextToSpeechScreen;
