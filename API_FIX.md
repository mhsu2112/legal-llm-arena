# API Keys Fix - Module Loading Issue

## Problem
API keys were configured in `.env` file but responses were still mocked with the message "To enable real responses, configure API keys in the .env file".

## Root Cause
**Module initialization timing issue:**

1. The `llmService.ts` module was creating Anthropic and OpenAI clients at **module load time**
2. Environment variables are loaded by `dotenv.config()` in `index.ts`
3. But `llmService.ts` was imported (and initialized) **before** environment variables were loaded
4. Result: `process.env.ANTHROPIC_API_KEY` was `undefined` when clients were created

## Solution Implemented

### 1. Improved .env Loading (index.ts)
```typescript
// Use process.cwd() for consistent path resolution
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Added logging to confirm keys are loaded
console.log('API Keys loaded:', {
  anthropic: process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing',
  openai: process.env.OPENAI_API_KEY ? 'Present' : 'Missing',
  google: process.env.GOOGLE_API_KEY ? 'Present' : 'Missing',
});
```

### 2. Lazy Client Initialization (llmService.ts)
Changed from **eager initialization**:
```typescript
// ❌ OLD: Created immediately when module loads
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;
```

To **lazy initialization**:
```typescript
// ✅ NEW: Created only when first needed
let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic | null {
  if (anthropic) return anthropic; // Return cached instance

  if (process.env.ANTHROPIC_API_KEY) {
    console.log('Initializing Anthropic client...');
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return anthropic;
  }

  console.log('Anthropic API key not found, using mock responses');
  return null;
}
```

## How to Verify It's Working

### 1. Check Server Logs
When the backend starts, you should see:
```
Loading .env from: /Users/michaelhsu/Documents/legal-llm-arena/backend/.env
API Keys loaded: { anthropic: 'Present', openai: 'Present', google: 'Present' }
```

### 2. Start a Match
When you start a match in the frontend, watch the backend logs:
```
Generating responses for question: What are the essential...
Initializing Anthropic client...
Initializing OpenAI client...
```

### 3. Check Response Content
**Mock response** (before fix):
```
Mock legal analysis for: "What are the essential..."

This is a placeholder response. The actual implementation would provide:
1. Identification of relevant legal issues
2. Application of relevant legal rules and precedents
...
To enable real responses, configure API keys in the .env file.
```

**Real response** (after fix):
```
To form a valid contract under common law, the following essential
elements must be present:

1. **Offer**: A clear and definite promise made by one party (the offeror)...

2. **Acceptance**: Unqualified agreement to the terms of the offer...

3. **Consideration**: Something of value exchanged between the parties...

4. **Mutual Assent** (Meeting of the Minds): Both parties must have...

5. **Capacity**: The parties must have legal capacity to enter into...

6. **Legality**: The contract's purpose must be legal...

[Detailed legal analysis continues...]
```

## Files Modified

1. **backend/src/index.ts**
   - Improved .env path resolution
   - Added API key loading confirmation logs

2. **backend/src/services/llmService.ts**
   - Implemented lazy initialization pattern
   - Added getAnthropicClient() and getOpenAIClient() functions
   - Updated generateAnthropicResponse() and generateOpenAIResponse()

## Benefits of This Approach

1. ✅ **Environment variables guaranteed to be loaded** before clients are created
2. ✅ **Singleton pattern** - clients created once and reused
3. ✅ **Better debugging** - logs show exactly when clients are initialized
4. ✅ **Graceful degradation** - still works with mock responses if keys missing
5. ✅ **No breaking changes** - API remains the same

## Testing Checklist

- [x] Server starts without errors
- [x] API keys confirmed loaded in logs
- [ ] Start a new match and verify real responses
- [ ] Check that both models (A and B) generate real responses
- [ ] Verify responses are different (not identical mock text)
- [ ] Complete evaluation and verify it saves correctly

## Current Status

✅ Backend server running: http://localhost:3001
✅ Frontend running: http://localhost:5173
✅ API keys loaded: Anthropic ✓, OpenAI ✓, Google ✓
✅ Lazy initialization implemented

**Next: Try a match in the frontend!**

The first time each model is used, you'll see initialization logs, then real AI-generated legal responses.
