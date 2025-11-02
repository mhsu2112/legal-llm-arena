# Quick Start Guide

## Installation (5 minutes)

### 1. Install all dependencies
```bash
cd legal-llm-arena

# Install shared types
cd shared && npm install && npm run build && cd ..

# Install backend
cd backend && npm install && cd ..

# Install frontend
cd frontend && npm install && cd ..
```

### 2. Set up environment
```bash
cd backend
cp .env.example .env
```

**Optional**: Edit `.env` to add your API keys. The app works with mock responses if you don't add keys.

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### 3. Initialize database
```bash
# From backend directory
npm run build
node dist/database/seed.js
```

You should see:
```
Starting database seed...
Seeding models...
  ✓ Created model: claude-3-5-sonnet-20241022
  ✓ Created model: claude-3-opus-20240229
  ✓ Created model: gpt-4-turbo-preview
  ✓ Created model: gpt-4
Seeding sample questions...
  ✓ Created question: What are the essential elements...
  ...
Database seeding completed!
```

## Running (2 terminals)

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

Wait for:
```
╔═══════════════════════════════════════════════════════════╗
║         Legal LLM Arena API Server                        ║
║                                                           ║
║  Server running on: http://localhost:3001                 ║
╚═══════════════════════════════════════════════════════════╝
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

Wait for:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## Using the App

1. Open http://localhost:5173
2. Click "Start New Match"
3. Wait for responses to generate (10-30 seconds)
4. Vote for the better response or choose "It's a Tie"
5. Submit evaluation
6. Check the Leaderboard and Analytics tabs

## Troubleshooting

**"Failed to create match"**
- Check that backend is running on port 3001
- If using real API keys, verify they're valid
- Check backend terminal for errors

**Database errors**
- Delete `backend/data/arena.db` and re-run seed script
- Check file permissions in backend/data directory

**Port already in use**
- Backend: Change PORT in `.env`
- Frontend: Change port in `vite.config.ts`

**No responses generating**
- Without API keys, you'll see mock responses (this is normal)
- Add real API keys to `.env` for actual LLM responses
- Restart backend after adding keys

## Next Steps

- Add more questions via the Questions page or API
- Try different model combinations
- Review analytics to see patterns
- Customize the taxonomy in `shared/src/types.ts`

Enjoy! ⚖️
