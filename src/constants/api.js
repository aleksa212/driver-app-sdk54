// Base URL for the existing Express backend (routes/tripOffers.js etc. in
// the main my-project repo). "localhost" doesn't work here the way it
// does in the web app -- on a physical phone (Expo Go) or the Android
// emulator, "localhost" resolves to the PHONE itself, not this dev
// machine, so the backend has to be reached by this machine's LAN IP
// instead. The phone and this computer need to be on the same Wi-Fi
// network for that to work.
//
// This IP can change if the network reassigns it (e.g. after a router
// restart) -- if API calls stop working, re-check it with `ipconfig`
// (Windows) and update below.
//
// Android emulator only: use 10.0.2.2 instead, which the emulator maps
// back to the host machine's localhost.
//
export const API_BASE_URL = "http://192.168.0.6:5000";
