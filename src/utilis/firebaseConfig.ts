// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = typeof window !== "undefined" ? getAnalytics(app) : null; // Ensure Analytics only runs in the browser
const db = getFirestore(app); // Initialize Firestore

const auth = getAuth(app);

export { app, db ,auth };





export const serverConfig = {
  cookieName: "auth",
  cookieSignatureKeys: process.env.COOKIE_SIGNATURE_KEYS
    ? process.env.COOKIE_SIGNATURE_KEYS.split(",") // Convert env variable into an array
    : ["fallback-secret-key"], // Add at least one default key
  cookieSerializeOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Ensure correct key format
  },
};

export const clientConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
};

// {web Api Key}
// AIzaSyDYJV4eZG1Mt7kqW4aP5EAzvfSeU4K2w6E

// {Sender Id}

// 149173701110