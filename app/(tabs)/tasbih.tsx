import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Predefined dhikr options
const dhikrOptions = [
  { id: 1, name: 'Subhanallah', arabicText: 'سُبْحَانَ ٱللَّٰهِ', count: 33, color: ['#4CAF50', '#2E7D32'] },
  { id: 2, name: 'Alhamdulillah', arabicText: 'ٱلْحَمْدُ لِلَّٰهِ', count: 33, color: ['#2196F3', '#1565C0'] },
  { id: 3, name: 'Allahu Akbar', arabicText: 'ٱللَّٰهُ أَكْبَرُ', count: 34, color: ['#9C27B0', '#6A1B9A'] },
  { id: 4, name: 'Astaghfirullah', arabicText: 'أَسْتَغْفِرُ ٱللَّٰهَ', count: 100, color: ['#FF9800', '#EF6C00'] },
  { id: 5, name: 'La ilaha illallah', arabicText: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', count: 100, color: ['#F44336', '#C62828'] },
  { id: 6, name: 'Custom', arabicText: '', count: 0, color: ['#607D8B', '#455A64'] },
];

export default function TasbihScreen() {
  const [selectedDhikr, setSelectedDhikr] = useState(dhikrOptions[0]);
  const [count, setCount] = useState(0);
  const [targetCount, setTargetCount] = useState(selectedDhikr.count);
  const [customName, setCustomName] = useState('');
  const [customArabic, setCustomArabic] = useState('');
  const [savedSessions, setSavedSessions] = useState<Array<{date: string, dhikr: string, count: number}>>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Reset count when dhikr changes
    setCount(0);
    setTargetCount(selectedDhikr.count);
  }, [selectedDhikr]);
  
  const incrementCount = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate the button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCount(prevCount => {
      const newCount = prevCount + 1;
      
      // If we've reached the target, provide stronger feedback
      if (newCount === targetCount) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Save this session
        const now = new Date();
        const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        setSavedSessions(prev => [
          { date: dateString, dhikr: selectedDhikr.name, count: newCount },
          ...prev
        ]);
        
        // Rotate the reset button to indicate completion
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
      
      return newCount;
    });
  };
  
  const resetCount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount(0);
    
    // Reset rotation animation
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const selectDhikr = (dhikr: typeof dhikrOptions[0]) => {
    setSelectedDhikr(dhikr);
  };
  
  const renderDhikrOptions = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dhikrOptionsContainer}
      >
        {dhikrOptions.map((dhikr) => (
          <TouchableOpacity
            key={dhikr.id}
            style={[
              styles.dhikrOption,
              selectedDhikr.id === dhikr.id && styles.selectedDhikrOption
            ]}
            onPress={() => selectDhikr(dhikr)}
          >
            <LinearGradient
              colors={dhikr.color}
              style={styles.dhikrGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ThemedText style={styles.dhikrOptionText}>
                {dhikr.name}
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  const renderHistory = () => {
    if (savedSessions.length === 0) {
      return (
        <ThemedView style={styles.emptyHistory}>
          <FontAwesome name="history" size={50} color="#ccc" />
          <ThemedText style={styles.emptyHistoryText}>No history yet</ThemedText>
        </ThemedView>
      );
    }
    
    return (
      <ScrollView style={styles.historyContainer}>
        {savedSessions.map((session, index) => (
          <ThemedView key={index} style={styles.historyItem}>
            <ThemedText style={styles.historyDate}>{session.date}</ThemedText>
            <ThemedView style={styles.historyDetails}>
              <ThemedText style={styles.historyDhikr}>{session.dhikr}</ThemedText>
              <ThemedText style={styles.historyCount}>{session.count}</ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>
    );
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.min((count / targetCount) * 100, 100);
  
  // Interpolate rotation for the reset button
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={selectedDhikr.color}
        style={styles.header}
      >
        <ThemedText style={styles.title}>Digital Tasbih</ThemedText>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => setShowHistory(!showHistory)}
        >
          <FontAwesome name="history" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
      
      {renderDhikrOptions()}
      
      {!showHistory ? (
        <ThemedView style={styles.counterContainer}>
          <ThemedView style={styles.dhikrInfoContainer}>
            <ThemedText style={styles.arabicText}>{selectedDhikr.arabicText}</ThemedText>
            <ThemedText style={styles.dhikrName}>{selectedDhikr.name}</ThemedText>
            <ThemedView style={styles.progressContainer}>
              <ThemedView style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
              <ThemedText style={styles.progressText}>
                {count} / {targetCount}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.buttonsContainer}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetCount}
              >
                <FontAwesome name="refresh" size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity 
                style={[styles.countButton, { backgroundColor: selectedDhikr.color[0] }]}
                onPress={incrementCount}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={selectedDhikr.color}
                  style={styles.countButtonGradient}
                >
                  <ThemedText style={styles.countButtonText}>{count}</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ThemedView>
        </ThemedView>
      ) : (
        <ThemedView style={styles.historyView}>
          <ThemedText style={styles.historyTitle}>History</ThemedText>
          {renderHistory()}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  historyButton: {
    padding: 10,
  },
  dhikrOptionsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  dhikrOption: {
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  selectedDhikrOption: {
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dhikrGradient: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  dhikrOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  counterContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  dhikrInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  arabicText: {
    fontSize: 36,
    marginBottom: 10,
    textAlign: 'center',
  },
  dhikrName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    height: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: selectedDhikr => selectedDhikr.color[0],
    borderRadius: 15,
  },
  progressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  resetButton: {
    backgroundColor: '#F44336',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  countButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  countButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countButtonText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  historyView: {
    flex: 1,
    padding: 20,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  historyContainer: {
    flex: 1,
  },
  historyItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  historyDate: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 5,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDhikr: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistoryText: {
    marginTop: 10,
    fontSize: 18,
    opacity: 0.5,
  },
});
