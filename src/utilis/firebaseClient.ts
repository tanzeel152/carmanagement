import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { clientConfig } from "./firebaseConfig";

// Use default/dummy config for build time when env vars are missing
const buildTimeConfig = {
  apiKey: "dummy-key-for-build",
  authDomain: "dummy-domain.firebaseapp.com",
  projectId: "dummy-project-id",
  storageBucket: "dummy-bucket.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:dummy-app-id",
  measurementId: "G-DUMMY123"
};

// Use real config if available, otherwise use build-time config
const effectiveConfig = clientConfig.apiKey && clientConfig.projectId ? clientConfig : buildTimeConfig;

// Initialize Firebase app once (for client usage)
const app = getApps().length ? getApp() : initializeApp(effectiveConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };





