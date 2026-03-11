/* ============================================================
   FIREBASE CONFIG — HPLN Grade 7 Science
   ============================================================
   Central Firebase initialization module.
   All other modules import from here.

   SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Create a new project (or use existing)
   3. Enable Authentication → Google provider
   4. Enable Cloud Firestore
   5. Go to Project Settings → General → Your Apps → Web App
   6. Copy config values below
   ============================================================ */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCvaqlYKvMy4t4F_zmy4Nckjql4_ezD47c",
  authDomain: "project-3c5c1cf6-7c84-4a5d-8fe.firebaseapp.com",
  projectId: "project-3c5c1cf6-7c84-4a5d-8fe",
  storageBucket: "project-3c5c1cf6-7c84-4a5d-8fe.firebasestorage.app",
  messagingSenderId: "487495658772",
  appId: "1:487495658772:web:8304e311380708f521e601"
};

// ===== Detect if config is placeholder =====
const FIREBASE_CONFIGURED = FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY_HERE';

// ===== Initialize Firebase =====
let _firebaseApp = null;
let _firebaseAuth = null;
let _firebaseDb = null;

function initFirebase() {
  if (!FIREBASE_CONFIGURED) {
    console.log('[Firebase] ⚠️ Config not set — running in OFFLINE mode.');
    console.log('[Firebase] Set your config in firebase-config.js to enable cloud features.');
    return false;
  }
  try {
    if (typeof firebase === 'undefined') {
      console.warn('[Firebase] SDK not loaded. Include Firebase SDK scripts.');
      return false;
    }
    if (!firebase.apps.length) {
      _firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      _firebaseApp = firebase.apps[0];
    }
    _firebaseAuth = firebase.auth();
    _firebaseDb = firebase.firestore();

    // Enable offline persistence for Firestore
    _firebaseDb.enablePersistence({ synchronizeTabs: true }).catch(err => {
      if (err.code === 'failed-precondition') {
        console.warn('[Firestore] Persistence failed: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('[Firestore] Persistence not available in this browser');
      }
    });

    console.log('[Firebase] ✓ Initialized — Auth + Firestore ready');
    return true;
  } catch (e) {
    console.error('[Firebase] Init failed:', e.message);
    return false;
  }
}

// ===== Getters =====
function getFirebaseAuth() { return _firebaseAuth; }
function getFirestore() { return _firebaseDb; }
function isFirebaseReady() { return FIREBASE_CONFIGURED && !!_firebaseAuth; }
