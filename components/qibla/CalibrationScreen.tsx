import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

interface CalibrationScreenProps {
  pulseValue: Animated.Value;
}

export const CalibrationScreen: React.FC<CalibrationScreenProps> = ({ pulseValue }) => {
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: pulseValue }],
            opacity: pulseValue.interpolate({
              inputRange: [1, 1.2],
              outputRange: [1, 0.7],
            }),
          }
        ]}
      >
        <FontAwesome
          name="compass"
          size={70}
          color="#4A90E2"
        />
      </Animated.View>
      <ThemedText style={styles.title}>
        Calibrating Compass...
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Please move your device in a figure-8 pattern
      </ThemedText>
      <View style={styles.instructionContainer}>
        <FontAwesome5 name="info-circle" size={16} color="#4A90E2" style={styles.infoIcon} />
        <ThemedText style={styles.instruction}>
          For best results, hold your device flat and away from metal objects
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f3f5',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    padding: 15,
    borderRadius: 10,
    maxWidth: '80%',
  },
  infoIcon: {
    marginRight: 10,
  },
  instruction: {
    flex: 1,
    fontSize: 14,
    opacity: 0.9,
  },
}); 