import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

const HelpScreen = () => {
  const [expanded, setExpanded] = useState({});

  const faqs = [
    {
      question: 'How do I use the AI Assistant?',
      answer: 'The AI Assistant provides general support through text or voice input. Enter your query via text or use voice commands (if enabled). The assistant responds with helpful information or actions tailored to your needs.',
    },
    {
      question: 'How does the Blind Assistant work?',
      answer: 'The Blind Assistant uses text-to-speech to read out content and accepts voice commands for navigation. Ensure your device’s screen reader is enabled for the best experience.',
    },
    {
      question: 'What features are available in the Deaf Assistant?',
      answer: 'The Deaf Assistant offers visual communication, including text input/output and potential sign language recognition (if implemented). It displays responses in large, clear text for accessibility.',
    },
    {
      question: 'How can I use the Dumb Assistant if I cannot speak?',
      answer: 'The Dumb Assistant supports text input or gesture-based controls (if implemented). Type your requests or use predefined gestures to interact with the assistant.',
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Go to the Profile screen via the footer or menu. Tap “Edit Profile” to update your details (feature coming soon). You can also reset your profile to re-enter details.',
    },
    {
      question: 'Where can I find accessibility settings?',
      answer: 'Navigate to the Settings screen from the menu or Profile screen. You can toggle Large Text or High Contrast to improve visibility.',
    },
  ];

  const toggleFAQ = (index) => {
    Haptics.selectionAsync();
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="help-circle-outline" size={40} color="#3498db" />
            <Text style={styles.title}>Help Center</Text>
            <Text style={styles.subtitle}>Find answers to common questions</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(index)}
                  accessibilityLabel={`FAQ: ${faq.question}`}
                  accessibilityHint={`Tap to ${expanded[index] ? 'collapse' : 'expand'} the answer`}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Ionicons
                    name={expanded[index] ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#3498db"
                  />
                </TouchableOpacity>
                {expanded[index] && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
                {index < faqs.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 8,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  faqItem: {
    paddingHorizontal: 20,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#7f8c8d',
    paddingBottom: 15,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#cfd8dc',
  },
});

export default HelpScreen;