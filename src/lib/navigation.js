import { Alert, Linking } from "react-native";

// Deep-links into the phone's own Google Maps app for real turn-by-turn
// navigation, rather than building a custom in-app GPS/nav screen from
// scratch -- Maps already does live rerouting, voice guidance, and
// traffic far better than anything worth building here. Uses Google's
// documented "Universal Cross-Platform" link format
// (https://developers.google.com/maps/documentation/urls/get-started) --
// a plain https:// URL, so it needs no iOS/Android URL-scheme
// whitelisting config (unlike the comgooglemaps:// custom scheme), and
// falls back to opening Maps in the browser if the app isn't installed.
// No origin is passed -- Maps defaults that to the phone's live GPS
// location on its own.
export async function openNavigationTo(destination) {
    if (!destination) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    try {
        await Linking.openURL(url);
    } catch (err) {
        Alert.alert("Couldn't open navigation", err.message);
    }
}
