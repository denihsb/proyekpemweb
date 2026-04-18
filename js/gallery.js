import { db } from './firebase-config.js';
import {
  collection, query, orderBy, limit, getDocs,
  doc, getDoc, where, startAfter
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let lastDoc = null;
const PAGE_SIZE = 12;

// ── Fetch Artworks (paginated) ────────────────────────────────
export async function fetchArtworks(reset = false, category = null) {
  if (reset) lastDoc = null;

  let q = query(
    collection(db, 'artworks'),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE)
  );

  if (category && category !== 'all') {
    q = query(
      collection(db, 'artworks'),
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE)
    );
  }

  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  if (!snap.empty) lastDoc = snap.docs[snap.docs.length - 1];

  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Fetch Single Artwork ──────────────────────────────────────
export async function fetchArtwork(id) {
  const snap = await getDoc(doc(db, 'artworks', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Fetch User Artworks ───────────────────────────────────────
export async function fetchUserArtworks(uid) {
  const q = query(
    collection(db, 'artworks'),
    where('artistUid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Render Masonry Card ───────────────────────────────────────
export function createArtCard(artwork) {
  const card = document.createElement('article');
  card.className = 'art-card';
  card.setAttribute('data-id', artwork.id);

  card.innerHTML = `
    <a href="artwork.html?id=${artwork.id}" class="art-card__link">
      <div class="art-card__img-wrap">
        <img src="${artwork.imageUrl}" alt="${artwork.title}" loading="lazy">
        <div class="art-card__overlay">
          <span class="art-card__view">Lihat Karya</span>
        </div>
      </div>
      <div class="art-card__info">
        <h3 class="art-card__title">${artwork.title}</h3>
        <p class="art-card__artist">
          <span class="art-card__dot"></span>
          ${artwork.artistName}
        </p>
      </div>
    </a>
  `;

  return card;
}

// ── Render Grid ───────────────────────────────────────────────
export function renderArtGrid(artworks, container, append = false) {
  if (!append) container.innerHTML = '';

  if (artworks.length === 0 && !append) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Belum ada karya di sini.</p>
        <a href="upload.html" class="btn btn--outline">Upload Pertama</a>
      </div>`;
    return;
  }

  artworks.forEach((artwork, i) => {
    const card = createArtCard(artwork);
    card.style.animationDelay = `${i * 80}ms`;
    card.classList.add('art-card--anim');
    container.appendChild(card);
  });
}
