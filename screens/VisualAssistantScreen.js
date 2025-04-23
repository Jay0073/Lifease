import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import * as Speech from "expo-speech";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Config from "react-native-config";

const { height: screenHeight } = Dimensions.get("window");
const padding = 16;

// Initialize the Google Generative AI client (secure API key in production)
const genAI = new GoogleGenerativeAI("AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw"); // Replace with env variable in production

const VisualAssistantScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const cameraRef = useRef(null);
  const lastTap = useRef(null);

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const micStatus = await Audio.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === "granted");
      setHasMicrophonePermission(micStatus.status === "granted");

      if (cameraStatus.status !== "granted" || micStatus.status !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Camera and microphone permissions are needed to use this feature.",
          [{ text: "OK" }]
        );
      }

      // Check TTS availability
      const voices = await Speech.getAvailableVoicesAsync();
      if (!voices || voices.length === 0) {
        Alert.alert(
          "Text-to-Speech Unavailable",
          "Please ensure a text-to-speech engine (e.g., Google Text-to-Speech) is installed and enabled.",
          [{ text: "OK" }]
        );
      }
    })();
  }, []);

  const callGeminiAPI = async (audioUri) => {
    setIsProcessing(true);
    try {
      if (!audioUri) {
        throw new Error("Audio URI is invalid.");
      }

      // Fetch audio blob
      const audioResponse = await fetch(audioUri);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
      }
      const audioBlob = await audioResponse.blob();

      // Convert audio to base64
      const audioBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(audioBlob);
      });

      // Prepare audio part
      const audioPart = {
        inlineData: {
          data: audioBase64,
          mimeType: "audio/m4a",
        },
      };

      // Prepare image part (if available)
      let imagePart = null;
      if (capturedImageUri) {
        const imageResponse = await fetch(capturedImageUri);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        const imageBlob = await imageResponse.blob();

        const imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(",")[1]);
          reader.readAsDataURL(imageBlob);
        });

        imagePart = {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg",
          },
        };
      }

      // Prepare conversation parts
      const parts = imagePart ? [imagePart, audioPart] : [audioPart];

      // Initialize the model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Create conversational prompt
      const prompt = `
  You are a vision assistant for blind users. Converse based on the user's audio input. 
  If an image is provided, briefly describe relevant objects, people, text, or obstacles. 
  Use short, simple, accurate sentences in plain language, avoiding emojis or abbreviations like "ok". 
  Keep a friendly tone and follow the conversation history:
  ${conversationHistory
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n")}
`;

      // Generate content
      const result = await model.generateContent([prompt, ...parts]);

      // Extract the text response
      const reply = result.response.text()?.trim();
      console.log("Gemini says:", reply);

      if (reply) {
        // Update conversation history
        setConversationHistory((prev) => [
          ...prev,
          { role: "user", content: "Audio input" }, // Placeholder for audio transcription
          { role: "assistant", content: reply },
        ]);

        // Platform-specific speech handling
        if (Platform.OS === "web" && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(reply);
          window.speechSynthesis.speak(utterance);
        } else {
          await new Promise((resolve, reject) => {
            Speech.speak(reply, {
              onDone: () => resolve(),
              onError: (error) => {
                console.error("Speech error:", error);
                reject(new Error("Failed to play AI response."));
              },
            });
          });
        }
      } else {
        throw new Error("No valid response received from the AI.");
      }
    } catch (error) {
      console.error("Error processing audio + image:", error);
      Alert.alert(
        "Error",
        error.message || "Something went wrong while processing your request.",
        [{ text: "OK" }]
      );
      // Attempt to speak error message
      try {
        if (Platform.OS === "web" && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance("Something went wrong.");
          window.speechSynthesis.speak(utterance);
        } else {
          await new Promise((resolve, reject) => {
            Speech.speak("Something went wrong.", {
              onDone: () => resolve(),
              onError: (err) => reject(err),
            });
          });
        }
      } catch (speechError) {
        console.error("Failed to speak error message:", speechError);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    if (!hasMicrophonePermission) {
      Alert.alert("Permission Denied", "Microphone access is required.");
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Error", "Failed to start recording.");
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      console.error("No recording in progress.");
      return;
    }
    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) {
        throw new Error("Recording URI is invalid.");
      }
      await callGeminiAPI(uri);
    } catch (err) {
      console.error("Failed to stop recording:", err);
      Alert.alert("Error", "Failed to process recording. Please try again.");
    } finally {
      setRecording(null);
    }
  };

  const handleCameraDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      if (!hasCameraPermission) {
        Alert.alert("Permission Denied", "Camera access is required.");
        return;
      }
      setIsCameraOpen(true);
    }
    lastTap.current = now;
  };

  const takePicture = async () => {
    if (!cameraRef.current) {
      console.error("Camera is not ready.");
      Alert.alert("Error", "Camera is not ready.");
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setCapturedImageUri(photo.uri);
      setIsCameraOpen(false);
    } catch (err) {
      console.error("Failed to take picture:", err);
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  };

  const clearImage = () => {
    setCapturedImageUri(null);
  };

  // Render loading state while permissions are being checked
  if (hasCameraPermission === null || hasMicrophonePermission === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text>Loading permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Camera Section */}
        {isCameraOpen ? (
          Platform.OS === "web" ? (
            <View style={styles.cameraSection}>
              <Text>Camera not supported on web</Text>
            </View>
          ) : hasCameraPermission ? (
            <Camera style={styles.cameraSection} ref={cameraRef} ratio="16:9">
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsCameraOpen(false)}
                >
                  <Ionicons name="close" size={30} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shutterButton}
                  onPress={takePicture}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#2c3e50" />
                  ) : (
                    <View style={styles.shutterInner} />
                  )}
                </TouchableOpacity>
              </View>
            </Camera>
          ) : (
            <View style={styles.cameraContent}>
              <Text style={styles.cameraText}>
                Camera permissions are required to use this feature.
              </Text>
            </View>
          )
        ) : (
          <TouchableOpacity
            style={styles.cameraSection}
            onPress={handleCameraDoubleTap}
            activeOpacity={0.8}
          >
            {capturedImageUri ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: capturedImageUri }}
                  style={styles.capturedImage}
                />
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearImage}
                >
                  <Ionicons name="trash-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraContent}>
                <Ionicons name="camera-outline" size={80} color="#2c3e50" />
                <Text style={styles.cameraText}>
                  Double-tap to capture{"\n"}or describe surroundings
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsBar}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log("Last Image button pressed")}
          >
            <Ionicons name="image-outline" size={30} color="#2c3e50" />
            <Text style={styles.actionButtonText}>Last Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log("Location button pressed")}
          >
            <Ionicons name="location-outline" size={30} color="#2c3e50" />
            <Text style={styles.actionButtonText}>Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log("Read Text button pressed")}
          >
            <Ionicons name="document-text-outline" size={30} color="#2c3e50" />
            <Text style={styles.actionButtonText}>Read Text</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Assistant */}
        <TouchableOpacity
          style={[
            styles.voiceAssistantSection,
            isRecording && styles.recordingActive,
          ]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isProcessing}
        >
          <View style={styles.voiceAssistantContent}>
            {isProcessing ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={isRecording ? "mic" : "mic-outline"}
                  size={50}
                  color="#fff"
                />
                <Text style={styles.voiceAssistantText}>
                  {isRecording
                    ? "Recording..."
                    : "Hold to Talk with Assistant"}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    padding: padding,
    justifyContent: "space-between",
  },
  cameraSection: {
    height: screenHeight * 0.58,
    backgroundColor: "#ecf0f1",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: padding,
    overflow: "hidden",
  },
  cameraContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  cameraText: {
    fontSize: 18,
    color: "#34495e",
    textAlign: "center",
    marginTop: 10,
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
  },
  capturedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  clearButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  cameraControls: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  cancelButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#2c3e50",
  },
  shutterInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ff3b30",
  },
  quickActionsBar: {
    height: 90,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: padding,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingHorizontal: padding,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#34495e",
    marginTop: 5,
    fontWeight: "bold",
  },
  voiceAssistantSection: {
    height: 120,
    backgroundColor: "#3498db",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  recordingActive: {
    backgroundColor: "#e74c3c",
  },
  voiceAssistantContent: {
    alignItems: "center",
  },
  voiceAssistantText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 8,
  },
});

export default VisualAssistantScreen;