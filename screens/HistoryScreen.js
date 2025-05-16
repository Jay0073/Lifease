import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock history data for demonstration
  const mockHistory = [
    { id: '1', action: 'Used AI Assistant', timestamp: '2025-05-03 10:30 AM' },
    { id: '2', action: 'Used Blind Assistant', timestamp: '2025-05-02 2:15 PM' },
    { id: '3', action: 'Used Deaf Assistant', timestamp: '2025-05-01 9:45 AM' },
    { id: '4', action: 'Used Dumb Assistant', timestamp: '2025-04-30 5:20 PM' },
  ];

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const storedHistory = await AsyncStorage.getItem('userHistory');
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        } else {
          // Initialize with mock data if none exists
          await AsyncStorage.setItem('userHistory', JSON.stringify(mockHistory));
          setHistory(mockHistory);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // Simulate refreshing history (e.g., API call in the future)
      setHistory(mockHistory); // Replace with actual data fetch
      await AsyncStorage.setItem('userHistory', JSON.stringify(mockHistory));
    } catch (error) {
      console.error('Failed to refresh history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="time-outline" size={40} color="#3498db" />
            <Text style={styles.title}>Activity History</Text>
            <Text style={styles.subtitle}>Your recent interactions</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>History</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefresh}
                accessibilityLabel="Refresh history button"
                accessibilityHint="Tap to refresh your activity history"
              >
                <LinearGradient
                  colors={['#00DDEB', '#6B73FF']}
                  style={styles.refreshButtonGradient}
                >
                  <Ionicons name="refresh" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
            ) : history.length === 0 ? (
              <Text style={styles.emptyText}>No history available.</Text>
            ) : (
              history.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#3498db" style={styles.itemIcon} />
                  <View style={styles.itemContent}>
                    <Text style={styles.itemAction}>{item.action}</Text>
                    <Text style={styles.itemTimestamp}>{item.timestamp}</Text>
                  </View>
                </View>
              ))
            )}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
  },
  refreshButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  refreshButtonGradient: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#cfd8dc',
  },
  itemIcon: {
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
  },
  itemAction: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '600',
  },
  itemTimestamp: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    padding: 20,
  },
  loader: {
    marginVertical: 20,
  },
});

export default HistoryScreen;