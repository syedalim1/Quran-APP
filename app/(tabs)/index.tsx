import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, RefreshControl, Text, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from 'adhan';
import { ThemedView } from '../../components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { NextPrayerCountdown } from '../../components/prayer/NextPrayerCountdown';
import { ActionButtons } from '../../components/prayer/ActionButtons';
import { PrayerTimeCard } from '../../components/prayer/PrayerTimeCard';
import { styles } from '../../src/styles/PrayertimeScreen.styles';

type PrayerName = keyof typeof PRAYER_NAMES;
type PrayerInfo = {
  english: string;
  arabic: string;
  color: string[];
  icon: string;
  description: string;
};

const PRAYER_NAMES: Record<string, PrayerInfo> = {
  fajr: { 
    english: 'Fajr', 
    arabic: 'الفجر', 
    color: ['#4A148C', '#7B1FA2'],
    icon: 'cloud-sun',
    description: 'Dawn Prayer'
  },
  sunrise: { 
    english: 'Sunrise', 
    arabic: 'الشروق', 
    color: ['#FF6F00', '#FFA000'],
    icon: 'sun',
    description: 'Sunrise Time'
  },
  dhuhr: { 
    english: 'Dhuhr', 
    arabic: 'الظهر', 
    color: ['#0277BD', '#039BE5'],
    icon: 'sun',
    description: 'Noon Prayer'
  },
  asr: { 
    english: 'Asr', 
    arabic: 'العصر', 
    color: ['#00695C', '#00897B'],
    icon: 'cloud-sun',
    description: 'Afternoon Prayer'
  },
  maghrib: { 
    english: 'Maghrib', 
    arabic: 'المغرب', 
    color: ['#880E4F', '#D81B60'],
    icon: 'cloud-sun-rain',
    description: 'Sunset Prayer'
  },
  isha: { 
    english: 'Isha', 
    arabic: 'العشاء', 
    color: ['#1A237E', '#3949AB'],
    icon: 'moon',
    description: 'Night Prayer'
  },
};

type CustomPrayerTimes = {
  [K in PrayerName]: Date;
};

