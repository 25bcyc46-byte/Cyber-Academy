/* ============================================================
   api.js — CyberAcademy Frontend ↔ Backend Integration
   STATUS: NEWLY CREATED — the frontend had no API connection.
           Login/Signup buttons did nothing. Quiz scores were
           never sent to the server.

   SETUP:
     1. Set API_BASE_URL below to your Render backend URL.
     2. This file is already added to index.html (before script.js).
     3. After login, the JWT token is stored in sessionStorage.
        (sessionStorage clears when the browser tab closes —
         safer than localStorage for auth tokens.)
   ============================================================ */

// ── Configuration ─────────────────────────────────────────────
// Automatically uses localhost in dev, your live URL in production.
// For Render backend, use your Render URL (e.g., https://cyber-academy-api.onrender.com)
const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }
    // Production: Set your Render backend URL here
    return 'https://cyber-academy-api.onrender.com'; // ← CHANGE TO YOUR RENDER URL
})();

// ── Token Helpers ──────────────────────────────────────────────
const getToken  = ()        => sessionStorage.getItem('ca_token');
const saveToken = (token)   => sessionStorage.setItem('ca_token', token);
const clearAuth = ()        => { sessionStorage.removeItem('ca_token'); sessionStorage.removeItem('ca_user'); };
const getUser   = ()        => JSON.parse(sessionStorage.getItem('ca_user') || 'null');
const saveUser  = (user)    => sessionStorage.setItem('ca_user', JSON.stringify(user));
const isLoggedIn = ()       => !!getToken();

// ── Core Fetch Wrapper ────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['x-auth-token'] = token;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        // Throw with the server's own message if available
        throw new Error(data.msg || data.error || `Request failed (HTTP ${response.status})`);
    }
    return data;
}

