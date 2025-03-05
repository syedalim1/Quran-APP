import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Platform, StatusBar, Animated, RefreshControl } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Coordinates, PrayerTimes, Madhab, CalculationMethod } from 'adhan';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

// Prayer time calculation methods with corrected parameters
const CALCULATION_METHOD = 'Karachi'; // Using string literal for calculation method

// Prayer names with Arabic translations and enhanced gradients
const PRAYER_NAMES = {
  fajr: { 
    english: 'Fajr', 
    arabic: 'الفجر', 
    color: ['#4A148C', '#7B1FA2'] as const,
    icon: 'sun',
    description: 'Dawn Prayer'
  },
  sunrise: { 
    english: 'Sunrise', 
    arabic: 'الشروق', 
    color: ['#FF6F00', '#FFA000'] as const,
    icon: 'sun',
    description: 'Sunrise Time'
  },
  dhuhr: { 
    english: 'Dhuhr', 
    arabic: 'الظهر', 
    color: ['#1565C0', '#1976D2'] as const,
    icon: 'sun',
    description: 'Noon Prayer'
  },
  asr: { 
    english: 'Asr', 
    arabic: 'العصر', 
    color: ['#2E7D32', '#43A047'] as const,
    icon: 'sun',
    description: 'Afternoon Prayer'
  },
  maghrib: { 
    english: 'Maghrib', 
    arabic: 'المغرب', 
    color: ['#C2185B', '#E91E63'] as const,
    icon: 'moon',
    description: 'Sunset Prayer'
  },
  isha: { 
    english: 'Isha', 
    arabic: 'العشاء', 
    color: ['#1A237E', '#3F51B5'] as const,
    icon: 'star',
    description: 'Night Prayer'
  },
};

