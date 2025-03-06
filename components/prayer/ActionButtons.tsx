import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';
import { styles } from '../../src/styles/PrayertimeScreen.styles';

interface ActionButtonsProps {
  locationName: string;
  onRefresh: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  locationName,
  onRefresh,
}) => {
  return (
    <View style={styles.actionButtonsContainer}>
      <View style={styles.locationContainer}>
        <LinearGradient
          colors={['#1A237E', '#3F51B5']}
          style={styles.locationGradient}
        >
          <FontAwesome name="map-marker" size={22} color="#fff" style={styles.locationIcon} />
          <ThemedText style={styles.locationText} numberOfLines={1}>
            {locationName || 'Location unavailable'}
          </ThemedText>
        </LinearGradient>
      </View>
      
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <LinearGradient
          colors={['#1A237E', '#3F51B5']}
          style={styles.refreshGradient}
        >
          <FontAwesome name="refresh" size={22} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
