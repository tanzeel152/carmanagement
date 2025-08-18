import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { clientConfig } from "./firebaseConfig";

// Initialize Firebase app once (for client usage)
const app = getApps().length ? getApp() : initializeApp(clientConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

