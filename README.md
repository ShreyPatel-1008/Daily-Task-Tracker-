# ⚡ TaskFlow — Modern Task Tracking & Productivity Analytics

A full-stack productivity application with beautiful analytics dashboards, time tracking, streak systems, and smart insights.

![TaskFlow](https://img.shields.io/badge/TaskFlow-v1.0-6c5ce7?style=for-the-badge)

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite |
| **Styling** | Vanilla CSS with Design System |
| **Charts** | Recharts |
| **Backend** | Node.js + Express |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcrypt |

## ✨ Features

### Core
- ✅ JWT Authentication (Register/Login/Logout)
- ✅ Task CRUD with status, priority, category, due date
- ✅ Search and filter tasks
- ✅ Dark/Light mode toggle

### Dashboard
- ✅ Stats cards (total, completed, in progress, not started)
- ✅ Completion percentage with progress bar
- ✅ Weekly bar chart (completed vs created)
- ✅ Status distribution pie chart
- ✅ Productivity trend area chart
- ✅ Category distribution chart
- ✅ Smart insights with AI-like analysis

### Analytics
- ✅ Weekly analytics with bar and line charts
- ✅ Monthly analytics with area and pie charts
- ✅ Focus hours tracking
- ✅ Month navigation
- ✅ GitHub-style contribution heatmap

### Advanced
- ✅ Productivity score (completed/total)
- ✅ Task streak system (🔥 Day Streak)
- ✅ Time tracking with start/stop timer
- ✅ Task categories with distribution
- ✅ Smart insights engine
- ✅ Calendar view with task indicators

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Setup

```bash
cd taskflow
```

### 2. Configure Environment

Edit `server/.env`:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 3. Install & Run Backend

```bash
cd server
npm install
npm run dev
```

### 4. Install & Run Frontend

```bash
cd client
npm install
npm run dev
```

### 5. Open App

Navigate to `http://localhost:5173` in your browser.

## 📁 Project Structure

```
taskflow/
├── client/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Sidebar, Layout
│   │   │   └── tasks/         # TaskCard, TaskModal
│   │   ├── pages/             # Dashboard, Tasks, Analytics, Calendar
│   │   ├── context/           # Auth, Task, Theme contexts
│   │   ├── utils/             # API client, helpers
│   │   └── index.css          # Design system
│   └── vite.config.js
├── server/                    # Express Backend
│   ├── config/db.js
│   ├── controllers/           # Auth, Task, Analytics, Time
│   ├── middleware/auth.js
│   ├── models/                # User, Task, TimeEntry
│   ├── routes/                # Auth, Tasks, Analytics
│   └── server.js
└── README.md
```

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get tasks (with filters) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/status` | Update status |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/weekly` | Weekly data |
| GET | `/api/analytics/monthly` | Monthly data |
| GET | `/api/analytics/heatmap` | Heatmap data |
| GET | `/api/analytics/streak` | Streak |
| GET | `/api/analytics/insights` | Smart insights |

## 📝 License

MIT
