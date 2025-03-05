import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  Vibration,
  Platform,
} from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { Magnetometer, Accelerometer, MagnetometerMeasurement, AccelerometerMeasurement } from "expo-sensors";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useThemeColor } from "../../hooks/useThemeColor";
import { styles } from "../../src/styles/QiblaScreen.style";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { FontAwesome } from "@expo/vector-icons";

interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;
const QIBLA_ACCURACY_THRESHOLD = 3;
const COMPASS_UPDATE_INTERVAL = 100;

export default function QiblaScreen() {
  // State variables
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [magneticDeclination, setMagneticDeclination] = useState<number>(0);
  const [lastVibrationTime, setLastVibrationTime] = useState<number>(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);

  // Sensor data
  const [filteredMagnet, setFilteredMagnet] = useState({ x: 0, y: 0, z: 0 });
  const [filteredAccel, setFilteredAccel] = useState({ x: 0, y: 0, z: 0 });

  // Animation values
  const rotateValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const calibrationValue = useRef(new Animated.Value(0)).current;
  const detailsHeight = useRef(new Animated.Value(0)).current;
  const needleValue = useRef(new Animated.Value(0)).current;
  const accuracyOpacity = useRef(new Animated.Value(0)).current;
  const makkahGlowValue = useRef(new Animated.Value(0.5)).current;

  // Sensor filter parameters
  const alpha = 0.15; // Smoothing factor for low-pass filter
  const calibrationSamples = useRef<{ x: number; y: number; z: number }[]>([]);

  // Theme colors
  const primaryColor = useThemeColor({ light: "#4A90E2", dark: "#5A9CF2" }, "text");
  const secondaryColor = useThemeColor({ light: "#F39C12", dark: "#F5B041" }, "text");
  const backgroundColor = useThemeColor({ light: "#fff", dark: "#000" }, "background");
  const textColor = useThemeColor({ light: "#333", dark: "#fff" }, "text");
  const errorColor = useThemeColor({ light: "#E74C3C", dark: "#FF6B6B" }, "text");
  const goldColor = "#FFD700";

  // Animated compass rotation
  const animateCompass = (angle: number) => {
    let currentValue = 0;
    rotateValue.addListener(({ value }) => {
      currentValue = value;
    });

    let newAngle = angle;
    const diff = ((newAngle - currentValue) + 540) % 360 - 180;
    newAngle = currentValue + diff;

    Animated.timing(rotateValue, {
      toValue: newAngle,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(needleValue, {
      toValue: newAngle,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  // Tilt-compensated heading calculation
  const calculateTrueHeading = () => {
    const { x: ax, y: ay, z: az } = filteredAccel;
    const { x: mx, y: my, z: mz } = filteredMagnet;

    const normAcc = Math.sqrt(ax ** 2 + ay ** 2 + az ** 2);
    const nax = ax / normAcc;
    const nay = ay / normAcc;
    const naz = az / normAcc;

    const ex = nay * mz - naz * my;
    const ey = naz * mx - nax * mz;
    const ez = nax * my - nay * mx;
    const normE = Math.sqrt(ex ** 2 + ey ** 2 + ez ** 2);
    const enx = ex / normE;
    const eny = ey / normE;
    const enz = ez / normE;

    const nx = nay * enz - naz * eny;
    const ny = naz * enx - nax * enz;
    const nz = nax * eny - nay * enx;

    const heading = Math.atan2(eny, nx) * (180 / Math.PI);
    return (heading + 360) % 360;
  };

  // Improved Qibla calculation using Great Circle formula
  const calculateQiblaBearing = (lat: number, lon: number): number => {
    const φ1 = lat * Math.PI / 180;
    const λ1 = lon * Math.PI / 180;
    const φ2 = KAABA_LATITUDE * Math.PI / 180;
    const λ2 = KAABA_LONGITUDE * Math.PI / 180;

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
  };

  // Update magnetic declination
  const updateMagneticDeclination = (lat: number, lon: number) => {
    const year = new Date().getFullYear();
    const declination = calculateMagneticDeclination(lat, lon, year);
    setMagneticDeclination(declination);
  };

  // Sensor handlers
  const handleMagnetometer = (data: MagnetometerMeasurement) => {
    setFilteredMagnet(prev => ({
      x: alpha * data.x + (1 - alpha) * prev.x,
      y: alpha * data.y + (1 - alpha) * prev.y,
      z: alpha * data.z + (1 - alpha) * prev.z,
    }));
  };

  const handleAccelerometer = (data: AccelerometerMeasurement) => {
    setFilteredAccel(prev => ({
      x: alpha * data.x + (1 - alpha) * prev.x,
      y: alpha * data.y + (1 - alpha) * prev.y,
      z: alpha * data.z + (1 - alpha) * prev.z,
    }));
  };

  // Calibration check
  const checkCalibration = () => {
    if (!isCalibrating) return;

    calibrationSamples.current.push({ ...filteredMagnet });
    if (calibrationSamples.current.length > 50) {
      calibrationSamples.current.shift();

      const avg = calibrationSamples.current.reduce((acc, val) => {
        acc.x += val.x;
        acc.y += val.y;
        acc.z += val.z;
        return acc;
      }, { x: 0, y: 0, z: 0 });

      avg.x /= 50;
      avg.y /= 50;
      avg.z /= 50;

      const stdDev = calibrationSamples.current.reduce((acc, val) => {
        acc.x += (val.x - avg.x) ** 2;
        acc.y += (val.y - avg.y) ** 2;
        acc.z += (val.z - avg.z) ** 2;
        return acc;
      }, { x: 0, y: 0, z: 0 });

      const totalStdDev = Math.sqrt(stdDev.x + stdDev.y + stdDev.z) / 50;
      if (totalStdDev < 0.05) {
        setIsCalibrating(false);
      }
    }
  };

  // Location permission and retrieval
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Location permission denied. Please enable in settings.");
        return;
      }

      try {
        setIsCalibrating(true);
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        setLocation(location);

        if (location) {
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            KAABA_LATITUDE,
            KAABA_LONGITUDE
          );
          setDistance(distance);
          updateMagneticDeclination(location.coords.latitude, location.coords.longitude);
          fetchPrayerTimes(location.coords.latitude, location.coords.longitude);
        }
      } catch (error) {
        setErrorMsg("Unable to retrieve location. Please try again.");
      }
    })();
  }, []);

  // Sensor setup
  useEffect(() => {
    let magnetSubscription: { remove: () => void } | null = null;
    let accelSubscription: { remove: () => void } | null = null;

    const setupSensors = async () => {
      setIsCalibrating(true);
      Magnetometer.setUpdateInterval(COMPASS_UPDATE_INTERVAL);
      Accelerometer.setUpdateInterval(COMPASS_UPDATE_INTERVAL);

      magnetSubscription = Magnetometer.addListener(handleMagnetometer);
      accelSubscription = Accelerometer.addListener(handleAccelerometer);
    };

    if (location) {
      setupSensors();
    }

    return () => {
      magnetSubscription?.remove();
      accelSubscription?.remove();
    };
  }, [location]);

  // Update heading and Qibla direction
  useEffect(() => {
    if (!location || isCalibrating) return;

    checkCalibration();

    const trueHeading = calculateTrueHeading();
    const qiblaBearing = calculateQiblaBearing(
      location.coords.latitude,
      location.coords.longitude
    );

    const adjustedHeading = (trueHeading + magneticDeclination + 360) % 360;
    const qiblaDirection = (qiblaBearing - adjustedHeading + 360) % 360;

    setHeading(adjustedHeading);
    setQiblaDirection(qiblaDirection);
    animateCompass(qiblaDirection);
  }, [filteredMagnet, filteredAccel, magneticDeclination]);

  // Render method
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.title, { color: primaryColor }]}>
        Qibla Direction
      </ThemedText>
  
      {errorMsg ? (
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={50} color="#FF6B6B" />
          <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setErrorMsg(null);
              setIsCalibrating(true);
            }}
          >
            <LinearGradient
              colors={["#4A90E2", "#357ABD"]}
              style={styles.button}
            >
              <ThemedText style={styles.buttonText}>Try Again</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : isCalibrating ? (
        <View style={styles.calibrationContainer}>
          <FontAwesome
            name="compass"
            size={50}
            color="#4A90E2"
            style={{ marginBottom: 20, opacity: 0.8 }}
          />
          <ThemedText style={styles.calibrationText}>
            Calibrating Compass...
          </ThemedText>
          <ThemedText style={styles.calibrationSubText}>
            Please rotate your device in a figure-8 pattern
          </ThemedText>
        </View>
      ) : (
        <>
          <View style={styles.compassContainer}>
            {accuracy !== null && (
              <LinearGradient
                colors={
                  Number(accuracy) <= QIBLA_ACCURACY_THRESHOLD
                    ? ["#4CAF50", "#45A049"]
                    : ["#FF9800", "#F57C00"]
                }
                style={styles.accuracyIndicator}
              >
                <ThemedText style={styles.accuracyText}>
                  ±{Number(accuracy).toFixed(1)}° {getAccuracyText()}
                </ThemedText>
              </LinearGradient>
            )}
  
            {/* Compass Background */}
            <Animated.View
              style={[
                styles.compassBackground,
                { transform: [{ rotate: compassRotation }] },
              ]}
            >
              <View style={styles.compassOuterRing}>
                <View style={styles.compassInnerRing}>
                  <View style={styles.compassRose}>
                    {/* Cardinal Directions */}
                    <ThemedText style={[styles.cardinalDirection, { top: -120 }]}>N</ThemedText>
                    <ThemedText style={[styles.cardinalDirection, { right: -120 }]}>E</ThemedText>
                    <ThemedText style={[styles.cardinalDirection, { bottom: -120 }]}>S</ThemedText>
                    <ThemedText style={[styles.cardinalDirection, { left: -120 }]}>W</ThemedText>
  
                    {/* Degree Markers */}
                    {Array.from({ length: 72 }, (_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.degreeMarker,
                          {
                            height: i % 9 === 0 ? 15 : 8,
                            backgroundColor: i % 9 === 0 ? "#4A90E2" : "rgba(74, 144, 226, 0.3)",
                            transform: [
                              { rotate: `${i * 5}deg` },
                              { translateY: -130 },
                            ],
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </Animated.View>
  
            {/* Qibla Needle */}
            <Animated.View
              style={[
                styles.qiblaNeedle,
                { transform: [{ rotate: needleRotation }] },
              ]}
            >
              <LinearGradient
                colors={["#FFD700", "#FFA000"]}
                style={styles.needleGradient}
              >
                <View style={styles.makkahIconContainer}>
                  <LinearGradient
                    colors={["rgba(255, 215, 0, 0.2)", "rgba(255, 215, 0, 0.1)"]}
                    style={styles.makkahIconBackground}
                  >
                    <FontAwesome5
                      name="mosque"
                      size={30}
                      color="#FFD700"
                      style={styles.makkahIcon}
                    />
                  </LinearGradient>
                </View>
              </LinearGradient>
            </Animated.View>
  
            {/* Center Dot */}
            <View style={styles.centerDot} />
          </View>
  
          {/* Direction Text */}
          <ThemedText style={styles.directionText}>
            {qiblaDirection.toFixed(1)}°
          </ThemedText>
  
          {/* Recalibrate Button */}
          <TouchableOpacity
            style={styles.recalibrateButton}
            onPress={handleRecalibrate}
          >
            <FontAwesome name="refresh" size={20} color="#4A90E2" />
            <ThemedText style={styles.recalibrateText}>Recalibrate</ThemedText>
          </TouchableOpacity>
  
          {/* Details Toggle */}
          <TouchableOpacity
            style={styles.detailsToggle}
            onPress={toggleDetails}
          >
            <ThemedText style={styles.detailsToggleText}>
              {showDetails ? "Hide Details" : "Show Details"}
            </ThemedText>
            <FontAwesome
              name={showDetails ? "chevron-up" : "chevron-down"}
              size={16}
              color="#4A90E2"
            />
          </TouchableOpacity>
  
          {/* Details Panel */}
          <Animated.View
            style={[
              styles.detailsPanel,
              {
                height: detailsHeight,
                opacity: 1,
              },
            ]}
          >
            <BlurView intensity={100} style={styles.blurContainer}>
              <View style={styles.detailRow}>
                <FontAwesome name="location-arrow" size={20} color="#4A90E2" />
                <ThemedText style={styles.detailText}>
                  Qibla: {qiblaDirection.toFixed(1)}°
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <FontAwesome name="compass" size={20} color="#4A90E2" />
                <ThemedText style={styles.detailText}>
                  Heading: {heading.toFixed(1)}°
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <FontAwesome name="map-marker" size={20} color="#4A90E2" />
                <ThemedText style={styles.detailText}>
                  Location: {location?.coords.latitude.toFixed(4)}°,{" "}
                  {location?.coords.longitude.toFixed(4)}°
                </ThemedText>
              </View>
            </BlurView>
          </Animated.View>
        </>
      )}
    </ThemedView>
  );
}