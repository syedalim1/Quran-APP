import React from 'react';
import { View, TouchableOpacity, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '../ThemedText';
import { styles } from '../../src/styles/PrayertimeScreen.styles';

interface PrayerDetailsProps {
  selectedPrayer: string | null;
  prayerTimes: any;
  PRAYER_NAMES: any;
  locationName: string;
  detailsHeight: Animated.Value;
  onClose: () => void;
}

export const PrayerDetails: React.FC<PrayerDetailsProps> = ({
  selectedPrayer,
  prayerTimes,
  PRAYER_NAMES,
  locationName,
  detailsHeight,
  onClose,
}) => {
  if (!selectedPrayer || !prayerTimes) return null;
  
  const info = PRAYER_NAMES[selectedPrayer];
  const prayerTime = prayerTimes[selectedPrayer];
  
  if (!info || !prayerTime) return null;
  
  let formattedTime = '--:--';
  try {
    let timeToDisplay: Date;
    if (prayerTime instanceof Date) {
      timeToDisplay = prayerTime;
    } else if (typeof prayerTime === 'number') {
      timeToDisplay = new Date(prayerTime);
    } else {
      timeToDisplay = new Date(prayerTime as any);
    }
    formattedTime = timeToDisplay.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting prayer time:', error);
  }
  
  return (
    <Animated.View 
      style={[
        styles.detailsContainer, 
        { 
          maxHeight: detailsHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 500]
          }),
          opacity: detailsHeight
        }
      ]}
    >
      <BlurView intensity={80} tint="dark" style={styles.detailsBlur}>
        <LinearGradient
          colors={[info.color[0], info.color[1]]}
          style={styles.detailsGradient}
        >
          <View style={styles.detailsHeader}>
            <ThemedText style={styles.detailsTitle}>{info.english} Prayer</ThemedText>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <FontAwesome name="times" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailsContent}>
            <View style={styles.detailsRow}>
              <FontAwesome name="clock-o" size={22} color="#fff" style={styles.detailsIcon} />
              <View>
                <ThemedText style={styles.detailsLabel}>Prayer Time</ThemedText>
                <ThemedText style={styles.detailsValue}>{formattedTime}</ThemedText>
              </View>
            </View>
            
            <View style={styles.detailsRow}>
              <FontAwesome name="info-circle" size={22} color="#fff" style={styles.detailsIcon} />
              <View>
                <ThemedText style={styles.detailsLabel}>Description</ThemedText>
                <ThemedText style={styles.detailsValue}>{info.description}</ThemedText>
              </View>
            </View>
            
            <View style={styles.detailsRow}>
              <FontAwesome name="language" size={22} color="#fff" style={styles.detailsIcon} />
              <View>
                <ThemedText style={styles.detailsLabel}>Arabic Name</ThemedText>
                <ThemedText style={styles.detailsValue}>{info.arabic}</ThemedText>
              </View>
            </View>
            
            {locationName && (
              <View style={styles.detailsRow}>
                <FontAwesome name="map-marker" size={22} color="#fff" style={styles.detailsIcon} />
                <View>
                  <ThemedText style={styles.detailsLabel}>Location</ThemedText>
                  <ThemedText style={styles.detailsValue}>{locationName}</ThemedText>
                </View>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              onClose();
            }}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.notificationButtonGradient}
            >
              <FontAwesome name="bell" size={18} color="#fff" style={{marginRight: 8}} />
              <ThemedText style={styles.notificationButtonText}>Set Notification</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};
