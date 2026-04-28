# CreatorLink

A social media collaboration platform for creative professionals built with **React + Tailwind CSS** (frontend), **FastAPI** (backend), **MongoDB + Beanie ODM** (database), **Cloudinary** (media), and **WebSockets** (real-time chat).

## Github Link

https://github.com/venkydevarapalli/CreatorLink

## Features

- **5 User Roles**: Brand, Influencer, Editor, Photographer, Admin
- **Gig Marketplace**: Post and bid on creative projects
- **Smart Bidding**: Negotiation chat, counter-offers, accept/reject
- **Photography Hub**: Service packages and bookings
- **Real-time Chat**: WebSocket messaging embedded across all project contexts
- **Global Chat Widget**: Floating chat button with unread badges
- **JWT Authentication**: Email/password + Google OAuth
- **Role-Based Access Control**: Endpoint-level permission checks

## Quick Start

### Prerequisites
- **Python 3.10+**
- **MongoDB** (local or Atlas)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

### 2. Configure Environment

Edit `backend/.env`:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=creatorlink
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name    # Optional
CLOUDINARY_API_KEY=your-api-key          # Optional
CLOUDINARY_API_SECRET=your-api-secret    # Optional
```

### 3. Seed Demo Data

```bash
cd backend
python -m app.seed
```

Demo accounts (password: `123456`):
| Email | Role |
|-------|------|
| mamaearth@gmail.com | Brand |
| raclidras@gmail.com | Influencer |
| venky@gmail.com | Editor |
| surya@gmail.com | Photographer |
| admin@gmail.com | Admin |

### 4. Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Architecture

```
┌───────────────┐     ┌──────────────┐     ┌──────────┐
│   React SPA   │────▶│   FastAPI    │────▶│ MongoDB  │
│  Tailwind CSS │     │  WebSocket   │     │  Beanie  │
│  Lucide Icons │     │   JWT Auth   │     │   ODM    │
└───────────────┘     └──────────────┘     └──────────┘
                              │
                      ┌───────▼──────┐
                      │  Cloudinary  │
                      │  (Media CDN) │
                      └──────────────┘
```

## Chat Integration Points

1. **Project/Gig Detail** – Chat button appears after bid acceptance
2. **Direct 1-to-1** – From any user profile page
3. **Bid Negotiation** – Private chat while bid is pending
4. **Global Widget** – Floating icon showing unread count on every page

## API Endpoints

| Route | Description |
|-------|-------------|
| `POST /auth/register` | Register new user |
| `POST /auth/login` | Login |
| `GET /auth/me` | Current user profile |
| `GET /gigs` | List gigs with filters |
| `POST /bids` | Submit a bid |
| `PUT /bids/{id}/accept` | Accept bid (auto-creates conversation) |
| `GET /conversations` | List user's conversations |
| `WS /ws/chat/{conversation_id}` | Real-time WebSocket chat |
| `POST /upload` | Upload file to Cloudinary |

## License

MIT
