import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { WebView } from 'react-native-webview';
import { BlurView } from 'expo-blur';
import { useThemeColor } from '../../hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

// Sample data for Quran surahs
const surahs = [
  { id: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', verses: 7 },
  { id: 2, name: 'Al-Baqarah', arabicName: 'البقرة', verses: 286 },
  { id: 3, name: 'Aal-Imran', arabicName: 'آل عمران', verses: 200 },
  { id: 4, name: 'An-Nisa', arabicName: 'النساء', verses: 176 },
  { id: 5, name: 'Al-Ma\'idah', arabicName: 'المائدة', verses: 120 },
  { id: 6, name: 'Al-An\'am', arabicName: 'الأنعام', verses: 165 },
  { id: 7, name: 'Al-A\'raf', arabicName: 'الأعراف', verses: 206 },
  { id: 8, name: 'Al-Anfal', arabicName: 'الأنفال', verses: 75 },
  { id: 9, name: 'At-Tawbah', arabicName: 'التوبة', verses: 129 },
  { id: 10, name: 'Yunus', arabicName: 'يونس', verses: 109 },
  { id: 11, name: 'Hud', arabicName: 'هود', verses: 123 },
  { id: 12, name: 'Yusuf', arabicName: 'يوسف', verses: 111 },
  { id: 13, name: 'Ar-Ra\'d', arabicName: 'الرعد', verses: 43 },
  { id: 14, name: 'Ibrahim', arabicName: 'إبراهيم', verses: 52 },
  { id: 15, name: 'Al-Hijr', arabicName: 'الحجر', verses: 99 },
  // Add more surahs as needed
];

export default function QuranScreen() {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'reading'>('list');
  
  const backgroundColor = useThemeColor({ light: '#f0f0f0', dark: '#121212' }, 'background');
  const textColor = useThemeColor({ light: '#000000', dark: '#ffffff' }, 'text');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1e1e1e' }, 'card');

  const filteredSurahs = surahs.filter(surah => 
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.arabicName.includes(searchQuery)
  );

  const toggleBookmark = (surahId: number) => {
    if (bookmarks.includes(surahId)) {
      setBookmarks(bookmarks.filter(id => id !== surahId));
    } else {
      setBookmarks([...bookmarks, surahId]);
    }
  };

  const openSurah = (surahId: number) => {
    setSelectedSurah(surahId);
    setLoading(true);
    setViewMode('reading');
  };

  const backToList = () => {
    setViewMode('list');
    setSelectedSurah(null);
  };

  const renderSurahItem = ({ item }: { item: typeof surahs[0] }) => (
    <TouchableOpacity 
      style={[styles.surahCard, { backgroundColor: cardColor }]} 
      onPress={() => openSurah(item.id)}
    >
      <View style={styles.surahNumberContainer}>
        <ThemedText style={styles.surahNumber}>{item.id}</ThemedText>
      </View>
      <View style={styles.surahInfo}>
        <ThemedText style={styles.surahName}>{item.name}</ThemedText>
        <ThemedText style={styles.surahArabicName}>{item.arabicName}</ThemedText>
        <ThemedText style={styles.versesCount}>{item.verses} verses</ThemedText>
      </View>
      <TouchableOpacity 
        style={styles.bookmarkButton}
        onPress={() => toggleBookmark(item.id)}
      >
        <FontAwesome 
          name={bookmarks.includes(item.id) ? "bookmark" : "bookmark-o"} 
          size={24} 
          color={bookmarks.includes(item.id) ? "#4CAF50" : textColor} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderQuranContent = () => {
    const surah = surahs.find(s => s.id === selectedSurah);
    if (!surah) return null;

    // For demonstration, we're using a public Quran API
    const quranUrl = `https://quran.com/${surah.id}`;
    
    return (
      <View style={styles.readingContainer}>
        <View style={styles.readingHeader}>
          <TouchableOpacity onPress={backToList} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={styles.readingTitle}>
            {surah.name} ({surah.arabicName})
          </ThemedText>
          <TouchableOpacity 
            style={styles.bookmarkButton}
            onPress={() => toggleBookmark(surah.id)}
          >
            <FontAwesome 
              name={bookmarks.includes(surah.id) ? "bookmark" : "bookmark-o"} 
              size={24} 
              color={bookmarks.includes(surah.id) ? "#4CAF50" : textColor} 
            />
          </TouchableOpacity>
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={styles.loadingText}>Loading Surah...</ThemedText>
          </View>
        )}
        
        <WebView 
          source={{ uri: quranUrl }} 
          style={styles.webView}
          onLoad={() => setLoading(false)}
        />
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {viewMode === 'list' ? (
        <>
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.header}
          >
            <ThemedText style={styles.title}>Quran Reader</ThemedText>
            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={20} color="#fff" style={styles.searchIcon} />
              <TouchableOpacity 
                style={[styles.filterButton, bookmarks.length > 0 ? styles.activeFilter : {}]}
                onPress={() => setSearchQuery(searchQuery ? '' : 'bookmarked')}
              >
                <FontAwesome name="bookmark" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
          
          <FlatList
            data={filteredSurahs}
            renderItem={renderSurahItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </>
      ) : (
        renderQuranContent()
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeFilter: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  listContainer: {
    padding: 16,
  },
  surahCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  surahNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  surahNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  surahArabicName: {
    fontSize: 20,
    marginBottom: 4,
    textAlign: 'left',
  },
  versesCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  bookmarkButton: {
    padding: 8,
  },
  readingContainer: {
    flex: 1,
  },
  readingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  readingTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
});
