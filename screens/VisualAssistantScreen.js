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
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import * as Speech from "expo-speech";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";

const { height: screenHeight } = Dimensions.get("window");
const padding = 16;
const ai = new GoogleGenAI({ apiKey: "AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw" });

const VisualAssistantScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const lastTap = useRef(null);
  const tapTimeout = useRef(null);

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
  
      // Upload audio using SDK
      const audioFile = new File([audioBlob], "audio.m4a", {
        type: "audio/m4a",
      });
      const uploadedAudio = await ai.files.upload({
        file: audioFile,
        config: { mimeType: "audio/m4a" },
      });
  
      const parts = [
        createPartFromUri(uploadedAudio.uri, uploadedAudio.mimeType),
      ];
  
      // Optionally add image
      if (capturedImageUri) {
        const imageResponse = await fetch(capturedImageUri);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        const imageBlob = await imageResponse.blob();
  
        const imageFile = new File([imageBlob], "image.jpg", {
          type: "image/jpeg",
        });
  
        const uploadedImage = await ai.files.upload({
          file: imageFile,
          config: { mimeType: "image/jpeg" },
        });
  
        parts.push(createPartFromUri(uploadedImage.uri, uploadedImage.mimeType));
      }
  
      // Add a prompt or message to guide the model
      parts.push("Respond to the audio input");
  
      // Generate response
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", 
        contents: createUserContent(parts),
      });
  
      const replyText = response.text;
      if (!replyText) throw new Error("No response text received");
  
      // Speak the response
      const utterance = new SpeechSynthesisUtterance(replyText);
      speechSynthesis.speak(utterance);
  
    } catch (error) {
      console.error("Error in callGeminiAPI:", error);
      const errorUtterance = new SpeechSynthesisUtterance("An error occurred: " + error.message);
      speechSynthesis.speak(errorUtterance);
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
      if (!uri) throw new Error("Recording URI is invalid.");
      await callGeminiAPI(uri);
    } catch (err) {
      console.error("Failed to stop recording:", err);
      Alert.alert("Error", "Failed to process recording.");
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
      Alert.alert("Error", "Failed to capture image.");
    }
  };

  const clearImage = () => {
    setCapturedImageUri(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Camera View */}
        {isCameraOpen ? (
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
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="image-outline" size={30} color="#2c3e50" />
            <Text style={styles.actionButtonText}>Last Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="location-outline" size={30} color="#2c3e50" />
            <Text style={styles.actionButtonText}>Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text-outline" size={30} color="#2c3e50" />
            <Text style={styles.actionButtonText}>Read Text</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Assistant */}
        <TouchableOpacity
          style={[
            styles.voiceAssistantSection,
            isRecording ? styles.recordingActive : null,
            isRecording
              ? { backgroundColor: "#27ae60" }
              : { backgroundColor: "#3498db" },
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
                  {isRecording ? "Recording..." : "Hold to Talk with Assistant"}
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
