import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";

// Types for prayer time data
interface PrayerTime {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface NextPrayerCountdownProps {
  prayerTimes: PrayerTime;
  primaryColor: string;
}

// Main component that handles both calculation and display
export function PrayerCountdownWithCalculation({
  prayerTimes,
  primaryColor,
}: NextPrayerCountdownProps) {
  const [timeToNextPrayer, setTimeToNextPrayer] = useState({
    hours: "--",
    minutes: "--",
    seconds: "--",
    name: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Function to calculate time until next prayer
  const calculateTimeToNextPrayer = () => {
    try {
      const now = new Date();
      let nextPrayerTime: Date | null = null;
      let nextPrayerName = "";

      // Convert prayer times to Date objects for comparison
      const prayerTimeObjects: Record<string, Date> = {};
      const today = new Date();

      for (const [name, timeStr] of Object.entries(prayerTimes)) {
        // Parse the time string (assuming format like "05:45" or "17:30")
        const [hours, minutes] = timeStr
          .split(":")
          .map((num: string) => parseInt(num, 10));

        const prayerDate = new Date(today);
        prayerDate.setHours(hours, minutes, 0, 0);

        prayerTimeObjects[name] = prayerDate;

        // Find the next prayer time
        if (
          prayerDate > now &&
          (!nextPrayerTime || prayerDate < nextPrayerTime)
        ) {
          nextPrayerTime = prayerDate;
          nextPrayerName = name;
        }
      }

      // If no next prayer found today, use first prayer of tomorrow
      if (!nextPrayerTime) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Use tomorrow's first prayer
        const firstPrayerName = "fajr"; // Usually fajr is the first prayer
        const firstPrayerTimeStr = prayerTimes[firstPrayerName];
        const [hours, minutes] = firstPrayerTimeStr
          .split(":")
          .map((num: string) => parseInt(num, 10));

        const firstPrayerTomorrow = new Date(tomorrow);
        firstPrayerTomorrow.setHours(hours, minutes, 0, 0);

        nextPrayerTime = firstPrayerTomorrow;
        nextPrayerName = firstPrayerName;
      }

      // Calculate difference in milliseconds
      const diff = nextPrayerTime.getTime() - now.getTime();

      // Convert to hours, minutes, seconds
      const totalSeconds = Math.floor(diff / 1000);
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
        2,
        "0"
      );
      const seconds = String(totalSeconds % 60).padStart(2, "0");

      return {
        hours,
        minutes,
        seconds,
        name: nextPrayerName,
      };
    } catch (err) {
      console.error("Error calculating next prayer time:", err);
      setError("Error calculating prayer time");
      return {
        hours: "--",
        minutes: "--",
        seconds: "--",
        name: "Unknown",
      };
    }
  };

  // Update timer every second
  useEffect(() => {
    // Initial calculation
    setTimeToNextPrayer(calculateTimeToNextPrayer());

    // Set up interval to update every second
    const timer = setInterval(() => {
      setTimeToNextPrayer(calculateTimeToNextPrayer());
    }, 1000);

    // Clean up timer
    return () => clearInterval(timer);
  }, [prayerTimes]);

  // The original display component
  return (
    <NextPrayerCountdown
      timeToNextPrayer={timeToNextPrayer}
      primaryColor={primaryColor}
      error={error}
    />
  );
}

// Original display component
export function NextPrayerCountdown({
  timeToNextPrayer,
  primaryColor,
  error,
}: {
  timeToNextPrayer: {
    hours: string;
    minutes: string;
    seconds: string;
    name: string;
  };
  primaryColor: string;
  error?: string | null;
}) {
  const isLoading = timeToNextPrayer.hours === "--";

  // Ensure the prayer name is properly capitalized and formatted
  const formatPrayerName = (name: string) => {
    if (!name) return "Unknown";

    // Convert to lowercase first to standardize
    const lowerName = name.toLowerCase();

    // Handle common prayer names
    if (lowerName.includes("fajr")) return "Fajr";
    if (lowerName.includes("sunrise")) return "Sunrise";
    if (lowerName.includes("dhuhr")) return "Dhuhr";
    if (lowerName.includes("asr")) return "Asr";
    if (lowerName.includes("maghrib")) return "Maghrib";
    if (lowerName.includes("isha")) return "Isha";

    // If it's not one of the standard names, capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Use the formatted prayer name
  const prayerName = formatPrayerName(timeToNextPrayer.name);

  // Define different gradient colors based on the prayer name
  const getGradientColors = () => {
    const prayerNameLower = prayerName.toLowerCase();

    if (prayerNameLower.includes("fajr"))
      return ["#4A148C", "#7B1FA2"] as const;
    if (prayerNameLower.includes("sunrise"))
      return ["#FF6F00", "#FFA000"] as const;
    if (prayerNameLower.includes("dhuhr"))
      return ["#1565C0", "#1976D2"] as const;
    if (prayerNameLower.includes("asr")) return ["#2E7D32", "#43A047"] as const;
    if (prayerNameLower.includes("maghrib"))
      return ["#C2185B", "#E91E63"] as const;
    if (prayerNameLower.includes("isha"))
      return ["#1A237E", "#3F51B5"] as const;

    return ["#1A237E", "#3F51B5"] as const; // Default colors
  };

  // Choose the icon based on prayer name
  const getPrayerIcon = () => {
    const prayerNameLower = prayerName.toLowerCase();

    if (prayerNameLower.includes("fajr")) return "cloud-sun";
    if (prayerNameLower.includes("sunrise")) return "sun";
    if (prayerNameLower.includes("dhuhr")) return "sun";
    if (prayerNameLower.includes("asr")) return "cloud-sun";
    if (prayerNameLower.includes("maghrib")) return "cloud-sun-rain";
    if (prayerNameLower.includes("isha")) return "moon";

    return "mosque"; // Default icon
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <FontAwesome5
                name={getPrayerIcon()}
                size={30}
                color="#fff"
                style={styles.icon}
              />
            </View>
            <ThemedText style={styles.title}>Next: {prayerName}</ThemedText>
          </View>

          <View style={styles.prayerNameContainer}>
            <ThemedText style={styles.prayerName}>{prayerName}</ThemedText>
            <View style={styles.decorativeLine} />
          </View>

          {error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : isLoading ? (
            <ThemedText style={styles.loadingText}>
              Calculating prayer times...
            </ThemedText>
          ) : (
            <View style={styles.countdownContainer}>
              <View style={styles.timeUnit}>
                <View style={styles.timeNumberContainer}>
                  <ThemedText style={styles.timeNumber}>
                    {timeToNextPrayer.hours}
                  </ThemedText>
                </View>
                <ThemedText style={styles.timeLabel}>Hours</ThemedText>
              </View>

              <ThemedText style={styles.timeSeparator}>:</ThemedText>

              <View style={styles.timeUnit}>
                <View style={styles.timeNumberContainer}>
                  <ThemedText style={styles.timeNumber}>
                    {timeToNextPrayer.minutes}
                  </ThemedText>
                </View>
                <ThemedText style={styles.timeLabel}>Minutes</ThemedText>
              </View>

              <ThemedText style={styles.timeSeparator}>:</ThemedText>

              <View style={styles.timeUnit}>
                <View style={styles.timeNumberContainer}>
                  <ThemedText style={styles.timeNumber}>
                    {timeToNextPrayer.seconds}
                  </ThemedText>
                </View>
                <ThemedText style={styles.timeLabel}>Seconds</ThemedText>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
  container: {
    margin: 16,
    width: width - 32,
    alignSelf: "center",
  },
  gradient: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  content: {
    padding: isSmallDevice ? 16 : 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  icon: {
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  title: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flex: 1,
  },
  prayerNameContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  prayerName: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    marginBottom: 10,
    paddingTop: 10,
  },
  decorativeLine: {
    width: width * 0.3,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 3,
  },
  countdownContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    padding: isSmallDevice ? 10 : 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    flexWrap: isSmallDevice ? "wrap" : "nowrap",
  },
  timeUnit: {
    alignItems: "center",
    minWidth: isSmallDevice ? 60 : 70,
    marginVertical: isSmallDevice ? 5 : 0,
  },
  timeNumberContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    minWidth: isSmallDevice ? 50 : 60,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  timeNumber: {
    fontSize: isSmallDevice ? 26 : 30,
    fontWeight: "bold",
    color: "#fff",
    padding: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 10,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
  },
  timeSeparator: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: "bold",
    color: "#fff",
    marginHorizontal: 6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 15,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#ff6b6b",
    textAlign: "center",
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 12,
    borderRadius: 12,
  },
});
