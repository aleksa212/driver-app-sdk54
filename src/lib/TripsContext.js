import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { acceptTrip, advanceTrip, declineTrip, fetchMyTrips, requestNoShowTrip } from "./driverTrips";
import { todayKey } from "./dateKey";

// Fetched once here and shared across all 3 tabs (Current/Pending/
// Completed) via context, rather than each tab independently calling
// GET /driver-trips/mine on mount -- that's the same data split 3 ways,
// so fetching it 3 times on every app open would just be wasted
// round-trips for an identical response.
const TripsContext = createContext(null);

export function TripsProvider({ children }) {
  const [trips, setTrips] = useState({ current: [], pending: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Scopes both the "current" and "completed" buckets (see
  // routes/driverTrips.js) -- Pending isn't date-filtered, a driver needs
  // to see every outstanding dispatch regardless of date. Plain
  // component state, not persisted anywhere, so a fresh app launch
  // always starts back on today by construction rather than needing
  // explicit reset logic.
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const data = await fetchMyTrips(selectedDate);
      setTrips(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Background poll so a trip a dispatcher just dispatched (or any other
  // status change made from the web app) shows up here without the
  // driver having to manually pull-to-refresh. `refresh` only flips
  // `loading` true on the very first mount (see above) -- every poll
  // after that quietly swaps in fresh data without flashing the
  // pull-to-refresh spinner. Restarts if `refresh` itself changes (i.e.
  // selectedDate changes), same as the web app's equivalent poll in
  // useReservations.jsx.
  const POLL_INTERVAL_MS = 8000;
  useEffect(() => {
    const interval = setInterval(() => refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const accept = useCallback(
    async (tripId) => {
      await acceptTrip(tripId);
      await refresh();
    },
    [refresh]
  );

  const decline = useCallback(
    async (tripId) => {
      await declineTrip(tripId);
      await refresh();
    },
    [refresh]
  );

  const advance = useCallback(
    async (tripId) => {
      await advanceTrip(tripId);
      await refresh();
    },
    [refresh]
  );

  const requestNoShow = useCallback(
    async (tripId) => {
      await requestNoShowTrip(tripId);
      await refresh();
    },
    [refresh]
  );

  return (
    <TripsContext.Provider
      value={{
        trips,
        loading,
        error,
        refresh,
        accept,
        decline,
        advance,
        requestNoShow,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error("useTrips must be used inside a TripsProvider");
  return ctx;
}
