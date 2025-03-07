import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Dimensions, View, Platform, Vibration } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DhikrOption } from './constants';

// Calculate responsive sizes
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const isLargeDevice = SCREEN_WIDTH >= 768;
const BUTTON_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * (isSmallDevice ? 0.3 : isLargeDevice ? 0.25 : 0.35);
const RESET_BUTTON_SIZE = BUTTON_SIZE * (isSmallDevice ? 0.45 : 0.4);
const SETTING_BUTTON_SIZE = BUTTON_SIZE * (isSmallDevice ? 0.3 : 0.25);

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
        colors={['#000000', '#000000']}
        style={styles.dhikrInfoContainer}
      >
        <ThemedText style={styles.arabicText}>{selectedDhikr.arabicText}</ThemedText>
        <ThemedText style={[styles.dhikrName, { color: selectedDhikr.color[0] }]}>{selectedDhikr.name}</ThemedText>
        
        {/* Enhanced Progress Bar with Target Display */}
        <ThemedView style={styles.progressWrapper}>
          <LinearGradient
            colors={['#ffffff', '#f8f9ff']}
            style={styles.progressContainer}
          >
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: progressColor,
                }
              ]} 
            />
            <ThemedText style={styles.progressText}>
              {count.toString().padStart(2, '0')} / {targetCount.toString().padStart(2, '0')}
            </ThemedText>
          </LinearGradient>
          
          {setTargetCount && (
            <ThemedView style={styles.limitControls}>
              <TouchableOpacity 
                style={styles.limitButton}
                onPress={() => adjustTargetCount(-10)}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#f03e3e']}
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
                  colors={['#ffd43b', '#fab005']}
                  style={styles.limitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.limitButtonText}>-1</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
              
              <ThemedView style={styles.limitIndicator}>
                <LinearGradient
                  colors={[selectedDhikr.color[0], selectedDhikr.color[1], selectedDhikr.color[1]] as readonly [string, string, string]}
                  style={styles.limitIndicatorGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.limitText}>
                    {targetCount.toString().padStart(2, '0')}
                  </ThemedText>
                </LinearGradient>
              </ThemedView>
              
              <TouchableOpacity 
                style={styles.limitButton}
                onPress={() => adjustTargetCount(1)}
              >
                <LinearGradient
                  colors={['#51cf66', '#37b24d']}
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
                  colors={['#339af0', '#1c7ed6']}
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
              colors={[selectedDhikr.color[0], selectedDhikr.color[1], selectedDhikr.color[1]] as readonly [string, string, string]}
              style={styles.completionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <FontAwesome name="check-circle" size={24} color="#fff" style={{marginRight: 10}} />
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
              <FontAwesome name="refresh" size={RESET_BUTTON_SIZE * 0.4} color="#fff" />
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
                <ThemedText style={styles.countButtonText}>
                  {count.toString().padStart(2, '0')}
                </ThemedText>
                {autoCount && (
                  <ThemedText style={styles.autoCountText}>
                    Auto
                  </ThemedText>
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
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    backgroundColor:"#000000"
  },
  dhikrInfoContainer: {
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.05,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor:"#000000",
    color:"#000000"
  },
  arabicText: {
    fontSize: isSmallDevice ? 32 : 40,
    padding: 20,
    margin: 10,
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dhikrName: {
    fontSize: isSmallDevice ? 18 : 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressWrapper: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  progressContainer: {
    width: '100%',
    height: isSmallDevice ? 28 : 35,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  progressBar: {
    height: '100%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    color: '#2d3436',
    fontSize: isSmallDevice ? 15 : 18,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  limitControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 5,
    paddingHorizontal: 5,
    backgroundColor:"#000000"
  },
  limitButton: {
    borderRadius: 12,
    marginHorizontal: 3,
    overflow: 'hidden',
    minWidth: isSmallDevice ? 38 : 45,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  limitButtonGradient: {
    paddingHorizontal: isSmallDevice ? 8 : 12,
    paddingVertical: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitButtonText: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  limitIndicator: {
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 70,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
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
    fontSize: isSmallDevice ? 18 : 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  completionIndicator: {
    marginTop: 15,
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  completionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  completionText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: isSmallDevice ? 16 : 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  settingsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    backgroundColor:"#000000"
  },
  settingButton: {
    width: SETTING_BUTTON_SIZE,
    height: SETTING_BUTTON_SIZE,
    borderRadius: SETTING_BUTTON_SIZE / 2,
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
    backgroundColor: 'transparent',
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
    backgroundColor:"#000000"
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
    width: RESET_BUTTON_SIZE,
    height: RESET_BUTTON_SIZE,
    borderRadius: RESET_BUTTON_SIZE / 2,
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
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  countButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BUTTON_SIZE / 2,
    padding: BUTTON_SIZE * 0.1,
  },
  glowEffect: {
    position: 'absolute',
    width: BUTTON_SIZE * 1.4,
    height: BUTTON_SIZE * 1.4,
    borderRadius: BUTTON_SIZE * 0.7,
    opacity: 0,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  countButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  countButtonText: {
    fontSize: BUTTON_SIZE * (isSmallDevice ? 0.28 : isLargeDevice ? 0.22 : 0.25),
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  autoCountText: {
    fontSize: isSmallDevice ? 12 : isLargeDevice ? 16 : 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
}); 