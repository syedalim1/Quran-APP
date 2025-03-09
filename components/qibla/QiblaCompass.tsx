import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  useSharedValue,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { useQiblaDirection } from './hooks/useQiblaDirection';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { ErrorScreen } from './ErrorScreen';
import { CalibrationScreen } from './CalibrationScreen';
import { ThemedText } from '../ThemedText';

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

  const rotateAnim = useSharedValue(0);
  const arrowAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    rotateAnim.value = withTiming(heading, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  }, [heading]);

  useEffect(() => {
    if (qiblaBearing !== null) {
      arrowAnim.value = withSpring((heading - qiblaBearing + 360) % 360, {
        damping: 20,
      });
    }
  }, [heading, qiblaBearing]);

  useEffect(() => {
    if (isCalibrating) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulseAnim.value = 1;
    }
  }, [isCalibrating]);

  const compassStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        rotate: `${rotateAnim.value}deg`
      }]
    };
  });

  const arrowStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        rotate: `${arrowAnim.value}deg`
      }]
    };
  });

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
    return <CalibrationScreen progress={calibrationProgress} />;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.compass, compassStyle]}>
        <Animated.View style={[styles.arrow, arrowStyle]}>
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

const InfoRow = ({ icon, label }: { icon: keyof typeof MaterialIcons.glyphMap; label: string }) => (
  <View style={styles.infoRow}>
    <MaterialIcons name={icon} size={24} color="#2c3e50" />
    <ThemedText style={styles.infoText}>{label}</ThemedText>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    position: 'absolute',
  },
  infoPanel: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
});

export default QiblaCompass;