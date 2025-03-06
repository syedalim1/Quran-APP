import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { DhikrOption } from '../../app/(tabs)/tasbih';

interface HeaderProps {
  selectedDhikr: DhikrOption;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

export function Header({ selectedDhikr, showHistory, setShowHistory }: HeaderProps) {
  return (
    <LinearGradient
      colors={selectedDhikr.color}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ThemedText style={styles.title}>Digital Tasbih</ThemedText>
      <TouchableOpacity 
        style={styles.historyButton}
        onPress={() => setShowHistory(!showHistory)}
      >
        <FontAwesome name="history" size={24} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  historyButton: {
    padding: 10,
  },
}); 