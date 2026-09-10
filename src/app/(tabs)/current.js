import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useTrips } from "../../lib/TripsContext";
import { openNavigationTo } from "../../lib/navigation";
import TripListScreen from "../../components/TripListScreen";

// Mirrors STATUS_PROGRESSION in routes/driverTrips.js -- the driver walks
// an accepted trip forward one step at a time, in this order. "confirmed"
// is just a dispatcher-side marker (they've called to double check the
// driver's coming in) -- it doesn't gate anything here, so both
// "accepted" and "confirmed" lead to the same next step. "Arrived" isn't
// listed here -- it's the one step with two possible next actions
// (Customer in car, or Request No Show), handled as its own branch below
// instead of a single button.
const NEXT_STATUS = {
  accepted: "On the way",
  confirmed: "On the way",
  "On the way": "Arrived",
  "Customer in car": "Done",
};

export default function CurrentTab() {
  const { trips, advance, requestNoShow } = useTrips();
  const [busyTripId, setBusyTripId] = useState(null);

  // Auto-opens turn-by-turn navigation for whichever leg the driver is
  // now on -- pickup once they're heading out ("On the way"), drop-off
  // once the customer's in the car. Keyed off the trip's status BEFORE
  // this advance call (the transition just made), not the new one, so
  // there's no extra round-trip to figure out what just happened. The
  // "Arrived" transition intentionally opens nothing -- there's no way
  // for this app to force-close Google Maps (no OS allows one app to
  // dismiss another), so "removing" it just means not launching it
  // again; Maps is already backgrounded once the driver switches back
  // here to tap the button.
  const handleAdvance = async (trip) => {
    setBusyTripId(trip._id);
    try {
      await advance(trip._id);
      if (trip.Status === "accepted" || trip.Status === "confirmed") {
        openNavigationTo(trip.PUlocation);
      } else if (trip.Status === "Arrived") {
        openNavigationTo(trip.DOlocation);
      }
    } catch (err) {
      Alert.alert("Couldn't update status", err.message);
    } finally {
      setBusyTripId(null);
    }
  };

  const handleRequestNoShow = (tripId) => {
    Alert.alert(
      "Request no-show?",
      "This flags the trip for your dispatcher to confirm as a no-show. Only do this if the customer never showed up.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request No Show",
          style: "destructive",
          onPress: async () => {
            setBusyTripId(tripId);
            try {
              await requestNoShow(tripId);
            } catch (err) {
              Alert.alert("Couldn't request no-show", err.message);
            } finally {
              setBusyTripId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <TripListScreen
      trips={trips.current}
      emptyLabel="No trips today."
      renderActions={(trip) => {
        const busy = busyTripId === trip._id;

        if (trip.Status === "Arrived") {
          return (
            <View style={styles.actions}>
              <Pressable
                style={[styles.button, styles.noShowButton, busy && styles.disabled]}
                onPress={() => handleRequestNoShow(trip._id)}
                disabled={busy}
              >
                <Text style={styles.noShowButtonText}>Request No Show</Text>
              </Pressable>
              <Pressable
                style={[styles.button, busy && styles.disabled]}
                onPress={() => handleAdvance(trip)}
                disabled={busy}
              >
                <Text style={styles.buttonText}>{busy ? "…" : "Customer in car"}</Text>
              </Pressable>
            </View>
          );
        }

        const next = NEXT_STATUS[trip.Status];
        if (!next) return null;

        return (
          <Pressable
            style={[styles.button, busy && styles.disabled]}
            onPress={() => handleAdvance(trip)}
            disabled={busy}
          >
            <Text style={styles.buttonText}>{busy ? "…" : `Mark: ${next}`}</Text>
          </Pressable>
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
    backgroundColor: "#208AEF",
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  noShowButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  noShowButtonText: {
    color: "#dc2626",
    fontWeight: "600",
  },
});
