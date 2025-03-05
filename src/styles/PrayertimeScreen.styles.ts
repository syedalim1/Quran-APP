import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    headerGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
    },
    content: {
      flex: 1,
    },
    errorContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      marginTop: 40,
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
      marginVertical: 20,
      color: '#ff6b6b',
    },
    retryButton: {
      borderRadius: 25,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    retryButtonGradient: {
      paddingVertical: 12,
      paddingHorizontal: 30,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    locationIcon: {
      marginRight: 10,
      opacity: 0.9,
    },
    locationText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
      opacity: 0.9,
    },
    prayerTimeCard: {
      marginBottom: 15,
      borderRadius: 15,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    nextPrayerCard: {
      transform: [{ scale: 1.02 }],
      elevation: 5,
    },
    prayerTimeGradient: {
      padding: 15,
    },
    prayerTimeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    prayerNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    prayerIcon: {
      marginRight: 12,
    },
    prayerNameEnglish: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
    prayerNameArabic: {
      fontSize: 16,
      color: '#fff',
      opacity: 0.8,
    },
    prayerTime: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
    },
    nextPrayerContainer: {
      marginHorizontal: width < 360 ? 10 : 16,
      marginBottom: 24,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    nextPrayerGradient: {
      padding: width < 360 ? 15 : 20,
    },
    nextPrayerContent: {
      alignItems: 'center',
      width: '100%',
    },
    nextPrayerLabel: {
      fontSize: width < 360 ? 14 : 16,
      color: '#fff',
      opacity: 0.9,
      marginBottom: 10,
      fontWeight: '600',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    nextPrayerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginBottom: width < 360 ? 10 : 15,
    },
    nextPrayerIconContainer: {
      width: width < 360 ? 40 : 50,
      height: width < 360 ? 40 : 50,
      borderRadius: width < 360 ? 20 : 25,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: width < 360 ? 12 : 15,
    },
    nextPrayerTextContainer: {
      flex: 1,
    },
    nextPrayerName: {
      paddingVertical: width < 360 ? 15 : 20,
      fontSize: width < 360 ? 24 : 28,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 2,
    },
    nextPrayerArabic: {
      fontSize: width < 360 ? 16 : 20,
      color: '#fff',
      opacity: 0.9,
      marginBottom: 2,
    },
    nextPrayerDescription: {
      fontSize: width < 360 ? 12 : 14,
      color: '#fff',
      opacity: 0.8,
    },
    nextPrayerTimeContainer: {
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      paddingHorizontal: width < 360 ? 12 : 16,
      paddingVertical: width < 360 ? 8 : 12,
      borderRadius: width < 360 ? 12 : 15,
      width: '100%',
      marginTop: width < 360 ? 8 : 12,
    },
    nextPrayerTimeLabel: {
      fontSize: width < 360 ? 11 : 13,
      color: '#fff',
      opacity: 0.9,
      marginBottom: width < 360 ? 4 : 6,
      letterSpacing: 1,
      textTransform: 'uppercase',
      fontWeight: '500',
    },
    nextPrayerTime: {
      paddingVertical: 15,
      fontSize: width < 360 ? 28 : 40,
      fontWeight: 'bold',
      color: '#fff',
      marginTop: 4,
      textAlign: 'center'
    },
    timeWrapper: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      flexWrap: 'nowrap',
    },
    timeText: {
      fontSize: width < 360 ? 28 : 36,
      fontWeight: 'bold',
      color: '#fff',
      letterSpacing: 1,
      textAlign: 'center',
      minWidth: width < 360 ? 35 : 45,
    },
    timeUnit: {
      fontSize: width < 360 ? 16 : 20,
      color: '#fff',
      opacity: 0.8,
      marginHorizontal: width < 360 ? 4 : 6,
      fontWeight: '500',
    },
    prayerTimeWrapper: {
      alignItems: 'flex-end',
    },
    nextIndicator: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginTop: 5,
    },
    nextIndicatorText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#fff',
      letterSpacing: 1,
    },
    progressBar: {
      height: 3,
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginTop: 10,
      borderRadius: 1.5,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#fff',
    },
  });