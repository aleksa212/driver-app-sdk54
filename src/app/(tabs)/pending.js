import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useTrips } from "../../lib/TripsContext";
import TripListScreen from "../../components/TripListScreen";

export default function PendingTab() {
  const { trips, accept, decline } = useTrips();
  const [busyTripId, setBusyTripId] = useState(null);

  const handleAccept = async (tripId) => {
    setBusyTripId(tripId);
    try {
      await accept(tripId);
    } catch (err) {
      Alert.alert("Couldn't accept", err.message);
    } finally {
      setBusyTripId(null);
    }
  };

  const handleDecline = (tripId) => {
    Alert.alert("Decline this trip?", "It goes back to dispatch for reassignment.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: async () => {
          setBusyTripId(tripId);
          try {
            await decline(tripId);
          } catch (err) {
            Alert.alert("Couldn't decline", err.message);
          } finally {
            setBusyTripId(null);
          }
        },
      },
    ]);
  };

  return (
    <TripListScreen
      trips={trips.pending}
      emptyLabel="Nothing waiting on you right now."
      renderActions={(trip) => {
        const busy = busyTripId === trip._id;
        return (
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.decline, busy && styles.disabled]}
              onPress={() => handleDecline(trip._id)}
              disabled={busy}
            >
              <Text style={styles.declineText}>Decline</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.accept, busy && styles.disabled]}
              onPress={() => handleAccept(trip._id)}
              disabled={busy}
            >
              <Text style={styles.acceptText}>{busy ? "…" : "Accept"}</Text>
            </Pressable>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  decline: {
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  declineText: {
    color: "#dc2626",
    fontWeight: "600",
  },
  accept: {
    backgroundColor: "#16a34a",
  },
  acceptText: {
    color: "#fff",
    fontWeight: "600",
  },
});
