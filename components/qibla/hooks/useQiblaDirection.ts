import { useState, useEffect, useRef } from 'react';
import { Magnetometer, Accelerometer, DeviceMotion } from 'expo-sensors';
import * as Location from 'expo-location';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Platform } from 'react-native';
import { calculateQiblaBearing } from '../utils/qibla-calculator';
import { getMagneticDeclination } from '../utils/magnetic-declination';

type SensorData = {
  x: number;
  y: number;
  z: number;
};

type DeviceMotionData = {
  acceleration: SensorData | null;
  accelerationIncludingGravity: SensorData | null;
};

const SENSOR_UPDATE_INTERVAL = 100;
const HEADING_SMOOTHING_FACTOR = 0.1;
const CALIBRATION_TIMEOUT = 20000;
const CALIBRATION_SAMPLES_NEEDED = 50;

export const useQiblaDirection = () => {
  const [state, setState] = useState({
    isCalibrating: true,
    sensorAvailable: true,
    hasPermissions: true,
    orientation: 1,
    accuracy: 0,
    heading: 0,
    qiblaBearing: null as number | null,
    magneticDeclination: 0,
    location: null as Location.LocationObject | null,
    errorMsg: null as string | null,
    calibrationProgress: 0,
  });

  const calibrationSamples = useRef<SensorData[]>([]);
  const lastAccelData = useRef<SensorData | null>(null);
  const headingRef = useRef(0);

  // Sensor handlers
  const handleDeviceMotion = (data: DeviceMotionData) => {
    if (!data.accelerationIncludingGravity) return;
    
    const accel = data.accelerationIncludingGravity;
    const magnet = calculateMagnetometerData(accel);
    
    if (state.isCalibrating) {
      calibrationSamples.current.push(magnet);
      setState(s => ({
        ...s,
        calibrationProgress: Math.min(
          calibrationSamples.current.length / CALIBRATION_SAMPLES_NEEDED, 
          1
        )
      }));
      return;
    }
    
    calculateHeading(magnet, accel);
  };

  const calculateMagnetometerData = (accel: SensorData): SensorData => {
    // Simplified magnetometer calculation from device motion
    return {
      x: accel.x * 0.5,
      y: accel.y * 0.5,
      z: accel.z * 0.5,
    };
  };

  const calculateHeading = (magnet: SensorData, accel: SensorData) => {
    const { magneticDeclination, orientation } = state;
    const [mx, my] = [magnet.x, magnet.y];
    const [ax, ay, az] = [accel.x, accel.y, accel.z];
    
    // Tilt compensation calculations
    const pitch = Math.atan(-ax / Math.sqrt(ay * ay + az * az));
    const roll = Math.atan2(ay, az);
    
    const xh = mx * Math.cos(pitch) + my * Math.sin(roll) * Math.sin(pitch);
    const yh = my * Math.cos(roll);
    
    let heading = Math.atan2(yh, xh) * (180 / Math.PI);
    heading = (heading + magneticDeclination + 360) % 360;
    
    // Apply smoothing
    const delta = ((heading - headingRef.current + 360) % 360) - 180;
    const smoothed = headingRef.current + delta * HEADING_SMOOTHING_FACTOR;
    headingRef.current = smoothed % 360;
    
    setState(s => ({ ...s, heading: smoothed }));
  };

  // Initialization
  useEffect(() => {
    let subscriptions: any[] = [];
    
    const initialize = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState(s => ({ ...s, hasPermissions: false, errorMsg: 'Location permission required' }));
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const bearing = calculateQiblaBearing(location.coords.latitude, location.coords.longitude);
        const declination = await getMagneticDeclination(location.coords.latitude, location.coords.longitude);
        
        setState(s => ({
          ...s,
          location,
          qiblaBearing: bearing,
          magneticDeclination: declination,
        }));

        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setupSensors();
      } catch (error: any) {
        setState(s => ({ ...s, errorMsg: error.message || 'An error occurred' }));
      }
    };

    const setupSensors = async () => {
      if (await DeviceMotion.isAvailableAsync()) {
        DeviceMotion.setUpdateInterval(SENSOR_UPDATE_INTERVAL);
        subscriptions.push(DeviceMotion.addListener(handleDeviceMotion));
      } else {
        Magnetometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL);
        Accelerometer.setUpdateInterval(SENSOR_UPDATE_INTERVAL);
        subscriptions.push(
          Magnetometer.addListener(data => 
            lastAccelData.current && calculateHeading(data, lastAccelData.current)
          )
        );
        subscriptions.push(
          Accelerometer.addListener(data => lastAccelData.current = data)
        );
      }
    };

    initialize();
    return () => subscriptions.forEach(sub => sub?.remove());
  }, []);

  return {
    ...state,
    retryCalibration: () => {
      calibrationSamples.current = [];
      setState(s => ({ ...s, isCalibrating: true, calibrationProgress: 0 }));
    },
  };
}; 