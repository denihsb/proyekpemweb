// ============================================================
//  GANTI dengan config Firebase kamu!
//  Firebase Console → Project Settings → Your Apps → Config
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyBcVF7RREOWUmRdMB9OHe5JmmCS8LiuvBs",
  authDomain: "artlocal-da76b.firebaseapp.com",
  projectId: "artlocal-da76b",
  storageBucket: "artlocal-da76b.firebasestorage.app",
  messagingSenderId: "1060337702008",
  appId: "1:1060337702008:web:622a51c94f3a378345898d",
  measurementId: "G-4CCFS43JT0"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
