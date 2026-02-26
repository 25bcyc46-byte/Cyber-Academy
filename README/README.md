\# 🛡️ CyberAcademy — Backend API



This is the complete backend server for the \*\*CyberAcademy Cybersecurity Learning Portfolio\*\*. It provides a robust REST API for user authentication, curriculum management, interactive activity scoring, and student progress tracking.



---



\## 🏗️ Project Architecture



The backend is built with \*\*Node.js\*\* and \*\*Express\*\*, utilizing a modular structure for scalability and security.



```text

cyber-academy-backend/

├── config/           # Database \& configuration settings

├── controllers/      # Route controllers (the logic)

├── middleware/       # JWT Auth \& Error handling

├── models/           # Mongoose schemas (User, Module, Activity)

├── routes/           # API endpoint definitions

├── scripts/          # Data seeding (initial module content)

├── .env              # Environment secrets (JWT, DB URI)

└── server.js         # Application entry point



🚀 Quick Start Guide1. PrerequisitesNode.js (v18.x or higher recommended)MongoDB (Local instance or MongoDB Atlas)npm (Package manager)2. InstallationBash# Enter project directory

cd cyber-academy-backend



\# Install all dependencies

npm install

3\. Environment SetupCreate a .env file in the root directory and add your credentials:Code snippetPORT=5000

MONGO\_URI=mongodb://127.0.0.1:27017/cyber\_academy

JWT\_SECRET=your\_super\_secret\_cyber\_key\_2026

4\. Seed the DatabasePopulate your database with the initial cybersecurity curriculum (Beginner, Intermediate, and Advanced modules):Bashnode scripts/seed.js

5\. Start the ServerBash# Development mode with nodemon

npm run dev



\# Production mode

npm start

📡 API Endpoints Summary🔑 AuthenticationMethodEndpointDescriptionPOST/api/auth/registerCreate a new student accountPOST/api/auth/loginLogin and receive a JWT token📚 CurriculumMethodEndpointDescriptionGET/api/modulesFetch all learning modules (M01, M02, etc.)🎯 Activities \& DashboardMethodEndpointDescriptionAuthPOST/api/activity/submitSave quiz/phishing scores \& update rankYesGET/api/dashboardGet user stats, points, and progressYes🔐 Security FeaturesPassword Hashing: Uses bcryptjs for one-way salting and hashing.Token-Based Auth: Secure routes are protected by JWT (JSON Web Tokens).Input Validation: Sanity checks on all incoming registration and login data.CORS Enabled: Configured for seamless communication with your frontend.🧩 CSS IntegrationThe backend response keys (like level, rank, and status) are mapped specifically to your CyberAcademy CSS classes:level: "beginner" ➔ .card-tag.beginnerrank: "Cyber Architect" ➔ .rank-badgestatus: "correct" ➔ .quiz-opt.correct🛠️ Tech StackRuntime: Node.jsFramework: Express.jsDatabase: MongoDBORM: MongooseSecurity: JWT, BcryptJS

