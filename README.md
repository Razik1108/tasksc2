# 🚀 Team Task Manager

A full-stack production-ready task management application built with Node.js, Express, MongoDB, and React. 
This project features Role-Based Access Control (RBAC), JWT Authentication, and a complete dashboard for teams to manage projects and tasks seamlessly.

## 🧠 Tech Stack
- **Frontend:** React, Vanilla CSS via Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **State/Routing:** React Context & React Router DOM

## 🎯 Core Features
- **Authentication:** JWT-based login, Signup, encrypted passwords with bcrypt.
- **Role-Based Access Control:** Separation between `Admin` and `Member` privileges.
- **Project Management:** Admins can create projects and invite team members.
- **Task Management:** Real-time status switching (To Do, In Progress, Done). Admins create tasks; Members manage statuses.
- **Dashboard:** At-a-glance metrics on pending, overdue, and completed workflow actions.

---

## 💻 Local Setup Instructions

1. **Install Dependencies**
   Make sure you have Node >22 installed. Run the following command in the root folder:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root based on `.env.example`:
   ```bash
   MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/taskmanager"
   JWT_SECRET="YOUR_SUPER_SECRET_KEY"
   ```

3. **Run the Application**
   Start the application in development mode (spins up both Vue/React Vite server and Express backend):
   ```bash
   npm run dev
   ```
   *The app will be running at http://localhost:3000.*

---

## 🌐 Deployment to Railway

This repository is structured for zero-config deployment to [Railway.app](https://railway.app/).

1. **Connect GitHub**
   Import this GitHub repository into your Railway dashboard.

2. **Add Environment Variables**
   Go to your Railway project's **Variables** tab and add:
   - `MONGODB_URI` 
   - `JWT_SECRET`

3. **Deploy**
   Railway will automatically read the `package.json` file. It will build using `npm run build` and start the server using `npm start` (`node server.ts`).

## ⚙️ Security Guidelines
- This application implements JWT tokens via local storage, properly protected API endpoints, input validation, and password hashing.
- API endpoints strictly verify JSON Web Tokens and user roles before applying database mutations to prevent escalation of privileges.
