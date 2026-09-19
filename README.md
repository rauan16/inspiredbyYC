# ULYS

ULYS is a personalized university admission navigator that helps students understand where they can apply and what they need to do next.

## What ULYS Does

- Builds a student profile from grades, IELTS/SAT, interests, budget and country preferences
- Recommends universities using ULYS Match
- Explains profile strengths and gaps
- Compares university options
- Creates a personalized admission Roadmap
- Shows the Next Best Action
- Supports What-If scenarios for IELTS, SAT, budget, country and major
- Provides contextual guidance through ULIE

ULYS Match represents profile-university compatibility. It is not an admission probability.

## How It Works

Profile
→ Diagnosis
→ ULYS Match
→ Compare
→ Roadmap
→ Next Best Action
→ What-If
→ ULIE

## What-If

Students can change one assumption without changing their real profile.

For example:

IELTS 6.5 → 8.0

ULYS recalculates:
- university matches
- roadmap tasks
- next best action

This allows students to understand the consequences of a decision before making it.

## Technology

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS

Backend:
- Python
- FastAPI
- SQLAlchemy
- Alembic
- JWT authentication

AI:
- OpenRouter / DeepSeek

Core matching, roadmap, Next Best Action and What-If logic are deterministic.
AI is used as an explanation and guidance layer.

## LOCUS Startup Hackathon 2026

Case 02 — Personalized University Admission Route.

Pre-hackathon foundation:
- basic ULYS infrastructure
- authentication
- reusable technical components

Developed during LOCUS 2026:
- redesigned admission journey
- profile/onboarding flow
- profile diagnosis
- explainable ULYS Match
- university comparison
- personalized Roadmap
- Next Best Action
- What-If simulation
- integration into one admission journey

## Running Locally

Frontend:

npm install
npm run dev

Backend:

Use the existing backend requirements/environment configuration and start the FastAPI application with the project's configured command.

Required environment variables must be configured locally.
Never commit .env files or API keys.

## Project Status

Working MVP built for LOCUS Startup Hackathon 2026.
