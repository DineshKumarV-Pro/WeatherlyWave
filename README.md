# WeatherlyWave

WeatherlyWave is a premium React TypeScript weather dashboard with a mobile-first layout, live weather data, smart planning insights, PWA support, and Firebase Hosting deployment.

## Features

- Live current weather, forecast, hourly timeline, KPIs, astronomy, and weather alerts
- OpenWeather primary provider with Tomorrow.io fallback and safe sample-data fallback
- Search autocomplete, current-location lookup, recent searches, and saved locations
- Smart weather insights for outdoor planning, carry advice, comfort, UV, air quality, rain, and wind
- Weather-aware visual themes with subtle hero atmosphere effects
- Recharts-powered hourly analysis with temperature, rain, wind, and humidity modes
- Settings drawer for units, motion, font size, and refresh interval
- PWA manifest and generated service worker through Vite
- Firebase Hosting-ready build output from `dist`

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React
- Sonner
- Firebase
- Vitest

## Getting Started

Install dependencies:

```bash
npm.cmd install
```

Create a local environment file:

```bash
copy .env.example .env.local
```

Fill in your API keys in `.env.local`.

Run the app locally:

```bash
npm.cmd run dev
```

Open the local Vite URL, usually:

```text
http://127.0.0.1:5173/
```

## Environment Variables

WeatherlyWave uses Vite browser environment variables. These values are exposed to the client at runtime, so do not place private server secrets here.

```env
VITE_OPENWEATHER_API_KEY="your-openweather-api-key"
VITE_TOMORROWIO_API_KEY="your-tomorrowio-api-key"
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-firebase-app-id"
VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```

## Scripts

```bash
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd run preview
```

## Firebase Hosting

Build the app:

```bash
npm.cmd run build
```

Deploy with Firebase CLI:

```bash
firebase deploy
```

Hosting is configured in `firebase.json` to serve the Vite production build from `dist` and rewrite all routes to `index.html`.

## Project Structure

```text
src/
  components/     React UI components and app panels
  hooks/          Weather app state and behavior
  services/       Weather, search, settings, Firebase, and alert services
  styles/         Global Tailwind/CSS design system
  types/          Shared TypeScript weather contracts
```

## Quality Checks

Before deploying or opening a pull request, run:

```bash
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

## Notes

- Browser API keys are public in any Vite frontend app. Keep private secrets on a server, not in `VITE_*` variables.
- The production build may warn about large chunks because charting and Firebase dependencies are bundled into the client app.
- The old HTML/CSS/DOM-script prototype has been migrated to a React TypeScript app shell.
