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
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";

const { width, height } = Dimensions.get("window");

const DeafAssistantScreen = () => {
  const [mode, setMode] = useState("audioToText");
  const [recording, setRecording] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [responseText, setResponseText] = useState("");
  const recordingRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    console.log("Initializing WebSocket...");
    const ws = new WebSocket("ws://192.168.152.157:8080");
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected");

    ws.onmessage = (message) => {
      console.log("WebSocket message received:", message.data);
      const data = JSON.parse(message.data);
      if (data.transcript) {
        console.log("Transcript received:", data.transcript);
        setResponseText((prev) => prev + " " + data.transcript);
      }
    };

    ws.onerror = (e) => console.error("WebSocket error:", e.message);

    ws.onclose = () => console.log("WebSocket closed");

    return () => {
      console.log("Closing WebSocket...");
      ws.close();
    };
  }, []);

  const handleRecord = async () => {
    if (!recording) {
      console.log("Starting recording...");
      setRecording(true);
      setResponseText("");
      startPulse();

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.error("Microphone permission denied");
        setRecording(false);
        return;
      }

      try {
        console.log("Preparing to record...");
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );
        await recording.startAsync();
        console.log("Recording started");
        recordingRef.current = recording;

        const interval = setInterval(async () => {
          if (recordingRef.current) {
            console.log("Fetching audio chunk...");
            const uri = recordingRef.current.getURI();
            console.log("Audio URI:", uri);
            const file = await fetch(uri);
            const blob = await file.blob();
            blob.arrayBuffer().then((buffer) => {
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                console.log("Sending audio chunk to WebSocket...");
                wsRef.current.send(buffer);
              } else {
                console.warn(
                  "WebSocket is not open. Ready state:",
                  wsRef.current?.readyState
                );
              }
            });
          }
        }, 1000);

        recordingRef.current.interval = interval;
      } catch (err) {
        console.error("Recording error:", err);
        setRecording(false);
      }
    } else {
      console.log("Stopping recording...");
      setRecording(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      try {
        await recordingRef.current.stopAndUnloadAsync();
        clearInterval(recordingRef.current.interval);
        console.log("Recording stopped and unloaded");
        recordingRef.current = null;
      } catch (e) {
        console.error("Stop recording error:", e);
      }
    }
  };

  const startPulse = () => {
    console.log("Starting pulse animation...");
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

  const handleOutsideMode = () => {
    console.log("Outside Mode button pressed");
  };

  const handleToggleMode = () => {
    console.log("Toggling mode...");
    setMode((prevMode) =>
      prevMode === "audioToSign" ? "audioToText" : "audioToSign"
    );
    setResponseText("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.displayArea}>
          {mode === "audioToSign" ? (
            <View style={styles.signArea}>
              <Ionicons name="hand-left-outline" size={120} color="#7f8c8d" />
              <Text style={styles.displayText}>Sign Output</Text>
            </View>
          ) : (
            <View style={styles.signArea}>
              <Ionicons name="mic-outline" size={120} color="#7f8c8d" />
              <Text style={styles.displayText}>
                {responseText || "Record to show text..."}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonBar}>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={handleOutsideMode}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Ionicons name="navigate-circle-outline" size={30} color="white" />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.largeButton}
              onPress={handleRecord}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Ionicons
                name={recording ? "stop-circle" : "mic-circle"}
                size={70}
                color="white"
              />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={handleToggleMode}
            activeOpacity={0.7}
            accessibilityRole="button"
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
    elevation: 5,
  },
  signArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  displayText: {
    fontSize: 18,
    color: "#7f8c8d",
    marginTop: 10,
  },
  buttonBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  smallButton: {
    backgroundColor: "#3498db",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
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