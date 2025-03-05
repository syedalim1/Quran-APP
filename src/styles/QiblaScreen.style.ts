import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  compassContainer: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  compassBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  compassOuterRing: {
    width: "100%",
    height: "100%",
    borderRadius: 150,
    borderWidth: 10,
    borderColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  compassInnerRing: {
    width: "80%",
    height: "80%",
    borderRadius: 120,
    borderWidth: 5,
    borderColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  compassRose: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  cardinalDirection: {
    position: "absolute",
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  degreeMarker: {
    width: 2,
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  qiblaNeedle: {
    width: 2,
    height: "50%",
    backgroundColor: "#FFD700",
    position: "absolute",
    top: 0,
    transformOrigin: "bottom",
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFD700",
    position: "absolute",
  },
  directionText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  recalibrateButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  recalibrateText: {
    marginLeft: 10,
    color: "#4A90E2",
  },
  detailsToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  detailsToggleText: {
    marginRight: 10,
    color: "#4A90E2",
  },
  detailsPanel: {
    width: "100%",
    marginTop: 20,
    overflow: "hidden",
  },
  blurContainer: {
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
  },
  errorContainer: {
    alignItems: "center",
  },
  errorText: {
    marginTop: 10,
    color: "#FF6B6B",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
  },
  calibrationContainer: {
    alignItems: "center",
  },
  calibrationText: {
    fontSize: 18,
    marginTop: 10,
  },
  calibrationSubText: {
    fontSize: 14,
    color: "#666",
  },
  accuracyIndicator: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  accuracyText: {
    color: "#fff",
  },
});