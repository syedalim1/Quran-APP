import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ErrorScreenProps {
  errorMsg: string;
  sensorAvailable: boolean;
  hasPermissions: boolean;
  onRetry: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  errorMsg,
  sensorAvailable,
  hasPermissions,
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <FontAwesome name="exclamation-triangle" size={50} color="#FF6B6B" />
      <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
      {!sensorAvailable && (
        <ThemedText style={styles.errorSubText}>
          Your device doesn't have the required compass sensor. Try using a different device.
        </ThemedText>
      )}
      {!hasPermissions && (
        <ThemedText style={styles.errorSubText}>
          Location permission is needed for accurate Qibla direction.
        </ThemedText>
      )}
      <TouchableOpacity onPress={onRetry}>
        <LinearGradient colors={["#4A90E2", "#357ABD"]} style={styles.button}>
          <ThemedText style={styles.buttonText}>Try Again</ThemedText>
        </LinearGradient>
      </TouchableOpacity>
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
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  errorSubText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 