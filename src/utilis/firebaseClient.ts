import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { clientConfig } from "./firebaseConfig";

// Check if Firebase config is valid
const isConfigValid = clientConfig.apiKey && clientConfig.projectId;

// Initialize Firebase app only if config is valid
let app, db, auth;

if (isConfigValid) {
  app = getApps().length ? getApp() : initializeApp(clientConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  // Create mock instances for build/SSR environments without proper config
  app = null;
  db = null;
  auth = null;
}

export { app, db, auth };





