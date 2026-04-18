import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Auth State Observer ───────────────────────────────────────
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ── Register ─────────────────────────────────────────────────
export async function registerUser(username, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username });
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    username,
    email,
    bio: '',
    avatarUrl: '',
    createdAt: serverTimestamp(),
    artworkCount: 0
  });
  return cred.user;
}

// ── Login ─────────────────────────────────────────────────────
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Logout ────────────────────────────────────────────────────
export async function logoutUser() {
  await signOut(auth);
}

// ── Get User Profile ──────────────────────────────────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ── Ensure User Profile Exists ────────────────────────────────
export async function ensureUserProfile(user) {
  const profile = await getUserProfile(user.uid);
  if (!profile) {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      username: user.displayName || 'Anonim',
      email: user.email || '',
      bio: '',
      avatarUrl: '',
      createdAt: serverTimestamp(),
      artworkCount: 0
    });
  }
}

// ── Update Nav Based on Auth ──────────────────────────────────
export function syncNavAuth(user) {
  const guestLinks = document.querySelectorAll('[data-guest]');
  const authLinks  = document.querySelectorAll('[data-auth]');
  const userNameEl = document.querySelector('[data-username]');

  if (user) {
    guestLinks.forEach(el => el.style.display = 'none');
    authLinks.forEach(el => el.style.display = '');
    if (userNameEl) userNameEl.textContent = user.displayName || 'Seniman';
  } else {
    guestLinks.forEach(el => el.style.display = '');
    authLinks.forEach(el => el.style.display = 'none');
  }
}
