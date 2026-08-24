import { useTrips } from "../../lib/TripsContext";
import TripListScreen from "../../components/TripListScreen";

export default function CompletedTab() {
  const { trips } = useTrips();
  return <TripListScreen trips={trips.completed} emptyLabel="No completed trips yet." />;
}
