# Custom Questions Feature

## Overview

Users can now type in their own legal questions instead of being limited to pre-determined questions from the database.

## Changes Made

### Frontend (ArenaPage.tsx)

1. **New State Variables:**
   - `customQuestion`: Stores the user's typed question
   - `availableQuestions`: Stores sample questions loaded from the database

2. **New UI Components:**
   - Large textarea for entering custom legal questions
   - Dropdown to select from sample questions (optional)
   - Form validation (requires question to be entered)

3. **New Functions:**
   - `loadQuestions()`: Loads sample questions on component mount
   - `resetToIdle()`: Resets the form after completing a match

4. **Updated Flow:**
   - User enters a question (or selects from samples)
   - Clicks "Start Match" button
   - Two AI models generate responses
   - User evaluates responses
   - "Start Another Match" resets the form for a new question

### Backend (arena.ts)

1. **Updated POST /api/arena/match endpoint:**
   - Now accepts optional `customQuestion` in request body
   - If custom question is provided:
     - Creates a new question in the database with the custom text
     - Tags it as "custom" and "user-submitted"
   - If no custom question:
     - Falls back to existing behavior (random question from database)

2. **Question Creation:**
   - Custom questions are saved to the database
   - Uses sensible defaults for taxonomy fields:
     - Domain: "general"
     - Jurisdiction: "us_federal"
     - Complexity: "intermediate"
     - Task Type: "legal_research"

### API Client (client.ts)

Updated `createMatch()` to accept optional `customQuestion` parameter:
```typescript
createMatch: (customQuestion?: string) =>
  api.post<GetArenaMatchResponse>('/api/arena/match', { customQuestion })
```

## User Experience

### Before:
- Click "Start New Match"
- System picks random question from database
- View responses and evaluate

### After:
1. **Landing Page:**
   - Large text box with helpful placeholder
   - Optional dropdown to select sample questions
   - "Start Match" button (disabled until question entered)

2. **Sample Questions:**
   - 20 pre-existing questions available in dropdown
   - Selecting a sample auto-fills the text box
   - Users can edit selected samples

3. **Custom Questions:**
   - Users can type any legal question
   - No taxonomy selection required (handled automatically)
   - Questions are saved for analytics

4. **After Evaluation:**
   - "Start Another Match" button resets form
   - Text box cleared
   - Ready for next question

## Example Custom Questions

Users can now ask questions like:

- "What is the statute of limitations for breach of contract in California?"
- "Can a landlord evict a tenant without notice during COVID-19?"
- "Is a verbal agreement for the sale of real estate enforceable?"
- "What defenses are available in a premises liability lawsuit?"
- "How does the business judgment rule protect corporate directors?"

## Technical Details

**Question Storage:**
- All custom questions are stored in the database
- Tagged with `["custom", "user-submitted"]`
- Use default taxonomy values for consistency
- Preserved for future analytics and pattern recognition

**Validation:**
- Frontend validates non-empty question
- Backend trims whitespace
- No maximum length enforced (reasonable for legal questions)

**Backward Compatibility:**
- Existing functionality maintained
- If no custom question provided, uses random selection
- Pre-existing sample questions still available

## Future Enhancements

Potential improvements:
1. Let users optionally specify domain/complexity
2. Question suggestions based on partial input
3. Community question sharing
4. Question quality ratings
5. Most popular user questions leaderboard
