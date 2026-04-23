# 🚀 Job Tracker App (MERN Stack)

A full-stack Job Tracker application built using the MERN stack.
This app helps users manage and track their job applications efficiently with authentication and a clean dashboard UI.

---

## 🌍 Live Demo

* Frontend: https://your-frontend-url.vercel.app
* Backend API: https://your-backend-url.onrender.com

---

## 📌 Features

### 🔐 Authentication

* User registration & login
* JWT-based authentication
* Protected routes

### 📊 Job Management

* Create, update, delete jobs
* Track application status:

  * Applied
  * Interview
  * Offer
  * Rejected
* Required job deadline field
* Reminder time selection (defaults to 24 hours before deadline)
* Paginated results with server-side search and filtering

### 🎨 UI/UX

* Clean dashboard layout
* Modal-based job creation
* Status badges with colors
* Responsive design (Tailwind CSS)

### ⚡ Advanced Features

* Server-side search (title/company/date)
* Filter by status and deadline date
* Pagination with page controls
* Email reminders via Resend
* Loading states & notifications

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* bcryptjs
* Resend (email)

---

## 📁 Project Structure

```
job-tracker/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│
├── frontend/
│   └── vite-project/
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   └── App.jsx
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```
git clone https://github.com/Sai-114s/job-tracker.git
cd job-tracker
```

---

### 2️⃣ Setup Backend

```
cd backend
npm install
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM=Job Tracker <you@yourdomain.com>
```

Run backend:

```
npm run dev
```

---

### 3️⃣ Setup Frontend

```
cd frontend/vite-project
npm install
```

Create `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```
npm run dev
```

---

## 🔗 API Endpoints

### Auth

* POST `/api/auth/register`
* POST `/api/auth/login`

### Jobs

* GET `/api/jobs?page=1&limit=5&search=&status=all&deadline=YYYY-MM-DD`
* POST `/api/jobs`
* PUT `/api/jobs/:id`
* DELETE `/api/jobs/:id`
* POST `/api/jobs/test-email`

---

## 🧠 Key Concepts Implemented

* REST API design
* JWT authentication & authorization
* Protected routes (backend + frontend)
* CRUD operations
* Server-side pagination, filtering, and search
* Reminder scheduling with Resend
* State management in React
* Modular backend architecture
### 📄 Pagination
- Backend pagination using page & limit
- Frontend pagination UI (Prev/Next)
- Total pages + results count

### ⏰ Smart Reminders
- Set reminder time per job
- Email reminders using Resend
- Auto scheduler:
  - Sends before deadline
  - Repeats every 24h until deadline

### 📧 Email System
- Reminder emails
- Test email endpoint for verificatio

---

## 🚀 Deployment

* Frontend deployed on Vercel
* Backend deployed on Render
* MongoDB Atlas for database

---

## 📄 Resume Description

Built a full-stack Job Tracker application using MERN stack with JWT authentication and protected routes. Implemented CRUD operations, user-specific data handling, and a responsive dashboard UI with search and filtering features. Deployed the application using Vercel and Render.

## 👨‍💻 Author

Your Name
GitHub: https://github.com/Sai-114s

---

⭐ If you like this project, consider giving it a star!
