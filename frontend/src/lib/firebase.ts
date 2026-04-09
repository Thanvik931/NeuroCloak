import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmiJZGf_pl1SExL7tjfSf2YmrWWfY_HKE",
    authDomain: "neurocloak.firebaseapp.com",
    projectId: "neurocloak",
    storageBucket: "neurocloak.firebasestorage.app",
    messagingSenderId: "523423572688",
    appId: "1:523423572688:web:93eeaf63fee15e8433f4d5",
    measurementId: "G-54XLP7G13B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider, analytics };
