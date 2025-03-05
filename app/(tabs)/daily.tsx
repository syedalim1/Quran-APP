import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Share, Dimensions, Animated } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Sample quotes data
const islamicQuotes = [
  {
    id: 1,
    text: "The best among you are those who have the best manners and character.",
    source: "Prophet Muhammad (PBUH)",
    category: "Character",
    background: ["#4CAF50", "#2E7D32"],
  },
  {
    id: 2,
    text: "Verily, with hardship comes ease.",
    source: "Quran 94:6",
    category: "Patience",
    background: ["#2196F3", "#1565C0"],
  },
  {
    id: 3,
    text: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
    source: "Prophet Muhammad (PBUH)",
    category: "Consistency",
    background: ["#9C27B0", "#6A1B9A"],
  },
  {
    id: 4,
    text: "Speak good or remain silent.",
    source: "Prophet Muhammad (PBUH)",
    category: "Speech",
    background: ["#FF9800", "#EF6C00"],
  },
  {
    id: 5,
    text: "Indeed, Allah is with the patient.",
    source: "Quran 2:153",
    category: "Patience",
    background: ["#F44336", "#C62828"],
  },
  {
    id: 6,
    text: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    source: "Prophet Muhammad (PBUH)",
    category: "Speech",
    background: ["#607D8B", "#455A64"],
  },
  {
    id: 7,
    text: "The strong person is not the one who can wrestle someone else down. The strong person is the one who can control himself when he is angry.",
    source: "Prophet Muhammad (PBUH)",
    category: "Self-Control",
    background: ["#009688", "#00695C"],
  },
  {
    id: 8,
    text: "And when My servants ask you concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
    source: "Quran 2:186",
    category: "Prayer",
    background: ["#673AB7", "#4527A0"],
  },
  {
    id: 9,
    text: "Richness is not having many possessions. Rather, true richness is the richness of the soul.",
    source: "Prophet Muhammad (PBUH)",
    category: "Contentment",
    background: ["#795548", "#4E342E"],
  },
  {
    id: 10,
    text: "And whoever relies upon Allah - then He is sufficient for him.",
    source: "Quran 65:3",
    category: "Trust",
    background: ["#3F51B5", "#283593"],
  },
];

// Sample reminders data
const dailyReminders = [
  {
    id: 1,
    title: "Morning Dhikr",
    description: "Remember to recite your morning adhkar after Fajr prayer.",
    icon: "sun-o",
  },
  {
    id: 2,
    title: "Duha Prayer",
    description: "Try to pray Duha prayer between sunrise and noon.",
    icon: "clock-o",
  },
  {
    id: 3,
    title: "Quran Reading",
    description: "Read at least one page of Quran daily.",
    icon: "book",
  },
  {
    id: 4,
    title: "Evening Dhikr",
    description: "Remember to recite your evening adhkar after Asr prayer.",
    icon: "moon-o",
  },
  {
    id: 5,
    title: "Charity",
    description: "Give in charity, even if it's a small amount.",
    icon: "heart",
  },
];

// Categories for filtering
const categories = [
  "All",
  "Character",
  "Patience",
  "Prayer",
  "Speech",
  "Trust",
  "Self-Control",
  "Contentment",
  "Consistency",
];

