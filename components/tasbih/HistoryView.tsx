import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { FontAwesome } from '@expo/vector-icons';
import { SessionHistory } from '../../app/(tabs)/tasbih';

interface HistoryViewProps {
  savedSessions: SessionHistory[];
}

export function HistoryView({ savedSessions }: HistoryViewProps) {
  if (savedSessions.length === 0) {
    return (
      <ThemedView style={styles.emptyHistory}>
        <FontAwesome name="history" size={50} color="#ccc" />
        <ThemedText style={styles.emptyHistoryText}>No history yet</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.historyView}>
      <ThemedText style={styles.historyTitle}>History</ThemedText>
      <ScrollView style={styles.historyContainer}>
        {savedSessions.map((session, index) => (
          <ThemedView key={index} style={styles.historyItem}>
            <ThemedText style={styles.historyDate}>{session.date}</ThemedText>
            <ThemedView style={styles.historyDetails}>
              <ThemedText style={styles.historyDhikr}>{session.dhikr}</ThemedText>
              <ThemedText style={styles.historyCount}>{session.count}</ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  historyView: {
    flex: 1,
    padding: 20,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  historyContainer: {
    flex: 1,
  },
  historyItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  historyDate: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 5,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDhikr: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistoryText: {
    marginTop: 10,
    fontSize: 18,
    opacity: 0.5,
  },
}); 