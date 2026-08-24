# Limo Driver

Driver-facing companion app for the dispatch system in `my-project` (the
sibling folder next to this one). Built with [Expo](https://expo.dev) +
[Expo Router](https://docs.expo.dev/router/introduction/), plain
JavaScript (no TypeScript, to match `my-project`'s stack).

Built on **Expo SDK 54** specifically because that's what the Expo Go
app on the App Store/Play Store actually supports right now — Expo Go
only ever supports one SDK version at a time, and newer SDKs (55+)
aren't available through it yet. If `npx expo start` ever suggests
upgrading past SDK 54, don't, until Expo Go itself has caught up (check
your Expo Go app's version against https://docs.expo.dev/versions/latest/
before upgrading).

## What this connects to

The backend already has the API this app is meant to call:

- `GET /trip-offers/mine?driverId=...` — trips currently offered to a
  driver (see `routes/tripOffers.js` in `my-project`)
- `POST /trip-offers/:tripId/accept` — accept an offered trip

That system (utils/tripOfferEngine.js, the "Bidding" status) is
currently **disabled** in `my-project/server.js` until this app is far
enough along to actually use it — see the comments there for how to
turn it back on.

No driver login/auth exists yet on either side — `routes/tripOffers.js`
takes a bare `driverId` with no verification. That needs real auth
before this app (or that backend route) is exposed to anyone but you.

## Running it

```bash
npm install
npx expo start
```

Scan the QR code with the [Expo Go](https://expo.dev/go) app on your
phone to run it live. Your phone and this computer need to be on the
**same Wi-Fi network** — the app talks to the backend via this
machine's LAN IP (see `src/constants/api.js`), not `localhost`, since
`localhost` on the phone means the phone itself.

The backend (`my-project`) needs to actually be running
(`node server.js`) for anything beyond the bare scaffold screen to work.

## Project layout

- `src/app/` — screens, using Expo Router's file-based routing (a file
  here = a route)
- `src/constants/api.js` — backend base URL
- `app.json` — Expo config (name, icons, splash screen, etc.)

## Android emulator instead of a physical phone

Use `10.0.2.2` instead of the LAN IP in `src/constants/api.js` — the
emulator maps that address back to this machine's own `localhost`.

iOS Simulator isn't available on Windows; Expo Go on a physical iPhone
works the same as Android does above.
