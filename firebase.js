// ═══════════════════════════════════════════════════════
// FIREBASE CONFIGURATION
// UNISBA VIRTUAL MARKET
// ═══════════════════════════════════════════════════════
//
// ⚙️  SETUP INSTRUCTIONS:
//
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Go to Project Settings → General → Your Apps
// 4. Click "Add App" → Web (</>)
// 5. Register your app and copy the config below
// 6. Replace the placeholder values with your real config
//
// 🔐 ENABLE AUTHENTICATION:
//    Firebase Console → Authentication → Sign-in method
//    → Enable "Email/Password"
//    → Enable "Google"
//
// 🗄️  ENABLE FIRESTORE:
//    Firebase Console → Firestore Database
//    → "Create database" → Start in test mode
//
// 📦 FIRESTORE SECURITY RULES (recommended):
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /users/{userId} {
//          allow read, write: if request.auth != null && request.auth.uid == userId;
//        }
//        match /leaderboard/{userId} {
//          allow read: if request.auth != null;
//          allow write: if request.auth != null && request.auth.uid == userId;
//        }
//      }
//    }
// ═══════════════════════════════════════════════════════

// ─── PASTE YOUR FIREBASE CONFIG HERE ───
const firebaseConfig = {
  apiKey:            "AIzaSyCYvuGgF-rGd0Cp_8md1a9M5gIwA_Bpzr8",
  authDomain:        "trading-saham.firebaseapp.com",
  projectId:         "trading-saham",
  storageBucket:     "trading-saham.firebasestorage.app",
  messagingSenderId: "364734247993",
  appId:             "1:364734247993:web:bfe05e1c8e7118860849e8",
  measurementId:     "G-8CQBT7YSQB"
};
// ─────────────────────────────────────────

// ─── Check if config is still placeholder ───
function isPlaceholderConfig(cfg) {
  return !cfg.apiKey ||
    cfg.apiKey === 'YOUR_API_KEY' ||
    cfg.apiKey.startsWith('YOUR_') ||
    cfg.projectId === 'YOUR_PROJECT_ID' ||
    cfg.projectId.startsWith('YOUR_');
}

let db, auth, googleProvider;
let firebaseReady = false;

function initFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      console.info('ℹ️  Firebase SDK tidak tersedia — mode DEMO aktif');
      return false;
    }

    if (isPlaceholderConfig(firebaseConfig)) {
      console.info('ℹ️  Firebase belum dikonfigurasi — mode DEMO aktif');
      return false;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    db             = firebase.firestore();
    auth           = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');

    firebaseReady = true;
    console.log('✅ Firebase initialized');
    return true;
  } catch (err) {
    console.info('ℹ️  Firebase tidak dapat diinisialisasi — mode DEMO aktif:', err.message);
    return false;
  }
}

// ─── Auth helpers ───
async function signInWithEmail(email, password) {
  if (!firebaseReady) return null;
  return auth.signInWithEmailAndPassword(email, password);
}

async function signUpWithEmail(email, password) {
  if (!firebaseReady) return null;
  return auth.createUserWithEmailAndPassword(email, password);
}

async function signInWithGoogle() {
  if (!firebaseReady) return null;
  return auth.signInWithPopup(googleProvider);
}

async function signOut() {
  if (!firebaseReady) return;
  return auth.signOut();
}

function onAuthChanged(callback) {
  if (!firebaseReady) { callback(null); return; }
  return auth.onAuthStateChanged(callback);
}

// ─── Firestore helpers ───
async function getUserData(uid) {
  if (!firebaseReady) return null;
  try {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch (e) { console.error('getUserData error:', e); return null; }
}

async function createUserData(uid, data) {
  if (!firebaseReady) return;
  try {
    await db.collection('users').doc(uid).set(data, { merge: true });
  } catch (e) { console.error('createUserData error:', e); }
}

async function updateUserData(uid, data) {
  if (!firebaseReady) return;
  try {
    await db.collection('users').doc(uid).update(data);
  } catch (e) { console.error('updateUserData error:', e); }
}

async function getLeaderboard(limit = 10) {
  if (!firebaseReady) return [];
  try {
    const snap = await db.collection('leaderboard')
      .orderBy('totalAssets', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error('getLeaderboard error:', e); return []; }
}

async function updateLeaderboard(uid, entry) {
  if (!firebaseReady) return;
  try {
    await db.collection('leaderboard').doc(uid).set(entry, { merge: true });
  } catch (e) { console.error('updateLeaderboard error:', e); }
}
