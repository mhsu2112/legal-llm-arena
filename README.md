# Legal LLM Arena

A web application for comparing and evaluating the performance of different Large Language Models (LLMs) on legal questions. Users can pose legal questions, view side-by-side responses from different AI models, and vote for the better response. The system uses an ELO rating system to rank models based on user preferences.

## Features

- **Anonymous Model Comparison**: Compare responses from different LLMs without knowing which model generated each response
- **Custom Questions**: Ask your own legal questions or select from a curated set of sample questions
- **URL References**: Include URLs to legal documents, cases, or articles for context
- **ELO Rating System**: Models are ranked using an ELO rating system based on user evaluations
- **Leaderboard**: View the current rankings of all models
- **Analytics Dashboard**: Explore model performance across different legal domains and complexity levels

## Supported Models

- **Claude 3.5 Sonnet** (Anthropic)
- **GPT-4o** (OpenAI)
- **GPT-4 Turbo** (OpenAI)
- **Grok 2** (xAI)

## Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Vite
- Recharts (for analytics visualizations)
- Axios (for API calls)

### Backend
- Node.js
- Express
- TypeScript
- SQLite (database)
- tsx (TypeScript execution)

### Architecture
- Monorepo structure using npm workspaces
- Shared types package for type safety across frontend and backend
- RESTful API design
- In-memory database with SQLite

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API keys for LLM providers:
  - Anthropic API key (for Claude models)
  - OpenAI API key (for GPT models)
  - xAI API key (for Grok models)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/legal-llm-arena.git
cd legal-llm-arena
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the `backend` directory:
```bash
cd backend
cat > .env << 'ENVEOF'
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
XAI_API_KEY=your_xai_key_here
GOOGLE_API_KEY=your_google_key_here  # Optional, currently disabled
ENVEOF
```

Replace the placeholder values with your actual API keys.

### Running the Application

#### Development Mode

Run both frontend and backend in development mode:

```bash
# From the root directory
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

#### Production Build

```bash
# Build all packages
npm run build

# Start the backend
cd backend
npm start
```

## Project Structure

```
legal-llm-arena/
├── backend/                  # Backend API server
│   ├── src/
│   │   ├── database/        # Database models and repositories
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (LLM, ELO, URL fetching)
│   │   └── index.ts         # Server entry point
│   ├── data/                # SQLite database
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # App entry point
│   └── package.json
├── shared/                  # Shared TypeScript types
│   └── src/
│       └── types.ts
└── package.json            # Root package.json (workspace config)
```

## API Endpoints

### Arena
- `POST /api/arena/match` - Create a new comparison match
- `POST /api/arena/submit` - Submit a comparison evaluation
- `GET /api/arena/leaderboard` - Get the current leaderboard

### Models
- `GET /api/models` - List all models
- `GET /api/models/:id` - Get a specific model
- `GET /api/models/:id/performance` - Get model performance metrics

### Questions
- `GET /api/questions` - List questions
- `GET /api/questions/random` - Get a random question
- `POST /api/questions` - Create a new question

### Analytics
- `GET /api/analytics/overview` - Get overall statistics
- `GET /api/analytics/domain-performance` - Performance by legal domain
- `GET /api/analytics/complexity-analysis` - Analysis by question complexity
- `GET /api/analytics/challenging-questions` - Most challenging questions
- `GET /api/analytics/model-comparison` - Compare two models

## How It Works

1. **Question Input**: Users enter a legal question and optionally provide reference URLs
2. **Model Selection**: The system randomly selects two different LLM models
3. **Response Generation**: Both models generate responses to the question concurrently
4. **Blind Evaluation**: Users see both responses side-by-side without knowing which model created each
5. **Voting**: Users vote for the better response or declare a tie
6. **ELO Update**: Model ratings are updated based on the comparison result using the ELO rating system
7. **Reveal**: After voting, the models are revealed to the user

## ELO Rating System

The application uses an ELO rating system similar to chess ratings:
- New models start at 1500 ELO
- K-factor adjusts based on number of comparisons (higher for new models)
- Winning against a higher-rated model yields more points
- The system accounts for ties (draws)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- Inspired by [LMSYS Chatbot Arena](https://chat.lmsys.org/)
- Built with modern web technologies and best practices
- Designed for legal professionals and researchers
