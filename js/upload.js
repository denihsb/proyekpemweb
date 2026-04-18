import { auth, db } from './firebase-config.js';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const CLOUD_NAME    = 'dwoyzgfxh';
const UPLOAD_PRESET = 'ml_default';

// ── Upload ke Cloudinary ──────────────────────────────────────
function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'artlocal');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) {
        onProgress && onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).secure_url);
      } else {
        reject(new Error('Upload ke Cloudinary gagal.'));
      }
    };

    xhr.onerror = () => reject(new Error('Koneksi gagal saat upload.'));
    xhr.send(formData);
  });
}

// ── Upload Artwork (Cloudinary + Firestore) ───────────────────
export async function uploadArtwork(file, metadata, onProgress) {
  const user = auth.currentUser;
  if (!user) throw new Error('Kamu harus login dulu.');

  // 1. Upload gambar ke Cloudinary
  const imageUrl = await uploadToCloudinary(file, onProgress);

  // 2. Simpan data ke Firestore
  const docRef = await addDoc(collection(db, 'artworks'), {
    title:       metadata.title,
    description: metadata.description || '',
    category:    metadata.category || 'lainnya',
    tags:        metadata.tags || [],
    imageUrl,
    artistUid:   user.uid,
    artistName:  user.displayName || 'Anonim',
    createdAt:   serverTimestamp(),
    likes: 0,
    views: 0
  });

  // 3. Tambah hitungan karya di profil user
  await updateDoc(doc(db, 'users', user.uid), {
    artworkCount: increment(1)
  });

  return { id: docRef.id, imageUrl };
}

// ── Validasi File ─────────────────────────────────────────────
export function validateImageFile(file) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) return 'Format harus JPG, PNG, WebP, atau GIF.';
  if (file.size > 10 * 1024 * 1024) return 'Ukuran file maksimal 10MB.';
  return null;
}