function PrayerTimesScreen() {
  const insets = useSafeAreaInsets();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [timeToNextPrayer, setTimeToNextPrayer] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Loading location...');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Refs for timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get theme colors
  const backgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#121212' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text');

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Initial prayer times calculation
    calculatePrayerTimes();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const calculatePrayerTimes = async () => {
    try {
      setErrorMsg(null);
      
      // Check location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get current location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      if (!location || !location.coords) {
        setErrorMsg('Could not get location. Please check your GPS settings.');
        return;
      }

      const { latitude, longitude } = location.coords;
      const newCoordinates = new Coordinates(latitude, longitude);
      setCoordinates(newCoordinates);

      // Get location name
      try {
        const [address] = await Location.reverseGeocodeAsync({ 
          latitude, 
          longitude
        });
        
        if (address) {
          const locationParts = [
            address.city,
            address.subregion,
            address.region,
            address.country
          ].filter(Boolean);
          const locationName = locationParts.join(', ');
          setLocationName(locationName || 'Location found');
        } else {
          setLocationName('Location found');
        }
      } catch (error) {
        console.log('Error getting location name:', error);
        setLocationName('Location found');
      }

      // Calculate prayer times using Karachi method
      const params = CalculationMethod.Karachi();
      params.madhab = Madhab.Hanafi;
      
      const date = new Date();
      const prayerTimes = new PrayerTimes(newCoordinates, date, params);
      setPrayerTimes(prayerTimes);

      // Calculate next prayer
      const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const now = new Date();
      let nextPrayerFound = false;

      for (const prayer of prayers) {
        const prayerTime = prayerTimes[prayer as keyof PrayerTimes] as Date;
        if (prayerTime > now) {
          setNextPrayer(prayer);
          const diff = prayerTime.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeToNextPrayer(`${hours}h ${minutes}m`);
          nextPrayerFound = true;
          break;
        }
      }

      if (!nextPrayerFound) {
        // If no next prayer found today, get tomorrow's Fajr
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowPrayers = new PrayerTimes(newCoordinates, tomorrow, params);
        setNextPrayer('fajr');
        const fajrTime = tomorrowPrayers.fajr;
        const diff = fajrTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeToNextPrayer(`${hours}h ${minutes}m`);
      }

    } catch (error) {
      console.error('Error calculating prayer times:', error);
      setErrorMsg('Error calculating prayer times. Please check your location settings.');
      setLocationName('Location error');
    }
  };

  const getProgressForPrayer = (prayerTime: Date) => {
    if (!prayerTimes || !prayerTime) return 0;
    
    const now = new Date();
    const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const currentPrayerIndex = prayers.findIndex(p => {
      const time = prayerTimes[p as keyof PrayerTimes];
      return time instanceof Date && time.getTime() === prayerTime.getTime();
    });
    
    if (currentPrayerIndex === -1) return 0;
    
    const nextPrayerIndex = currentPrayerIndex + 1;
    let nextPrayerTime: Date;
    
    if (nextPrayerIndex < prayers.length) {
      const nextPrayer = prayers[nextPrayerIndex];
      const time = prayerTimes[nextPrayer as keyof PrayerTimes];
      if (time instanceof Date) {
        nextPrayerTime = time;
      } else {
        // If no next prayer today, use 24 hours from current prayer
        nextPrayerTime = new Date(prayerTime.getTime() + (24 * 60 * 60 * 1000));
      }
    } else {
      // If this is the last prayer, use 24 hours from current prayer
      nextPrayerTime = new Date(prayerTime.getTime() + (24 * 60 * 60 * 1000));
    }

    const total = nextPrayerTime.getTime() - prayerTime.getTime();
    const elapsed = now.getTime() - prayerTime.getTime();
    
    return Math.max(0, Math.min(1, elapsed / total));
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await calculatePrayerTimes();
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    }
    setRefreshing(false);
  }, []);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        style={[styles.headerGradient, { height: 100 + insets.top }]}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={textColor}
            colors={['#4CAF50', '#2196F3', '#9C27B0']}
          />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {errorMsg ? (
            <View style={styles.errorContainer}>
              <FontAwesome name="exclamation-circle" size={50} color="#ff6b6b" />
              <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={calculatePrayerTimes}
              >
                <LinearGradient
                  colors={['#4CAF50', '#43A047']}
                  style={styles.retryButtonGradient}
                >
                  <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.locationContainer}>
                <FontAwesome name="map-marker" size={24} color="#ff6b6b" />
                <ThemedText style={styles.locationText}>{locationName}</ThemedText>
              </View>
              {nextPrayer && timeToNextPrayer && (
                <View style={styles.nextPrayerContainer}>
                  <LinearGradient
                    colors={PRAYER_NAMES[nextPrayer as keyof typeof PRAYER_NAMES].color}
                    style={styles.nextPrayerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.nextPrayerContent}>
                      <ThemedText style={styles.nextPrayerLabel}>Next Prayer</ThemedText>
                      <View style={styles.nextPrayerInfo}>
                        <View style={styles.nextPrayerIconContainer}>
                          <FontAwesome 
                            name={PRAYER_NAMES[nextPrayer as keyof typeof PRAYER_NAMES].icon} 
                            size={width < 360 ? 24 : 30} 
                            color="#fff" 
                          />
                        </View>
                        <View style={styles.nextPrayerTextContainer}>
                          <ThemedText style={styles.nextPrayerName}>
                            {PRAYER_NAMES[nextPrayer as keyof typeof PRAYER_NAMES].english}
                          </ThemedText>
                          <ThemedText style={styles.nextPrayerArabic}>
                            {PRAYER_NAMES[nextPrayer as keyof typeof PRAYER_NAMES].arabic}
                          </ThemedText>
                          <ThemedText style={styles.nextPrayerDescription}>
                            {PRAYER_NAMES[nextPrayer as keyof typeof PRAYER_NAMES].description}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.nextPrayerTimeContainer}>
                        <ThemedText style={styles.nextPrayerTimeLabel}>Time Remaining</ThemedText>
                        <View style={styles.timeWrapper}>
                          <ThemedText style={[styles.nextPrayerTime, styles.timeText]}>
                            {timeToNextPrayer.split('h')[0]}
                          </ThemedText>
                          <ThemedText style={styles.timeUnit}>h</ThemedText>
                          <ThemedText style={[styles.nextPrayerTime, styles.timeText]}>
                            {timeToNextPrayer.split('h')[1].split('m')[0]}
                          </ThemedText>
                          <ThemedText style={styles.timeUnit}>m</ThemedText>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              )}
              {prayerTimes && Object.entries(PRAYER_NAMES).map(([prayer, info]) => {
                const prayerTime = prayerTimes[prayer as keyof PrayerTimes] as Date;
                const isNext = prayer === nextPrayer;
                const progress = getProgressForPrayer(prayerTime);
                
                return (
                  <View key={prayer} style={[styles.prayerTimeCard, isNext && styles.nextPrayerCard]}>
                    <LinearGradient
                      colors={info.color || ['#4a90e2', '#357abd']}
                      style={styles.prayerTimeGradient}
                    >
                      <View style={styles.prayerTimeContent}>
                        <View style={styles.prayerNameContainer}>
                          <FontAwesome 
                            name={info.icon}
                            size={24} 
                            color="#fff" 
                            style={styles.prayerIcon} 
                          />
                          <View>
                            <ThemedText style={styles.prayerNameEnglish}>
                              {info.english}
                            </ThemedText>
                            <ThemedText style={styles.prayerNameArabic}>
                              {info.arabic}
                            </ThemedText>
                          </View>
                        </View>
                        <View style={styles.prayerTimeWrapper}>
                          <ThemedText style={styles.prayerTime}>
                            {prayerTime.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </ThemedText>
                          {isNext && (
                            <View style={styles.nextIndicator}>
                              <ThemedText style={styles.nextIndicatorText}>NEXT</ThemedText>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                      </View>
                    </LinearGradient>
                  </View>
                );
              })}
            </>
          )}
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#ff6b6b',
  },
  retryButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  retryButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  prayerTimeCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nextPrayerCard: {
    transform: [{ scale: 1.02 }],
    elevation: 5,
  },
  prayerTimeGradient: {
    padding: 15,
  },
  prayerTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prayerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    marginRight: 12,
  },
  prayerNameEnglish: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  prayerNameArabic: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  prayerTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  nextPrayerContainer: {
    marginHorizontal: width < 360 ? 10 : 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nextPrayerGradient: {
    padding: width < 360 ? 15 : 20,
  },
  nextPrayerContent: {
    alignItems: 'center',
    width: '100%',
  },
  nextPrayerLabel: {
    fontSize: width < 360 ? 14 : 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nextPrayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: width < 360 ? 10 : 15,
  },
  nextPrayerIconContainer: {
    width: width < 360 ? 40 : 50,
    height: width < 360 ? 40 : 50,
    borderRadius: width < 360 ? 20 : 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width < 360 ? 12 : 15,
  },
  nextPrayerTextContainer: {
    flex: 1,
  },
  nextPrayerName: {
    fontSize: width < 360 ? 24 : 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  nextPrayerArabic: {
    fontSize: width < 360 ? 16 : 20,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 2,
  },
  nextPrayerDescription: {
    fontSize: width < 360 ? 12 : 14,
    color: '#fff',
    opacity: 0.8,
  },
  nextPrayerTimeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: width < 360 ? 12 : 16,
    paddingVertical: width < 360 ? 8 : 12,
    borderRadius: width < 360 ? 12 : 15,
    width: '100%',
    marginTop: width < 360 ? 8 : 12,
  },
  nextPrayerTimeLabel: {
    fontSize: width < 360 ? 11 : 13,
    color: '#fff',
    opacity: 0.9,
    marginBottom: width < 360 ? 4 : 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  nextPrayerTime: {
    fontSize: width < 360 ? 28 : 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
    textAlign: 'center'
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexWrap: 'nowrap',
  },
  timeText: {
    fontSize: width < 360 ? 28 : 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
    minWidth: width < 360 ? 35 : 45,
  },
  timeUnit: {
    fontSize: width < 360 ? 16 : 20,
    color: '#fff',
    opacity: 0.8,
    marginHorizontal: width < 360 ? 4 : 6,
    fontWeight: '500',
  },
  prayerTimeWrapper: {
    alignItems: 'flex-end',
  },
  nextIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  nextIndicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 10,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
});

export default PrayerTimesScreen;
