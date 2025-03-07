// Predefined dhikr options
export const dhikrOptions = [
  { id: 1, name: 'Subhanallah', arabicText: 'سُبْحَانَ ٱللَّٰهِ', count: 33, color: ['#4CAF50', '#2E7D32'] as readonly string[] },
  { id: 2, name: 'Alhamdulillah', arabicText: 'ٱلْحَمْدُ لِلَّٰهِ', count: 33, color: ['#2196F3', '#1565C0'] as readonly string[] },
  { id: 3, name: 'Allahu Akbar', arabicText: 'ٱللَّٰهُ أَكْبَرُ', count: 34, color: ['#9C27B0', '#6A1B9A'] as readonly string[] },
  { id: 4, name: 'Astaghfirullah', arabicText: 'أَسْتَغْفِرُ ٱللَّٰهَ', count: 100, color: ['#FF9800', '#EF6C00'] as readonly string[] },
  { id: 5, name: 'La ilaha illallah', arabicText: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', count: 100, color: ['#F44336', '#C62828'] as readonly string[] },
  { id: 6, name: 'Hasbunallah', arabicText: 'حَسْبُنَا ٱللَّٰهُ وَنِعْمَ ٱلْوَكِيلُ', count: 100, color: ['#009688', '#00695C'] as readonly string[] },
  { id: 7, name: 'Salawat', arabicText: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ', count: 100, color: ['#673AB7', '#4527A0'] as readonly string[] },
  { id: 8, name: 'La hawla', arabicText: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ', count: 100, color: ['#795548', '#4E342E'] as readonly string[] },
  { id: 9, name: 'SubhanAllahi wa bihamdihi', arabicText: 'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ', count: 100, color: ['#3F51B5', '#283593'] as readonly string[] },
  { id: 10, name: 'Ayatul Kursi', arabicText: 'ٱللَّٰهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ', count: 7, color: ['#E91E63', '#C2185B'] as readonly string[] },
  { id: 11, name: 'Ya Hayyu Ya Qayyum', arabicText: 'يَا حَيُّ يَا قَيُّومُ', count: 100, color: ['#00BCD4', '#00838F'] as readonly string[] },
  { id: 12, name: 'Ya Rahman Ya Raheem', arabicText: 'يَا رَحْمَٰنُ يَا رَحِيمُ', count: 100, color: ['#8BC34A', '#558B2F'] as readonly string[] },
  { id: 13, name: 'Ya Latif', arabicText: 'يَا لَطِيفُ', count: 129, color: ['#FFC107', '#FFA000'] as readonly string[] },
  { id: 14, name: 'Ya Razzaq', arabicText: 'يَا رَزَّاقُ', count: 308, color: ['#607D8B', '#455A64'] as readonly string[] },
  { id: 15, name: 'Custom', arabicText: '', count: 0, color: ['#9E9E9E', '#616161'] as readonly string[] },
];

export type DhikrOption = typeof dhikrOptions[0];
export type SessionHistory = {date: string, dhikr: string, count: number}; 