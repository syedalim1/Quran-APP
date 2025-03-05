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
import {
  Compass,
  Navigation,
  MapPin,
  RotateCcw,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
  Home,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useThemeColor } from "../../hooks/useThemeColor";

const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;
const QIBLA_ACCURACY_THRESHOLD = 5; // degrees
const VIBRATION_PATTERN = [0, 50, 100, 50];

export default function QiblaScreen() {
  // State variables
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<"low" | "medium" | "high">("medium");
  const [showDetails, setShowDetails] = useState(false);
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
      Magnetometer.setUpdateInterval(100);

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
                Vibration.vibrate(VIBRATION_PATTERN);
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
      setAccuracy("low");
    } else if (magnitude < 40) {
      setAccuracy("medium");
    } else {
      setAccuracy("high");
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
      case "low":
        return errorColor;
      case "medium":
        return secondaryColor;
      case "high":
        return "#2ECC71";
      default:
        return secondaryColor;
    }
  };

  // Get accuracy text
  const getAccuracyText = () => {
    switch (accuracy) {
      case "low":
        return "Low Accuracy";
      case "medium":
        return "Medium Accuracy";
      case "high":
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
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            {errorMsg}
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={() => {
              setErrorMsg(null);
              setIsCalibrating(true);
            }}
          >
            <ThemedText style={styles.buttonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <>
          {isCalibrating ? (
            <ThemedView style={styles.calibrationContainer}>
              <Animated.View
                style={[
                  styles.calibrationAnimation,
                  { transform: [{ rotate: calibrationRotation }] },
                ]}
              >
                <RotateCcw size={80} color={secondaryColor} />
              </Animated.View>
              <ThemedText style={[styles.calibrationText, { color: secondaryColor }]}>
                Calibrating compass...
              </ThemedText>
              <ThemedText style={styles.calibrationSubText}>
                Please move your device in a figure-8 pattern
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.compassContainer}>
              {/* Accuracy indicator */}
              <Animated.View
                style={[
                  styles.accuracyIndicator,
                  { opacity: accuracyOpacity, backgroundColor: getAccuracyColor() },
                ]}
              >
                <ThemedText style={styles.accuracyText}>
                  {getAccuracyText()}
                </ThemedText>
              </Animated.View>

              {/* Compass rose background with professional design */}
              <Animated.View
                style={[
                  styles.compassBackground,
                  {
                    transform: [
                      { scale: pulseValue },
                      { rotate: compassRotation },
                    ],
                    borderColor: `rgba(74, 144, 226, 0.3)`,
                  },
                ]}
              >
                {/* Outer ring */}
                <View style={styles.compassOuterRing}>
                  {/* Inner ring */}
                  <View style={styles.compassInnerRing}>
                    <View style={styles.compassRose}>
                      {/* Cardinal directions */}
                      {["N", "E", "S", "W"].map((direction, index) => (
                        <ThemedText
                          key={direction}
                          style={[
                            styles.cardinalDirection,
                            {
                              transform: [
                                { rotate: `${index * 90}deg` },
                                { translateY: -100 },
                              ],
                            },
                          ]}
                        >
                          {direction}
                        </ThemedText>
                      ))}

                      {/* Degree markers */}
                      {Array.from({ length: 72 }).map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.degreeMarker,
                            {
                              transform: [
                                { rotate: `${index * 5}deg` },
                                { translateY: -110 },
                              ],
                              height: index % 9 === 0 ? 15 : 8,
                              backgroundColor:
                                index % 9 === 0 ? primaryColor : textColor,
                              opacity: index % 9 === 0 ? 0.8 : 0.3,
                            },
                          ]}
                        />
                      ))}
                    </View>

                    <Compass
                      size={180}
                      color={primaryColor}
                      strokeWidth={1.5}
                    />
                  </View>
                </View>
              </Animated.View>

              {/* Qibla needle with Makkah icon */}
              <Animated.View
                style={[
                  styles.qiblaNeedle,
                  {
                    transform: [{ rotate: needleRotation }],
                  },
                ]}
              >
                <LinearGradient
                  colors={["rgba(74, 144, 226, 0.7)", "rgba(74, 144, 226, 1)"]}
                  style={styles.needleGradient}
                >
                  <Navigation
                    size={40}
                    color="#fff"
                    style={{ transform: [{ translateY: -90 }] }}
                  />
                </LinearGradient>
                
                {/* Makkah Icon */}
                <Animated.View 
                  style={[
                    styles.makkahIconContainer,
                    { opacity: makkahGlowValue }
                  ]}
                >
                  <LinearGradient
                    colors={["rgba(0, 0, 0, 0.7)", "rgba(0, 0, 0, 0.9)"]}
                    style={styles.makkahIconBackground}
                  >
                    <Home
                      size={24}
                      color={goldColor}
                      style={styles.makkahIcon}
                    />
                  </LinearGradient>
                </Animated.View>
              </Animated.View>

              {/* Center dot */}
              <View 
                style={[
                  styles.centerDot, 
                  { 
                    backgroundColor: primaryColor,
                    borderColor: "rgba(255, 255, 255, 0.5)" 
                  }
                ]} 
              />

              {/* Direction text */}
              <ThemedText style={[styles.directionText, { color: primaryColor }]}>
                {qiblaDirection.toFixed(1)}°
              </ThemedText>

              {/* Recalibrate button */}
              <TouchableOpacity
                style={styles.recalibrateButton}
                onPress={handleRecalibrate}
              >
                <RotateCcw size={20} color={secondaryColor} />
                <ThemedText style={[styles.recalibrateText, { color: secondaryColor }]}>
                  Recalibrate
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Details panel */}
          <TouchableOpacity
            style={styles.detailsToggle}
            onPress={toggleDetails}
          >
            <ThemedText style={styles.detailsToggleText}>
              {showDetails ? "Hide Details" : "Show Details"}
            </ThemedText>
            {showDetails ? (
              <ChevronUp size={20} color={textColor} />
            ) : (
              <ChevronDown size={20} color={textColor} />
            )}
          </TouchableOpacity>

          <Animated.View style={[styles.detailsPanel, { height: detailsHeight }]}>
            <BlurView intensity={80} style={styles.blurContainer}>
              {distance && (
                <View style={styles.detailRow}>
                  <MapPin size={18} color={primaryColor} />
                  <ThemedText style={styles.detailText}>
                    Distance to Kaaba: {distance.toFixed(0)} km
                  </ThemedText>
                </View>
              )}

              <View style={styles.detailRow}>
                <Info size={18} color={primaryColor} />
                <ThemedText style={styles.detailText}>
                  Magnetic Declination: {magneticDeclination.toFixed(2)}°
                </ThemedText>
              </View>

              {prayerTimes && (
                <View style={styles.detailRow}>
                  <Clock size={18} color={primaryColor} />
                  <ThemedText style={styles.detailText}>
                    Next Prayer: {prayerTimes.maghrib}
                  </ThemedText>
                </View>
              )}

              <View style={styles.detailRow}>
                <Home size={18} color={primaryColor} />
                <ThemedText style={styles.detailText}>
                  Kaaba Coordinates: {KAABA_LATITUDE.toFixed(4)}, {KAABA_LONGITUDE.toFixed(4)}
                </ThemedText>
              </View>
            </BlurView>
          </Animated.View>
        </>
      )}

      <ThemedView
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <ThemedText style={styles.infoText}>
        Align the arrow with Qibla direction for prayer
      </ThemedText>
    </ThemedView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  compassContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    height: 300,
  },
  compassBackground: {
    alignItems: "center",
    justifyContent: "center",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
  },
  compassOuterRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    borderColor: "rgba(74, 144, 226, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  compassInnerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  compassRose: {
    position: "absolute",
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  cardinalDirection: {
    position: "absolute",
    fontSize: 16,
    fontWeight: "bold",
  },
  degreeMarker: {
    position: "absolute",
    width: 2,
  },
  qiblaNeedle: {
    position: "absolute",
    width: 40,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  needleGradient: {
    width: 40,
    height: 120,
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  makkahIconContainer: {
    position: "absolute",
    top: -120,
    alignItems: "center",
    justifyContent: "center",
  },
  makkahIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  makkahIcon: {
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  centerDot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  directionText: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  calibrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  calibrationAnimation: {
    marginBottom: 20,
  },
  calibrationText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  calibrationSubText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    opacity: 0.7,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    opacity: 0.7,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  recalibrateButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  recalibrateText: {
    marginLeft: 5,
    fontSize: 14,
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  detailsToggleText: {
    fontSize: 14,
    marginRight: 5,
  },
  detailsPanel: {
    width: width - 40,
    overflow: "hidden",
    borderRadius: 10,
    marginTop: 10,
  },
  blurContainer: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
  },
  accuracyIndicator: {
    position: "absolute",
    top: -30,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 10,
  },
  accuracyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
