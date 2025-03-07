import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { Header } from '../../components/tasbih/Header';
import { DhikrOptions } from '../../components/tasbih/DhikrOptions';
import { Counter } from '../../components/tasbih/Counter';
import { HistoryView } from '../../components/tasbih/HistoryView';
import { Controls } from '../../components/tasbih/Controls';
import { ProgressIndicator } from '../../components/tasbih/ProgressIndicator';
import { CustomDhikrModal } from '../../components/tasbih/CustomDhikrModal';
import { CompletionModal } from '../../components/tasbih/CompletionModal';
import { CustomLimitModal } from '../../components/tasbih/CustomLimitModal';
import { dhikrOptions, DhikrOption, SessionHistory } from '../../components/tasbih/constants';

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
  
  const handleCancelCustomDhikr = () => {
    setShowCustomModal(false);
    setSelectedDhikr(dhikrOptions[0]);
  };
  
  const handleCompletionModalClose = () => {
    setShowCompletionModal(false);
    setSelectedDhikr(dhikrOptions[0]);
  };
  
  return (
    <ThemedView style={styles.container}>
      {/* <Header 
        selectedDhikr={selectedDhikr} 
        showHistory={showHistory}
        setShowHistory={setShowHistory}
      /> */}
      
      {!showHistory && (
        <>
          <DhikrOptions 
            dhikrOptions={dhikrOptions}
            selectedDhikr={selectedDhikr}
            onSelectDhikr={handleSelectDhikr}
          />
          
          <Controls
            autoProgress={autoProgress}
            targetCount={targetCount}
            toggleAutoProgress={toggleAutoProgress}
            showLimitModal={() => setShowLimitModal(true)}
          />
          
          <ProgressIndicator
            dhikrOptions={dhikrOptions}
            completedDhikrs={completedDhikrs}
          />
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
      
      {/* Modals */}
      <CustomDhikrModal
        visible={showCustomModal}
        customName={customName}
        customArabic={customArabic}
        customCount={customCount}
        setCustomName={setCustomName}
        setCustomArabic={setCustomArabic}
        setCustomCount={setCustomCount}
        onCancel={handleCancelCustomDhikr}
        onSave={handleCustomDhikr}
      />
      
      <CompletionModal
        visible={showCompletionModal}
        onClose={handleCompletionModalClose}
      />
      
      <CustomLimitModal
        visible={showLimitModal}
        selectedDhikr={selectedDhikr}
        targetCount={targetCount}
        customLimit={customLimit}
        setCustomLimit={setCustomLimit}
        onCancel={() => setShowLimitModal(false)}
        onSave={handleSetCustomLimit}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#000000"
  },
});
