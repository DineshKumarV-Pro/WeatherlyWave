import type { FirebaseApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";

type FirebaseRuntime = {
  app: FirebaseApp | null;
  analytics: Analytics | null;
};

let runtime: FirebaseRuntime | null = null;

export async function initFirebase(): Promise<FirebaseRuntime> {
  if (runtime) return runtime;

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  if (!config.apiKey || !config.projectId || !config.appId) {
    runtime = { app: null, analytics: null };
    return runtime;
  }

  const { initializeApp } = await import("firebase/app");
  const app = initializeApp(config);
  const analyticsSdk = await import("firebase/analytics");
  const analytics = config.measurementId && (await analyticsSdk.isSupported()) ? analyticsSdk.getAnalytics(app) : null;

  runtime = { app, analytics };
  return runtime;
}
