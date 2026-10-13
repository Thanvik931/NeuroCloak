import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Environment-driven Firebase configuration to protect secrets from client exposure
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "neurocloak.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "neurocloak",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "neurocloak.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase safely
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId ? getAnalytics(app) : null;
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, analytics };
