import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  nextPrayerContainer: {
    margin: 16,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nextPrayerGradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  nextPrayerContent: {
    padding: 20,
  },
  nextPrayerHeader: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  nextPrayerIcon: {
    marginRight: 10,
  },
  nextPrayerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    opacity: 0.9,
  },
  nextPrayerName: {
    padding: 10,
    fontSize: 35,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  countdownContainer: {
    
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding:15,
  },
  timeUnit: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeNumber: {
    fontSize: 32,
    padding: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  timeLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 32,
    color: '#fff',
    opacity: 0.5,
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  prayerTimeCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  nextPrayerCard: {
    transform: [{ scale: 1.02 }],
  },
  prayerTimeGradient: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  prayerTimeContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    marginRight: 12,
  },
  prayerNameEnglish: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  prayerNameArabic: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  prayerTime: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});