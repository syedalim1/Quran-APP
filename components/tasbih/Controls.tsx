import React from 'react';
import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { FontAwesome } from '@expo/vector-icons';

interface ControlsProps {
  autoProgress: boolean;
  targetCount: number;
  toggleAutoProgress: () => void;
  showLimitModal: () => void;
}

export function Controls({ 
  autoProgress, 
  targetCount, 
  toggleAutoProgress, 
  showLimitModal 
}: ControlsProps) {
  return (
    <ThemedView style={styles.controlsContainer}>
      <TouchableOpacity
        style={[
          styles.controlButton,
          autoProgress && styles.controlButtonActive
        ]}
        onPress={toggleAutoProgress}
      >
        <FontAwesome 
          name="forward" 
          size={14} 
          color={autoProgress ? "#fff" : "#666"} 
          style={styles.controlIcon}
        />
        <ThemedText style={[
          styles.controlText,
          autoProgress && styles.controlTextActive
        ]}>
          Auto-Progress
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.controlButton}
        onPress={showLimitModal}
      >
        <FontAwesome 
          name="sliders" 
          size={14} 
          color="#666" 
          style={styles.controlIcon}
        />
        <ThemedText style={styles.controlText}>
          Set Limit: {targetCount}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor:"#000000"
    
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  controlButtonActive: {
    backgroundColor: '#4CAF50',
  },
  controlIcon: {
    marginRight: 5,
  },
  controlText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  controlTextActive: {
    color: '#fff',
  },
}); 