// ============================================================
//  Firebase Configuration
//  Development: baca dari .env via Vite
//  Production: fallback ke hardcoded values
// ============================================================
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyBcVF7RREOWUmRdMB9OHe5JmmCS8LiuvBs",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "artlocal-da76b.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "artlocal-da76b",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "artlocal-da76b.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "1060337702008",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:1060337702008:web:622a51c94f3a378345898d",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-4CCFS43JT0"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
