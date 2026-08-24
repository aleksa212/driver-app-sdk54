import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { logout } from "../lib/driverAuth";
import { stopLocationTracking } from "../lib/locationTracking";
import { useTrips } from "../lib/TripsContext";
import { dateToKey, keyToLocalDate, todayKey } from "../lib/dateKey";

// Shared across all 3 tabs (set as the Tabs navigator's own header, see
// (tabs)/_layout.js) so there's one hamburger menu and one date picker,
// not one per screen.
export default function Header() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const { selectedDate, setSelectedDate } = useTrips();

  // iOS shows the picker as an inline component you toggle visible;
  // Android has no equivalent -- DateTimePickerAndroid.open() below pops
  // its own native dialog directly, no component/state needed for it.
  const [showIOSPicker, setShowIOSPicker] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await stopLocationTracking();
    await logout();
    router.replace("/");
  };

  const applyPickedDate = (event, picked) => {
    setShowIOSPicker(false);
    if (event.type === "set" && picked) {
      setSelectedDate(dateToKey(picked));
    }
  };

  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: keyToLocalDate(selectedDate),
        mode: "date",
        onChange: applyPickedDate,
      });
    } else {
      setShowIOSPicker(true);
    }
  };

  const isToday = selectedDate === todayKey();
  const dateLabel = keyToLocalDate(selectedDate).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Limo Driver</Text>

        <Pressable onPress={() => setMenuOpen(true)} hitSlop={12}>
          <Text style={styles.hamburger}>☰</Text>
        </Pressable>
      </View>

      <Pressable style={styles.dateRow} onPress={openPicker}>
        <Text style={styles.dateText}>📅 {isToday ? "Today" : dateLabel}</Text>
        {!isToday && (
          <Pressable
            style={styles.todayButton}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedDate(todayKey());
            }}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </Pressable>
        )}
      </Pressable>

      {Platform.OS === "ios" && showIOSPicker && (
        <DateTimePicker
          value={keyToLocalDate(selectedDate)}
          mode="date"
          display="inline"
          onChange={applyPickedDate}
        />
      )}

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { top: insets.top + 50 }]}>
            <Pressable style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuItemText}>Log Out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  hamburger: {
    fontSize: 24,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#208AEF",
  },
  todayButton: {
    borderWidth: 1,
    borderColor: "#208AEF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#208AEF",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  menu: {
    position: "absolute",
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 6,
    minWidth: 140,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 15,
    color: "#dc2626",
    fontWeight: "600",
  },
});
