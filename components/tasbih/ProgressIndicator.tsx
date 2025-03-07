import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '../ThemedView';
import { DhikrOption } from './constants';

interface ProgressIndicatorProps {
  dhikrOptions: DhikrOption[];
  completedDhikrs: number[];
}

export function ProgressIndicator({ dhikrOptions, completedDhikrs }: ProgressIndicatorProps) {
  if (completedDhikrs.length === 0) {
    return null;
  }
  
  return (
    <ThemedView style={styles.progressIndicator}>
      {dhikrOptions.slice(0, 5).map((dhikr) => (
        <View 
          key={dhikr.id}
          style={[
            styles.progressDot,
            completedDhikrs.includes(dhikr.id) && { backgroundColor: dhikr.color[0] }
          ]}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
    backgroundColor: '#e0e0e0',
  },
}); 