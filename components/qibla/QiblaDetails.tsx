import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { ThemedText } from '../ThemedText';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { styles } from '../../src/styles/QiblaScreen.style';
import { Location } from 'expo-location';

interface QiblaDetailsProps {
  showDetails: boolean;
  detailsHeight: Animated.Value;
  qiblaDirection: number;
  heading: number;
  location: Location.LocationObject | null;
  onToggleDetails: () => void;
}

export const QiblaDetails: React.FC<QiblaDetailsProps> = ({
  showDetails,
  detailsHeight,
  qiblaDirection,
  heading,
  location,
  onToggleDetails,
}) => {
  return (
    <>
      <TouchableOpacity
        style={styles.detailsToggle}
        onPress={onToggleDetails}
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
  );
}; 