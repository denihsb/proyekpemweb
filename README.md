# ArtLocal 🎨
Platform seni digital untuk seniman lokal Indonesia.

---

## Setup Firebase (WAJIB sebelum deploy)

### 1. Buat Project Firebase
1. Buka [https://console.firebase.google.com](https://console.firebase.google.com)
2. Klik **Add project** → beri nama (misal: `artlocal`)
3. Aktifkan Google Analytics jika mau (opsional)

### 2. Aktifkan Layanan
Di Firebase Console, aktifkan:
- **Authentication** → Sign-in method → Email/Password → Enable
- **Firestore Database** → Create database → Start in test mode
- **Storage** → Get started → Start in test mode

### 3. Ambil Config
- Project Settings (⚙️) → Your apps → **Add app** → Web (`</>`)
- Copy `firebaseConfig` object-nya

### 4. Paste ke `js/firebase-config.js`
Ganti bagian ini:
```js
const firebaseConfig = {
  apiKey: "GANTI_INI",
  authDomain: "GANTI_INI.firebaseapp.com",
  projectId: "GANTI_INI",
  storageBucket: "GANTI_INI.appspot.com",
  messagingSenderId: "GANTI_INI",
  appId: "GANTI_INI"
};
```

### 5. Firestore Rules (Production)
Setelah testing, ganti rules Firestore:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artworks/{artworkId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.artistUid;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### 6. Storage Rules (Production)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /artworks/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

---

## Struktur File
```
artlocal/
├── index.html        ← Home / Landing page
├── explore.html      ← Galeri semua karya
├── auth.html         ← Login & Register
├── upload.html       ← Upload karya (perlu login)
├── profile.html      ← Profil user (perlu login)
├── artwork.html      ← Detail satu karya
├── css/
│   └── style.css     ← Semua styling
└── js/
    ├── firebase-config.js  ← ⚠️ Config Firebase (ganti dulu!)
    ├── auth.js             ← Login, register, logout
    ├── gallery.js          ← Load & render karya
    ├── upload.js           ← Upload ke Storage + Firestore
    └── cursor.js           ← Cursor custom + animasi
```

## Deploy ke GitHub Pages
1. Push semua file ke repo GitHub
2. Settings → Pages → Source: main branch, root `/`
3. Done! Tapi pastikan Firebase config sudah diisi dulu.

> **Tips:** Untuk production, pindah ke **Firebase Hosting** biar lebih cepat & aman.
