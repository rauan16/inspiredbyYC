# ULYS — Database Migration Guide

## Problem

The Supabase database tables have not been created yet. The backend returns 500 errors for all database operations because the tables don't exist.

## Solution

You need to run the migration SQL files in the Supabase Dashboard SQL Editor.

### Steps

1. Go to: https://supabase.com/dashboard/project/igjmhjitdnxcncgygjtu/sql/new
2. Copy the contents of `backend/migrations/0001_init_tables.sql` and paste it into the SQL Editor
3. Click "Run" to execute
4. Repeat for `backend/migrations/0002_seed_opportunities.sql`
5. Repeat for `backend/migrations/0003_seed_universities.sql`

### What the migrations create

- **profiles** — User profile data (auto-created on signup)
- **opportunities** — Available opportunities (seeded with 11 records)
- **saved_opportunities** — User's saved opportunities (many-to-many)
- **portfolio_items** — User's portfolio entries
- **mentor_messages** — AI mentor conversation history
- **universities** — University data with analysis (seeded with 4 records)

All tables have Row Level Security (RLS) enabled with appropriate policies.

### Auto-profile creation

The migration includes a trigger that automatically creates a profile when a new user signs up via Supabase Auth.

## After running migrations

Restart the backend and test again:

```powershell
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
