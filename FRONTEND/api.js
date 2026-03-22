/* ============================================================
   api.js — CyberAcademy Frontend ↔ Firebase + Backend
   CHANGES:
     - Login/Register now use Firebase Auth SDK (CDN)
     - JWT token replaced with Firebase ID token
     - Token sent as "Authorization: Bearer <token>" header
     - Auth state tracked via onAuthStateChanged()

   SETUP:
     1. Add Firebase CDN scripts to index.html (see comment below)
     2. Replace FIREBASE_CONFIG values with your project's config
        (Firebase Console → Project Settings → Your Apps → SDK setup)
     3. Set API_BASE_URL to your Render backend URL
   ============================================================

   ADD THESE SCRIPTS TO index.html <head>, BEFORE api.js:
   -------------------------------------------------------
   <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
   <script src="api.js"></script>
   <script src="script.js"></script>
   ------------------------------------------------------- */

// ── Firebase Frontend Config ──────────────────────────────────
// Replace ALL values below with your own project config.
// Firebase Console → Project Settings → Your Apps → Web App → SDK setup
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBowNUrxBFCFR4Ytn-wblIskgAjtBQ4ut8",
  authDomain:        "cyber-academy-dbd0f.firebaseapp.com",
  projectId:         "cyber-academy-dbd0f",
  storageBucket:     "cyber-academy-dbd0f.firebasestorage.app",
  messagingSenderId: "253125385686",
  appId:             "1:253125385686:web:723770486fb6595e5f5877"
};

firebase.initializeApp(FIREBASE_CONFIG);
const firebaseAuth = firebase.auth();

// ── Backend API Base URL ──────────────────────────────────────
const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return 'https://cyber-academy-3d23.onrender.com'; // ← your Render URL
})();

// ── User Cache Helpers ────────────────────────────────────────
const getUser    = ()       => JSON.parse(sessionStorage.getItem('ca_user') || 'null');
const saveUser   = (user)   => sessionStorage.setItem('ca_user', JSON.stringify(user));
const clearUser  = ()       => sessionStorage.removeItem('ca_user');
const isLoggedIn = ()       => !!firebaseAuth.currentUser;

// ── Get Firebase ID Token (sent to backend as Bearer token) ──
async function getIdToken() {
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  return user.getIdToken(); // auto-refreshes if expired
}

// ── Core Fetch Wrapper ─────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json' };

  const token = await getIdToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed (HTTP ${response.status})`);
  }
  return data;
}

// ── Auth API ──────────────────────────────────────────────────
const AuthAPI = {

  // 1. Firebase creates the user account (handles password hashing)
  // 2. We get the ID token
  // 3. Backend creates the Firestore profile doc
  async register(username, email, password) {
    const credential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    await credential.user.updateProfile({ displayName: username });

    // Create Firestore profile via backend
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });

    saveUser({ username, rank: data.rank, points: data.points });
    return data;
  },

  // 1. Firebase verifies credentials
  // 2. Fetch Firestore profile from backend
  async login(email, password) {
    await firebaseAuth.signInWithEmailAndPassword(email, password);

    const data = await apiFetch('/api/auth/me');
    saveUser({ username: data.username, rank: data.role, points: data.points });
    return data;
  },

  async logout() {
    await firebaseAuth.signOut();
    clearUser();
    updateNavForAuthState();
    showToast('You have been logged out.', 'info');
  }
};

// ── Modules API ───────────────────────────────────────────────
const ModulesAPI = {
  async getAll() {
    return apiFetch('/api/modules');
  }
};

// ── Activity API ──────────────────────────────────────────────
const ActivityAPI = {
  async submit(activityType, status, score) {
    if (!isLoggedIn()) {
      console.info('[ActivityAPI] Skipped — user not logged in.');
      return null;
    }
    const data = await apiFetch('/api/activity/submit', {
      method: 'POST',
      body: JSON.stringify({ activityType, status, score }),
    });
    // Update cached user points
    const cached = getUser();
    if (cached && data.newTotal !== undefined) {
      cached.points = data.newTotal;
      cached.rank   = data.currentRank;
      saveUser(cached);
      updateDashboardStats(cached);
    }
    return data;
  }
};

// ── Dashboard API ─────────────────────────────────────────────
const DashboardAPI = {
  async get() {
    return apiFetch('/api/dashboard');
  }
};

// ── UI Sync Helpers ───────────────────────────────────────────
async function syncDashboard() {
  if (!isLoggedIn()) return;
  try {
    const data = await DashboardAPI.get();

    const nameEl  = document.querySelector('.profile-info h3');
    const rankEl  = document.querySelector('.rank-badge');
    const pts     = document.querySelectorAll('.p-stat .mono.accent');
    const ringPct = document.getElementById('ringPercent');
    const ringEl  = document.getElementById('progressRing');

    if (nameEl)  nameEl.textContent   = data.username;
    if (rankEl)  rankEl.textContent   = `🔐 ${data.role}`;
    if (pts[0])  pts[0].textContent   = data.points;

    if (ringEl && ringPct) {
      const pct           = parseInt(data.progress, 10);
      const circumference = 2 * Math.PI * 50;
      const dash          = (circumference * pct) / 100;
      ringEl.setAttribute('stroke-dasharray', `${dash} ${circumference}`);
      ringPct.textContent = `${pct}%`;
    }
  } catch (err) {
    console.warn('[DashboardAPI] Could not load live data:', err.message);
  }
}

function updateDashboardStats(user) {
  const pts    = document.querySelectorAll('.p-stat .mono.accent');
  const rankEl = document.querySelector('.rank-badge');
  if (pts[0])  pts[0].textContent = user.points;
  if (rankEl)  rankEl.textContent = `🔐 ${user.rank}`;
}

function updateNavForAuthState() {
  const signupBtn = document.querySelector('.nav-auth .btn-primary');
  const loginBtn  = document.querySelector('.nav-auth .btn-ghost');
  const user      = getUser();

  if (isLoggedIn() && user) {
    if (signupBtn) { signupBtn.textContent = 'Logout';  signupBtn.onclick = () => AuthAPI.logout(); }
    if (loginBtn)  { loginBtn.textContent  = `👤 ${user.username}`; loginBtn.onclick = null; loginBtn.style.cursor = 'default'; }
  } else {
    if (signupBtn) { signupBtn.textContent = 'Sign Up'; signupBtn.onclick = () => openModal('signup'); }
    if (loginBtn)  { loginBtn.textContent  = 'Login';   loginBtn.onclick  = () => openModal('login');  loginBtn.style.cursor = 'pointer'; }
  }
}

// ── Toast Notification ────────────────────────────────────────
function showToast(message, type = 'info') {
  document.querySelector('.ca-toast')?.remove();
  const colorMap = { success: 'var(--green-accent)', error: 'var(--red-accent)', info: 'var(--blue-accent)', warning: 'var(--yellow-accent)' };
  const color    = colorMap[type] || colorMap.info;
  const toast    = document.createElement('div');
  toast.className = 'ca-toast';
  toast.style.cssText = `
    position:fixed; bottom:2rem; right:2rem; z-index:9999;
    background:var(--bg-card); border:1px solid ${color};
    color:${color}; font-family:var(--font-mono); font-size:.85rem;
    padding:.85rem 1.5rem; border-radius:8px; max-width:380px;
    box-shadow:0 0 24px ${color}44; line-height:1.5;
    animation:slideInRight .3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

