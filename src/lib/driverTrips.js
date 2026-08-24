import { getItemAsync } from "expo-secure-store";
import { API_BASE_URL } from "../constants/api";

async function authedRequest(path, options = {}) {
  const token = await getItemAsync("driverAuthToken");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }
  return data;
}

// { current: [...], pending: [...], completed: [...] }. `date` is a
// "YYYY-MM-DD" key scoping the "current" bucket -- omit it to get the
// server's own default (today).
export function fetchMyTrips(date) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return authedRequest(`/driver-trips/mine${query}`);
}

export function acceptTrip(tripId) {
  return authedRequest(`/driver-trips/${tripId}/accept`, { method: "POST" });
}

export function declineTrip(tripId) {
  return authedRequest(`/driver-trips/${tripId}/decline`, { method: "POST" });
}

export function advanceTrip(tripId) {
  return authedRequest(`/driver-trips/${tripId}/advance`, { method: "POST" });
}

export function requestNoShowTrip(tripId) {
  return authedRequest(`/driver-trips/${tripId}/request-no-show`, { method: "POST" });
}
