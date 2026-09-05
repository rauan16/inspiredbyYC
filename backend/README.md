# ULYS Backend

FastAPI backend for the ULYS student opportunity platform with AI mentor (ULIE).

## Tech Stack

- **FastAPI** — REST API framework
- **Supabase** — PostgreSQL database + Authentication
- **OpenAI-compatible API** — AI mentor via OmniRoute/OpenAI/OpenRouter

## Prerequisites

- Python 3.11+
- Running Supabase project (local or cloud)
- OpenAI-compatible AI provider (local OmniRoute recommended)

## Setup

### 1. Create Python environment

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

OPENROUTER_API_KEY=your-openrouter-key
AI_API_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=deepseek/deepseek-chat

CORS_ALLOWED_ORIGINS=http://localhost:3000,https://ulys-gamma.vercel.app
```

### 4. Run migrations

Execute the SQL files in order via the Supabase SQL Editor or `psql`:

```bash
# Option A: Supabase Dashboard SQL Editor
# Run migrations/0001_init_tables.sql
# Run migrations/0002_seed_opportunities.sql
# Run migrations/0003_seed_universities.sql

# Option B: psql (if using self-hosted Supabase)
psql $DATABASE_URL -f migrations/0001_init_tables.sql
psql $DATABASE_URL -f migrations/0002_seed_opportunities.sql
psql $DATABASE_URL -f migrations/0003_seed_universities.sql
```

### 5. Start the server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, explore the interactive docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Testing

### Health check

```bash
curl http://localhost:8000/health
# {"status":"healthy"}
```

### Authentication

```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Save the access_token from the response
TOKEN="your-access-token"

# Get current user
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Profile

```bash
# Get profile
curl http://localhost:8000/api/profile \
  -H "Authorization: Bearer $TOKEN"

# Update profile
curl -X PATCH http://localhost:8000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","grade":"11 класс","location":"Алматы"}'
```

### Opportunities

```bash
# List opportunities
curl http://localhost:8000/api/opportunities \
  -H "Authorization: Bearer $TOKEN"

# With filters
curl "http://localhost:8000/api/opportunities?category=forum&format=offline" \
  -H "Authorization: Bearer $TOKEN"

# Get by ID
curl http://localhost:8000/api/opportunities/kuanysh-forum \
  -H "Authorization: Bearer $TOKEN"
```

### Portfolio

```bash
# List portfolio
curl http://localhost:8000/api/portfolio \
  -H "Authorization: Bearer $TOKEN"

# Create entry
curl -X POST http://localhost:8000/api/portfolio \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"section":"projects","title":"My Project","description":"A great project"}'

# Update entry
curl -X PATCH http://localhost:8000/api/portfolio/{entry-id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Delete entry
curl -X DELETE http://localhost:8000/api/portfolio/{entry-id} \
  -H "Authorization: Bearer $TOKEN"
```

### AI Mentor

```bash
# Get chat history
curl http://localhost:8000/api/mentor/messages \
  -H "Authorization: Bearer $TOKEN"

# Send message
curl -X POST http://localhost:8000/api/mentor/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Привет! Как мне улучшить портфолио?"}'
```

### Offline Sync

```bash
curl -X POST http://localhost:8000/api/sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {"name": "Updated Name"},
    "portfolio": [{"id": "entry-id", "title": "New Title"}],
    "saved_opportunities": [{"opportunity_id": "kuanysh-forum", "saved": true}]
  }'
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # Supabase REST client
│   ├── auth.py              # JWT authentication
│   ├── api/
│   │   ├── auth.py          # /api/auth/* endpoints
│   │   ├── profile.py       # /api/profile endpoints
│   │   ├── opportunities.py # /api/opportunities/* endpoints
│   │   ├── saved_opportunities.py
│   │   ├── portfolio.py     # /api/portfolio/* endpoints
│   │   ├── mentor.py        # /api/mentor/* endpoints
│   │   └── sync.py          # /api/sync endpoint
│   ├── schemas/
│   │   ├── auth.py          # Request/response models
│   │   ├── profile.py
│   │   ├── opportunity.py
│   │   ├── portfolio.py
│   │   ├── mentor.py
│   │   └── sync.py
│   └── services/
│       └── ai.py            # OpenAI-compatible AI service
├── migrations/
│   ├── 0001_init_tables.sql
│   ├── 0002_seed_opportunities.sql
│   └── 0003_seed_universities.sql
├── requirements.txt
├── .env.example
└── README.md
```

## Architecture Notes

- **Auth**: Supabase Auth with JWT. Tokens passed as `Authorization: Bearer <token>`.
- **Database Access**: All requests use the authenticated user's token, respecting RLS.
- **AI Service**: Generic OpenAI-compatible client. Switch providers by changing env vars.
- **Security**: Service role key never exposed to frontend. CORS restricted to frontend origin.
