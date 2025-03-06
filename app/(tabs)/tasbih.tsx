import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, Modal, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Header } from '../../components/tasbih/Header';
import { DhikrOptions } from '../../components/tasbih/DhikrOptions';
import { Counter } from '../../components/tasbih/Counter';
import { HistoryView } from '../../components/tasbih/HistoryView';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Predefined dhikr options
export const dhikrOptions = [
  { id: 1, name: 'Subhanallah', arabicText: 'سُبْحَانَ ٱللَّٰهِ', count: 33, color: ['#4CAF50', '#2E7D32'] as readonly string[] },
  { id: 2, name: 'Alhamdulillah', arabicText: 'ٱلْحَمْدُ لِلَّٰهِ', count: 33, color: ['#2196F3', '#1565C0'] as readonly string[] },
  { id: 3, name: 'Allahu Akbar', arabicText: 'ٱللَّٰهُ أَكْبَرُ', count: 34, color: ['#9C27B0', '#6A1B9A'] as readonly string[] },
  { id: 4, name: 'Astaghfirullah', arabicText: 'أَسْتَغْفِرُ ٱللَّٰهَ', count: 100, color: ['#FF9800', '#EF6C00'] as readonly string[] },
  { id: 5, name: 'La ilaha illallah', arabicText: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', count: 100, color: ['#F44336', '#C62828'] as readonly string[] },
  { id: 6, name: 'Custom', arabicText: '', count: 0, color: ['#607D8B', '#455A64'] as readonly string[] },
];

export type DhikrOption = typeof dhikrOptions[0];
export type SessionHistory = {date: string, dhikr: string, count: number};

export default function TasbihScreen() {
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrOption>(dhikrOptions[0]);
  const [count, setCount] = useState(0);
  const [targetCount, setTargetCount] = useState(selectedDhikr.count);
  const [savedSessions, setSavedSessions] = useState<SessionHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Custom dhikr state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customArabic, setCustomArabic] = useState('');
  const [customCount, setCustomCount] = useState('');
  
  // Auto progression state
  const [autoProgress, setAutoProgress] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedDhikrs, setCompletedDhikrs] = useState<number[]>([]);
  
  // Custom limit state
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [customLimit, setCustomLimit] = useState('');
  
  useEffect(() => {
    // Reset count when dhikr changes
    setCount(0);
    
    // If custom dhikr is selected, show the modal
    if (selectedDhikr.id === 6) {
      setShowCustomModal(true);
    } else {
      setTargetCount(selectedDhikr.count);
    }
  }, [selectedDhikr]);
  
  const saveSession = (newCount: number) => {
    const now = new Date();
    const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    setSavedSessions(prev => [
      { date: dateString, dhikr: selectedDhikr.name, count: newCount },
      ...prev
    ]);
    
    // Add to completed dhikrs
    setCompletedDhikrs(prev => [...prev, selectedDhikr.id]);
    
    // If auto-progress is enabled, move to the next dhikr
    if (autoProgress) {
      // Find the next dhikr in sequence (excluding Custom)
      const currentIndex = dhikrOptions.findIndex(d => d.id === selectedDhikr.id);
      const nextIndex = (currentIndex + 1) % (dhikrOptions.length - 1); // Exclude the last one (Custom)
      
      // If we've completed a full cycle
      if (nextIndex === 0 && currentIndex === dhikrOptions.length - 2) {
        setShowCompletionModal(true);
        setCompletedDhikrs([]);
      } else {
        // Move to the next dhikr
        setSelectedDhikr(dhikrOptions[nextIndex]);
      }
    }
  };
  
  const handleCustomDhikr = () => {
    // Create a custom dhikr option
    const customDhikr: DhikrOption = {
      ...dhikrOptions[5], // Copy the Custom template
      name: customName || 'Custom Dhikr',
      arabicText: customArabic,
      count: parseInt(customCount) || 33,
    };
    
    setSelectedDhikr(customDhikr);
    setTargetCount(customDhikr.count);
    setShowCustomModal(false);
  };
  
  const handleSelectDhikr = (dhikr: DhikrOption) => {
    setSelectedDhikr(dhikr);
  };
  
  const toggleAutoProgress = () => {
    setAutoProgress(!autoProgress);
  };
  
  const handleSetCustomLimit = () => {
    const newLimit = parseInt(customLimit);
    if (newLimit > 0) {
      setTargetCount(newLimit);
      setShowLimitModal(false);
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <Header 
        selectedDhikr={selectedDhikr} 
        showHistory={showHistory}
        setShowHistory={setShowHistory}
      />
      
      {!showHistory && (
        <>
          <DhikrOptions 
            dhikrOptions={dhikrOptions}
            selectedDhikr={selectedDhikr}
            onSelectDhikr={handleSelectDhikr}
          />
          
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
              onPress={() => setShowLimitModal(true)}
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
          
          {completedDhikrs.length > 0 && (
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
          )}
        </>
      )}
      
      {!showHistory ? (
        <Counter 
          selectedDhikr={selectedDhikr}
          count={count}
          setCount={setCount}
          targetCount={targetCount}
          onTargetReached={saveSession}
          setTargetCount={setTargetCount}
        />
      ) : (
        <HistoryView savedSessions={savedSessions} />
      )}
      
      {/* Custom Dhikr Modal */}
      <Modal
        visible={showCustomModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Custom Dhikr</ThemedText>
            
            <ThemedText style={styles.inputLabel}>Name</ThemedText>
            <TextInput
              style={styles.textInput}
              value={customName}
              onChangeText={setCustomName}
              placeholder="Enter dhikr name"
              placeholderTextColor="#999"
            />
            
            <ThemedText style={styles.inputLabel}>Arabic Text (optional)</ThemedText>
            <TextInput
              style={styles.textInput}
              value={customArabic}
              onChangeText={setCustomArabic}
              placeholder="Enter Arabic text"
              placeholderTextColor="#999"
            />
            
            <ThemedText style={styles.inputLabel}>Target Count</ThemedText>
            <TextInput
              style={styles.textInput}
              value={customCount}
              onChangeText={setCustomCount}
              placeholder="33"
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCustomModal(false);
                  setSelectedDhikr(dhikrOptions[0]);
                }}
              >
                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCustomDhikr}
              >
                <ThemedText style={styles.buttonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
      
      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.completionModalContent}>
            <ThemedText style={styles.completionTitle}>Tasbih Completed!</ThemedText>
            <ThemedText style={styles.completionSubtitle}>
              You have completed the full set of dhikrs.
            </ThemedText>
            
            <TouchableOpacity 
              style={styles.completionButton}
              onPress={() => {
                setShowCompletionModal(false);
                setSelectedDhikr(dhikrOptions[0]);
              }}
            >
              <LinearGradient
                colors={['#4CAF50', '#2E7D32'] as readonly [string, string]}
                style={styles.completionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ThemedText style={styles.completionButtonText}>
                  Start Again
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
      
      {/* Custom Limit Modal */}
      <Modal
        visible={showLimitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLimitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.limitModalContent}>
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
                  onPress={() => setShowLimitModal(false)}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSetCustomLimit}
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    padding: 20,
    borderRadius: 15,
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
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
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
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
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
  completionModalContent: {
    width: width * 0.85,
    padding: 20,
    borderRadius: 15,
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
  completionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  completionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  completionButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  limitModalContent: {
    width: width * 0.9,
    maxWidth: 400,
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
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#eee',
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
