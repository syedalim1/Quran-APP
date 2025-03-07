import React from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Linking, Platform, Dimensions } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { FontAwesome } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface Mosque {
  id: string;
  name: string;
  distance: number;
  latitude: number;
  longitude: number;
  address: string;
  rating: number;
  userRatingsTotal: number;
}

export default function MosquesScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [showMap, setShowMap] = useState(true);

  const fetchNearbyMosques = async (latitude: number, longitude: number) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      
      // First, get the initial results
      const initialResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${latitude},${longitude}&` +
        `radius=5000&` +
        `type=mosque&` +
        `keyword=mosque&` + // Add keyword to improve accuracy
        `rankBy=distance&` + // Rank by distance for better results
        `key=AIzaSyA99tN7WtyttOzPiWMn-5dkLKLBtC5Fkiw`
      );

      if (!initialResponse.ok) {
        throw new Error(`HTTP error! status: ${initialResponse.status}`);
      }

      const initialData = await initialResponse.json();
      
      if (initialData.status === 'REQUEST_DENIED') {
        throw new Error('API request was denied. Please check your API key.');
      }

      if (initialData.status === 'ZERO_RESULTS') {
        setErrorMsg('No mosques found within 5km. Try increasing the search radius.');
        setMosques([]);
        return;
      }

      if (!initialData.results || !Array.isArray(initialData.results)) {
        throw new Error('Invalid response format from Google Places API');
      }

      // Process initial results
      let mosquesData: Mosque[] = initialData.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        distance: calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        address: place.vicinity || 'Address not available',
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0
      }));

      // If we have a next_page_token, fetch more results
      if (initialData.next_page_token) {
        // Wait for 2 seconds as required by Google Places API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const nextPageResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `pagetoken=${initialData.next_page_token}&` +
          `key=AIzaSyA99tN7WtyttOzPiWMn-5dkLKLBtC5Fkiw`
        );

        if (nextPageResponse.ok) {
          const nextPageData = await nextPageResponse.json();
          if (nextPageData.results && Array.isArray(nextPageData.results)) {
            const additionalMosques = nextPageData.results.map((place: any) => ({
              id: place.place_id,
              name: place.name,
              distance: calculateDistance(
                latitude,
                longitude,
                place.geometry.location.lat,
                place.geometry.location.lng
              ),
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              address: place.vicinity || 'Address not available',
              rating: place.rating || 0,
              userRatingsTotal: place.user_ratings_total || 0
            }));
            mosquesData = [...mosquesData, ...additionalMosques];
          }
        }
      }

      // Filter and sort mosques
      mosquesData = mosquesData
        .filter(mosque => 
          // Filter out potential false positives
          mosque.name.toLowerCase().includes('mosque') ||
          mosque.name.toLowerCase().includes('masjid') ||
          mosque.name.toLowerCase().includes('مسجد')
        )
        .sort((a, b) => a.distance - b.distance);

      if (mosquesData.length > 0) {
        setMosques(mosquesData);
      } else {
        setErrorMsg('No mosques found within 5km. Try increasing the search radius.');
        setMosques([]);
      }
    } catch (error) {
      console.error('Error fetching nearby mosques:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Error fetching nearby mosques. Please try again later.');
      setMosques([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Add a refresh function
  const refreshMosques = async () => {
    if (location) {
      setIsLoading(true);
      await fetchNearbyMosques(location.coords.latitude, location.coords.longitude);
    }
  };

  // Add pull-to-refresh functionality
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (location) {
      await fetchNearbyMosques(location.coords.latitude, location.coords.longitude);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setLocation(location);
        await fetchNearbyMosques(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Error getting location');
        setIsLoading(false);
      }
    })();
  }, []);

  const openInMaps = (mosque: Mosque) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${mosque.latitude},${mosque.longitude}`;
    const label = mosque.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const renderMap = () => {
    if (!location) return null;

    const initialRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    return (
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {/* User location marker */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
          
          {/* Mosque markers */}
          {mosques.map((mosque) => (
            <Marker
              key={mosque.id}
              coordinate={{
                latitude: mosque.latitude,
                longitude: mosque.longitude,
              }}
              title={mosque.name}
              description={mosque.address}
              pinColor="#4CAF50"
              onPress={() => setSelectedMosque(mosque)}
            />
          ))}
        </MapView>
      </View>
    );
  };

  const renderMosqueItem = ({ item }: { item: Mosque }) => (
    <TouchableOpacity 
      style={[
        styles.mosqueItem,
        selectedMosque?.id === item.id && styles.selectedMosqueItem
      ]}
      onPress={() => {
        setSelectedMosque(item);
        setShowMap(false);
      }}
    >
      <View style={styles.mosqueInfo}>
        <ThemedText style={styles.mosqueName}>{item.name}</ThemedText>
        <ThemedText style={styles.mosqueAddress}>{item.address}</ThemedText>
        <ThemedText style={styles.mosqueDistance}>
          {(item.distance / 1000).toFixed(1)} km away
        </ThemedText>
      </View>
      <FontAwesome name="map-marker" size={24} color="#4CAF50" />
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (errorMsg) {
      return <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>;
    }

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Finding nearby mosques...</ThemedText>
        </View>
      );
    }

    return (
      <>
        {showMap && renderMap()}
        <FlatList
          data={mosques}
          renderItem={renderMosqueItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <ThemedText style={styles.noMosquesText}>No mosques found nearby</ThemedText>
          }
        />
      </>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Nearby Mosques</ThemedText>
      <ThemedView style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {renderContent()}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={refreshMosques}
        >
          <FontAwesome name="refresh" size={20} color="#4CAF50" />
          <ThemedText style={styles.refreshText}>Refresh</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setShowMap(!showMap)}
        >
          <FontAwesome 
            name={showMap ? "list" : "map"} 
            size={20} 
            color="#4CAF50" 
          />
          <ThemedText style={styles.refreshText}>
            {showMap ? "Show List" : "Show Map"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.4,
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  separator: {
    marginVertical: 10,
    height: 1,
    width: '90%',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  mosqueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  selectedMosqueItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  mosqueInfo: {
    flex: 1,
    marginRight: 16,
  },
  mosqueName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mosqueAddress: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  mosqueDistance: {
    fontSize: 14,
    color: '#4CAF50',
  },
  noMosquesText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  refreshText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  }
});
