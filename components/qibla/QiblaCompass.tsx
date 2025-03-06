import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useQiblaDirection } from './hooks/useQiblaDirection';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { ErrorScreen } from './ErrorScreen';
import { CalibrationScreen } from './CalibrationScreen';

const QiblaCompass = () => {
  const { 
    heading, 
    qiblaBearing,
    isCalibrating,
    calibrationProgress,
    errorMsg,
    sensorAvailable,
    hasPermissions,
    retryCalibration
  } = useQiblaDirection();

  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const arrowAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: heading,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [heading]);

  useEffect(() => {
    if (qiblaBearing !== null) {
      Animated.spring(arrowAnim, {
        toValue: (heading - qiblaBearing + 360) % 360,
        speed: 20,
        useNativeDriver: true,
      }).start();
    }
  }, [heading, qiblaBearing]);

  useEffect(() => {
    if (isCalibrating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCalibrating]);

  if (!sensorAvailable || !hasPermissions || errorMsg) {
    return (
      <ErrorScreen
        errorMsg={errorMsg || (!sensorAvailable ? 'Compass not supported' : 'Location permission required')}
        sensorAvailable={sensorAvailable}
        hasPermissions={hasPermissions}
        onRetry={retryCalibration}
      />
    );
  }

  if (isCalibrating) {
    return <CalibrationScreen pulseValue={pulseAnim} />;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.compass, {
        transform: [{ rotate: rotateAnim.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg']
        })}]
      }]}>
        <FontAwesome name="compass" size={300} color="#2c3e50" />
        
        <Animated.View style={[styles.arrow, {
          transform: [{ rotate: arrowAnim.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg']
          })}]
        }]}>
          <MaterialIcons name="navigation" size={60} color="#e74c3c" />
        </Animated.View>
      </Animated.View>

      <View style={styles.infoPanel}>
        <InfoRow icon="explore" label={`Heading: ${Math.round(heading)}°`} />
        <InfoRow icon="mosque" label={`Qibla: ${qiblaBearing?.toFixed(1) ?? '--'}°`} />
      </View>
    </View>
  );
};

const InfoRow = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.infoRow}>
    <MaterialIcons name={icon as any} size={24} color="#2c3e50" />
    <Text style={styles.infoText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f3f5',
  },
  compass: {
    width: 300,
    height: 300,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    position: 'absolute',
    alignSelf: 'center',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
});

export default QiblaCompass; 