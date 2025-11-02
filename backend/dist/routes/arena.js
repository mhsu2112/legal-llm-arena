"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const QuestionRepository_1 = require("../database/repositories/QuestionRepository");
const ModelRepository_1 = require("../database/repositories/ModelRepository");
const ResponseRepository_1 = require("../database/repositories/ResponseRepository");
const ComparisonRepository_1 = require("../database/repositories/ComparisonRepository");
const ErrorAnnotationRepository_1 = require("../database/repositories/ErrorAnnotationRepository");
const llmService_1 = require("../services/llmService");
const eloService_1 = require("../services/eloService");
const router = (0, express_1.Router)();
/**
 * POST /api/arena/match
 * Create a new arena match with random question and models
 */
router.post('/match', async (req, res) => {
    try {
        // Get random question
        const question = QuestionRepository_1.questionRepository.findRandom();
        if (!question) {
            return res.status(404).json({ error: 'No questions available' });
        }
        // Get two random active models
        const activeModels = ModelRepository_1.modelRepository.findAllActive();
        if (activeModels.length < 2) {
            return res.status(400).json({ error: 'Not enough active models' });
        }
        // Randomly select two different models
        const shuffled = activeModels.sort(() => Math.random() - 0.5);
        const modelA = shuffled[0];
        const modelB = shuffled[1];
        // Generate responses from both models
        console.log(`Generating responses for question ${question.id}...`);
        const [responseAResult, responseBResult] = await Promise.all([
            (0, llmService_1.generateResponse)({
                modelId: modelA.id,
                modelName: modelA.name,
                provider: modelA.provider,
                question: question.content,
                context: question.factPattern,
            }),
            (0, llmService_1.generateResponse)({
                modelId: modelB.id,
                modelName: modelB.name,
                provider: modelB.provider,
                question: question.content,
                context: question.factPattern,
            }),
        ]);
        // Save responses
        const responseA = ResponseRepository_1.responseRepository.create({
            questionId: question.id,
            modelId: modelA.id,
            content: responseAResult.content,
            tokensUsed: responseAResult.tokensUsed,
            latencyMs: responseAResult.latencyMs,
        });
        const responseB = ResponseRepository_1.responseRepository.create({
            questionId: question.id,
            modelId: modelB.id,
            content: responseBResult.content,
            tokensUsed: responseBResult.tokensUsed,
            latencyMs: responseBResult.latencyMs,
        });
        // Create comparison record
        const comparison = ComparisonRepository_1.comparisonRepository.create({
            questionId: question.id,
            modelAId: modelA.id,
            modelBId: modelB.id,
            responseAId: responseA.id,
            responseBId: responseB.id,
        });
        // Return match data
        const matchResponse = {
            question,
            modelAId: modelA.id,
            modelBId: modelB.id,
            responseA,
            responseB,
            comparisonId: comparison.id,
        };
        res.json(matchResponse);
    }
    catch (error) {
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
        const data = req.body;
        // Get comparison
        const comparison = ComparisonRepository_1.comparisonRepository.findById(data.comparisonId);
        if (!comparison) {
            return res.status(404).json({ error: 'Comparison not found' });
        }
        // Get models
        const modelA = ModelRepository_1.modelRepository.findById(comparison.modelAId);
        const modelB = ModelRepository_1.modelRepository.findById(comparison.modelBId);
        if (!modelA || !modelB) {
            return res.status(404).json({ error: 'Models not found' });
        }
        // Calculate ELO changes
        const result = (0, eloService_1.getResultFromWinner)(comparison.modelAId, comparison.modelBId, data.winnerId || null);
        const eloChanges = (0, eloService_1.calculateEloChange)(modelA.eloRating, modelB.eloRating, modelA.totalComparisons, modelB.totalComparisons, result);
        // Update comparison
        ComparisonRepository_1.comparisonRepository.complete(comparison.id, data.winnerId || null, eloChanges.playerAChange, eloChanges.playerBChange);
        // Update model ratings
        const aWon = data.winnerId === modelA.id;
        const bWon = data.winnerId === modelB.id;
        const tied = data.winnerId === null || data.winnerId === undefined;
        ModelRepository_1.modelRepository.updateElo(modelA.id, eloChanges.playerAChange, aWon, tied);
        ModelRepository_1.modelRepository.updateElo(modelB.id, eloChanges.playerBChange, bWon, tied);
        // Save error annotations if provided
        if (data.errorAnnotations && data.errorAnnotations.length > 0) {
            for (const annotation of data.errorAnnotations) {
                ErrorAnnotationRepository_1.errorAnnotationRepository.create(annotation);
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
    }
    catch (error) {
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
        const limit = parseInt(req.query.limit) || 50;
        const leaderboard = ModelRepository_1.modelRepository.getLeaderboard(limit);
        res.json({
            overall: leaderboard,
            lastUpdated: new Date(),
        });
    }
    catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});
exports.default = router;