export default function DailyScreen() {
  const [dailyQuote, setDailyQuote] = useState(islamicQuotes[0]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  // Set a random daily quote on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * islamicQuotes.length);
    setDailyQuote(islamicQuotes[randomIndex]);
  }, []);
  
  const filteredQuotes = islamicQuotes.filter(quote => 
    selectedCategory === "All" || quote.category === selectedCategory
  );
  
  const favoritedQuotes = islamicQuotes.filter(quote => 
    favorites.includes(quote.id)
  );
  
  const toggleFavorite = (quoteId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (favorites.includes(quoteId)) {
      setFavorites(favorites.filter(id => id !== quoteId));
    } else {
      setFavorites([...favorites, quoteId]);
      
      // Animate the favorite button
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };
  
  const shareQuote = async (quote: typeof islamicQuotes[0]) => {
    try {
      await Share.share({
        message: `"${quote.text}" - ${quote.source}`,
      });
    } catch (error) {
      console.error(error);
    }
  };
  
  const changeQuote = () => {
    // Animate fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Change quote
      const currentIndex = islamicQuotes.findIndex(q => q.id === dailyQuote.id);
      const nextIndex = (currentIndex + 1) % islamicQuotes.length;
      setDailyQuote(islamicQuotes[nextIndex]);
      
      // Animate fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };
  
  const renderCategorySelector = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categorySelectorContainer}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryItem,
              selectedCategory === category && styles.selectedCategoryItem
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <ThemedText 
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}
            >
              {category}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  const renderQuoteCard = (quote: typeof islamicQuotes[0]) => {
    const isFavorite = favorites.includes(quote.id);
    
    return (
      <ThemedView style={styles.quoteCard} key={quote.id}>
        <LinearGradient
          colors={quote.background}
          style={styles.quoteCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ThemedText style={styles.quoteText}>"{quote.text}"</ThemedText>
          <ThemedText style={styles.quoteSource}>- {quote.source}</ThemedText>
          
          <ThemedView style={styles.quoteActions}>
            <TouchableOpacity 
              style={styles.quoteActionButton}
              onPress={() => toggleFavorite(quote.id)}
            >
              <Animated.View style={{ transform: [{ scale: isFavorite ? scaleAnim : 1 }] }}>
                <FontAwesome 
                  name={isFavorite ? "heart" : "heart-o"} 
                  size={20} 
                  color="#fff" 
                />
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quoteActionButton}
              onPress={() => shareQuote(quote)}
            >
              <FontAwesome name="share" size={20} color="#fff" />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView style={styles.categoryTag}>
            <ThemedText style={styles.categoryTagText}>{quote.category}</ThemedText>
          </ThemedView>
        </LinearGradient>
      </ThemedView>
    );
  };
  
  const renderDailyQuote = () => {
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <ThemedView style={styles.dailyQuoteContainer}>
          <ThemedText style={styles.dailyQuoteTitle}>Today's Inspiration</ThemedText>
          {renderQuoteCard(dailyQuote)}
          
          <TouchableOpacity 
            style={styles.changeQuoteButton}
            onPress={changeQuote}
          >
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.changeQuoteButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <FontAwesome name="refresh" size={16} color="#fff" style={{ marginRight: 5 }} />
              <ThemedText style={styles.changeQuoteButtonText}>Change Quote</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </ThemedView>
      </Animated.View>
    );
  };
  
  const renderReminders = () => {
    return (
      <ThemedView style={styles.remindersContainer}>
        <ThemedText style={styles.remindersTitle}>Daily Reminders</ThemedText>
        
        {dailyReminders.map(reminder => (
          <ThemedView key={reminder.id} style={styles.reminderItem}>
            <ThemedView style={styles.reminderIconContainer}>
              <FontAwesome name={reminder.icon} size={24} color="#4CAF50" />
            </ThemedView>
            <ThemedView style={styles.reminderContent}>
              <ThemedText style={styles.reminderTitle}>{reminder.title}</ThemedText>
              <ThemedText style={styles.reminderDescription}>{reminder.description}</ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
      </ThemedView>
    );
  };
  
  const renderQuotesList = () => {
    const quotesToRender = showFavorites ? favoritedQuotes : filteredQuotes;
    
    if (showFavorites && favoritedQuotes.length === 0) {
      return (
        <ThemedView style={styles.emptyFavorites}>
          <FontAwesome name="heart-o" size={50} color="#ccc" />
          <ThemedText style={styles.emptyFavoritesText}>No favorites yet</ThemedText>
          <ThemedText style={styles.emptyFavoritesSubtext}>
            Tap the heart icon on any quote to add it to your favorites
          </ThemedText>
        </ThemedView>
      );
    }
    
    return (
      <ThemedView style={styles.quotesListContainer}>
        {quotesToRender.map(quote => renderQuoteCard(quote))}
      </ThemedView>
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.header}
      >
        <ThemedText style={styles.title}>Daily Inspiration</ThemedText>
        <ThemedView style={styles.tabButtons}>
          <TouchableOpacity 
            style={[
              styles.tabButton,
              !showFavorites && styles.activeTabButton
            ]}
            onPress={() => setShowFavorites(false)}
          >
            <FontAwesome name="list" size={16} color="#fff" />
            <ThemedText style={styles.tabButtonText}>All</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton,
              showFavorites && styles.activeTabButton
            ]}
            onPress={() => setShowFavorites(true)}
          >
            <FontAwesome name="heart" size={16} color="#fff" />
            <ThemedText style={styles.tabButtonText}>Favorites</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </LinearGradient>
      
      <ScrollView style={styles.scrollView}>
        {!showFavorites && renderDailyQuote()}
        
        {!showFavorites && renderCategorySelector()}
        
        {renderQuotesList()}
        
        {!showFavorites && renderReminders()}
      </ScrollView>
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
    marginBottom: 15,
  },
  tabButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 25,
    padding: 5,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flex: 1,
  },
  activeTabButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  dailyQuoteContainer: {
    padding: 20,
  },
  dailyQuoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  changeQuoteButton: {
    alignSelf: 'center',
    marginTop: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  changeQuoteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  changeQuoteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  categorySelectorContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  selectedCategoryItem: {
    backgroundColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  quotesListContainer: {
    padding: 15,
  },
  quoteCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quoteCardGradient: {
    padding: 20,
    borderRadius: 15,
  },
  quoteText: {
    fontSize: 18,
    color: '#fff',
    fontStyle: 'italic',
    marginBottom: 15,
    lineHeight: 26,
  },
  quoteSource: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'right',
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  quoteActionButton: {
    padding: 10,
    marginLeft: 10,
  },
  categoryTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#fff',
  },
  remindersContainer: {
    padding: 20,
    marginTop: 10,
  },
  remindersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  reminderItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 10,
    marginBottom: 10,
  },
  reminderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76,175,80,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reminderDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyFavorites: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFavoritesText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyFavoritesSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});