function PrayerTimesScreen() {
  const insets = useSafeAreaInsets();
  const [prayerTimes, setPrayerTimes] = useState<CustomPrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerName | null>(null);
  const [timeToNextPrayer, setTimeToNextPrayer] = useState({
    hours: '--',
    minutes: '--',
    seconds: '--',
    name: 'Loading...'
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('Location unavailable');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Get theme colors
  const backgroundColor = useThemeColor({ light: '#f8f9fa', dark: '#121212' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text');
  const primaryColor = useThemeColor({ light: '#2196F3', dark: '#1976D2' }, 'text');
  const accentColor = useThemeColor({ light: '#FF9800', dark: '#FFA726' }, 'text');

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    calculatePrayerTimes().finally(() => setRefreshing(false));
  }, []);

  // Calculate prayer progress percentage
  const getProgressForPrayer = useCallback((prayer: PrayerName) => {
    if (!prayerTimes || !prayer || !coordinates) return 0;
    
    try {
      const now = new Date();
      const prayerTime = prayerTimes[prayer];
      
      if (!prayerTime || typeof prayerTime !== 'object') return 0;
      
      // Find next prayer after this one
      const prayers = Object.keys(PRAYER_NAMES);
      const currentIndex = prayers.indexOf(prayer);
      
      if (currentIndex === -1) return 0;
      
      let nextIndex = (currentIndex + 1) % prayers.length;
      let nextPrayerName = prayers[nextIndex];
      let nextTime = prayerTimes[nextPrayerName];
      
      // If the next prayer is on the next day, use a 24-hour window
      if (nextTime && nextTime < prayerTime) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const params = CalculationMethod.Karachi();
        params.madhab = Madhab.Hanafi;
        
        const tomorrowPrayerTimes = new PrayerTimes(coordinates, tomorrow, params);
        nextTime = tomorrowPrayerTimes[nextPrayerName as keyof PrayerTimes];
      }
      
      if (!nextTime) return 0;
      
      const totalDuration = nextTime.getTime() - prayerTime.getTime();
      const elapsed = now.getTime() - prayerTime.getTime();
      
      return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    } catch (error) {
      console.error('Error calculating prayer progress:', error);
      return 0;
    }
  }, [prayerTimes, coordinates]);

  // Find next prayer based on current time
  const findNextPrayer = useCallback(() => {
    if (!prayerTimes || isLoading) return;

    const now = new Date();
    const prayers = Object.keys(PRAYER_NAMES);
    let foundNext = false;

    for (const prayer of prayers) {
      const prayerTime = prayerTimes[prayer as PrayerName];
      if (!prayerTime || typeof prayerTime !== 'object') continue;

      if (prayerTime.getTime() > now.getTime()) {
        setNextPrayer(prayer as PrayerName);
        setTimeToNextPrayer(prev => ({
          ...prev,
          name: PRAYER_NAMES[prayer as PrayerName]?.english || prayer
        }));
        foundNext = true;
        break;
      }
    }

    if (!foundNext) {
      calculateTomorrowFirstPrayer();
    }
  }, [prayerTimes, isLoading]);

  // Calculate tomorrow's first prayer if all today's prayers have passed
  const calculateTomorrowFirstPrayer = useCallback(() => {
    if (!coordinates) return;

    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const calculationMethod = CalculationMethod.Karachi();
      calculationMethod.madhab = Madhab.Hanafi;
      
      const tomorrowPrayerTimes = new PrayerTimes(coordinates, tomorrow, calculationMethod);
      
      // Create empty object for prayer times
      const prayerTimesWithDates: CustomPrayerTimes = {} as CustomPrayerTimes;
      
      // Handle each prayer time
      Object.keys(PRAYER_NAMES).forEach(prayer => {
        try {
          // Get the prayer time from the Adhan library
          const prayerMethod = prayer as keyof PrayerTimes;
          const prayerTimeDate = tomorrowPrayerTimes.timeForPrayer(prayerMethod);
          
          if (prayerTimeDate) {
            prayerTimesWithDates[prayer as PrayerName] = prayerTimeDate;
          }
        } catch (error) {
          console.error(`Error processing ${prayer} time:`, error);
        }
      });
      
      const firstPrayer = Object.keys(PRAYER_NAMES)[0];
      
      setNextPrayer(firstPrayer as PrayerName);
      setTimeToNextPrayer(prev => ({
        ...prev,
        name: PRAYER_NAMES[firstPrayer as PrayerName]?.english || firstPrayer
      }));
    } catch (error) {
      console.error('Error calculating tomorrow prayer times:', error);
      setErrorMsg('Error calculating tomorrow prayer times');
    }
  }, [coordinates]);

  // Get location and calculate prayer times
  const calculatePrayerTimes = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      if (!location?.coords) {
        throw new Error('Could not get location. Please check your GPS settings.');
      }

      const { latitude, longitude } = location.coords;
      const newCoordinates = new Coordinates(latitude, longitude);
      setCoordinates(newCoordinates);

      try {
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (address) {
          const locationParts = [
            address.city,
            address.region,
            address.country
          ].filter(Boolean);
          setLocationName(locationParts.join(', ') || 'Location found');
        }
      } catch (error) {
        console.error('Error getting location name:', error);
        setLocationName('Location found');
      }

      const params = CalculationMethod.Karachi();
      params.madhab = Madhab.Hanafi;
      
      const date = new Date();
      const calculatedPrayerTimes = new PrayerTimes(newCoordinates, date, params);
      
      // Create empty object for prayer times
      const prayerTimesWithDates: CustomPrayerTimes = {} as CustomPrayerTimes;
      
      // Handle each prayer time
      Object.keys(PRAYER_NAMES).forEach(prayer => {
        try {
          // Get the prayer time from the Adhan library
          const prayerMethod = prayer as keyof PrayerTimes;
          const prayerTimeDate = calculatedPrayerTimes.timeForPrayer(prayerMethod);
          
          if (prayerTimeDate) {
            // If prayer time has already passed today, set it for tomorrow
            if (prayerTimeDate.getTime() < date.getTime()) {
              const tomorrow = new Date(date);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              const tomorrowPrayerTimes = new PrayerTimes(newCoordinates, tomorrow, params);
              const tomorrowTime = tomorrowPrayerTimes.timeForPrayer(prayerMethod);
              
              if (tomorrowTime) {
                prayerTimesWithDates[prayer as PrayerName] = tomorrowTime;
              }
            } else {
              prayerTimesWithDates[prayer as PrayerName] = prayerTimeDate;
            }
          }
        } catch (error) {
          console.error(`Error processing ${prayer} time:`, error);
        }
      });
      
      setPrayerTimes(prayerTimesWithDates);
      
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true
        })
      ]).start();
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error calculating prayer times:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Error calculating prayer times');
      setTimeToNextPrayer(prev => ({ 
        ...prev, 
        hours: '--',
        minutes: '--',
        seconds: '--',
        name: 'Error calculating times'
      }));
      setIsLoading(false);
    }
  }, [fadeAnim, slideAnim]);

  // Update countdown timer
  useEffect(() => {
    if (!prayerTimes || !nextPrayer || isLoading) return;
    
    const updateTimer = () => {
      try {
        const prayerTime = prayerTimes[nextPrayer];
        if (!prayerTime || !(prayerTime instanceof Date)) return;

        const now = new Date();
        const diff = prayerTime.getTime() - now.getTime();

        if (diff <= 0) {
          // Prayer time has arrived, find next prayer
          findNextPrayer();
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          setTimeToNextPrayer({
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            name: PRAYER_NAMES[nextPrayer]?.english || nextPrayer
          });
        }
      } catch (error) {
        console.error('Error updating timer:', error);
      }
    };

    updateTimer(); // Update immediately
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [prayerTimes, nextPrayer, isLoading, findNextPrayer]);

  // Find next prayer when prayer times change
  useEffect(() => {
    if (!prayerTimes || isLoading) return;
    findNextPrayer();
  }, [prayerTimes, isLoading, findNextPrayer]);

  // Initial load
  useEffect(() => {
    calculatePrayerTimes();
    
    // Request notification permissions
    registerForPushNotifications();
    
    return () => {
      // Clean up any subscriptions if needed
    };
  }, []);
  
  // Register for push notifications
  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for notifications');
        return;
      }
    } catch (error) {
      console.error('Error registering for notifications:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[primaryColor]}
            tintColor={primaryColor}
          />
        }
      >
        <Animated.View style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
          <NextPrayerCountdown 
            timeToNextPrayer={timeToNextPrayer}
            primaryColor={primaryColor}
            error={errorMsg}
          />
          
          <ActionButtons
            locationName={locationName}
            onRefresh={onRefresh}
          />
          
          {!isLoading && prayerTimes && Object.entries(PRAYER_NAMES).map(([prayer, info]) => {
            const prayerTime = prayerTimes[prayer as PrayerName];
            if (!prayerTime) return null;
            
            const isNext = prayer === nextPrayer;
            const progress = getProgressForPrayer(prayer as PrayerName);
            
            return (
              <PrayerTimeCard
                key={prayer}
                prayer={prayer}
                info={info}
                prayerTime={prayerTime}
                isNext={isNext}
                progress={progress}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              />
            );
          })}
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

export default PrayerTimesScreen;