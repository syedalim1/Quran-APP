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
import { styles } from '../../src/styles/PrayertimeScreen.styles';
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
    icon: 'clock-o' as const,
    description: 'Dawn Prayer'
  },
  sunrise: { 
    english: 'Sunrise', 
    arabic: 'الشروق', 
    color: ['#FF6F00', '#FFA000'] as const,
    icon: 'clock-o' as const,
    description: 'Sunrise Time'
  },
  dhuhr: { 
    english: 'Dhuhr', 
    arabic: 'الظهر', 
    color: ['#1565C0', '#1976D2'] as const,
    icon: 'clock-o' as const,
    description: 'Noon Prayer'
  },
  asr: { 
    english: 'Asr', 
    arabic: 'العصر', 
    color: ['#2E7D32', '#43A047'] as const,
    icon: 'clock-o' as const,
    description: 'Afternoon Prayer'
  },
  maghrib: { 
    english: 'Maghrib', 
    arabic: 'المغرب', 
    color: ['#C2185B', '#E91E63'] as const,
    icon: 'clock-o' as const,
    description: 'Sunset Prayer'
  },
  isha: { 
    english: 'Isha', 
    arabic: 'العشاء', 
    color: ['#1A237E', '#3F51B5'] as const,
    icon: 'clock-o' as const,
    description: 'Night Prayer'
  },
};