// ── Auth API ──────────────────────────────────────────────────
const AuthAPI = {
    async register(username, email, password) {
        const data = await apiFetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        saveToken(data.token);
        saveUser({ username: data.username, rank: data.rank, points: data.points });
        return data;
    },

    async login(email, password) {
        const data = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        saveToken(data.token);
        saveUser({ username: data.username, rank: data.rank, points: data.points });
        return data;
    },

    logout() {
        clearAuth();
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
    /**
     * Submit a scored activity to the backend.
     * @param {string} activityType  'quiz' | 'phishing' | 'scenario' | 'checklist' | 'casestudy'
     * @param {string} status        'correct' | 'incorrect' | 'best' | 'partial' | 'wrong'
     * @param {number} score         Integer 0–200
     */
    async submit(activityType, status, score) {
        if (!isLoggedIn()) {
            // Silently skip — user is not logged in, no server call
            console.info('[ActivityAPI] Skipped — user not logged in.');
            return null;
        }
        const data = await apiFetch('/api/activity/submit', {
            method: 'POST',
            body: JSON.stringify({ activityType, status, score })
        });
        // Refresh cached user points/rank from response
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

/** Update dashboard section with live data from the server */
async function syncDashboard() {
    if (!isLoggedIn()) return;
    try {
        const data = await DashboardAPI.get();

        const nameEl   = document.querySelector('.profile-info h3');
        const rankEl   = document.querySelector('.rank-badge');
        const pts      = document.querySelectorAll('.p-stat .mono.accent');
        const ringPct  = document.getElementById('ringPercent');
        const ringEl   = document.getElementById('progressRing');

        if (nameEl)  nameEl.textContent     = data.username;
        if (rankEl)  rankEl.textContent     = `🔐 ${data.rank}`;
        if (pts[0])  pts[0].textContent     = data.points;

        // Animate the SVG progress ring
        if (ringEl && ringPct) {
            const pct          = parseInt(data.progress, 10);
            const circumference = 2 * Math.PI * 50; // r=50 from SVG
            const dash         = (circumference * pct) / 100;
            ringEl.setAttribute('stroke-dasharray', `${dash} ${circumference}`);
            ringPct.textContent = `${pct}%`;
        }
    } catch (err) {
        console.warn('[DashboardAPI] Could not load live data:', err.message);
    }
}

/** Quick stats update without a full API call (uses cached data) */
function updateDashboardStats(user) {
    const pts   = document.querySelectorAll('.p-stat .mono.accent');
    const rankEl = document.querySelector('.rank-badge');
    if (pts[0])  pts[0].textContent = user.points;
    if (rankEl)  rankEl.textContent = `🔐 ${user.rank}`;
}

/** Swap Login/Signup nav buttons to show user name + Logout */
function updateNavForAuthState() {
    const signupBtn = document.querySelector('.nav-auth .btn-primary');
    const loginBtn  = document.querySelector('.nav-auth .btn-ghost');
    const user      = getUser();

    if (isLoggedIn() && user) {
        if (signupBtn) { signupBtn.textContent = 'Logout'; signupBtn.onclick = () => AuthAPI.logout(); }
        if (loginBtn)  { loginBtn.textContent  = `👤 ${user.username}`; loginBtn.onclick = null; loginBtn.style.cursor = 'default'; }
    } else {
        if (signupBtn) { signupBtn.textContent = 'Sign Up'; signupBtn.onclick = () => openModal('signup'); }
        if (loginBtn)  { loginBtn.textContent  = 'Login';   loginBtn.onclick = () => openModal('login'); loginBtn.style.cursor = 'pointer'; }
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

// ── Wire Auth Modal Forms to API ───────────────────────────────
function wireAuthForms() {
    // ─ Login form
    const loginBtn = document.querySelector('#loginForm .btn-primary');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email    = document.querySelector('#loginForm input[type="email"]')?.value?.trim();
            const password = document.querySelector('#loginForm input[type="password"]')?.value;

            if (!email || !password) {
                return showToast('Please enter your email and password.', 'warning');
            }

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

    // ─ Register form
    const registerBtn = document.querySelector('#signupForm .btn-primary');
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const username = document.querySelector('#signupForm input[type="text"]')?.value?.trim();
            const email    = document.querySelector('#signupForm input[type="email"]')?.value?.trim();
            const password = document.querySelector('#signupForm input[type="password"]')?.value;

            if (!username || !email || !password) {
                return showToast('Please fill in all fields.', 'warning');
            }
            if (password.length < 8) {
                return showToast('Password must be at least 8 characters.', 'warning');
            }

            registerBtn.textContent = 'Creating account…';
            registerBtn.disabled    = true;
            try {
                const data = await AuthAPI.register(username, email, password);
                showToast(`✅ Account created! Welcome, ${data.username}!`, 'success');
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

// ── Activity Score Hooks ──────────────────────────────────────
// These functions are called from script.js after each interaction.
// They silently submit scores to the backend if the user is logged in.

window.onQuizAnswered = function(isCorrect) {
    const status = isCorrect ? 'correct' : 'incorrect';
    const score  = isCorrect ? 20 : 0;
    ActivityAPI.submit('quiz', status, score).then(data => {
        if (data) showToast(`+${data.pointsAdded} pts — ${data.currentRank}`, 'success');
    }).catch(() => {});
};

window.onPhishingAnswered = function(correct) {
    ActivityAPI.submit('phishing', correct ? 'correct' : 'incorrect', correct ? 30 : 0)
        .catch(() => {});
};

window.onScenarioAnswered = function(result) {
    // result: 'best' | 'partial' | 'wrong'
    const scoreMap = { best: 50, partial: 20, wrong: 0 };
    ActivityAPI.submit('scenario', result, scoreMap[result] || 0).catch(() => {});
};

// ── Bootstrap on DOMContentLoaded ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    wireAuthForms();
    updateNavForAuthState();

    // Load live dashboard data if user is already logged in (return visit)
    if (isLoggedIn()) {
        syncDashboard();
    }
});