import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { TripsProvider } from "../../lib/TripsContext";
import { getStoredSession } from "../../lib/driverAuth";
import { startLocationTracking } from "../../lib/locationTracking";
import Header from "../../components/Header";
import TabBar from "../../components/TabBar";

// One auth check here (not per-tab) covers the whole group -- a driver
// hitting /current, /pending, or /completed directly without a session
// gets bounced back to login before any tab renders.
export default function TabsLayout() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getStoredSession().then((session) => {
      if (!session) {
        router.replace("/");
      } else {
        setChecking(false);
        // Fire-and-forget -- a driver who denies location permission
        // still gets to use the rest of the app, they just won't show up
        // on the dispatcher map. logout() in Header.js is what stops
        // this again.
        startLocationTracking();
      }
    });
  }, [router]);

  if (checking) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <TripsProvider>
      <Tabs
        screenOptions={{ header: () => <Header /> }}
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tabs.Screen name="current" options={{ title: "Current" }} />
        <Tabs.Screen name="pending" options={{ title: "Pending" }} />
        <Tabs.Screen name="completed" options={{ title: "Completed" }} />
      </Tabs>
    </TripsProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