function PrayerTimesScreen() {
  const insets = useSafeAreaInsets();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [timeToNextPrayer, setTimeToNextPrayer] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    name: string;
  }>({ hours: '00', minutes: '00', seconds: '00', name: '' });
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
  const primaryColor = useThemeColor({ light: '#2196F3', dark: '#1976D2' }, 'text');

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
      const calculateTimeToNextPrayer = (currentTime: Date, nextPrayerTime: Date | number | any, prayerName: string) => {
        // Ensure we have a valid Date object
        let prayerDateTime: Date;
        
        try {
          if (nextPrayerTime instanceof Date) {
            prayerDateTime = nextPrayerTime;
          } else if (typeof nextPrayerTime === 'number') {
            prayerDateTime = new Date(nextPrayerTime);
          } else if (typeof nextPrayerTime === 'string') {
            prayerDateTime = new Date(nextPrayerTime);
          } else {
            prayerDateTime = currentTime; // fallback to current time if invalid
          }
        } catch (error) {
          console.error('Error converting prayer time to Date:', error);
          prayerDateTime = currentTime;
        }
        
        const diff = prayerDateTime.getTime() - currentTime.getTime();
        const hours = Math.floor(Math.max(0, diff) / (1000 * 60 * 60));
        const minutes = Math.floor((Math.max(0, diff) % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((Math.max(0, diff) % (1000 * 60)) / 1000);
        
        return {
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0'),
          name: PRAYER_NAMES[prayerName as keyof typeof PRAYER_NAMES]?.english || prayerName
        };
      };

      const updatePrayerTimes = () => {
        if (!coordinates || !prayerTimes) return;

        const now = new Date();
        const prayers = Object.keys(PRAYER_NAMES);
        let foundNext = false;

        for (const prayer of prayers) {
          const prayerTime = prayerTimes[prayer as keyof PrayerTimes];
          
          // Skip if prayer time is not available or is a function
          if (!prayerTime || typeof prayerTime === 'function') continue;

          try {
            // Ensure prayerTime is a Date object
            let prayerDateTime: Date;
            
            if (prayerTime instanceof Date) {
              prayerDateTime = prayerTime;
            } else if (typeof prayerTime === 'number') {
              prayerDateTime = new Date(prayerTime);
            } else {
              // For any other type, try to create a new Date
              prayerDateTime = new Date(prayerTime as any);
              
              // Validate that we got a valid date
              if (isNaN(prayerDateTime.getTime())) {
                throw new Error('Invalid prayer time format');
              }
            }

            if (prayerDateTime.getTime() > now.getTime() && !foundNext) {
              setNextPrayer(prayer);
              const timeUntil = calculateTimeToNextPrayer(now, prayerDateTime, prayer);
              setTimeToNextPrayer(timeUntil);
              foundNext = true;
              break;
            }
          } catch (error) {
            console.error('Error processing prayer time:', error);
            continue;
          }
        }

        if (!foundNext) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          try {
            // Get the calculation method parameters by calling the method
            const calculationMethod = CalculationMethod[CALCULATION_METHOD as keyof typeof CalculationMethod]();
            const tomorrowPrayerTimes = new PrayerTimes(coordinates, tomorrow, calculationMethod);
            const firstPrayer = prayers[0];
            const nextPrayerTime = tomorrowPrayerTimes[firstPrayer as keyof PrayerTimes];
            
            if (nextPrayerTime && typeof nextPrayerTime !== 'function') {
              setNextPrayer(firstPrayer);
              let prayerDateTime: Date;
              
              if (nextPrayerTime instanceof Date) {
                prayerDateTime = nextPrayerTime;
              } else if (typeof nextPrayerTime === 'number') {
                prayerDateTime = new Date(nextPrayerTime);
              } else {
                // For any other type, try to create a new Date
                prayerDateTime = new Date(nextPrayerTime as any);
                
                // Validate that we got a valid date
                if (isNaN(prayerDateTime.getTime())) {
                  throw new Error('Invalid prayer time format');
                }
              }
              
              const timeUntil = calculateTimeToNextPrayer(now, prayerDateTime, firstPrayer);
              setTimeToNextPrayer(timeUntil);
            }
          } catch (error) {
            console.error('Error calculating tomorrow prayer times:', error);
          }
        }
      };

      updatePrayerTimes();

      // Cleanup timer on unmount
      const timer = setInterval(() => {
        updatePrayerTimes();
      }, 1000);

      timerRef.current = timer;
      return () => clearInterval(timer);
    } catch (error) {
      console.error('Error calculating prayer times:', error);
      setErrorMsg('Error calculating prayer times. Please check your location settings.');
      setLocationName('Location error');
    }
  };

  const getProgressForPrayer = (prayerTime: any) => {
    if (!prayerTimes || !prayerTime || !coordinates) return 0;
    
    const now = new Date();
    const prayers = Object.keys(PRAYER_NAMES);
    const currentPrayerIndex = prayers.findIndex(p => {
      const time = prayerTimes[p as keyof PrayerTimes];
      if (!time || typeof time === 'function') return false;
      
      try {
        const currentTime = time instanceof Date ? time : new Date(time as any);
        const targetTime = prayerTime instanceof Date ? prayerTime : new Date(prayerTime as any);
        
        return currentTime.getTime() === targetTime.getTime();
      } catch (error) {
        console.error('Error comparing prayer times:', error);
        return false;
      }
    });
    
    if (currentPrayerIndex === -1) return 0;
    
    const nextPrayerIndex = currentPrayerIndex + 1;
    let nextPrayerTime: Date | null = null;
    
    try {
      if (nextPrayerIndex < prayers.length) {
        const nextTime = prayerTimes[prayers[nextPrayerIndex] as keyof PrayerTimes];
        if (nextTime && typeof nextTime !== 'function') {
          nextPrayerTime = nextTime instanceof Date ? nextTime : new Date(nextTime as any);
        }
      } else {
        // If it's the last prayer of the day, use the first prayer of next day
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const calculationMethod = CalculationMethod[CALCULATION_METHOD as keyof typeof CalculationMethod]();
        const tomorrowPrayerTimes = new PrayerTimes(coordinates, tomorrow, calculationMethod);
        const firstPrayer = prayers[0];
        const nextTime = tomorrowPrayerTimes[firstPrayer as keyof PrayerTimes];
        if (nextTime && typeof nextTime !== 'function') {
          nextPrayerTime = nextTime instanceof Date ? nextTime : new Date(nextTime as any);
        }
      }
      
      if (!nextPrayerTime) return 0;
      
      const currentTime = prayerTime instanceof Date ? prayerTime : new Date(prayerTime as any);
      const totalDuration = nextPrayerTime.getTime() - currentTime.getTime();
      const elapsed = now.getTime() - currentTime.getTime();
      
      return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    } catch (error) {
      console.error('Error calculating prayer progress:', error);
      return 0;
    }
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

  const renderNextPrayerCountdown = () => {
    return (
      <View style={styles.nextPrayerContainer}>
        <LinearGradient
          colors={[primaryColor, `${primaryColor}80`]}
          style={styles.nextPrayerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.nextPrayerContent}>
            <View style={styles.nextPrayerHeader}>
              <FontAwesome name="clock-o" size={24} color="#fff" style={styles.nextPrayerIcon} />
              <ThemedText style={styles.nextPrayerTitle}>Next Prayer</ThemedText>
            </View>
            
            <ThemedText style={styles.nextPrayerName}>
              {timeToNextPrayer.name}
            </ThemedText>
            
            <View style={styles.countdownContainer}>
              <View style={styles.timeUnit}>
                <ThemedText style={styles.timeNumber}>{timeToNextPrayer.hours}</ThemedText>
                <ThemedText style={styles.timeLabel}>Hours</ThemedText>
              </View>
              
              <ThemedText style={styles.timeSeparator}>:</ThemedText>
              
              <View style={styles.timeUnit}>
                <ThemedText style={styles.timeNumber}>{timeToNextPrayer.minutes}</ThemedText>
                <ThemedText style={styles.timeLabel}>Minutes</ThemedText>
              </View>
              
              <ThemedText style={styles.timeSeparator}>:</ThemedText>
              
              <View style={styles.timeUnit}>
                <ThemedText style={styles.timeNumber}>{timeToNextPrayer.seconds}</ThemedText>
                <ThemedText style={styles.timeLabel}>Seconds</ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderNextPrayerCountdown()}
        
        {/* Rest of the prayer times list */}
        {prayerTimes && Object.entries(PRAYER_NAMES).map(([prayer, info]) => {
          const prayerTime = prayerTimes[prayer as keyof PrayerTimes];
          if (!prayerTime) return null;
          
          const isNext = prayer === nextPrayer;
          const progress = getProgressForPrayer(prayerTime);
          
          return (
            <View key={prayer} style={[styles.prayerTimeCard, isNext && styles.nextPrayerCard]}>
              <LinearGradient
                colors={info.color}
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
                  <ThemedText style={styles.prayerTime}>
                    {(() => {
                      // Convert prayerTime to Date if it isn't already
                      let timeToDisplay: Date;
                      try {
                        if (prayerTime instanceof Date) {
                          timeToDisplay = prayerTime;
                        } else if (typeof prayerTime === 'number') {
                          timeToDisplay = new Date(prayerTime);
                        } else if (typeof prayerTime === 'function') {
                          return '--:--'; // Handle function case
                        } else {
                          timeToDisplay = new Date(prayerTime as any);
                          if (isNaN(timeToDisplay.getTime())) {
                            return '--:--';
                          }
                        }
                        return timeToDisplay.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } catch (error) {
                        console.error('Error formatting prayer time:', error);
                        return '--:--';
                      }
                    })()}
                  </ThemedText>
                </View>
                {isNext && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                )}
              </LinearGradient>
            </View>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

export default PrayerTimesScreen;
