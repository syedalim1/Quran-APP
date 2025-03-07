import React from 'react';
import { StyleSheet, Modal, TextInput, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { DhikrOption } from './constants';

interface CustomDhikrModalProps {
  visible: boolean;
  customName: string;
  customArabic: string;
  customCount: string;
  setCustomName: (name: string) => void;
  setCustomArabic: (text: string) => void;
  setCustomCount: (count: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function CustomDhikrModal({
  visible,
  customName,
  customArabic,
  customCount,
  setCustomName,
  setCustomArabic,
  setCustomCount,
  onCancel,
  onSave
}: CustomDhikrModalProps) {
  const width = Dimensions.get('window').width;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={[styles.modalContent, { width: width * 0.85 }]}>
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
              onPress={onCancel}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]}
              onPress={onSave}
            >
              <ThemedText style={styles.buttonText}>Save</ThemedText>
            </TouchableOpacity>
          </View>
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
  modalContent: {
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
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
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
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
}); 