import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

// Collapsed: PU time, PU location, flight number, DO location -- per
// the ask. Tap anywhere on the card to expand for the rest. `actions`
// (Accept/Decline, on the Pending tab) render right below the summary
// regardless of expand state -- that's the actual decision a driver
// needs to make on a pending trip, not something worth burying behind a
// tap first.
export default function TripCard({ trip, actions }) {
  const [expanded, setExpanded] = useState(false);

  const puLabel = trip.PUlocationName || trip.PUlocation;
  const doLabel = trip.DOlocationName || trip.DOlocation;
  const flightLabel = trip.FlightNumber && trip.FlightNumber !== "N/A" ? trip.FlightNumber : "No flight";
  // "confirmed" is a dispatcher-only marker for the web grid (they've
  // called to double check the driver's coming in) -- it's not a status
  // change from the driver's own point of view, so it still just reads
  // as "Accepted" here.
  const statusLabel = trip.Status === "confirmed" ? "Accepted" : trip.Status;

  return (
    <Pressable style={styles.card} onPress={() => setExpanded((e) => !e)}>
      <View style={styles.summaryRow}>
        <Text style={styles.time}>{trip.PUtime}</Text>
        <View style={styles.summaryMiddle}>
          <Text style={styles.location} numberOfLines={1}>
            {puLabel}
          </Text>
          <Text style={styles.arrowLine} numberOfLines={1}>
            → {doLabel}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? "▾" : "▸"}</Text>
      </View>

      <Text style={styles.flight}>{flightLabel}</Text>

      {actions}

      {expanded && (
        <View style={styles.details}>
          <DetailRow label="Status" value={statusLabel} />
          <DetailRow
            label="Date"
            value={new Date(trip.PUdate).toLocaleDateString(undefined, { timeZone: "UTC" })}
          />
          <DetailRow label="PAX" value={trip.PAX} />
          <DetailRow label="Vehicle" value={trip.VEHnumber || "—"} />
          {trip.stops?.length > 0 && <DetailRow label="Stops" value={trip.stops.join(", ")} />}
          {trip.FLTscheduled ? <DetailRow label="Flt Scheduled" value={trip.FLTscheduled} /> : null}
          {trip.FLTactual ? <DetailRow label="Flt Actual" value={trip.FLTactual} /> : null}
          {trip.FLTstatus ? <DetailRow label="Flt Status" value={trip.FLTstatus} /> : null}
          {trip.DriverNotes ? (
            <View style={styles.notesBlock}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.notesText}>{trip.DriverNotes}</Text>
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  time: {
    fontSize: 16,
    fontWeight: "700",
    width: 56,
  },
  summaryMiddle: {
    flex: 1,
  },
  location: {
    fontSize: 15,
    fontWeight: "600",
  },
  arrowLine: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  chevron: {
    fontSize: 16,
    color: "#999",
  },
  flight: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
    marginLeft: 66,
  },
  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: "#888",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
    textAlign: "right",
  },
  notesBlock: {
    marginTop: 4,
    gap: 2,
  },
  notesText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
});
