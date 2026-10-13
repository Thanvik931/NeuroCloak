import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

// Environment-driven Firebase configuration to protect secrets from client exposure
const firebaseConfig = {
    apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || "").trim(),
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "neurocloak.firebaseapp.com").trim(),
    projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || "neurocloak").trim(),
    storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "neurocloak.firebasestorage.app").trim(),
    messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
    appId: (import.meta.env.VITE_FIREBASE_APP_ID || "").trim(),
    measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "").trim()
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let analytics: Analytics | null = null;

// Safely initialize only when a valid API key is supplied
if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5) {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
        if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
            analytics = getAnalytics(app);
        }
    } catch (err) {
        console.warn('Firebase initialization skipped:', err);
    }
}

export { app, auth, googleProvider, analytics };
