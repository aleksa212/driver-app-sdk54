import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import TripCard from "./TripCard";
import { useTrips } from "../lib/TripsContext";

export default function TripListScreen({ trips, emptyLabel, renderActions }) {
  const { loading, error, refresh } = useTrips();

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={trips.length === 0 ? styles.emptyContent : undefined}
      data={trips}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TripCard trip={item} actions={renderActions ? renderActions(item) : null} />
      )}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          {error ? <Text style={styles.error}>{error}</Text> : <Text style={styles.emptyText}>{emptyLabel}</Text>}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 12,
  },
  emptyContent: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    color: "#888",
    fontSize: 15,
  },
  error: {
    color: "#dc2626",
    fontSize: 15,
    textAlign: "center",
  },
});
