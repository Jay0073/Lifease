import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  ImageBackground, // Import ImageBackground for the background image
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons'; // Import Ionicons for icons

const { width } = Dimensions.get('window');
const padding = 15;
const gap = 15;
const optionSize = (width - padding * 2 - gap) / 2;

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>

          {/* --- Hero Section --- */}
          <View style={styles.heroContainerWrapper}>
            <ImageBackground
              source={require('../assets/geometrics_background.jpg')} // Path to the background image
              style={styles.heroBackground}
              imageStyle={{ borderRadius: 15 }} // Ensure the image respects the border radius
            >
              <View style={styles.heroContainer}>
                <Text style={styles.heroTitle}>LifeEasy</Text>
                <Text style={styles.heroQuote}>
                  Empowering independence through intuitive assistance.
                </Text>
              </View>
            </ImageBackground>
          </View>

          {/* --- Options Section (Modern Cards) --- */}
          <View style={styles.optionsContainer}>
            {/* Visual Assistant Option */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate('VisualAssistant')}
            >
              <Ionicons name="eye-outline" size={40} color="#fff" />
              <Text style={styles.optionText}>Visual Assistant</Text>
            </TouchableOpacity>

            
            {/* Voice Assistant Option */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate('DumbAssistant')}
            >
              <Ionicons name="volume-high-outline" size={40} color="#fff" />
              <Text style={styles.optionText}>Voice Accessibility</Text>
            </TouchableOpacity>

            {/* Deaf Assistant Option */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate('DeafAssistant')}
            >
              <Ionicons name="ear-outline" size={40} color="#fff" />
              <Text style={styles.optionText}>Auditory Accessibility</Text>
            </TouchableOpacity>

            {/* AI Assistant Option */}
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => navigation.navigate('AIAssistant')}
            >
              <Ionicons name="sparkles-outline" size={40} color="#fff" />
              <Text style={styles.optionText}>AI Assistant</Text>
            </TouchableOpacity>
          </View>

          {/* --- Placeholder Footer --- */}
          <View style={styles.placeholderFooter}></View>

        </View>
      </ScrollView>

      {/* --- Visual Footer Bar (Placeholder) --- */}
      <View style={styles.visualFooterBar}>
        <TouchableOpacity style={styles.footerOption} onPress={() => console.log('Home Placeholder Press')}>
          <Ionicons name="home" size={24} color="#007AFF" />
          <Text style={styles.footerOptionText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerOption} onPress={() => console.log('History Placeholder Press')}>
          <Ionicons name="time-outline" size={24} color="#555" />
          <Text style={styles.footerOptionText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerOption} onPress={() => console.log('Help Placeholder Press')}>
          <Ionicons name="help-circle-outline" size={24} color="#555" />
          <Text style={styles.footerOptionText}>Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerOption} onPress={() => navigation.navigate('Profile')}>
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
    paddingBottom: 80, // Ensure space for the fixed footer
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
    elevation: 5, // Add elevation for shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginVertical: 20,
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: 60, // Increased height
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
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    fontSize: 16,
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