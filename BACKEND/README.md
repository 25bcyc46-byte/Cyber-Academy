# 🛡️ CyberSec Learning Platform — Backend

Node.js + Express + MongoDB REST API with JWT authentication.

---

## 📁 Folder Structure

```
backend/
├── server.js              # Entry point
├── package.json
├── .env.example           # Environment variable template
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── User.js
│   ├── Module.js
│   └── Activity.js
├── routes/
│   ├── auth.js            # Register / Login
│   ├── modules.js         # Get modules
│   ├── activity.js        # Submit activity
│   └── dashboard.js       # Student dashboard
└── middleware/
    ├── auth.js            # JWT protect + adminOnly
    └── errorHandler.js    # Global error handler
```

---

## ⚙️ Local Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` with your values.

### 3. Start dev server
```bash
npm run dev
```

---

## 🌐 MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.
2. Create a new **free cluster** (M0).
3. Under **Database Access**, create a user with a username and password.
4. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** on your cluster → **Connect your application**.
6. Copy the connection string and paste it into your `.env`:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/cybersec-platform?retryWrites=true&w=majority
```

Replace `<username>` and `<password>` with your database user credentials.

---

## 🚀 Deploy to Render

1. Push your backend folder to a GitHub repo.
2. Go to [https://render.com](https://render.com) and sign in.
3. Click **New → Web Service** and connect your GitHub repo.
4. Configure the service:
   - **Root Directory:** `backend` (if monorepo) or leave blank
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Under **Environment Variables**, add:
   ```
   MONGO_URI       = your Atlas connection string
   JWT_SECRET      = a long random secret string
   JWT_EXPIRES_IN  = 7d
   CLIENT_ORIGIN   = https://your-frontend-domain.com
   PORT            = 5000
   ```
6. Click **Create Web Service**. Render will deploy automatically.

Your API will be live at: `https://your-service-name.onrender.com`

---

## 🔌 Frontend Connection

In your frontend, set the base API URL to your deployed backend:

```js
// Example with fetch
const API_URL = 'https://your-service-name.onrender.com/api';

// Register
fetch(`${API_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, email, password }),
});

// Login → save token
fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Protected request (pass JWT in header)
fetch(`${API_URL}/dashboard`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

Make sure `CLIENT_ORIGIN` in your backend `.env` matches your frontend's deployed URL to avoid CORS errors.

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login and get JWT |
| GET | `/api/modules` | ❌ | List all modules (`?level=beginner`) |
| GET | `/api/modules/:id` | ✅ | Get single module with content |
| POST | `/api/activity/submit` | ✅ | Submit activity, award points |
| GET | `/api/dashboard` | ✅ | Student dashboard data |

---

## 🔐 Security Features

- `helmet` — secure HTTP headers
- `express-rate-limit` — 100 req / 15 min per IP
- `bcryptjs` — password hashing (salt rounds: 12)
- `jsonwebtoken` — stateless JWT auth
- `cors` — configurable allowed origins
- `dotenv` — no secrets hardcoded
- Global error handler — consistent error responses
