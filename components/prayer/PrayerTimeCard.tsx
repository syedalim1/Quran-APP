import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';

interface PrayerTimeCardProps {
  prayer: string;
  info: {
    english: string;
    arabic: string;
    color: string[];
    icon: string;
    description: string;
  };
  prayerTime: Date;
  isNext: boolean;
  progress: number;
  onPress: () => void;
}

export function PrayerTimeCard({ prayer, info, prayerTime, isNext, progress, onPress }: PrayerTimeCardProps) {
  // Animation values for touch feedback
  const [scaleValue] = useState(new Animated.Value(1));
  
  // Handle touch events for interactive feedback
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      friction: 5,
      tension: 300,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 400,
      useNativeDriver: true
    }).start();
  };

  const formatTime = (date: Date) => {
    try {
      if (!(date instanceof Date)) {
        console.warn('Invalid date object provided to PrayerTimeCard');
        return '--:-- --';
      }
      
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:-- --';
    }
  };

  // Ensure we have exactly the right format for LinearGradient colors
  const color1 = info.color[0] || '#3F51B5';
  const color2 = info.color[1] || '#1A237E';
  
  // Choose appropriate icon based on prayer name
  const getIcon = () => {
    const prayerName = prayer.toLowerCase();
    
    if (prayerName.includes('fajr')) return 'cloud-sun';
    if (prayerName.includes('sunrise')) return 'sun';
    if (prayerName.includes('dhuhr')) return 'sun';
    if (prayerName.includes('asr')) return 'cloud-sun';
    if (prayerName.includes('maghrib')) return 'cloud-sun-rain';
    if (prayerName.includes('isha')) return 'moon';
    
    return 'mosque';
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, isNext && styles.nextContainer]}
      activeOpacity={0.9}
      accessible={true}
      accessibilityLabel={`${info.english} prayer at ${formatTime(prayerTime)}${isNext ? ', next prayer' : ''}`}
      accessibilityRole="button"
    >
      <Animated.View 
        style={[
          { transform: [{ scale: scaleValue }] },
          styles.animatedContainer,
          isNext && styles.nextAnimatedContainer
        ]}
      >
        <LinearGradient
          colors={[color1, color2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, isNext && styles.nextPrayer]}
        >
          {/* Decorative circles for visual effect */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          
          <View style={styles.content}>
            <View style={styles.mainContent}>
              <View style={styles.header}>
                <View style={[styles.iconContainer, isNext && styles.nextIconContainer]}>
                  <FontAwesome5 
                    name={getIcon()} 
                    size={isNext ? 26 : 24} 
                    color="#fff" 
                    style={styles.icon} 
                  />
                </View>
                <View style={styles.titleContainer}>
                  <ThemedText style={[styles.englishName, isNext && styles.nextEnglishName]}>
                    {info.english}
                  </ThemedText>
                  <ThemedText style={styles.arabicName}>{info.arabic}</ThemedText>
                </View>
              </View>

              <View style={styles.timeContainer}>
                <View style={[styles.timeWrapper, isNext && styles.nextTimeWrapper]}>
                  <ThemedText style={styles.time}>{formatTime(prayerTime)}</ThemedText>
                </View>
                <ThemedText style={styles.description}>{info.description}</ThemedText>
              </View>
            </View>

            {isNext && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBg}>
                  <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>
                <ThemedText style={styles.progressText}>Progress until next prayer</ThemedText>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375; // For smaller devices like iPhone SE

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    width: width - 32, // Full width minus margins
    alignSelf: 'center',
  },
  animatedContainer: {
    width: '100%',
  },
  nextAnimatedContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  nextContainer: {
    marginVertical: 12,
    zIndex: 10, // Ensure next prayer is above other cards
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  nextPrayer: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 8,
    shadowOpacity: 0.35,
    shadowRadius: 6.27,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -30,
    right: -30,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -20,
    left: -20,
  },
  content: {
    padding: isSmallDevice ? 12 : 16,
    position: 'relative',
  },
  nextPrayerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  nextPrayerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: isSmallDevice ? 'wrap' : 'nowrap',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: isSmallDevice ? 0 : 1.5,
    marginBottom: isSmallDevice ? 8 : 0,
    width: isSmallDevice ? '100%' : undefined,
  },
  iconContainer: {
    width: isSmallDevice ? 42 : 50,
    height: isSmallDevice ? 42 : 50,
    borderRadius: isSmallDevice ? 21 : 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleContainer: {
    flex: 1,
  },
  englishName: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nextEnglishName: {
    fontSize: isSmallDevice ? 20 : 22,
  },
  arabicName: {
    fontSize: isSmallDevice ? 14 : 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  timeContainer: {
    flex: isSmallDevice ? 0 : 1,
    alignItems: isSmallDevice ? 'flex-start' : 'flex-end',
    width: isSmallDevice ? '100%' : undefined,
    flexDirection: isSmallDevice ? 'row' : 'column',
    justifyContent: isSmallDevice ? 'space-between' : 'flex-end',
    alignSelf: isSmallDevice ? 'flex-end' : undefined,
  },
  timeWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: isSmallDevice ? 0 : 4,
  },
  nextTimeWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'right',
  },
});
