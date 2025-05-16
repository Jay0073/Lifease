import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const padding = 15;
const gap = 15;
const optionSize = (width - padding * 2 - gap) / 2;

const HomeScreen = ({ navigation, route }) => {
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const stored = await AsyncStorage.getItem('userDetails');
      const parsed = stored ? JSON.parse(stored) : route.params?.userDetails || {};
      setUserDetails(parsed);
    };
    loadData();
  }, [route.params]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Hero Section */}
          <View style={styles.heroContainerWrapper}>
            <ImageBackground
              source={require('../assets/geometrics_background.jpeg')}
              style={styles.heroBackground}
              imageStyle={{ borderRadius: 15 }}
            >
              <View style={styles.heroContainer}>
                <Text style={styles.heroTitle}>
                  Welcome, {userDetails.name || 'User'}
                </Text>
                <Text style={styles.heroQuote}>
                  Empowering independence through intuitive assistance.
                </Text>
                {userDetails.disability && (
                  <Text style={styles.heroSubtitle}>
                    Tailored for {userDetails.disability}
                  </Text>
                )}
              </View>
            </ImageBackground>
          </View>

          {/* Options Section */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate('VisualAssistant')}
              accessibilityLabel="Blind Assistant button"
              accessibilityHint="Tap to access visual assistance features"
            >
              <Ionicons name="eye-outline" size={40} color="#fff" />
              <Text style={styles.optionText}>Blind Assistant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate('DumbAssistant')}
              accessibilityLabel="Dumb Assistant button"
              accessibilityHint="Tap to access voice accessibility features"
            >
              <Ionicons name="volume-high-outline" size={40} color="#fff" />
              <Text style={styles.optionText}>Voice Assistant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate('DeafAssistant')}
              accessibilityLabel="Deaf Assistant button"
              accessibilityHint="Tap to access auditory accessibility features"
            >
              <Ionicons name="ear-outline" size={40} color="#fff" />
              <Text style={styles.optionText}>Hearing Assistant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate('AIAssistant')}
              accessibilityLabel="AI Assistant button"
              accessibilityHint="Tap to access AI-powered assistance"
            >
              <Ionicons name="sparkles-outline" size={40} color="#fff" />
              <Text style={styles.optionText}>AI Assistant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate('DeafMuteAssistantScreen')}
              accessibilityLabel="Deaf & Mute Assistant button"
              accessibilityHint="Tap to access deaf & mute assistance"
            >
              <Ionicons name="accessibility-outline" size={40} color="#fff" />
              <Text style={styles.optionText}>Deaf & Mute Assistant </Text>
            </TouchableOpacity>
          </View>

          {/* Placeholder Footer */}
          <View style={styles.placeholderFooter}></View>
        </View>
      </ScrollView>

      {/* Visual Footer Bar */}
      <View style={styles.visualFooterBar}>
        <TouchableOpacity
          style={styles.footerOption}
          onPress={() => navigation.navigate('HomeScreen')}
          accessibilityLabel="Home button"
          accessibilityHint="Tap to return to the home screen"
        >
          <Ionicons name="home" size={24} color="#007AFF" />
          <Text style={styles.footerOptionText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerOption}
          onPress={() => navigation.navigate('History')}
          accessibilityLabel="History button"
          accessibilityHint="Tap to view your activity history"
        >
          <Ionicons name="time-outline" size={24} color="#555" />
          <Text style={styles.footerOptionText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerOption}
          onPress={() => navigation.navigate('Help')}
          accessibilityLabel="Help button"
          accessibilityHint="Tap to access help resources"
        >
          <Ionicons name="help-circle-outline" size={24} color="#555" />
          <Text style={styles.footerOptionText}>Help</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerOption}
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Profile button"
          accessibilityHint="Tap to view your profile"
        >
          <Ionicons name="person-outline" size={24} color="#555" />
          <Text style={styles.footerOptionText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 80,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    paddingHorizontal: padding,
  },
  heroContainerWrapper: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginVertical: 20,
  },
  heroBackground: {
    width: '100%',
    borderRadius: 15,
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  heroQuote: {
    fontSize: 17,
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 8,
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: optionSize,
    height: optionSize,
    backgroundColor: '#3498db',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: gap,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    padding: 15,
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  placeholderFooter: {
    height: 20,
    width: '100%',
  },
  visualFooterBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    paddingBottom: 10,
  },
  footerOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
  },
  footerOptionText: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
});

export default HomeScreen;