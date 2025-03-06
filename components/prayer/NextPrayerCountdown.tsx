import React from 'react';
import { View, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';

interface NextPrayerCountdownProps {
  timeToNextPrayer: {
    hours: string;
    minutes: string;
    seconds: string;
    name: string;
  };
  primaryColor: string;
  error?: string | null;
}

export function NextPrayerCountdown({ timeToNextPrayer, primaryColor, error }: NextPrayerCountdownProps) {
  const isLoading = timeToNextPrayer.hours === '--';

  // Define different gradient colors based on the prayer name
  const getGradientColors = () => {
    const prayerName = timeToNextPrayer.name.toLowerCase();
    
    if (prayerName.includes('fajr')) return ['#4A148C', '#7B1FA2'] as const;
    if (prayerName.includes('sunrise')) return ['#FF6F00', '#FFA000'] as const;
    if (prayerName.includes('dhuhr')) return ['#1565C0', '#1976D2'] as const;
    if (prayerName.includes('asr')) return ['#2E7D32', '#43A047'] as const;
    if (prayerName.includes('maghrib')) return ['#C2185B', '#E91E63'] as const;
    if (prayerName.includes('isha')) return ['#1A237E', '#3F51B5'] as const;
    
    return ['#1A237E', '#3F51B5'] as const; // Default colors
  };

  // Choose the icon based on prayer name
  const getPrayerIcon = () => {
    const prayerName = timeToNextPrayer.name.toLowerCase();
    
    if (prayerName.includes('fajr')) return 'cloud-sun';
    if (prayerName.includes('sunrise')) return 'sun';
    if (prayerName.includes('dhuhr')) return 'sun';
    if (prayerName.includes('asr')) return 'cloud-sun';
    if (prayerName.includes('maghrib')) return 'cloud-sun-rain';
    if (prayerName.includes('isha')) return 'moon';
    
    return 'mosque'; // Default icon
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name={getPrayerIcon()} size={30} color="#fff" style={styles.icon} />
            </View>
            <ThemedText style={styles.title}>Next Prayer</ThemedText>
          </View>

          <View style={styles.prayerNameContainer}>
            <ThemedText style={styles.prayerName}>
              {timeToNextPrayer.name}
            </ThemedText>
            <View style={styles.decorativeLine} />
          </View>

          {error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : isLoading ? (
            <ThemedText style={styles.loadingText}>Calculating prayer times...</ThemedText>
          ) : (
            <View style={styles.countdownContainer}>
              <View style={styles.timeUnit}>
                <View style={styles.timeNumberContainer}>
                  <ThemedText style={styles.timeNumber}>{timeToNextPrayer.hours}</ThemedText>
                </View>
                <ThemedText style={styles.timeLabel}>Hours</ThemedText>
              </View>

              <ThemedText style={styles.timeSeparator}>:</ThemedText>

              <View style={styles.timeUnit}>
                <View style={styles.timeNumberContainer}>
                  <ThemedText style={styles.timeNumber}>{timeToNextPrayer.minutes}</ThemedText>
                </View>
                <ThemedText style={styles.timeLabel}>Minutes</ThemedText>
              </View>

              <ThemedText style={styles.timeSeparator}>:</ThemedText>

              <View style={styles.timeUnit}>
                <View style={styles.timeNumberContainer}>
                  <ThemedText style={styles.timeNumber}>{timeToNextPrayer.seconds}</ThemedText>
                </View>
                <ThemedText style={styles.timeLabel}>Seconds</ThemedText>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
  container: {
    margin: 16,
    width: width - 32,
    alignSelf: 'center',
  },
  gradient: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: isSmallDevice ? 16 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  prayerNameContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  prayerName: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    marginBottom: 10,
  },
  decorativeLine: {
    width: width * 0.3,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 3,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: isSmallDevice ? 10 : 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexWrap: isSmallDevice ? 'wrap' : 'nowrap',
  },
  timeUnit: {
    alignItems: 'center',
    minWidth: isSmallDevice ? 60 : 70,
    marginVertical: isSmallDevice ? 5 : 0,
  },
  timeNumberContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 12,
    minWidth: isSmallDevice ? 50 : 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  timeNumber: {
    fontSize: isSmallDevice ? 26 : 30,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  timeSeparator: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
  },
});
