import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import MapView, { Marker } from 'react-native-maps';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export default function MosquesScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // Placeholder mosque data
  const mosques = [
    {
      latitude: 51.5074,
      longitude: 0.1278,
      title: 'Placeholder Mosque 1',
    },
    {
      latitude: 51.5174,
      longitude: 0.1378,
      title: 'Placeholder Mosque 2',
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Nearby Mosques</ThemedText>
      <ThemedView style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {errorMsg ? (
        <ThemedText>{errorMsg}</ThemedText>
      ) : location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {mosques.map((mosque, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: mosque.latitude, longitude: mosque.longitude }}
              title={mosque.title}
            />
          ))}
        </MapView>
      ) : (
        <ThemedText>Loading map...</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  map: {
    width: '100%',
    height: '80%',
  },
});
