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
  Button, // Added Button for permission request
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
// Updated expo-camera imports
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Speech from "expo-speech";
import { GoogleGenerativeAI } from "@google/generative-ai";

const { height: screenHeight } = Dimensions.get("window");
const padding = 16;

// Initialize the Google Generative AI client (secure API key in production)
// IMPORTANT: Replace with a secure method like environment variables in production
const genAI = new GoogleGenerativeAI("AIzaSyCtju80slt9-z-Otk1mKSnpoKCfR8jQRUw"); // Replace with your actual API key

const VisualAssistantScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const cameraRef = useRef(null);
  const lastTap = useRef(null);

  // --- New Camera State and Permissions Hook ---
  const [facing, setFacing] = useState < CameraType > ('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  // --- End New Camera State ---

  // Keep microphone permission separate for clarity
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(null);

  useEffect(() => {
    (async () => {
      // Request microphone permissions
      const micStatus = await Audio.requestPermissionsAsync();
      setHasMicrophonePermission(micStatus.status === "granted");

      if (micStatus.status !== "granted") {
        Alert.alert(
          "Microphone Permission Required",
          "Microphone permission is needed to record audio.",
          [{ text: "OK" }]
        );
      }

      // Check TTS availability (remains the same)
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        if (!voices || voices.length === 0) {
          Alert.alert(
            "Text-to-Speech Unavailable",
            "Please ensure a text-to-speech engine (e.g., Google Text-to-Speech) is installed and enabled.",
            [{ text: "OK" }]
          );
        }
      } catch (ttsError) {
         console.error("Error checking TTS voices:", ttsError);
         Alert.alert(
            "TTS Check Failed",
            "Could not check for available text-to-speech voices.",
            [{ text: "OK" }]
         );
      }

    })();
  }, []); // Removed camera permission request from here

  // --- New function to toggle camera ---
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }
  // --- End new function ---

  const callGeminiAPI = async (audioUri) => {
     // --- (This function remains largely the same, ensure YOUR_API_KEY is set above) ---
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
       const audioBase64 = await new Promise((resolve, reject) => { // Added reject
         const reader = new FileReader();
         reader.onerror = reject; // Handle reader errors
         reader.onloadend = () => {
            if (reader.result) {
               resolve(reader.result.split(",")[1]);
            } else {
               reject(new Error("Failed to read audio data."));
            }
         };
         reader.readAsDataURL(audioBlob);
       });

       // Prepare audio part
       const audioPart = {
         inlineData: {
           data: audioBase64,
           mimeType: "audio/m4a", // Ensure this matches your recording format
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

         const imageBase64 = await new Promise((resolve, reject) => { // Added reject
           const reader = new FileReader();
           reader.onerror = reject; // Handle reader errors
           reader.onloadend = () => {
              if (reader.result) {
                 resolve(reader.result.split(",")[1]);
              } else {
                 reject(new Error("Failed to read image data."));
              }
           };
           reader.readAsDataURL(imageBlob);
         });

         imagePart = {
           inlineData: {
             data: imageBase64,
             mimeType: "image/jpeg", // Ensure this matches your camera output
           },
         };
       }

       // Prepare conversation parts
       const parts = imagePart ? [imagePart, audioPart] : [audioPart];

       // Initialize the model
       const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

       // Create conversational prompt (Remains the same)
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
       // Use optional chaining for safer access
       const response = result?.response;
       const reply = response?.text()?.trim();
       console.log("Gemini says:", reply);

       if (reply) {
         // Update conversation history
         setConversationHistory((prev) => [
           ...prev,
           { role: "user", content: "Audio input" }, // Placeholder
           { role: "assistant", content: reply },
         ]);

         // Platform-specific speech handling (Remains the same)
         if (Platform.OS === "web" && window.speechSynthesis) {
           const utterance = new SpeechSynthesisUtterance(reply);
           window.speechSynthesis.speak(utterance);
         } else {
           await new Promise((resolve, reject) => {
             Speech.speak(reply, {
               onDone: resolve,
               onError: (error) => {
                 console.error("Speech error:", error);
                 // Don't reject the outer promise here, just log the error
                 // Maybe alert the user?
                 Alert.alert("Speech Error", "Could not speak the response.");
                 resolve(); // Resolve anyway so processing finishes
               },
             });
           });
         }
       } else {
         // Handle cases where response or text() is missing
         const candidate = response?.candidates?.[0];
         const finishReason = candidate?.finishReason;
         const safetyRatings = candidate?.safetyRatings;

         console.warn("Gemini Response Details:", { finishReason, safetyRatings });

         let errorMessage = "No valid response received from the AI.";
         if (finishReason === 'SAFETY') {
             errorMessage = "The response was blocked due to safety concerns.";
         } else if (finishReason === 'RECITATION') {
             errorMessage = "The response was blocked due to potential recitation issues.";
         } else if (finishReason) {
             errorMessage = `Response generation stopped: ${finishReason}`;
         }

         throw new Error(errorMessage);
       }
     } catch (error) {
       console.error("Error processing audio/image:", error);
       Alert.alert(
         "Error",
         error.message || "Something went wrong while processing your request.",
         [{ text: "OK" }]
       );
       // Attempt to speak error message (remains the same)
       try {
         const errorMsgToSpeak = "Something went wrong.";
         if (Platform.OS === "web" && window.speechSynthesis) {
           const utterance = new SpeechSynthesisUtterance(errorMsgToSpeak);
           window.speechSynthesis.speak(utterance);
         } else {
           await new Promise((resolve) => { // No reject needed here
             Speech.speak(errorMsgToSpeak, {
               onDone: resolve,
               onError: (err) => {
                  console.error("Failed to speak error message:", err);
                  resolve(); // Resolve anyway
               },
             });
           });
         }
       } catch (speechError) {
         console.error("Exception while trying to speak error message:", speechError);
       }
     } finally {
       setIsProcessing(false);
     }
  };


  const startRecording = async () => {
    // Check microphone permission before starting
    if (hasMicrophonePermission === null) {
       Alert.alert("Permissions Pending", "Microphone permission check is in progress.");
       return;
    }
    if (!hasMicrophonePermission) {
      Alert.alert("Permission Denied", "Microphone access is required to record audio.");
      // Optionally, add a button to re-request or guide to settings
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        // Consider adding Android options if needed:
        // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        // playsInSilentModeAndroid: true, // Or false depending on desired behavior
        // staysActiveInBackground: false, // Or true
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
         // Consider a more specific preset or custom options if needed
        Audio.RecordingOptionsPresets.HIGH_QUALITY
        // Example specific options (adjust as needed):
        // {
        //    android: {
        //       extension: '.m4a',
        //       outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        //       audioEncoder: Audio.AndroidAudioEncoder.AAC,
        //       sampleRate: 44100,
        //       numberOfChannels: 1,
        //       bitRate: 128000,
        //    },
        //    ios: {
        //       extension: '.m4a', // or .wav, .caf
        //       outputFormat: Audio.IOSOutputFormat.MPEG4AAC, // Matches .m4a
        //       audioQuality: Audio.IOSAudioQuality.HIGH,
        //       sampleRate: 44100,
        //       numberOfChannels: 1,
        //       bitRate: 128000,
        //       linearPCMBitDepth: 16,
        //       linearPCMIsBigEndian: false,
        //       linearPCMIsFloat: false,
        //    },
        //    web: { // Web recording might need different handling/libraries
        //      mimeType: 'audio/webm',
        //      bitsPerSecond: 128000,
        //    }
        // }
      );

      setRecording(recording);
      setIsRecording(true);
       console.log('Recording started');
    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Error", "Failed to start recording.");
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      // This can happen if onPressOut triggers before recording starts or after stop
      console.log("Stop recording called but no recording object exists.");
      return;
    }
     console.log('Stopping recording..');
    setIsRecording(false); // Set state first

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
       console.log('Recording stopped and stored at', uri);
      if (!uri) {
        throw new Error("Recording URI is invalid after stopping.");
      }
      // Reset recording state *before* calling API
      setRecording(null);
      await callGeminiAPI(uri);
    } catch (err) {
      console.error("Failed to stop or process recording:", err);
      Alert.alert("Error", "Failed to process recording. Please try again.");
      // Ensure recording state is reset even on error
      setRecording(null);
    }
    // No finally block needed as setRecording(null) is handled in try/catch
  };


  const handleCameraDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // Milliseconds

    // Check camera permission before opening
    if (!cameraPermission?.granted) {
       Alert.alert(
          "Camera Permission Required",
          "Camera access is needed to take pictures. Please grant permission.",
          // Add button to request again if status allows
          cameraPermission?.canAskAgain ? [{ text: "Grant Permission", onPress: requestCameraPermission }] : [{ text: "OK" }]
       );
       return;
    }

    if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
      console.log("Double tap detected, opening camera.");
      setIsCameraOpen(true);
      lastTap.current = null; // Reset tap detection
    } else {
       console.log("Single tap detected.");
      lastTap.current = now;
    }
  };


  const takePicture = async () => {
    if (!cameraRef.current) {
      console.error("Camera ref is not available.");
      Alert.alert("Error", "Camera is not ready.");
      return;
    }
     console.log("Taking picture...");
    setIsProcessing(true); // Indicate processing starts

    try {
      const photo = await cameraRef.current.takePictureAsync({
         quality: 0.8, // Keep quality setting
         // base64: false, // Default is false, no need to include usually
         // exif: false, // Set true if you need EXIF data
      });
      console.log("Picture taken:", photo.uri);
      setCapturedImageUri(photo.uri);
      setIsCameraOpen(false); // Close camera after taking picture
    } catch (err) {
      console.error("Failed to take picture:", err);
      Alert.alert("Error", "Failed to capture image. Please try again.");
      // Consider closing camera even on error?
      // setIsCameraOpen(false);
    } finally {
      setIsProcessing(false); // Ensure processing indicator stops
    }
  };

  const clearImage = () => {
    setCapturedImageUri(null);
  };

  // --- Render loading state while permissions are loading ---
  if (!cameraPermission || hasMicrophonePermission === null) {
    // Still waiting for either permission hook to initialize or mic check to complete
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Loading Permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Render permission denied state for Camera ---
  if (!cameraPermission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
          <View style={styles.permissionDeniedContainer}>
            <Ionicons name="camera-reverse-outline" size={60} color="#e74c3c" />
            <Text style={styles.permissionText}>Camera permission is required to take pictures.</Text>
            <Text style={styles.permissionSubText}>Double-tapping the top section uses the camera.</Text>
            {cameraPermission.canAskAgain && (
              <Button onPress={requestCameraPermission} title="Grant Camera Permission" />
            )}
             {!cameraPermission.canAskAgain && (
              <Text style={styles.permissionSubText}>Please enable camera permissions in your device settings.</Text>
            )}
             {/* Add similar check/button for microphone if needed */}
             {/* {!hasMicrophonePermission && ( ... )} */}
          </View>
      </SafeAreaView>
    );
  }

  // --- Main Render ---
  // Now we know camera permission is granted, microphone status is known (granted or not)
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Camera Section */}
        {isCameraOpen ? (
          // Use CameraView when open
          <CameraView
             style={styles.cameraSection} // Use existing style
             facing={facing} // Use state for facing direction
             ref={cameraRef} // Keep the ref
          >
            <View style={styles.cameraOverlay}>
              {/* Top Controls: Close and Flip */}
              <View style={styles.cameraTopControls}>
                 <TouchableOpacity
                    style={styles.cameraActionButton} // Re-use style
                    onPress={() => setIsCameraOpen(false)}
                 >
                   <Ionicons name="close" size={30} color="#fff" />
                 </TouchableOpacity>
                 <TouchableOpacity
                    style={styles.cameraActionButton} // Re-use style
                    onPress={toggleCameraFacing} // Use new function
                 >
                   <Ionicons name="camera-reverse-outline" size={30} color="#fff" />
                 </TouchableOpacity>
              </View>

              {/* Bottom Controls: Shutter */}
              <View style={styles.cameraBottomControls}>
                <TouchableOpacity
                  style={styles.shutterButton}
                  onPress={takePicture}
                  disabled={isProcessing} // Keep disabled state
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#2c3e50" />
                  ) : (
                    <View style={styles.shutterInner} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        ) : (
          // Show placeholder or captured image when camera is closed
          <TouchableOpacity
            style={styles.cameraSection} // Keep existing style
            onPress={handleCameraDoubleTap} // Keep double tap logic
            activeOpacity={0.8}
          >
            {capturedImageUri ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: capturedImageUri }}
                  style={styles.capturedImage}
                  resizeMode="cover" // Ensure image covers the area
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
                 {/* Optional: Add hint about permissions if needed */}
                 {!cameraPermission.granted && (
                    <Text style={[styles.cameraText, {color: 'red', marginTop: 5}]}>Camera Permission needed</Text>
                 )}
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Quick Actions (Remains the same) */}
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

        {/* Voice Assistant (Remains the same) */}
        {/* Ensure microphone permission is checked before enabling */}
        <TouchableOpacity
          style={[
            styles.voiceAssistantSection,
            isRecording && styles.recordingActive,
            // Optionally dim or change style if mic permission denied
            !hasMicrophonePermission && styles.micDisabled,
          ]}
          // Only allow recording if permission granted and not already processing
          onPressIn={hasMicrophonePermission && !isProcessing ? startRecording : null}
          onPressOut={isRecording ? stopRecording : null} // Only stop if actually recording
          disabled={isProcessing || !hasMicrophonePermission} // Disable if processing or no mic perm
          activeOpacity={0.7} // Standard opacity when active
        >
          <View style={styles.voiceAssistantContent}>
            {isProcessing ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={isRecording ? "mic" : "mic-outline"}
                  size={50}
                  color={hasMicrophonePermission ? "#fff" : "#bdc3c7"} // Dim icon if no perm
                />
                <Text style={styles.voiceAssistantText}>
                  {!hasMicrophonePermission
                     ? "Microphone needed"
                     : isRecording
                        ? "Recording..."
                        : "Hold to Talk" // Simplified text
                  }
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
    backgroundColor: "#f0f4f8", // Consistent background
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    padding: padding,
    justifyContent: "space-between",
  },
  loadingContainer: { // Added style for loading
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { // Added style for loading text
     marginTop: 10,
     fontSize: 16,
     color: '#34495e',
  },
  permissionDeniedContainer: { // Added style for permission denied
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  permissionText: { // Added style for permission text
    fontSize: 18,
    color: '#34495e',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
   permissionSubText: { // Added style for permission sub-text
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraSection: {
    // Keep height calculation, background, border, etc.
    height: screenHeight * 0.58,
    backgroundColor: "#000", // Usually black for camera view
    borderRadius: 10,
    justifyContent: "center", // Keep for placeholder content
    alignItems: "center", // Keep for placeholder content
    marginBottom: padding,
    overflow: "hidden", // Important for CameraView/Image
    position: 'relative', // Needed for overlay
  },
  // --- New styles for CameraView overlay ---
  cameraOverlay: {
     flex: 1,
     backgroundColor: 'transparent',
     justifyContent: 'space-between', // Pushes controls to top/bottom
     padding: 10, // Add padding inside the overlay
  },
  cameraTopControls: {
     flexDirection: 'row',
     justifyContent: 'space-between', // Space out close and flip
     paddingTop: Platform.OS === 'ios' ? 30 : 10, // Adjust for status bar/notch
  },
  cameraBottomControls: {
     alignItems: 'center', // Center shutter button
     paddingBottom: 10,
  },
  cameraActionButton: { // Style for close/flip buttons
     backgroundColor: "rgba(0,0,0,0.4)",
     borderRadius: 20,
     padding: 8,
     margin: 5, // Add some margin
  },
 // --- End new styles ---
  cameraContent: { // For the placeholder inside cameraSection
    alignItems: "center",
    justifyContent: "center",
    padding: 10, // Add padding to content
  },
  cameraText: {
    fontSize: 16, // Slightly smaller
    color: "#7f8c8d", // Greyer color for placeholder text
    textAlign: "center",
    marginTop: 10,
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
    backgroundColor: '#000', // Background for image container
  },
  capturedImage: {
    width: "100%",
    height: "100%",
    // borderRadius: 10, // Removed, let container handle rounding
  },
  clearButton: { // Keep existing style
    position: "absolute",
    top: 15, // Adjust position slightly
    right: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  // Removed cameraControls, replaced by cameraOverlay structure
  // Removed cancelButton, integrated into cameraTopControls
  shutterButton: { // Keep existing style
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    // Removed border, maybe add subtle shadow?
    // borderWidth: 5,
    // borderColor: "#2c3e50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  shutterInner: { // Keep existing style
    width: 50, // Slightly smaller inner circle
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e74c3c", // Red color for capture
  },
  quickActionsBar: { // Keep existing style
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
  actionButton: { // Keep existing style
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    flex: 1, // Allow buttons to space out evenly
  },
  actionButtonText: { // Keep existing style
    fontSize: 14,
    color: "#34495e",
    marginTop: 5,
    fontWeight: "bold",
    textAlign: 'center', // Ensure text centers
  },
  voiceAssistantSection: { // Keep existing style
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
  recordingActive: { // Keep existing style
    backgroundColor: "#e74c3c", // Red when recording
  },
  micDisabled: { // Added style for disabled mic button
     backgroundColor: "#95a5a6", // Grey out background
     opacity: 0.7, // Make it slightly transparent
  },
  voiceAssistantContent: { // Keep existing style
    alignItems: "center",
  },
  voiceAssistantText: { // Keep existing style
    fontSize: 16, // Slightly smaller text
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 8,
  },
});

export default VisualAssistantScreen;