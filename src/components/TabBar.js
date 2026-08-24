import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTrips } from "../lib/TripsContext";

// A fully custom tab bar, rather than styling the built-in one -- the
// built-in bar's per-tab background only ever ended up sized to the
// label text instead of the tab's full 1/3 share of the bar, even with
// flex: 1 set at every level the library exposes (traced it through
// expo-router's own Link-wrapped tab button and React Navigation's
// default button renderer; something in that chain wasn't propagating
// width correctly, and it wasn't worth fighting further blind without
// being able to see the rendered result directly). Three plain,
// explicitly flex: 1 Pressables here can't have that problem.
export default function TabBar({ state, descriptors, navigation, insets }) {
  // trips.current/pending/completed keys match the route names
  // ("current"/"pending"/"completed") directly -- see TripsContext.
  const { trips } = useTrips();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const focused = state.index === index;
        const count = trips[route.name]?.length ?? 0;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={[styles.tab, { backgroundColor: focused ? "#208AEF" : "#fff" }]}
          >
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: focused ? "#fff" : "#208AEF" }]}>{label}</Text>
              <View style={[styles.badge, { backgroundColor: focused ? "#fff" : "#208AEF" }]}>
                <Text style={[styles.badgeText, { color: focused ? "#208AEF" : "#fff" }]}>{count}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