// ── Wire Auth Modal Forms ─────────────────────────────────────
function wireAuthForms() {
  // Login form
  const loginBtn = document.querySelector('#loginForm .btn-primary');
  if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
      const email    = document.querySelector('#loginForm input[type="email"]')?.value?.trim();
      const password = document.querySelector('#loginForm input[type="password"]')?.value;

      if (!email || !password) return showToast('Please enter your email and password.', 'warning');

      loginBtn.textContent = 'Logging in…';
      loginBtn.disabled    = true;
      try {
        const data = await AuthAPI.login(email, password);
        showToast(`✅ Welcome back, ${data.username}!`, 'success');
        closeModal();
        updateNavForAuthState();
        syncDashboard();
      } catch (err) {
        showToast(`❌ ${err.message}`, 'error');
      } finally {
        loginBtn.textContent = 'Login to CyberAcademy';
        loginBtn.disabled    = false;
      }
    });
  }

  // Register form
  const registerBtn = document.querySelector('#signupForm .btn-primary');
  if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
      const username = document.querySelector('#signupForm input[type="text"]')?.value?.trim();
      const email    = document.querySelector('#signupForm input[type="email"]')?.value?.trim();
      const password = document.querySelector('#signupForm input[type="password"]')?.value;

      if (!username || !email || !password) return showToast('Please fill in all fields.', 'warning');
      if (password.length < 6) return showToast('Password must be at least 6 characters.', 'warning');

      registerBtn.textContent = 'Creating account…';
      registerBtn.disabled    = true;
      try {
        const data = await AuthAPI.register(username, email, password);
        showToast(`✅ Account created! Welcome, ${username}!`, 'success');
        closeModal();
        updateNavForAuthState();
        syncDashboard();
      } catch (err) {
        showToast(`❌ ${err.message}`, 'error');
      } finally {
        registerBtn.textContent = 'Create Account';
        registerBtn.disabled    = false;
      }
    });
  }
}

// ── Activity Score Hooks (called from script.js) ──────────────
window.onQuizAnswered = function(isCorrect) {
  const score = isCorrect ? 20 : 0;
  ActivityAPI.submit('quiz', isCorrect ? 'correct' : 'incorrect', score)
    .then(data => { if (data) showToast(`+${data.pointsAdded} pts — ${data.currentRank}`, 'success'); })
    .catch(() => {});
};

window.onPhishingAnswered = function(correct) {
  ActivityAPI.submit('phishing', correct ? 'correct' : 'incorrect', correct ? 30 : 0)
    .catch(() => {});
};

window.onScenarioAnswered = function(result) {
  const scoreMap = { best: 50, partial: 20, wrong: 0 };
  ActivityAPI.submit('scenario', result, scoreMap[result] || 0).catch(() => {});
};

// ── Firebase Auth State Listener ─────────────────────────────
// Fires on page load and on every login/logout — keeps UI in sync.
firebaseAuth.onAuthStateChanged((user) => {
  updateNavForAuthState();
  if (user) {
    syncDashboard();
  }
});

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  wireAuthForms();
});