import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Platform } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { DhikrOption } from './types';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const OPTION_WIDTH = width * 0.28;

interface DhikrOptionsProps {
  dhikrOptions: DhikrOption[];
  selectedDhikr: DhikrOption;
  onSelectDhikr: (dhikr: DhikrOption) => void;
}

export function DhikrOptions({ dhikrOptions, selectedDhikr, onSelectDhikr }: DhikrOptionsProps) {
  // Animation values for each option
  const [animations] = useState(() => 
    dhikrOptions.map(() => new Animated.Value(0))
  );
  
  const handlePress = (dhikr: DhikrOption, index: number) => {
    // Animate the selected option
    Animated.sequence([
      Animated.timing(animations[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animations[index], {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Call the parent handler
    onSelectDhikr(dhikr);
  };
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.sectionTitle}>Select Dhikr</ThemedText>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dhikrOptionsContainer}
        decelerationRate="fast"
        snapToInterval={OPTION_WIDTH + 15}
        snapToAlignment="center"
      >
        {dhikrOptions.map((dhikr, index) => {
          // Create animation styles
          const scale = animations[index].interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0.9, 1],
          });
          
          const rotate = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '5deg'],
          });
          
          return (
            <Animated.View
              key={dhikr.id}
              style={[
                { transform: [{ scale }, { rotate }] }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.dhikrOption,
                  selectedDhikr.id === dhikr.id && styles.selectedDhikrOption
                ]}
                onPress={() => handlePress(dhikr, index)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={dhikr.color as unknown as readonly [string, string]}
                  style={styles.dhikrGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {selectedDhikr.id === dhikr.id && (
                    <FontAwesome5 
                      name="check-circle" 
                      size={16} 
                      color="#fff" 
                      style={styles.checkIcon}
                    />
                  )}
                  <ThemedText style={styles.dhikrOptionText}>
                    {dhikr.name}
                  </ThemedText>
                  <ThemedText style={styles.dhikrCount}>
                    {dhikr.count > 0 ? `${dhikr.count}x` : 'Custom'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    backgroundColor:"#000000"
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 5,
    opacity: 0.7,
  },
  dhikrOptionsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dhikrOption: {
    width: OPTION_WIDTH,
    marginHorizontal: 7.5,
    borderRadius: 15,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  selectedDhikrOption: {
    borderWidth: 2,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  dhikrGradient: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  dhikrOptionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dhikrCount: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
}); 