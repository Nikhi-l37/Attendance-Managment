# 🎓 AcademiaSystem — Student Attendance and Marks Management System

A full-stack, cloud-powered academic management web application engineered to digitize student records, track attendance, calculate subject marks, detect attendance defaulters, and generate official printable report cards.

---

## 🚀 Tech Stack

- **Frontend**: React 19, Vite 6, TypeScript 5.8, Tailwind CSS, Recharts
- **Backend**: Node.js, Express 4, Mongoose 8
- **Database**: MongoDB Atlas (Cloud Database)
- **Data Exchange**: Client-side RFC 4180 CSV Engine & Print/PDF Engine

---

## ✨ Key Features

1. **👑 Role-Based Access Portals**:
   - **Administrator**: Comprehensive school-wide analytics, student/teacher directories, bulk CSV student enrollment, and defaulters monitor.
   - **Teacher**: Class attendance marking (daily calendar & monthly), bulk attendance actions (*Mark All Present / Absent*), subject marks management, and student report card generator.
   - **Student**: Personal academic metrics, attendance history, monthly subject performance charts, defaulter warnings, and printable official report card.

2. **☁️ Pure MongoDB Atlas Cloud Storage**:
   - Live cloud persistence across all user sessions and devices.
   - Automatic account provisioning on login.
   - Automated database seeder (`npm run seed`) with realistic mock records.

3. **📅 Daily Calendar & Bulk Attendance**:
   - Calendar date picker with quick shortcuts (*Today*, *Yesterday*).
   - Real-time class metrics bar (Present, Absent, Late, Unmarked, and Attendance Rate %).
   - 1-click bulk operations: *Mark All Present* / *Mark All Absent*.

4. **⚠️ Attendance Defaulter Alerts (<75%)**:
   - Institutional defaulter detection engine flags any student under 75% attendance.
   - Computes exact recovery shortfall (e.g. *"Needs +4 consecutive sessions to reach 75%"*).
   - Dedicated Defaulters portal with notice dispatch and CSV export.

5. **📥 CSV / Excel Import & Export**:
   - Export class attendance, subject marks ledgers, defaulters reports, and student rosters to CSV.
   - Drag-and-drop CSV student bulk importer with real-time format validation and preview.

6. **🖨️ Printable Official Academic Report Card**:
   - Institutional transcript layout with academy crest, registration credentials, and signature blocks.
   - Multi-tier grading engine ($A^+$, $A$, $B^+$, $B$, $C$, $D$, $F$) with 4.0 GPA scale.
   - `@media print` CSS optimization for clean A4 printing or saving as PDF.

---

## 🛠️ Project Structure

```
├── src/                   # Frontend Application (React 19 + TypeScript + Vite)
│   ├── components/        # Reusable UI components (Layout, Defaulters, ReportCard, etc.)
│   ├── context/           # Authentication & Theme state contexts
│   ├── hooks/             # Custom React hooks (useAuth, useTheme)
│   ├── screens/           # Role dashboard screens (Admin, Teacher, Student, Login)
│   ├── services/          # API client, CSV utilities, Grading & Attendance engines
│   ├── App.tsx            # Main application component & routing
│   ├── index.tsx          # React DOM entry point
│   └── types.ts           # Core TypeScript definitions
├── server/                # Backend API Server (Node.js + Express + MongoDB Atlas)
│   ├── config/            # MongoDB Atlas connection manager with DNS resolver
│   ├── models/            # Mongoose Schemas (User, Student, Teacher)
│   ├── routes/            # API Route handlers (auth, students, teachers, attendance, marks)
│   ├── seed.js            # Database seeder script
│   ├── server.js          # Express app entry point
│   ├── package.json       # Backend dependencies
│   └── Dockerfile         # Multi-stage production container for Render
├── index.html             # Application HTML & print stylesheets
├── render.yaml            # Render Blueprint configuration
└── package.json           # Root scripts (dev, build, server, seed)
```

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster connection URI

### 1. Environment Setup
Configure your MongoDB Atlas connection in `.env` (or `server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/attendance_db?retryWrites=true&w=majority
```
> **Note**: Ensure your IP address (or `0.0.0.0/0`) is added to your MongoDB Atlas **Network Access** whitelist.

### 2. Seed the Database (Optional)
Populate your MongoDB Atlas cluster with realistic sample records (1 Admin, 3 Teachers, 7 Students with multi-month attendance and marks):
```bash
npm run seed
```

### 3. Start the Backend API Server
```bash
npm run server
```
Server will start on `http://localhost:5000/api`.

### 4. Start the Frontend Development Server
In a new terminal window:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## ⚡ Quick Demo Accounts

Use the **1-Click Quick Demo** buttons on the login screen or sign in with:

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin@academia.edu` | Full administrative control, rosters, teacher management |
| **Teacher** | `sarah.teacher@academia.edu` | Classes 10A & 10B, Attendance, Marks, Report Cards |
| **Student** | `alex.student@academia.edu` | Class 10A, personal attendance, marks, report card |

*You can also type any custom email, select a role, and click **Sign In** — the system will automatically provision your account in MongoDB Atlas.*

---

## 🌐 Deploy to Render (Free Cloud Hosting)

This application is engineered to deploy seamlessly to [Render](https://render.com) as a single, unified full-stack web service (Frontend + Backend + MongoDB Atlas).

### Option A: Deploy with Docker (Recommended)
1. Push this repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Web Service**.
3. Select your GitHub repository.
4. Set **Environment / Runtime** to **Docker**.
5. Set **Docker Command / Context**:
   - **Docker Build Context Directory**: `.`
   - **Dockerfile Path**: `server/Dockerfile`
   *(Render will also configure this automatically if using Blueprints via `render.yaml`)*
6. Under **Environment Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://sivadanikhilreddy_db_user:6VaiAjdq3O9Jj8Py@attendance.iglhxxh.mongodb.net/attendance_db?retryWrites=true&w=majority&appName=attendance`
   - `NODE_ENV`: `production`
7. Click **Deploy Web Service**!

### Option B: Deploy as Native Node Web Service
1. In Render Dashboard → **New** → **Web Service**.
2. Set **Runtime** to **Node**.
3. Set **Build Command**: `npm run build:render`
4. Set **Start Command**: `npm start`
5. Add the `MONGODB_URI` and `NODE_ENV=production` environment variables.
6. Click **Deploy**!

---

## 📜 License
MIT
