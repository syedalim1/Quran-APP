import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Dimensions, View, Platform, Vibration } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DhikrOption } from '../../app/(tabs)/tasbih';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = Math.min(width, height) * 0.35; // Responsive button size

interface CounterProps {
  selectedDhikr: DhikrOption;
  count: number;
  setCount: (count: number | ((prevCount: number) => number)) => void;
  targetCount: number;
  onTargetReached: (count: number) => void;
  setTargetCount?: (count: number) => void;
}

export function Counter({ 
  selectedDhikr, 
  count, 
  setCount, 
  targetCount,
  onTargetReached,
  setTargetCount
}: CounterProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Additional state
  const [showVibration, setShowVibration] = useState(true);
  const [showSound, setShowSound] = useState(false);
  const [autoCount, setAutoCount] = useState(false);
  const [autoCountInterval, setAutoCountInterval] = useState<NodeJS.Timeout | null>(null);
  const [countSpeed, setCountSpeed] = useState(1000); // ms between counts
  const [showSpeedControls, setShowSpeedControls] = useState(false);
  const [showCompletionIndicator, setShowCompletionIndicator] = useState(false);
  
  // Calculate progress percentage
  const progressPercentage = Math.min((count / targetCount) * 100, 100);
  
  // Update progress animation when count changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Add glow effect when close to target
    if (progressPercentage > 90) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1000, useNativeDriver: false }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [count, targetCount]);
  
  // Setup pulse animation
  useEffect(() => {
    const pulsate = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (autoCount) {
      pulsate.start();
    } else {
      pulseAnim.setValue(1);
      pulsate.stop();
    }
    
    return () => pulsate.stop();
  }, [autoCount]);
  
  // Handle auto-counting
  useEffect(() => {
    if (autoCount) {
      const interval = setInterval(() => {
        incrementCount();
      }, countSpeed);
      setAutoCountInterval(interval);
    } else if (autoCountInterval) {
      clearInterval(autoCountInterval);
      setAutoCountInterval(null);
    }
    
    return () => {
      if (autoCountInterval) {
        clearInterval(autoCountInterval);
      }
    };
  }, [autoCount, countSpeed]);
  
  // Interpolate rotation for the reset button
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // Interpolate colors for the progress bar
  const progressColor = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [selectedDhikr.color[0], selectedDhikr.color[0], selectedDhikr.color[1]],
  });
  
  // Interpolate shadow for 3D effect
  const shadowOpacity = scaleAnim.interpolate({
    inputRange: [0.95, 1],
    outputRange: [0.5, 0.3],
  });
  
  // Interpolate glow effect
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7],
  });
  
  useEffect(() => {
    // Reset completion indicator when count changes
    if (count === 0) {
      setShowCompletionIndicator(false);
    }
    
    // Show completion indicator when target is reached
    if (count === targetCount) {
      setShowCompletionIndicator(true);
    }
  }, [count, targetCount]);
  
  const incrementCount = () => {
    // Haptic feedback if enabled
    if (showVibration) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Animate the button
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCount(prevCount => {
      const newCount = prevCount + 1;
      
      // If we've reached the target, provide stronger feedback
      if (newCount === targetCount) {
        if (showVibration) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Add a pattern vibration for completion
          Vibration.vibrate([0, 100, 50, 100, 50, 100]);
        }
        
        // Save this session
        onTargetReached(newCount);
        
        // Stop auto-counting if active
        if (autoCount) {
          setAutoCount(false);
        }
        
        // Rotate the reset button to indicate completion
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
      
      return newCount;
    });
  };
  
  const resetCount = () => {
    if (showVibration) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setCount(0);
    
    // Reset rotation animation
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const toggleAutoCount = () => {
    setAutoCount(!autoCount);
    if (!autoCount) {
      setShowSpeedControls(true);
    }
  };
  
  const toggleVibration = () => {
    setShowVibration(!showVibration);
    if (!showVibration) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const toggleSound = () => {
    setShowSound(!showSound);
  };
  
  const increaseSpeed = () => {
    if (countSpeed > 200) {
      setCountSpeed(prevSpeed => prevSpeed - 200);
    }
  };
  
  const decreaseSpeed = () => {
    if (countSpeed < 2000) {
      setCountSpeed(prevSpeed => prevSpeed + 200);
    }
  };
  
  const adjustTargetCount = (amount: number) => {
    if (setTargetCount) {
      const newTarget = Math.max(1, targetCount + amount);
      setTargetCount(newTarget);
    }
  };
  
  return (
    <ThemedView style={styles.counterContainer}>
      <LinearGradient
        colors={['#f0f8f0', '#e8f5e8']}
        style={styles.dhikrInfoContainer}
      >
        <ThemedText style={styles.arabicText}>{selectedDhikr.arabicText}</ThemedText>
        <ThemedText style={styles.dhikrName}>{selectedDhikr.name}</ThemedText>
        
        {/* Enhanced Progress Bar with Target Display */}
        <ThemedView style={styles.progressWrapper}>
          <ThemedView style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: `${progressPercentage}%`, 
                  backgroundColor: progressColor 
                }
              ]} 
            />
            <ThemedText style={styles.progressText}>
              {count} / {targetCount}
            </ThemedText>
          </ThemedView>
          
          {setTargetCount && (
            <ThemedView style={styles.limitControls}>
              <TouchableOpacity 
                style={styles.limitButton}
                onPress={() => adjustTargetCount(-10)}
              >
                <LinearGradient
                  colors={['#f44336', '#d32f2f'] as readonly [string, string]}
                  style={styles.limitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.limitButtonText}>-10</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.limitButton}
                onPress={() => adjustTargetCount(-1)}
              >
                <LinearGradient
                  colors={['#ff9800', '#ef6c00'] as readonly [string, string]}
                  style={styles.limitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.limitButtonText}>-1</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
              
              <ThemedView style={styles.limitIndicator}>
                <LinearGradient
                  colors={selectedDhikr.color as unknown as readonly [string, string]}
                  style={styles.limitIndicatorGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.limitText}>
                    {targetCount}
                  </ThemedText>
                </LinearGradient>
              </ThemedView>
              
              <TouchableOpacity 
                style={styles.limitButton}
                onPress={() => adjustTargetCount(1)}
              >
                <LinearGradient
                  colors={['#4caf50', '#2e7d32'] as readonly [string, string]}
                  style={styles.limitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.limitButtonText}>+1</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.limitButton}
                onPress={() => adjustTargetCount(10)}
              >
                <LinearGradient
                  colors={['#2196f3', '#1565c0'] as readonly [string, string]}
                  style={styles.limitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.limitButtonText}>+10</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
        
        {showCompletionIndicator && (
          <Animated.View 
            style={[
              styles.completionIndicator,
              { opacity: pulseAnim }
            ]}
          >
            <LinearGradient
              colors={selectedDhikr.color as unknown as readonly [string, string]}
              style={styles.completionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome name="check-circle" size={20} color="#fff" style={{marginRight: 10}} />
              <ThemedText style={styles.completionText}>
                Completed! Tap to continue
              </ThemedText>
            </LinearGradient>
          </Animated.View>
        )}
      </LinearGradient>
      
      {/* Settings Buttons */}
      <ThemedView style={styles.settingsContainer}>
        <TouchableOpacity 
          style={[styles.settingButton, showVibration && styles.settingButtonActive]} 
          onPress={toggleVibration}
        >
          <LinearGradient
            colors={showVibration 
              ? ['#4CAF50', '#2E7D32'] as readonly [string, string]
              : ['#f0f0f0', '#e0e0e0'] as readonly [string, string]
            }
            style={styles.settingButtonGradient}
          >
            <MaterialCommunityIcons 
              name={showVibration ? "vibrate" : "vibrate-off"} 
              size={20} 
              color={showVibration ? "#fff" : "#888"} 
            />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingButton, showSound && styles.settingButtonActive]} 
          onPress={toggleSound}
        >
          <LinearGradient
            colors={showSound 
              ? ['#2196F3', '#1565C0'] as readonly [string, string]
              : ['#f0f0f0', '#e0e0e0'] as readonly [string, string]
            }
            style={styles.settingButtonGradient}
          >
            <Ionicons 
              name={showSound ? "volume-high" : "volume-mute"} 
              size={20} 
              color={showSound ? "#fff" : "#888"} 
            />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingButton, autoCount && styles.settingButtonActive]} 
          onPress={toggleAutoCount}
        >
          <LinearGradient
            colors={autoCount 
              ? ['#9C27B0', '#6A1B9A'] as readonly [string, string]
              : ['#f0f0f0', '#e0e0e0'] as readonly [string, string]
            }
            style={styles.settingButtonGradient}
          >
            <MaterialCommunityIcons 
              name="timer-outline" 
              size={20} 
              color={autoCount ? "#fff" : "#888"} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </ThemedView>
      
      {/* Auto-Count Speed Controls */}
      {showSpeedControls && (
        <ThemedView style={styles.speedControlContainer}>
          <TouchableOpacity 
            style={styles.speedButton}
            onPress={decreaseSpeed}
          >
            <LinearGradient
              colors={['#f0f0f0', '#e0e0e0'] as readonly [string, string]}
              style={styles.speedButtonGradient}
            >
              <Feather name="minus" size={18} color="#555" />
            </LinearGradient>
          </TouchableOpacity>
          
          <ThemedText style={styles.speedText}>
            Speed: {(1000 / countSpeed).toFixed(1)}/s
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.speedButton}
            onPress={increaseSpeed}
          >
            <LinearGradient
              colors={['#f0f0f0', '#e0e0e0'] as readonly [string, string]}
              style={styles.speedButtonGradient}
            >
              <Feather name="plus" size={18} color="#555" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowSpeedControls(false)}
          >
            <Feather name="x" size={16} color="#888" />
          </TouchableOpacity>
        </ThemedView>
      )}
      
      <ThemedView style={styles.buttonsContainer}>
        <Animated.View 
          style={[
            styles.resetButtonContainer,
            { 
              transform: [{ rotate }],
              opacity: count > 0 ? 1 : 0.5
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetCount}
            disabled={count === 0}
          >
            <LinearGradient
              colors={['#F44336', '#D32F2F'] as readonly [string, string]}
              style={styles.resetButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome name="refresh" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.countButtonContainer,
            { 
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim }
              ],
              shadowOpacity
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.countButton}
            onPress={incrementCount}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={selectedDhikr.color as unknown as readonly [string, string]}
              style={styles.countButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View 
                style={[
                  styles.glowEffect, 
                  { 
                    opacity: glowOpacity,
                    backgroundColor: selectedDhikr.color[1]
                  }
                ]} 
              />
              <View style={styles.countButtonInner}>
                <ThemedText style={styles.countButtonText}>{count}</ThemedText>
                {autoCount && (
                  <ThemedText style={styles.autoCountText}>Auto</ThemedText>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  counterContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dhikrInfoContainer: {
    alignItems: 'center',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  arabicText: {
    fontSize: 36,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  dhikrName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4CAF50',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  progressWrapper: {
    width: '100%',
  },
  progressContainer: {
    width: '100%',
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 15,
  },
  progressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  limitControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  limitButton: {
    borderRadius: 8,
    marginHorizontal: 3,
    overflow: 'hidden',
    minWidth: 40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  limitButtonGradient: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  limitIndicator: {
    marginHorizontal: 8,
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 60,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  limitIndicatorGradient: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  completionIndicator: {
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  completionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  completionText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  settingsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  settingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingButtonActive: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  speedControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  speedButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  speedButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 5,
    top: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  resetButtonContainer: {
    marginRight: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  resetButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  resetButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countButtonContainer: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  countButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  countButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BUTTON_SIZE / 2,
  },
  glowEffect: {
    position: 'absolute',
    width: BUTTON_SIZE * 1.2,
    height: BUTTON_SIZE * 1.2,
    borderRadius: BUTTON_SIZE * 0.6,
    opacity: 0,
  },
  countButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  countButtonText: {
    fontSize: BUTTON_SIZE * 0.3,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  autoCountText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 