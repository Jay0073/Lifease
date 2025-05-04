import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
  Platform, // Import Platform
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system"; // Import FileSystem

const { width, height } = Dimensions.get("window");

// IMPORTANT: Replace with your actual server IP/domain in production
const WEBSOCKET_URL = "ws://192.168.20.157:8080"; // Or your machine's local IP for testing

const DeafAssistantScreen = () => {
  const [mode, setMode] = useState("audioToText");
  const [isRecording, setIsRecording] = useState(false); // Renamed for clarity
  const [pulseAnim] = useState(new Animated.Value(1));
  const [responseText, setResponseText] = useState("");
  const [isConnecting, setIsConnecting] = useState(true); // Track WS connection status
  const [connectionError, setConnectionError] = useState(null); // Store connection errors
  const recordingInstanceRef = useRef(null); // Ref to store the recording object
  const wsRef = useRef(null);
  const recordingLoopActive = useRef(false); // Ref to control the recording loop

  // --- WebSocket Connection ---
  useEffect(() => {
    console.log("Attempting to initialize WebSocket...");
    setIsConnecting(true);
    setConnectionError(null);
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnecting(false);
      setConnectionError(null);
    };

    ws.onmessage = (evt) => {
      // console.log("WebSocket message received:", evt.data); // Can be noisy
      try {
        const { transcript, isFinal } = JSON.parse(evt.data);
        // Replace text with the latest transcript (interim or final)
        // Google STT often sends the full refined sentence as interim
        setResponseText(transcript);
        // Optional: Add logic here if you want to handle final results differently
        // e.g., append to a separate "final transcript" state.
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e.message);
      setConnectionError(
        `WebSocket Error: ${e.message || "Failed to connect"}`
      );
      setIsConnecting(false);
    };

    ws.onclose = (e) => {
      console.log(`WebSocket closed. Code: ${e.code}, Reason: ${e.reason}`);
      setIsConnecting(false);
      // Optionally attempt to reconnect or notify the user
      if (isRecording) {
        // If it closes while recording, stop the process
        stopRecordingLogic();
      }
    };

    wsRef.current = ws;

    return () => {
      console.log("Closing WebSocket connection...");
      ws.close();
      wsRef.current = null;
      // Ensure recording stops if component unmounts
      if (recordingInstanceRef.current) {
        recordingInstanceRef.current.stopAndUnloadAsync().catch(console.error);
        recordingInstanceRef.current = null;
      }
      recordingLoopActive.current = false; // Stop loop on unmount
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // --- Recording Logic ---
  const startRecordingLogic = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket not connected. Cannot start recording.");
      setConnectionError("WebSocket not connected. Please wait or restart.");
      setIsRecording(false); // Ensure state is correct
      return;
    }
    if (recordingLoopActive.current) {
      console.log("Recording loop already active.");
      return; // Prevent multiple loops
    }

    console.log("Starting recording process...");
    setIsRecording(true);
    setResponseText(""); // Clear previous text
    startPulse();
    recordingLoopActive.current = true; // Signal loop is active

    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingLoop = async () => {
        // Check if we should continue looping
        if (!recordingLoopActive.current) {
          console.log("Recording loop stopped.");
          if (recordingInstanceRef.current) {
            await recordingInstanceRef.current.stopAndUnloadAsync();
            recordingInstanceRef.current = null;
          }
          return;
        }

        console.log("Starting new recording segment...");
        const recording = new Audio.Recording();
        recordingInstanceRef.current = recording; // Store ref

        try {
          await recording.prepareToRecordAsync({
            android: {
              extension: ".wav",
              outputFormat:
                Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT, // Let Expo handle format details if possible
              audioEncoder:
                Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM_16BIT,
              sampleRate: 16000,
              numberOfChannels: 1,
            },
            ios: {
              extension: ".wav", // Google prefers LINEAR16, WAV is container
              audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX, // Use high quality
              sampleRate: 16000,
              numberOfChannels: 1,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false,
            },
            web: {}, // Add web options if needed
          });
          await recording.startAsync();
          console.log("Recording segment started.");

          // Record for a short duration (e.g., 1500ms)
          // Adjust this based on desired latency vs overhead trade-off
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Check again if we should stop before processing
          if (!recordingLoopActive.current) {
            console.log("Stopping mid-segment due to external stop request.");
            await recording.stopAndUnloadAsync();
            recordingInstanceRef.current = null;
            return; // Exit the loop
          }

          console.log("Stopping and unloading segment...");
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          recordingInstanceRef.current = null; // Clear ref after use

          // Wait 100ms to allow filesystem to potentially finish writing/flushing
          await new Promise((resolve) => setTimeout(resolve, 100));

          if (!uri) {
            console.error("Failed to get recording URI.");
            throw new Error("Recording URI is null"); // Throw to be caught below
          }
          console.log("Audio segment URI:", uri);

          // Check WS connection again before sending
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error(
              "WebSocket disconnected during recording. Stopping loop."
            );
            setConnectionError("WebSocket disconnected.");
            recordingLoopActive.current = false; // Stop the loop
            setIsRecording(false); // Update UI state
            stopPulse();
            return;
          }

          // Read the audio file and send via WebSocket
          const audioBase64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log(
            `Sending audio data (${audioBase64.length} chars base64)...`
          );
          wsRef.current.send(
            JSON.stringify({ type: "audio_chunk", data: audioBase64 })
          );

          // Schedule the next loop iteration
          // Use requestAnimationFrame for smoother looping if needed, or just call directly
          recordingLoop();
        } catch (error) {
          console.error("Error within recording segment:", error);
          // Attempt to clean up if an error occurred mid-segment
          if (recordingInstanceRef.current) {
            try {
              await recordingInstanceRef.current.stopAndUnloadAsync();
            } catch (cleanupError) {
              console.error("Error during cleanup:", cleanupError);
            }
            recordingInstanceRef.current = null;
          }
          // Stop the entire process on error
          recordingLoopActive.current = false;
          setIsRecording(false);
          stopPulse();
          // Optionally display an error message to the user
        }
      };

      recordingLoop(); // Start the first iteration
    } catch (err) {
      console.error("Failed to start recording process:", err);
      setIsRecording(false);
      stopPulse();
      // Display error to user
    }
  };

  const stopRecordingLogic = async () => {
    console.log("Stopping recording process...");
    recordingLoopActive.current = false; // Signal the loop to stop
    stopPulse(); // Stop animation
    setIsRecording(false); // Update UI state immediately

    // Send a message to backend that client stopped sending audio (optional but good practice)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("Sending end_audio signal to server.");
      wsRef.current.send(JSON.stringify({ type: "end_audio" }));
    } else {
      console.warn("WebSocket not open when trying to send end_audio signal.");
    }

    // The loop will detect recordingLoopActive.current === false and clean up
    // Any active recording instance using recordingInstanceRef.current.
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
    pulseAnim.setValue(1); // Reset before starting
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
    // Find the animation attached to pulseAnim and stop it
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1); // Reset scale
  };

  const handleOutsideMode = () => {
    console.log("Outside Mode button pressed - (Not implemented)");
    // Implement functionality for Outside Mode here
  };

  const handleToggleMode = () => {
    console.log("Toggling mode...");
    setMode((prevMode) =>
      prevMode === "audioToSign" ? "audioToText" : "audioToSign"
    );
    setResponseText(""); // Clear text when switching mode
    // Log the *new* mode after state update (use effect or log calculation directly)
    console.log(
      "Mode toggled to:",
      mode === "audioToSign" ? "audioToText" : "audioToSign"
    );
    if (isRecording) {
      // Stop recording if mode is toggled while recording
      stopRecordingLogic();
    }
  };

  // --- Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Display Area */}
        <View style={styles.displayArea}>
          {isConnecting ? (
            <Text style={styles.displayText}>Connecting to server...</Text>
          ) : connectionError ? (
            <Text style={[styles.displayText, styles.errorText]}>
              {connectionError}
            </Text>
          ) : mode === "audioToSign" ? (
            <View style={styles.signArea}>
              <Ionicons name="hand-left-outline" size={120} color="#7f8c8d" />
              <Text style={styles.displayText}>
                Sign Output (Not Implemented)
              </Text>
              {/* Add your Sign Language display component here */}
            </View>
          ) : (
            // Audio to Text Mode
            <View style={styles.signArea}>
              {responseText ? (
                <Text style={styles.largeResponseText}>{responseText}</Text>
              ) : isRecording ? (
                <Text style={styles.displayText}>Listening...</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Button Bar */}
        <View style={styles.buttonBar}>
          {/* Outside Mode Button */}
          <TouchableOpacity
            style={styles.smallButton}
            onPress={handleOutsideMode}
            activeOpacity={0.7}
            accessibilityRole="button"
            disabled={isRecording} // Disable during recording
          >
            <Ionicons name="navigate-circle-outline" size={30} color="white" />
          </TouchableOpacity>

          {/* Record Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.largeButton}
              onPress={handleRecordToggle} // Use the combined toggle handler
              activeOpacity={0.7}
              accessibilityRole="button"
              disabled={isConnecting || !!connectionError} // Disable if not connected
            >
              <Ionicons
                name={isRecording ? "stop-circle" : "mic-circle"}
                size={70}
                color="white"
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Toggle Mode Button */}
          <TouchableOpacity
            style={styles.smallButton}
            onPress={handleToggleMode}
            activeOpacity={0.7}
            accessibilityRole="button"
            disabled={isRecording} // Disable during recording
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

// --- Styles --- (Keep your existing styles, adding errorText style)
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
  displayArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signArea: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Ensure text wraps
  },
  displayText: {
    fontSize: 18,
    color: "#34495e", // Darker text
    marginTop: 10,
    textAlign: "center", // Center align text
    paddingHorizontal: 10, // Add padding for longer text
  },
  errorText: {
    color: "#e74c3c", // Use error color for errors
    fontWeight: "bold",
  },
  largeResponseText: {
    fontSize: 32, // Large font size for response text
    color: "#34495e",
    textAlign: "center",
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
});

export default DeafAssistantScreen;
