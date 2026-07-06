# ProctorAI — AI-Powered Online Examination Platform

ProctorAI is a secure AI-powered online examination platform featuring intelligent proctoring, automated evaluation, and comprehensive exam management. It features a modern decoupled stack: a **FastAPI** backend leveraging **SQLAlchemy 2.0** with async PostgreSQL, and a **Next.js** frontend with **TypeScript** and **TailwindCSS**.

---

## Folder Structure

```
.
├── backend/                  # FastAPI Backend Source
│   ├── app/
│   │   ├── api/              # API router and versioned endpoint groups
│   │   ├── core/             # Central configurations, security, utility utilities
│   │   ├── database/         # Async engine configuration and session provider
│   │   ├── dependencies/     # Common dependencies (DB sessions, authentication tokens)
│   │   ├── middleware/       # Custom middlewares (CORS, timing, logging)
│   │   ├── models/           # SQLAlchemy models
│   │   ├── repositories/     # Generic repository CRUD layers
│   │   ├── schemas/          # Pydantic schemas (Request and Response validations)
│   │   ├── services/         # Decoupled business logic
│   │   ├── utils/            # Shared utilities
│   │   └── main.py           # Application starter
│   ├── tests/                # Pytest suites
│   ├── Dockerfile            # Container definition
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # Next.js Frontend Source
│   ├── app/                  # Next.js App Router (pages, layout, styles)
│   ├── components/           # UI elements (buttons, forms, charts, tables)
│   ├── hooks/                # Custom client-side React hooks
│   ├── lib/                  # Shared utility libraries (e.g., API clients, custom utility wrappers)
│   ├── services/             # API client network calls
│   ├── types/                # TypeScript types & interfaces
│   ├── Dockerfile            # Container definition
│   ├── package.json          # Node dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   └── tailwind.config.ts    # Tailwind styling config
│
├── .env.example              # Centralized environment variables template
├── docker-compose.yml        # Docker compose orchestration definition
└── README.md                 # Current documentation file
```

---

## Technical Stack

### Backend
- **Framework**: FastAPI (Asynchronous Python Web Framework)
- **Database ORM**: SQLAlchemy 2.0 (with `asyncpg` driver)
- **Database Migrations**: Alembic
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Pydantic v2

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Python 3.11+ (for local backend development)
- Node.js 18+ (for local frontend development)

### Quick Start using Docker Compose

1. **Clone & Setup Environment**
   ```bash
   cp .env.example .env
   ```
   *Edit the newly created `.env` file to customize passwords and secret keys.*

2. **Spin up Services**
   ```bash
   docker-compose up --build
   ```

3. **Verify running services**
   - Backend API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Frontend Dashboard: [http://localhost:3000](http://localhost:3000)

---

## Local Development (Without Docker)

### Running Backend
1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Create a virtual environment & install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Running Frontend
1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js dev server:
   ```bash
   npm run dev
   ```
