import { StyleSheet } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import QiblaCompass from '../../components/qibla/QiblaCompass';

export default function QiblaScreen() {
  return (
    <ThemedView style={styles.container}>
      <QiblaCompass />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f5',
  },
}); 