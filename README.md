# 🚀 CreatorLink

A full-stack **Creator Marketplace Platform** designed for the modern creator economy, enabling seamless collaboration between **Brands, Influencers, Editors, and Photographers**.

Built using **FastAPI, React, MongoDB, and WebSockets**, CreatorLink provides a structured, role-driven environment for managing creative projects end-to-end.

---

## 🌐 Live Repository

👉 https://github.com/venkydevarapalli/CreatorLink

---

## 📌 Overview

The creator economy is growing rapidly, but existing platforms like Fiverr and Upwork lack **role-specific workflows** for creative professionals.

**CreatorLink solves this problem** by introducing:

* Role-based collaboration
* Structured gig workflows
* Real-time communication
* Smart bidding system

---

## ✨ Key Features

### 👥 Multi-Role System

* Brand
* Influencer
* Editor
* Photographer
* Admin

### 💼 Gig Marketplace

* Post gigs (Editing, Photography, Promotion)
* Advanced filtering & search
* Budget & deadline management

### 💰 Smart Bidding System

* Bid submission with proposals
* Counter-offers & negotiation
* Automatic rejection of competing bids

### 💬 Real-Time Chat

* WebSocket-based messaging
* Bid negotiation chat
* Project collaboration chat
* Global chat widget with unread indicators

### 🔐 Authentication & Security

* JWT Authentication
* Google OAuth login
* Role-Based Access Control (RBAC)

### 📸 Media Management

* Cloudinary integration for:

  * Portfolio images
  * Gig attachments

### ⭐ Review & Rating System

* Post-project feedback
* Auto-calculated user ratings

---

## 🏗️ System Architecture

```
┌───────────────┐      ┌──────────────┐      ┌──────────┐
│   React SPA   │────▶ │   FastAPI    │────▶│ MongoDB  │
│  Tailwind CSS │      │  WebSocket   │      │  Beanie  │
│  Lucide Icons │      │   JWT Auth   │      │   ODM    │
└───────────────┘      └──────────────┘      └──────────┘
                              │
                      ┌───────▼──────┐
                      │  Cloudinary  │
                      │  (Media CDN) │
                      └──────────────┘
```

✔ Decoupled 3-tier architecture
✔ Scalable & production-ready design

---

## ⚙️ Tech Stack

### 🔹 Backend

* FastAPI
* MongoDB (Atlas)
* Beanie ODM
* Motor (Async DB Driver)
* JWT (python-jose)
* Passlib (bcrypt)

### 🔹 Frontend

* React 19 + Vite
* Tailwind CSS
* React Router DOM
* Axios
* Lucide Icons

### 🔹 Tools & Services

* Cloudinary (Media CDN)
* WebSockets (Real-time communication)
* Git & GitHub

---

## 🚀 Getting Started

### ✅ Prerequisites

* Python 3.10+
* Node.js (v18+)
* MongoDB (Local or Atlas)

---

### 🔧 Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

---

### 🔑 Environment Variables

Create `backend/.env`:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=creatorlink
JWT_SECRET=your-secret-key

CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

---

### 🌱 Seed Demo Data

```bash
python -m app.seed
```

#### Demo Accounts (Password: 123456)

| Email                                             | Role         |
| ------------------------------------------------- | ------------ |
| [mamaearth@gmail.com](mailto:mamaearth@gmail.com) | Brand        |
| [raclidras@gmail.com](mailto:raclidras@gmail.com) | Influencer   |
| [venky@gmail.com](mailto:venky@gmail.com)         | Editor       |
| [surya@gmail.com](mailto:surya@gmail.com)         | Photographer |
| [admin@gmail.com](mailto:admin@gmail.com)         | Admin        |

---

### ▶️ Run Backend

```bash
uvicorn app.main:app --reload --port 8000
```

📌 API Docs: http://localhost:8000/docs

---

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

🌐 Open: http://localhost:5173

---

## 🔄 Workflow

### 🧑‍💼 Brand → Creator Flow

1. Brand posts a gig
2. Creators submit bids
3. Negotiation via chat
4. Brand accepts bid
5. Project starts (chat auto-created)
6. Work submission & review
7. Project completion
8. Ratings & feedback

✔ Fully automated lifecycle

---

## 🔌 API Highlights

| Endpoint              | Description    |
| --------------------- | -------------- |
| POST /auth/register   | Register user  |
| POST /auth/login      | Login          |
| GET /gigs             | Fetch gigs     |
| POST /bids            | Submit bid     |
| PUT /bids/{id}/accept | Accept bid     |
| GET /conversations    | Chat list      |
| WS /ws/chat/{id}      | Real-time chat |
| POST /upload          | Upload media   |

---

## 🧠 Core Concepts

* Role-based restrictions (e.g., Editors only bid on editing gigs)
* Automatic chat creation on:

  * Bid submission
  * Bid acceptance
* Async architecture using FastAPI
* Real-time WebSocket communication

---

## 🧪 Testing

* Unit Testing (business logic)
* Integration Testing (workflow validation)
* API Testing (Postman)
* Security Testing (JWT, RBAC)

✔ 100% pass rate across major modules

---

## 🚧 Challenges Solved

* Complex role-based logic enforcement
* Real-time WebSocket connection management
* Automatic conversation provisioning
* Secure media handling via Cloudinary

---

## 🔮 Future Scope

* 💳 Payment Gateway (Razorpay/Stripe)
* 🤖 AI-based creator recommendation
* 🎥 Video portfolio support
* 📱 Mobile app (React Native)
* 📊 Advanced analytics dashboard

---

## 📜 License

MIT License

---

## 🙌 Author

**D. Venka Reddy**
B.Tech CSE – RGUKT RK Valley

---
