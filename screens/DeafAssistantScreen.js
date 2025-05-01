import React, { useState } from "react";
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

const { width, height } = Dimensions.get("window");

const DeafAssistantScreen = () => {
  const [mode, setMode] = useState("audioToSign"); // 'audioToSign' or 'audioToText'
  const [recording, setRecording] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [responseText, setResponseText] = useState(""); // Added state to manage text response

  const handleRecord = () => {
    setRecording((prev) => !prev);

    if (!recording) {
      startPulse();
      if (mode === "audioToText") {
        // Simulate getting some text response from audio
        setTimeout(() => {
          setResponseText("Recognized text from audio...");
        }, 2000);
      }
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  };

  const startPulse = () => {
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
    setMode((prevMode) =>
      prevMode === "audioToSign" ? "audioToText" : "audioToSign"
    );
    setResponseText(""); // Clear old response when switching mode
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Display Area */}
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

        {/* Bottom Button Bar */}
        <View style={styles.buttonBar}>
          {/* Left Small Button - Outside Mode */}
          <TouchableOpacity
            style={styles.smallButton}
            onPress={handleOutsideMode}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Ionicons name="navigate-circle-outline" size={30} color="white" />
          </TouchableOpacity>

          {/* Center Large Mic Button */}
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

          {/* Right Small Button - Toggle Mode */}
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
  textOutputContainer: {
    width: "100%",
    backgroundColor: "#ecf0f1",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    minHeight: 150,
    justifyContent: "center",
  },
  textOutput: {
    fontSize: 18,
    color: "#2c3e50",
    textAlign: "left",
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
