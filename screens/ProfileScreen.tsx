import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

const ProfileScreen = ({ navigation, route }) => {
  const [userDetails, setUserDetails] = useState({
    name: 'Lifease User',
    disability: 'N/A',
    language: 'N/A',
    emergencyContact: 'N/A',
    emergencyPhone: 'N/A',
  });

  useEffect(() => {
    const loadData = async () => {
      const stored = await AsyncStorage.getItem('userDetails');
      const parsed = stored ? JSON.parse(stored) : route.params?.userDetails || {};
      setUserDetails((prev) => ({
        ...prev,
        ...parsed,
      }));
    };
    loadData();
  }, [route.params]);

  const handleEditProfile = () => {
    Haptics.selectionAsync();
    console.log('Edit Profile pressed');
    // TODO: Navigate to Edit Profile screen
  };

  const handleAccessibilitySettings = () => {
    Haptics.selectionAsync();
    navigation.navigate('Settings');
  };

  const handleLogout = async () => {
    Haptics.selectionAsync();
    await AsyncStorage.removeItem('userDetails');
    navigation.navigate('OnboardingScreen');
  };

  const ProfileOptionButton = ({
    iconName,
    label,
    onPress,
    iconColor = '#3498db',
    textColor = '#34495e',
    accessibilityLabel,
    accessibilityHint,
    hideArrow = false,
  }) => (
    <TouchableOpacity
      style={styles.optionButton}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessible={true}
    >
      <Ionicons name={iconName} size={24} color={iconColor} style={styles.optionIcon} />
      <Text style={[styles.optionText, { color: textColor }]}>{label}</Text>
      {!hideArrow && <Ionicons name="chevron-forward-outline" size={24} color="#bdc3c7" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            {userDetails.profilePictureUrl ? (
              <Image
                source={{ uri: userDetails.profilePictureUrl }}
                style={styles.avatar}
                accessibilityLabel={`${userDetails.name}'s profile picture`}
                accessible={true}
              />
            ) : (
              <View
                style={styles.avatarPlaceholder}
                accessible={true}
                accessibilityLabel="User avatar placeholder"
              >
                <Ionicons name="person-circle-outline" size={120} color="#bdc3c7" />
              </View>
            )}
            <Text style={styles.userName} accessibilityRole="text">
              {userDetails.name}
            </Text>
            <Text style={styles.userType} accessibilityRole="text">
              Disability: {userDetails.disability}
            </Text>
            <Text style={styles.userInfo} accessibilityRole="text">
              Language: {userDetails.language}
            </Text>
            <Text style={styles.userInfo} accessibilityRole="text">
              Emergency Contact: {userDetails.emergencyContact}
            </Text>
            <Text style={styles.userInfo} accessibilityRole="text">
              Emergency Phone: {userDetails.emergencyPhone}
            </Text>
          </View>

          {/* Account Settings */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account Settings</Text>
            <ProfileOptionButton
              iconName="create-outline"
              label="Edit Profile"
              onPress={handleEditProfile}
              accessibilityLabel="Edit Profile Information"
              accessibilityHint="Opens the screen to update your profile details"
            />
          </View>

          {/* Accessibility Settings */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Accessibility</Text>
            <ProfileOptionButton
              iconName="accessibility-outline"
              label="Accessibility Settings"
              onPress={handleAccessibilitySettings}
              accessibilityLabel="Access Accessibility Settings"
              accessibilityHint="Navigates to the screen where you can adjust accessibility preferences"
            />
          </View>

          {/* Logout */}
          <View style={styles.card}>
            <ProfileOptionButton
              iconName="log-out-outline"
              label="Reset Profile"
              onPress={handleLogout}
              iconColor="#e74c3c"
              textColor="#e74c3c"
              accessibilityLabel="Reset profile"
              accessibilityHint="Clears your profile data and returns to the onboarding screen"
              hideArrow={true}
            />
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
    backgroundColor: '#f0f4f8',
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cfd8dc',
    width: '100%',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userType: {
    fontSize: 16,
    color: '#3498db',
    fontStyle: 'italic',
    marginTop: 5,
  },
  userInfo: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
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
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    color: '#34495e',
  },
  separator: {
    height: 1,
    backgroundColor: '#cfd8dc',
    marginLeft: 20,
    marginRight: 20,
  },
});

export default ProfileScreen;