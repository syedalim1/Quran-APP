import React from 'react';
import { StyleSheet, Modal, TextInput, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { DhikrOption } from './constants';

interface CustomLimitModalProps {
  visible: boolean;
  selectedDhikr: DhikrOption;
  targetCount: number;
  customLimit: string;
  setCustomLimit: (limit: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function CustomLimitModal({
  visible,
  selectedDhikr,
  targetCount,
  customLimit,
  setCustomLimit,
  onCancel,
  onSave
}: CustomLimitModalProps) {
  const width = Dimensions.get('window').width;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.limitModalContent, { width: width * 0.9, maxWidth: 400 }]}>
          <LinearGradient
            colors={selectedDhikr.color as readonly [string, string]}
            style={styles.limitModalHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText style={styles.limitModalTitle}>Set Custom Limit</ThemedText>
          </LinearGradient>
          
          <LinearGradient
            colors={['#f0f8f0', '#e8f5e8']}
            style={styles.limitModalBody}
          >
            <View style={styles.limitInfoContainer}>
              <LinearGradient
                colors={selectedDhikr.color as readonly [string, string]}
                style={styles.currentLimitBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.currentLimitText}>
                  Current: <ThemedText style={styles.currentLimitValue}>{targetCount}</ThemedText>
                </ThemedText>
              </LinearGradient>
              
              <ThemedText style={styles.dhikrNameBadge}>
                {selectedDhikr.name}
              </ThemedText>
            </View>
            
            <ThemedText style={styles.inputLabel}>New Target Count</ThemedText>
            <View style={styles.inputContainer}>
              <LinearGradient
                colors={['#ffffff', '#f9f9f9']}
                style={styles.inputGradient}
              >
                <TextInput
                  style={styles.limitInput}
                  value={customLimit}
                  onChangeText={setCustomLimit}
                  placeholder={targetCount.toString()}
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  selectionColor={selectedDhikr.color[0]}
                />
                {customLimit !== '' && (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => setCustomLimit('')}
                  >
                    <FontAwesome name="times-circle" size={18} color="#999" />
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
            
            <View style={styles.limitPresets}>
              <ThemedText style={styles.presetLabel}>Quick Presets:</ThemedText>
              <View style={styles.presetButtons}>
                {[33, 99, 100, 500, 1000].map(preset => (
                  <TouchableOpacity 
                    key={preset}
                    style={[
                      styles.presetButton,
                      parseInt(customLimit) === preset && styles.presetButtonActive
                    ]}
                    onPress={() => setCustomLimit(preset.toString())}
                  >
                    <LinearGradient
                      colors={parseInt(customLimit) === preset 
                        ? selectedDhikr.color as readonly [string, string]
                        : ['#ffffff', '#f0f0f0'] as readonly [string, string]}
                      style={styles.presetButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <ThemedText 
                        style={[
                          styles.presetButtonText,
                          parseInt(customLimit) === preset && styles.presetButtonTextActive
                        ]}
                      >
                        {preset}
                      </ThemedText>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.commonLimitsContainer}>
              <ThemedText style={styles.presetLabel}>Common Tasbih Sets:</ThemedText>
              <View style={styles.commonLimits}>
                <TouchableOpacity 
                  style={styles.commonLimitButton}
                  onPress={() => setCustomLimit('33')}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f5f5f5']}
                    style={styles.commonLimitGradient}
                  >
                    <View style={[styles.commonLimitIconContainer, {backgroundColor: '#4CAF50'}]}>
                      <FontAwesome name="star" size={16} color="#fff" />
                    </View>
                    <ThemedText style={styles.commonLimitText}>33 × 3 (Tasbih)</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.commonLimitButton}
                  onPress={() => setCustomLimit('11')}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f5f5f5']}
                    style={styles.commonLimitGradient}
                  >
                    <View style={[styles.commonLimitIconContainer, {backgroundColor: '#2196F3'}]}>
                      <FontAwesome name="star" size={16} color="#fff" />
                    </View>
                    <ThemedText style={styles.commonLimitText}>11 × 11 (Tahlil)</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.commonLimitButton}
                  onPress={() => setCustomLimit('100')}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f5f5f5']}
                    style={styles.commonLimitGradient}
                  >
                    <View style={[styles.commonLimitIconContainer, {backgroundColor: '#FF9800'}]}>
                      <FontAwesome name="star" size={16} color="#fff" />
                    </View>
                    <ThemedText style={styles.commonLimitText}>100 × 1 (Istighfar)</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onCancel}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={onSave}
              >
                <LinearGradient
                  colors={selectedDhikr.color as readonly [string, string]}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <FontAwesome name="check" size={16} color="#fff" style={{marginRight: 5}} />
                  <ThemedText style={styles.saveButtonText}>Set Limit</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitModalContent: {
    borderRadius: 15,
    overflow: 'hidden',
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
  limitModalHeader: {
    padding: 15,
    alignItems: 'center',
  },
  limitModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  limitModalBody: {
    padding: 20,
  },
  limitInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentLimitBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  currentLimitText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  currentLimitValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  dhikrNameBadge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputLabel: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputGradient: {
    borderRadius: 10,
    padding: 2,
  },
  limitInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    fontSize: 22,
    fontWeight: 'bold',
    backgroundColor: '#fff',
    color: '#333',
    textAlign: 'center',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -9,
  },
  limitPresets: {
    marginBottom: 20,
  },
  presetLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  presetButton: {
    margin: 5,
    borderRadius: 8,
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
  presetButtonActive: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  presetButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  presetButtonTextActive: {
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  commonLimitsContainer: {
    marginBottom: 20,
  },
  commonLimits: {
    flexDirection: 'column',
  },
  commonLimitButton: {
    borderRadius: 8,
    marginVertical: 5,
    overflow: 'hidden',
  },
  commonLimitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  commonLimitIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commonLimitText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    // No additional styles needed
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  saveButtonGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 