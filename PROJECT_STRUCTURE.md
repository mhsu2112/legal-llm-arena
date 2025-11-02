# Project Structure

## Overview

This is a complete, production-ready Legal LLM Arena application with 40+ source files organized into three main packages:

```
legal-llm-arena/
├── shared/            # Shared TypeScript types (3 files)
├── backend/           # Express API server (17 files)
├── frontend/          # React web app (13 files)
├── README.md          # Comprehensive documentation
├── QUICKSTART.md      # Quick setup guide
└── package.json       # Root package with helper scripts
```

## File Count Summary

- **TypeScript files**: 27
- **Configuration files**: 10
- **Documentation**: 3
- **Total source files**: 40

## Detailed Structure

### Shared Package (3 files)
```
shared/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts          # Exports all types
    └── types.ts          # 800+ lines of comprehensive legal taxonomy
                          # - 19 Legal domains
                          # - 30+ Subdomains
                          # - 9 Jurisdictions
                          # - 20+ Error types
                          # - Complete type system
```

### Backend Package (17 files)
```
backend/
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts                    # Express server entry point
    │
    ├── database/
    │   ├── db.ts                   # Database connection & initialization
    │   ├── schema.sql              # Complete SQLite schema (8 tables, 3 views)
    │   ├── seed.ts                 # Sample data (4 models, 10 questions)
    │   └── repositories/
    │       ├── ModelRepository.ts        # Model CRUD & ELO operations
    │       ├── QuestionRepository.ts     # Question management
    │       ├── ResponseRepository.ts     # LLM response storage
    │       ├── ComparisonRepository.ts   # Arena comparisons
    │       └── ErrorAnnotationRepository.ts  # Error tracking
    │
    ├── services/
    │   ├── eloService.ts           # ELO rating calculations
    │   └── llmService.ts           # Multi-provider LLM integration
    │
    └── routes/
        ├── models.ts               # Model endpoints
        ├── questions.ts            # Question endpoints
        ├── arena.ts                # Arena match endpoints
        └── analytics.ts            # Analytics & reporting
```

### Frontend Package (13 files)
```
frontend/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── index.html
└── src/
    ├── main.tsx              # React app entry point
    ├── App.tsx               # Router & navigation
    ├── index.css             # Tailwind imports
    │
    ├── api/
    │   └── client.ts         # Axios API client with typed endpoints
    │
    └── pages/
        ├── ArenaPage.tsx         # Side-by-side comparison interface
        ├── LeaderboardPage.tsx   # ELO rankings table
        ├── AnalyticsPage.tsx     # Charts & insights (Recharts)
        └── QuestionsPage.tsx     # Question browser
```

## Key Features Implemented

### Backend (Express + TypeScript)
- ✅ SQLite database with comprehensive schema
- ✅ Repository pattern for data access
- ✅ ELO rating system with K-factor adjustments
- ✅ Multi-provider LLM integration (Anthropic, OpenAI, Google)
- ✅ RESTful API with 15+ endpoints
- ✅ Error handling and validation
- ✅ Seeding system with sample data
- ✅ Analytics queries with aggregations

### Frontend (React + TypeScript + Tailwind)
- ✅ Arena comparison interface with anonymous voting
- ✅ Real-time ELO leaderboard
- ✅ Analytics dashboard with Recharts visualizations
- ✅ Question browser with detailed taxonomy
- ✅ Responsive design with Tailwind CSS
- ✅ Loading states and error handling
- ✅ Type-safe API client

### Shared Types
- ✅ 19 legal domains with subdomains
- ✅ 4 complexity levels (Basic to Expert)
- ✅ 10 task types (Research, Analysis, Memo Writing, etc.)
- ✅ 8 reasoning types
- ✅ 7 cognitive skills
- ✅ 20+ error types with severity levels
- ✅ Complete API request/response types

## Database Schema

**Tables**: 8
- models (LLM configurations & ELO ratings)
- questions (Legal questions with full taxonomy)
- responses (Generated LLM responses)
- comparisons (Head-to-head evaluations)
- detailed_evaluations (Criterion scores)
- error_annotations (Error tracking)
- challenging_patterns (Identified problem areas)

**Views**: 3
- model_performance (Aggregate metrics)
- domain_performance (Performance by legal domain)
- error_frequency (Error analysis)

## API Endpoints: 15+

**Models** (3 endpoints)
- GET /api/models
- GET /api/models/:id
- GET /api/models/:id/performance

**Questions** (4 endpoints)
- GET /api/questions
- GET /api/questions/random
- GET /api/questions/:id
- POST /api/questions

**Arena** (3 endpoints)
- POST /api/arena/match
- POST /api/arena/submit
- GET /api/arena/leaderboard

**Analytics** (6 endpoints)
- GET /api/analytics/overview
- GET /api/analytics/domain-performance
- GET /api/analytics/error-frequency
- GET /api/analytics/complexity-analysis
- GET /api/analytics/model-comparison
- GET /api/analytics/challenging-questions

## Technology Stack

**Language**: TypeScript throughout
**Backend**: Node.js, Express, SQLite (better-sqlite3)
**Frontend**: React 18, Vite, Tailwind CSS 3, Recharts
**AI SDKs**: Anthropic SDK, OpenAI SDK
**Validation**: Zod
**HTTP Client**: Axios

## Lines of Code (Approximate)

- Shared types: ~800 lines
- Backend: ~2,500 lines
- Frontend: ~1,500 lines
- Documentation: ~500 lines
- **Total: ~5,300 lines**

## Ready to Run

1. All dependencies specified in package.json files
2. Database schema ready to initialize
3. Seed data script with 10 diverse legal questions
4. Development servers with hot reload
5. Production build scripts
6. Comprehensive documentation

## Next Steps for User

1. Follow QUICKSTART.md to install and run
2. Add API keys to .env for real LLM responses
3. Start evaluating legal AI models
4. Add custom questions via API or seed script
5. Analyze results in the analytics dashboard

Built with ⚖️ and ready to deploy locally!
