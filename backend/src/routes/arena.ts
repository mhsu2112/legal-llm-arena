import { Router } from 'express';
import { questionRepository } from '../database/repositories/QuestionRepository';
import { modelRepository } from '../database/repositories/ModelRepository';
import { responseRepository } from '../database/repositories/ResponseRepository';
import { comparisonRepository } from '../database/repositories/ComparisonRepository';
import { errorAnnotationRepository } from '../database/repositories/ErrorAnnotationRepository';
import { generateResponse } from '../services/llmService';
import { calculateEloChange, getResultFromWinner } from '../services/eloService';
import { fetchMultipleUrls } from '../services/urlFetcherService';
import { GetArenaMatchResponse, SubmitComparisonRequest } from '@legal-llm-arena/shared';

const router = Router();

/**
 * POST /api/arena/match
 * Create a new arena match with custom or random question and models
 */
router.post('/match', async (req, res) => {
  try {
    const { customQuestion, urls } = req.body;

    // Fetch URL content if provided
    let urlContext = '';
    if (urls && Array.isArray(urls) && urls.length > 0) {
      console.log(`Fetching content from ${urls.length} URL(s)...`);
      const fetchedUrls = await fetchMultipleUrls(urls);

      // Build context from fetched URLs
      const successfulFetches = fetchedUrls.filter(f => !f.error && f.content);
      if (successfulFetches.length > 0) {
        urlContext = successfulFetches
          .map(f => `[Content from ${f.url}]\n${f.content}`)
          .join('\n\n---\n\n');
      }

      // Log any errors
      fetchedUrls.filter(f => f.error).forEach(f => {
        console.error(`Failed to fetch ${f.url}: ${f.error}`);
      });
    }

    // Get or create question
    let question;
    if (customQuestion && customQuestion.trim()) {
      // Create a temporary question for custom user input
      question = questionRepository.create({
        content: customQuestion.trim(),
        domain: 'general' as any,
        jurisdiction: 'us_federal' as any,
        complexity: 'intermediate' as any,
        taskType: 'legal_research' as any,
        requiredReasoningTypes: [],
        requiredCognitiveSkills: [],
        tags: ['custom', 'user-submitted'],
        hasGroundTruth: false,
        factPattern: urlContext || undefined,
      });
    } else {
      // Get random question from database
      question = questionRepository.findRandom();
      if (!question) {
        return res.status(404).json({ error: 'No questions available' });
      }

      // Add URL context to existing question if provided
      if (urlContext) {
        question.factPattern = question.factPattern
          ? `${question.factPattern}\n\n${urlContext}`
          : urlContext;
      }
    }

    // Get two random active models
    const activeModels = modelRepository.findAllActive();
    if (activeModels.length < 2) {
      return res.status(400).json({ error: 'Not enough active models' });
    }

    // Randomly select two different models
    const shuffled = activeModels.sort(() => Math.random() - 0.5);
    const modelA = shuffled[0];
    const modelB = shuffled[1];

    // Generate responses from both models
    console.log(`Generating responses for question: ${question.content.substring(0, 50)}...`);

    const [responseAResult, responseBResult] = await Promise.all([
      generateResponse({
        modelId: modelA.id,
        modelName: modelA.name,
        provider: modelA.provider,
        question: question.content,
        context: question.factPattern,
      }),
      generateResponse({
        modelId: modelB.id,
        modelName: modelB.name,
        provider: modelB.provider,
        question: question.content,
        context: question.factPattern,
      }),
    ]);

    // Save responses
    const responseA = responseRepository.create({
      questionId: question.id,
      modelId: modelA.id,
      content: responseAResult.content,
      tokensUsed: responseAResult.tokensUsed,
      latencyMs: responseAResult.latencyMs,
    });

    const responseB = responseRepository.create({
      questionId: question.id,
      modelId: modelB.id,
      content: responseBResult.content,
      tokensUsed: responseBResult.tokensUsed,
      latencyMs: responseBResult.latencyMs,
    });

    // Create comparison record
    const comparison = comparisonRepository.create({
      questionId: question.id,
      modelAId: modelA.id,
      modelBId: modelB.id,
      responseAId: responseA.id,
      responseBId: responseB.id,
    });

    // Return match data
    const matchResponse: GetArenaMatchResponse = {
      question,
      modelAId: modelA.id,
      modelBId: modelB.id,
      responseA,
      responseB,
      comparisonId: comparison.id,
    };

    res.json(matchResponse);
  } catch (error) {
    console.error('Error creating arena match:', error);
    res.status(500).json({ error: 'Failed to create arena match' });
  }
});

/**
 * POST /api/arena/submit
 * Submit comparison evaluation and update ELO ratings
 */
router.post('/submit', async (req, res) => {
  try {
    const data: SubmitComparisonRequest = req.body;

    // Get comparison
    const comparison = comparisonRepository.findById(data.comparisonId);
    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    // Get models
    const modelA = modelRepository.findById(comparison.modelAId);
    const modelB = modelRepository.findById(comparison.modelBId);

    if (!modelA || !modelB) {
      return res.status(404).json({ error: 'Models not found' });
    }

    // Calculate ELO changes
    const result = getResultFromWinner(
      comparison.modelAId,
      comparison.modelBId,
      data.winnerId || null
    );

    const eloChanges = calculateEloChange(
      modelA.eloRating,
      modelB.eloRating,
      modelA.totalComparisons,
      modelB.totalComparisons,
      result
    );

    // Update comparison
    comparisonRepository.complete(
      comparison.id,
      data.winnerId || null,
      eloChanges.playerAChange,
      eloChanges.playerBChange
    );

    // Update model ratings
    const aWon = data.winnerId === modelA.id;
    const bWon = data.winnerId === modelB.id;
    const tied = data.winnerId === null || data.winnerId === undefined;

    modelRepository.updateElo(modelA.id, eloChanges.playerAChange, aWon, tied);
    modelRepository.updateElo(modelB.id, eloChanges.playerBChange, bWon, tied);

    // Save error annotations if provided
    if (data.errorAnnotations && data.errorAnnotations.length > 0) {
      for (const annotation of data.errorAnnotations) {
        errorAnnotationRepository.create(annotation);
      }
    }

    res.json({
      success: true,
      eloChanges: {
        modelA: eloChanges.playerAChange,
        modelB: eloChanges.playerBChange,
      },
      newRatings: {
        modelA: eloChanges.playerANewRating,
        modelB: eloChanges.playerBNewRating,
      },
    });
  } catch (error) {
    console.error('Error submitting comparison:', error);
    res.status(500).json({ error: 'Failed to submit comparison' });
  }
});

/**
 * GET /api/arena/leaderboard
 * Get current leaderboard
 */
router.get('/leaderboard', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = modelRepository.getLeaderboard(limit);

    res.json({
      overall: leaderboard,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
