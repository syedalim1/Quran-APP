import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Islamic months
const islamicMonths = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Sha\'ban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qa\'dah',
  'Dhu al-Hijjah'
];

// Important Islamic dates and events
const importantDates = [
  { day: 1, month: 0, name: 'Islamic New Year', description: 'First day of Muharram, the first month in the Islamic calendar.' },
  { day: 10, month: 0, name: 'Day of Ashura', description: 'Commemorates the martyrdom of Husayn ibn Ali, the grandson of Muhammad, at the Battle of Karbala.' },
  { day: 12, month: 2, name: 'Mawlid al-Nabi', description: 'Observance of the birthday of Islamic prophet Muhammad.' },
  { day: 27, month: 6, name: 'Laylat al-Mi\'raj', description: 'The night journey and ascension of Muhammad, when he journeyed from Mecca to Jerusalem and then to heaven.' },
  { day: 15, month: 7, name: 'Laylat al-Bara\'at', description: 'Night of Forgiveness or Night of Records. A time when Muslims seek forgiveness for their sins.' },
  { day: 1, month: 8, name: 'Beginning of Ramadan', description: 'The first day of the month of fasting.' },
  { day: 27, month: 8, name: 'Laylat al-Qadr', description: 'The Night of Power, commemorating the night when the first verses of the Quran were revealed to Muhammad.' },
  { day: 1, month: 9, name: 'Eid al-Fitr', description: 'Festival of Breaking the Fast, marking the end of Ramadan.' },
  { day: 8, month: 11, name: 'Day of Arafah', description: 'The second day of the Hajj pilgrimage, when pilgrims gather on Mount Arafat.' },
  { day: 10, month: 11, name: 'Eid al-Adha', description: 'Festival of the Sacrifice, commemorating Ibrahim\'s willingness to sacrifice his son in obedience to God.' },
];

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [islamicDate, setIslamicDate] = useState({ day: 1, month: 0, year: 1444 });
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<Array<typeof importantDates[0] & { daysUntil: number }>>([]);
  
  // Function to convert Gregorian date to Islamic date (simplified version)
  const convertToIslamicDate = (gregorianDate: Date) => {
    // This is a simplified conversion that doesn't account for all the complexities
    // of the Islamic calendar. In a real app, you would use a more accurate library.
    
    // For demonstration purposes, we'll use a simple approximation
    const gregorianYear = gregorianDate.getFullYear();
    const gregorianMonth = gregorianDate.getMonth();
    const gregorianDay = gregorianDate.getDate();
    
    // Approximate conversion (not accurate)
    // In a real app, use a proper Hijri calendar library
    const islamicYear = Math.floor((gregorianYear - 622) * (33/32));
    const islamicMonth = (gregorianMonth + 1) % 12;
    const islamicDay = gregorianDay;
    
    return { day: islamicDay, month: islamicMonth, year: islamicYear };
  };
  
  // Function to generate days for the selected month
  const generateDaysForMonth = (month: number, year: number) => {
    // In a real app, this would use proper Hijri calendar calculations
    // For demonstration, we'll use a simplified approach
    
    // Most Islamic months have 29 or 30 days
    const daysInMonth = month % 2 === 0 ? 30 : 29;
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  // Calculate upcoming events
  useEffect(() => {
    const today = convertToIslamicDate(new Date());
    
    // Find upcoming events
    const upcoming = importantDates
      .map(event => {
        let daysUntil;
        
        if (event.month > today.month || (event.month === today.month && event.day >= today.day)) {
          // Event is later this year
          const monthDiff = event.month - today.month;
          daysUntil = (monthDiff * 30) + (event.day - today.day);
        } else {
          // Event is next year
          const monthsLeft = 12 - today.month + event.month;
          daysUntil = (monthsLeft * 30) + (event.day - today.day);
        }
        
        return { ...event, daysUntil };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5); // Get the 5 closest events
    
    setUpcomingEvents(upcoming);
  }, []);
  
  // Initialize Islamic date
  useEffect(() => {
    const islamicDate = convertToIslamicDate(currentDate);
    setIslamicDate(islamicDate);
    setSelectedMonth(islamicDate.month);
  }, [currentDate]);
  
  const days = generateDaysForMonth(selectedMonth, islamicDate.year);
  
  // Check if a day has an important event
  const getEventForDay = (day: number, month: number) => {
    return importantDates.find(event => event.day === day && event.month === month);
  };
  
  // Render month selector
  const renderMonthSelector = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthSelectorContainer}
      >
        {islamicMonths.map((month, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.monthItem,
              selectedMonth === index && styles.selectedMonthItem
            ]}
            onPress={() => setSelectedMonth(index)}
          >
            <ThemedText 
              style={[
                styles.monthText,
                selectedMonth === index && styles.selectedMonthText
              ]}
            >
              {month}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  // Render calendar grid
  const renderCalendarGrid = () => {
    // Create week day headers
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <ThemedView style={styles.calendarContainer}>
        <ThemedView style={styles.weekDaysContainer}>
          {weekDays.map((day, index) => (
            <ThemedView key={index} style={styles.weekDayItem}>
              <ThemedText style={[
                styles.weekDayText,
                index === 5 && styles.fridayText // Highlight Friday
              ]}>
                {day}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
        
        <ThemedView style={styles.daysGrid}>
          {days.map(day => {
            const event = getEventForDay(day, selectedMonth);
            
            return (
              <TouchableOpacity 
                key={day} 
                style={[
                  styles.dayItem,
                  islamicDate.day === day && islamicDate.month === selectedMonth && styles.currentDayItem,
                  event && styles.eventDayItem
                ]}
              >
                <ThemedText style={[
                  styles.dayText,
                  islamicDate.day === day && islamicDate.month === selectedMonth && styles.currentDayText,
                  event && styles.eventDayText
                ]}>
                  {day}
                </ThemedText>
                {event && (
                  <ThemedView style={styles.eventIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </ThemedView>
    );
  };
  
  // Render upcoming events
  const renderUpcomingEvents = () => {
    return (
      <ThemedView style={styles.upcomingEventsContainer}>
        <ThemedText style={styles.upcomingEventsTitle}>Upcoming Events</ThemedText>
        
        {upcomingEvents.map((event, index) => (
          <ThemedView key={index} style={styles.eventCard}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.eventCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ThemedView style={styles.eventCardContent}>
                <ThemedText style={styles.eventName}>{event.name}</ThemedText>
                <ThemedText style={styles.eventDate}>
                  {event.day} {islamicMonths[event.month]}
                </ThemedText>
                <ThemedText style={styles.eventDescription}>
                  {event.description}
                </ThemedText>
                <ThemedView style={styles.daysUntilContainer}>
                  <FontAwesome name="calendar" size={14} color="#fff" />
                  <ThemedText style={styles.daysUntilText}>
                    {event.daysUntil === 0 ? 'Today' : 
                     event.daysUntil === 1 ? 'Tomorrow' : 
                     `In ${event.daysUntil} days`}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </LinearGradient>
          </ThemedView>
        ))}
      </ThemedView>
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.header}
      >
        <ThemedText style={styles.title}>Islamic Calendar</ThemedText>
        <ThemedText style={styles.subtitle}>
          {islamicDate.day} {islamicMonths[islamicDate.month]} {islamicDate.year} AH
        </ThemedText>
      </LinearGradient>
      
      <ScrollView style={styles.scrollView}>
        {renderMonthSelector()}
        {renderCalendarGrid()}
        {renderUpcomingEvents()}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  monthSelectorContainer: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  monthItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  selectedMonthItem: {
    backgroundColor: '#4CAF50',
  },
  monthText: {
    fontSize: 14,
  },
  selectedMonthText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  calendarContainer: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  fridayText: {
    color: '#4CAF50',
    opacity: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayItem: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  currentDayItem: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  eventDayItem: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
  },
  currentDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventDayText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 5,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
  },
  upcomingEventsContainer: {
    padding: 15,
    marginTop: 20,
  },
  upcomingEventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  eventCard: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventCardGradient: {
    borderRadius: 10,
  },
  eventCardContent: {
    padding: 15,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 10,
  },
  eventDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 10,
  },
  daysUntilContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  daysUntilText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 5,
  },
});
