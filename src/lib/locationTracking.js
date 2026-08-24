import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { getItemAsync } from "expo-secure-store";
import { API_BASE_URL } from "../constants/api";

export const LOCATION_TASK_NAME = "driver-location-tracking";

const PING_INTERVAL_MS = 5000;

// Defined at module scope (not inside a component) -- this is what lets
// it keep firing from native code even while the JS side is backgrounded
// or the screen's off, which a plain setInterval in a component could
// never do. Runs outside the React tree entirely, so it can't read
// anything from context/state -- pulls the auth token fresh from
// SecureStore on every firing instead.
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Location task error:", error);
    return;
  }

  const latest = data?.locations?.[data.locations.length - 1];
  if (!latest) return;

  const token = await getItemAsync("driverAuthToken");
  if (!token) return; // logged out -- nothing to attribute this ping to

  try {
    await fetch(`${API_BASE_URL}/driver-location`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ lat: latest.coords.latitude, lng: latest.coords.longitude }),
    });
  } catch {
    // Best-effort -- a dropped ping just leaves one stale point on the
    // dispatcher map until the next one gets through a few seconds later.
  }
});

// Requires a custom dev client (EAS build), not Expo Go -- Expo Go can't
// grant a third-party JS bundle background location permission, so
// startLocationUpdatesAsync would only ever run while the app is open.
export async function startLocationTracking() {
  const alreadyRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
  if (alreadyRunning) return true;

  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") return false;

  // Best-effort -- if the driver declines "Allow Always", tracking still
  // starts and just pauses once the app is backgrounded instead of
  // continuing, rather than not tracking at all.
  await Location.requestBackgroundPermissionsAsync();

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: PING_INTERVAL_MS,
    distanceInterval: 0,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Limo Driver",
      notificationBody: "Sharing your location with dispatch",
    },
  });

  return true;
}

export async function stopLocationTracking() {
  const running = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).catch(() => false);
  if (running) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}
