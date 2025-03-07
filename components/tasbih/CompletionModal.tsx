import React from 'react';
import { StyleSheet, Modal, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { DhikrOption } from './constants';

interface CompletionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CompletionModal({ visible, onClose }: CompletionModalProps) {
  const width = Dimensions.get('window').width;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.completionModalContent, { width: width * 0.85 }]}>
          <ThemedText style={styles.completionTitle}>Tasbih Completed!</ThemedText>
          <ThemedText style={styles.completionSubtitle}>
            You have completed the full set of dhikrs.
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.completionButton}
            onPress={onClose}
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
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionModalContent: {
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
}); 