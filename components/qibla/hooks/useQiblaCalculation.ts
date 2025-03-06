import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;

export const useQiblaCalculation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const calculateQiblaBearing = (lat: number, lon: number): number => {
    // Convert all angles to radians
    const φ1 = (lat * Math.PI) / 180;  // Current latitude
    const φ2 = (KAABA_LATITUDE * Math.PI) / 180;  // Kaaba latitude
    const Δλ = ((KAABA_LONGITUDE - lon) * Math.PI) / 180;  // Difference in longitude

    // Calculate Qibla direction using great circle formula
    const y = Math.sin(Δλ);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
    
    // Calculate initial bearing
    let qibla = Math.atan2(y, x);
    
    // Convert to degrees
    qibla = (qibla * 180) / Math.PI;
    
    // Normalize to 0-360
    qibla = (qibla + 360) % 360;

    return qibla;
  };

  const calculateDistance = (lat1: number, lon1: number): number => {
    // Convert to radians
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (KAABA_LATITUDE * Math.PI) / 180;
    const Δφ = ((KAABA_LATITUDE - lat1) * Math.PI) / 180;
    const Δλ = ((KAABA_LONGITUDE - lon1) * Math.PI) / 180;

    // Haversine formula
    const a = 
      Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) * 
      Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const R = 6371; // Earth's radius in kilometers
    
    return R * c;
  };

  const updateLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      });
      
      setLocation(location);
      
      // Calculate Qibla direction
      const qibla = calculateQiblaBearing(
        location.coords.latitude,
        location.coords.longitude
      );
      setQiblaDirection(qibla);
      
      // Calculate distance to Kaaba
      const dist = calculateDistance(
        location.coords.latitude,
        location.coords.longitude
      );
      setDistance(dist);
    } catch (error) {
      setErrorMsg('Error getting location');
    }
  };

  useEffect(() => {
    updateLocation();
  }, []);

  return {
    location,
    qiblaDirection,
    distance,
    errorMsg,
    updateLocation,
  };
}; 