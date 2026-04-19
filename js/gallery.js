import { auth, db } from './firebase-config.js';
import {
  collection, query, orderBy, limit, getDocs,
  doc, getDoc, where, startAfter,
  updateDoc, increment, setDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let lastDoc = null;
let allCached = []; // cache semua artwork buat client-side filter
const PAGE_SIZE = 12;

// ── Fetch Artworks ────────────────────────────────────────────
export async function fetchAllArtworks() {
  const snap = await getDocs(collection(db, 'artworks'));

  const data = [];
  snap.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() });
  });

  return data;
}

// lalu filter di client-side.
export async function fetchArtworks(reset = false, category = null) {
  if (reset) {
    lastDoc = null;
    allCached = [];
  }

  // Kalau ada cache dan kita hanya ganti filter (bukan load more),
  // langsung filter dari cache
  if (reset && allCached.length > 0 && category) {
    return filterAndPage(allCached, category, true);
  }

  // Fetch dari Firestore — hanya pakai orderBy, tanpa where category
  let q = query(
    collection(db, 'artworks'),
    orderBy('createdAt', 'desc'),
    limit(50) // ambil lebih banyak, filter di client
  );

  if (lastDoc) {
    q = query(
      collection(db, 'artworks'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(50)
    );
  }

  const snap = await getDocs(q);
  if (!snap.empty) lastDoc = snap.docs[snap.docs.length - 1];

  const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (reset) {
    allCached = fetched;
  } else {
    allCached = [...allCached, ...fetched];
  }

  return filterAndPage(allCached, category, reset);
}

// ── Filter + Paginate client-side ─────────────────────────────
function filterAndPage(artworks, category, reset) {
  let filtered = artworks;
  if (category && category !== 'all') {
    filtered = artworks.filter(a => a.category === category);
  }
  return filtered.slice(0, PAGE_SIZE);
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
      <div style="margin-top:0.5rem;display:flex;align-items:center;gap:0.5rem">
        <button class="likeBtn">❤️</button>
        <span class="likeCount">${artwork.likes || 0}</span>
      </div>
    </a>
  `;

const likeBtn = card.querySelector('.likeBtn');
const likeCount = card.querySelector('.likeCount');

const artworkRef = doc(db, 'artworks', artwork.id);

// 🔥 realtime update count
onSnapshot(artworkRef, (snap) => {
  if (!snap.exists()) return;

  const data = snap.data();
  likeCount.textContent = data.likes || 0;
});

// 🔥 cek status awal + set class
if (auth.currentUser) {
  const likeId = `${auth.currentUser.uid}_${artwork.id}`;
  getDoc(doc(db, 'likes', likeId)).then(snap => {
    if (snap.exists()) {
      likeBtn.textContent = '💔';
      likeBtn.classList.add('liked'); // anim state
    }
  });
}

likeBtn.onclick = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const user = auth.currentUser;
  if (!user) {
    alert("Login dulu ya!");
    return;
  }

  const likeId = `${user.uid}_${artwork.id}`;
  const likeRef = doc(db, 'likes', likeId);

  const snap = await getDoc(likeRef);

  if (snap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(artworkRef, { likes: increment(-1) });

    likeBtn.textContent = '❤️';
    likeBtn.classList.remove('liked');

  } else {
    await setDoc(likeRef, {
      userId: user.uid,
      artworkId: artwork.id
    });

    await updateDoc(artworkRef, { likes: increment(1) });

    likeBtn.textContent = '💔';
    likeBtn.classList.add('liked');

    // 🔥 animasi pop
    likeBtn.classList.add('pop');
    setTimeout(() => {
      likeBtn.classList.remove('pop');
    }, 250);
  }
};
  return card;
}

// ── Render Grid ───────────────────────────────────────────────
export function renderArtGrid(artworks, container, append = false) {
  if (!append) container.innerHTML = '';

  if (artworks.length === 0 && !append) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Belum ada karya di kategori ini.</p>
        <a href="upload.html" class="btn btn--outline">Upload Pertama</a>
      </div>`;
    return;
  }

  artworks.forEach((artwork, i) => 
    {
    const card = createArtCard(artwork);
    card.style.animationDelay = `${i * 80}ms`;
    card.classList.add('art-card--anim');
    container.appendChild(card);
    }
  );
}
