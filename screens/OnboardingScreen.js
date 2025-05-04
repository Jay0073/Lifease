import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { FontAwesome5 } from "@expo/vector-icons";

export default function OnboardingScreen({ navigation }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [disability, setDisability] = useState("");
  const [language, setLanguage] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisabilityDropdown, setShowDisabilityDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const disabilities = [
    { label: "Blind", value: "blind" },
    { label: "Deaf", value: "deaf" },
    { label: "Mute", value: "mute" },
    { label: "Motor-Impaired", value: "motor-impaired" },
    { label: "Other", value: "other" },
  ];

  const languages = [
    { label: "English", value: "en-US" },
    { label: "Hindi", value: "hi-IN" },
    { label: "Tamil", value: "ta-IN" },
    { label: "Telugu", value: "te-IN" },
    { label: "Bengali", value: "bn-IN" },
    { label: "Marathi", value: "mr-IN" },
    { label: "Kannada", value: "kn-IN" },
  ];

  const validateForm = () => {
    if (!name.trim()) return "Name is required.";
    if (!age.trim() || isNaN(age) || age < 1 || age > 120)
      return "Please enter a valid age (1–120).";
    if (!disability) return "Please select a disability.";
    if (!language) return "Please select a preferred language.";
    if (!emergencyContact.trim()) return "Emergency contact name is required.";
    if (!emergencyPhone.trim() || !/^\d{10}$/.test(emergencyPhone))
      return "Please enter a valid 10-digit phone number.";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Error", error);
      return;
    }
  
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const formData = {
        name,
        age,
        disability,
        language,
        emergencyContact,
        emergencyPhone,
      };
      await AsyncStorage.setItem("userDetails", JSON.stringify(formData));
      
      // Reset navigation stack to home screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    } catch (error) {
      Alert.alert("Error", "Failed to submit details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    Haptics.selectionAsync();
    // Store minimal user data when skipping
    const skipData = { skipped: true };
    await AsyncStorage.setItem("userDetails", JSON.stringify(skipData));
    
    // Reset navigation stack to home screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  };

  const speakName = async () => {
    if (!name.trim()) {
      Alert.alert("No Name", "Please enter your name to preview.");
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.speak(`Hello, ${name}`, { language: language || "en-US" });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={["#E8F0FE", "#F5F5F5"]} style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <FontAwesome5 name="heart" size={40} color="#007AFF" />
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>Tell us about yourself</Text>
          </View>

          <BlurView
            intensity={Platform.OS === "ios" ? 80 : 100}
            style={styles.inputContainer}
          >
            <View style={styles.inputWrapper}>
              <FontAwesome5
                name="user"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                accessibilityLabel="Name input"
                accessibilityHint="Enter your full name"
                onFocus={() => Haptics.selectionAsync()}
              />
              <TouchableOpacity
                style={styles.speakButton}
                onPress={speakName}
                accessibilityLabel="Preview name button"
                accessibilityHint="Tap to hear your name spoken"
              >
                <FontAwesome5 name="volume-up" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <FontAwesome5
                name="birthday-cake"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#666"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                accessibilityLabel="Age input"
                accessibilityHint="Enter your age"
                onFocus={() => Haptics.selectionAsync()}
              />
            </View>
            <View style={styles.inputWrapper}>
              <FontAwesome5
                name="accessible-icon"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  setShowDisabilityDropdown(!showDisabilityDropdown);
                  Haptics.selectionAsync();
                }}
                accessibilityLabel="Disability selector"
                accessibilityHint="Tap to select your disability type"
              >
                <Text style={styles.dropdownText}>
                  {disability
                    ? disabilities.find((d) => d.value === disability)?.label
                    : "Select Disability"}
                </Text>
                <FontAwesome5
                  name={showDisabilityDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {showDisabilityDropdown && (
              <View style={styles.dropdown}>
                {disabilities.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dropdownItem,
                      disability === item.value && styles.selectedDropdownItem,
                    ]}
                    onPress={() => {
                      setDisability(item.value);
                      setShowDisabilityDropdown(false);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.inputWrapper}>
              <FontAwesome5
                name="globe"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  setShowLanguageDropdown(!showLanguageDropdown);
                  Haptics.selectionAsync();
                }}
                accessibilityLabel="Language selector"
                accessibilityHint="Tap to select your preferred language"
              >
                <Text style={styles.dropdownText}>
                  {language
                    ? languages.find((l) => l.value === language)?.label
                    : "Select Language"}
                </Text>
                <FontAwesome5
                  name={showLanguageDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {showLanguageDropdown && (
              <View style={styles.dropdown}>
                {languages.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dropdownItem,
                      language === item.value && styles.selectedDropdownItem,
                    ]}
                    onPress={() => {
                      setLanguage(item.value);
                      setShowLanguageDropdown(false);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.inputWrapper}>
              <FontAwesome5
                name="user-shield"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Emergency Contact Name"
                placeholderTextColor="#666"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
                autoCapitalize="words"
                accessibilityLabel="Emergency contact name input"
                accessibilityHint="Enter the name of your emergency contact"
                onFocus={() => Haptics.selectionAsync()}
              />
            </View>
            <View style={styles.inputWrapper}>
              <FontAwesome5
                name="phone"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Emergency Contact Phone"
                placeholderTextColor="#666"
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                keyboardType="phone-pad"
                accessibilityLabel="Emergency contact phone input"
                accessibilityHint="Enter the phone number of your emergency contact"
                onFocus={() => Haptics.selectionAsync()}
              />
            </View>
          </BlurView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              accessibilityLabel="Skip button"
              accessibilityHint="Tap to skip onboarding and go to the home screen"
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#007AFF"
                style={styles.loader}
              />
            ) : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                accessibilityLabel="Submit button"
                accessibilityHint="Tap to submit your details"
              >
                <LinearGradient
                  colors={["#00DDEB", "#6B73FF"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginTop: 8,
  },
  inputContainer: {
    borderRadius: 12,
    overflow: "hidden",
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#333",
    paddingVertical: 12,
  },
  speakButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  dropdownButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 18,
    color: "#333",
  },
  dropdown: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedDropdownItem: {
    backgroundColor: "#007AFF",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    flex: 1,
    marginLeft: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  skipButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
  },
  loader: {
    marginVertical: 24,
  },
});
