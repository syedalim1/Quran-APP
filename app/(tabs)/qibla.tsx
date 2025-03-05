import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  Vibration,
  Platform,
} from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { Magnetometer } from "expo-sensors";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { Compass, Navigation, MapPin, RotateCcw, Info, Clock, ChevronDown, ChevronUp, Home } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useThemeColor } from "../../hooks/useThemeColor";
import { styles } from "../../src/styles/QiblaScreen.style";
import LottieView from 'lottie-react-native';
import { FontAwesome } from "@expo/vector-icons";

const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;
const QIBLA_ACCURACY_THRESHOLD = 3; // Increased accuracy threshold
const COMPASS_UPDATE_INTERVAL = 100; // More frequent updates

export default function QiblaScreen() {
  // State variables
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [magneticDeclination, setMagneticDeclination] = useState(0);
  const [lastVibrationTime, setLastVibrationTime] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState<any>(null);

  // Animation values
  const rotateValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const calibrationValue = useRef(new Animated.Value(0)).current;
  const detailsHeight = useRef(new Animated.Value(0)).current;
  const needleValue = useRef(new Animated.Value(0)).current;
  const accuracyOpacity = useRef(new Animated.Value(0)).current;
  const makkahGlowValue = useRef(new Animated.Value(0.5)).current;

  // Theme colors
  const primaryColor = useThemeColor({ light: "#4A90E2", dark: "#5A9CF2" }, "text");
  const secondaryColor = useThemeColor({ light: "#F39C12", dark: "#F5B041" }, "text");
  const backgroundColor = useThemeColor({ light: "#fff", dark: "#000" }, "background");
  const textColor = useThemeColor({ light: "#333", dark: "#fff" }, "text");
  const errorColor = useThemeColor({ light: "#E74C3C", dark: "#FF6B6B" }, "text");
  const goldColor = "#FFD700";

  // Animated compass rotation
  const animateCompass = (angle: number) => {
    // Calculate shortest rotation path
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

    // Animate needle separately for smoother effect
    Animated.timing(needleValue, {
      toValue: newAngle,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  // Pulse animation
  useEffect(() => {
    const startPulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(() => startPulseAnimation());
    };

    startPulseAnimation();

    return () => {
      pulseValue.stopAnimation();
    };
  }, []);

  // Makkah icon glow animation
  useEffect(() => {
    const startGlowAnimation = () => {
      Animated.sequence([
        Animated.timing(makkahGlowValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(makkahGlowValue, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(() => startGlowAnimation());
    };

    startGlowAnimation();

    return () => {
      makkahGlowValue.stopAnimation();
    };
  }, []);

  // Calibration animation
  useEffect(() => {
    if (isCalibrating) {
      const startCalibrationAnimation = () => {
        Animated.loop(
          Animated.timing(calibrationValue, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();
      };

      startCalibrationAnimation();
    } else {
      calibrationValue.stopAnimation();
      calibrationValue.setValue(0);
    }
  }, [isCalibrating]);

  // Details panel animation
  useEffect(() => {
    Animated.timing(detailsHeight, {
      toValue: showDetails ? 200 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [showDetails]);

  // Accuracy indicator animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(accuracyOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(accuracyOpacity, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [accuracy]);

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

        // Calculate distance to Kaaba
        if (location) {
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            KAABA_LATITUDE,
            KAABA_LONGITUDE
          );
          setDistance(distance);
        }

        // Get magnetic declination (simplified - in a real app you'd use a proper API)
        estimateMagneticDeclination(location.coords.latitude, location.coords.longitude);

        // Get prayer times
        fetchPrayerTimes(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        setErrorMsg("Unable to retrieve location. Please try again.");
      }
    })();
  }, []);

  // Magnetometer setup
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const setupMagnetometer = async () => {
      setIsCalibrating(true);
      Magnetometer.setUpdateInterval(COMPASS_UPDATE_INTERVAL);

      subscription = Magnetometer.addListener((data) => {
        if (location) {
          const direction = calculateQiblaDirection(data, location);
          setQiblaDirection(direction);
          animateCompass(direction);

          // Update accuracy based on magnetometer data stability
          updateAccuracy(data);

          // Trigger haptic feedback when pointing to Qibla
          const qiblaAngleDiff = Math.abs(direction);
          if (qiblaAngleDiff < QIBLA_ACCURACY_THRESHOLD) {
            const now = Date.now();
            if (now - lastVibrationTime > 2000) { // Limit to once every 2 seconds
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } else {
                Vibration.vibrate([0, 50, 100, 50]);
              }
              setLastVibrationTime(now);
            }
          }
        }
      });

      // Simulate calibration with a more realistic time
      setTimeout(() => setIsCalibrating(false), 3000);
    };

    if (location) {
      setupMagnetometer();
    }

    return () => {
      subscription?.remove();
    };
  }, [location]);

  // Estimate magnetic declination (simplified)
  const estimateMagneticDeclination = (latitude: number, longitude: number) => {
    // This is a very simplified model - in a real app, you would use a proper API or library
    // like the World Magnetic Model (WMM) or International Geomagnetic Reference Field (IGRF)
    const latRad = (latitude * Math.PI) / 180;
    const lonRad = (longitude * Math.PI) / 180;
    
    // Simplified calculation (not accurate, just for demonstration)
    const declination = 
      2.5 * Math.sin(latRad) * Math.cos(lonRad) + 
      0.5 * Math.cos(2 * latRad) * Math.sin(2 * lonRad);
    
    setMagneticDeclination(declination);
  };

  // Update accuracy based on magnetometer data stability
  const updateAccuracy = (data: { x: number; y: number; z: number }) => {
    // Calculate magnitude of magnetic field
    const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
    
    // Determine accuracy based on magnitude (simplified)
    if (magnitude < 20) {
      setAccuracy(1);
    } else if (magnitude < 40) {
      setAccuracy(2);
    } else {
      setAccuracy(3);
    }
  };

  // Fetch prayer times (simplified)
  const fetchPrayerTimes = (latitude: number, longitude: number) => {
    // In a real app, you would use a proper API
    // This is just a placeholder with fixed times
    setPrayerTimes({
      fajr: "05:12 AM",
      dhuhr: "12:30 PM",
      asr: "03:45 PM",
      maghrib: "06:32 PM",
      isha: "08:00 PM",
    });
  };

  // Qibla direction calculation with enhanced accuracy
  const calculateQiblaDirection = (
    magnetometerData: { x: number; y: number; z: number },
    location: Location.LocationObject
  ) => {
    const { x, y } = magnetometerData;
    const { latitude, longitude } = location.coords;

    // Convert degrees to radians
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    const toDegrees = (radians: number) => radians * (180 / Math.PI);

    // Calculate Qibla direction using the Spherical Law of Cosines
    const latK = toRadians(KAABA_LATITUDE);
    const lonK = toRadians(KAABA_LONGITUDE);
    const latL = toRadians(latitude);
    const lonL = toRadians(longitude);

    // Calculate the angle
    let angle = Math.atan2(
      Math.sin(lonK - lonL),
      Math.cos(latL) * Math.tan(latK) -
        Math.sin(latL) * Math.cos(lonK - lonL)
    );

    angle = toDegrees(angle);
    angle = (angle + 360) % 360;

    // Calculate magnetic heading
    let magneticHeading = Math.atan2(y, x);
    magneticHeading = toDegrees(magneticHeading);
    
    // Apply magnetic declination correction
    magneticHeading = (magneticHeading + magneticDeclination + 360) % 360;

    // Calculate final Qibla direction
    let qiblaDirection = angle - magneticHeading;
    return (qiblaDirection + 360) % 360;
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Recalibrate compass
  const handleRecalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => setIsCalibrating(false), 3000);
  };

  // Toggle details panel
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Rotation animations
  const compassRotation = rotateValue.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const needleRotation = needleValue.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const calibrationRotation = calibrationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Get accuracy color
  const getAccuracyColor = () => {
    switch (accuracy) {
      case 1:
        return errorColor;
      case 2:
        return secondaryColor;
      case 3:
        return "#2ECC71";
      default:
        return secondaryColor;
    }
  };

  // Get accuracy text
  const getAccuracyText = () => {
    switch (accuracy) {
      case 1:
        return "Low Accuracy";
      case 2:
        return "Medium Accuracy";
      case 3:
        return "High Accuracy";
      default:
        return "Medium Accuracy";
    }
  };

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
          <FontAwesome name="compass" size={50} color="#4A90E2" style={{
            marginBottom: 20,
            opacity: 0.8,
          }} />
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
                  ±{Number(accuracy).toFixed(1)}° {Number(accuracy) <= QIBLA_ACCURACY_THRESHOLD ? "Accurate" : "Calibrating"}
                </ThemedText>
              </LinearGradient>
            )}
            <Animated.View
              style={[
                styles.compassBackground,
                { transform: [{ rotate: compassRotation }] },
              ]}
            >
              <View style={styles.compassOuterRing}>
                <View style={styles.compassInnerRing}>
                  <View style={styles.compassRose}>
                    {/* Cardinal directions */}
                    <ThemedText style={[styles.cardinalDirection, { top: -120 }]}>N</ThemedText>
                    <ThemedText style={[styles.cardinalDirection, { right: -120 }]}>E</ThemedText>
                    <ThemedText style={[styles.cardinalDirection, { bottom: -120 }]}>S</ThemedText>
                    <ThemedText style={[styles.cardinalDirection, { left: -120 }]}>W</ThemedText>
                    
                    {/* Degree markers */}
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

            {/* Qibla direction needle */}
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
                    <FontAwesome name="mosque" size={30} color="#FFD700" style={styles.makkahIcon} />
                  </LinearGradient>
                </View>
              </LinearGradient>
            </Animated.View>

            <View style={styles.centerDot} />
          </View>

          <ThemedText style={styles.directionText}>
            {qiblaDirection.toFixed(1)}°
          </ThemedText>

          <TouchableOpacity
            style={styles.recalibrateButton}
            onPress={handleRecalibrate}
          >
            <FontAwesome name="refresh" size={20} color="#4A90E2" />
            <ThemedText style={styles.recalibrateText}>Recalibrate</ThemedText>
          </TouchableOpacity>

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
                  Heading: {qiblaDirection.toFixed(1)}°
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
