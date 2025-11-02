"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const ErrorAnnotationRepository_1 = require("../database/repositories/ErrorAnnotationRepository");
const router = (0, express_1.Router)();
/**
 * GET /api/analytics/overview
 * Get overall system statistics
 */
router.get('/overview', (req, res) => {
    try {
        const stats = db_1.db
            .prepare(`
      SELECT
        (SELECT COUNT(*) FROM models WHERE is_active = 1) as active_models,
        (SELECT COUNT(*) FROM questions) as total_questions,
        (SELECT COUNT(*) FROM comparisons WHERE completed_at IS NOT NULL) as completed_comparisons,
        (SELECT COUNT(*) FROM responses) as total_responses,
        (SELECT COUNT(*) FROM error_annotations) as total_errors
    `)
            .get();
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching overview:', error);
        res.status(500).json({ error: 'Failed to fetch analytics overview' });
    }
});
/**
 * GET /api/analytics/domain-performance
 * Get performance metrics by domain
 */
router.get('/domain-performance', (req, res) => {
    try {
        const domainStats = db_1.db
            .prepare(`
      SELECT
        q.domain,
        COUNT(DISTINCT c.id) as total_comparisons,
        COUNT(DISTINCT q.id) as unique_questions,
        AVG(
          CASE
            WHEN c.winner_id IS NULL THEN 0.5
            ELSE 1.0
          END
        ) as avg_decisiveness
      FROM questions q
      LEFT JOIN comparisons c ON q.id = c.question_id
      WHERE c.completed_at IS NOT NULL
      GROUP BY q.domain
      ORDER BY total_comparisons DESC
    `)
            .all();
        res.json(domainStats);
    }
    catch (error) {
        console.error('Error fetching domain performance:', error);
        res.status(500).json({ error: 'Failed to fetch domain performance' });
    }
});
/**
 * GET /api/analytics/error-frequency
 * Get error frequency analysis
 */
router.get('/error-frequency', (req, res) => {
    try {
        const modelId = req.query.modelId;
        const errorFrequency = ErrorAnnotationRepository_1.errorAnnotationRepository.getErrorFrequency(modelId);
        res.json(errorFrequency);
    }
    catch (error) {
        console.error('Error fetching error frequency:', error);
        res.status(500).json({ error: 'Failed to fetch error frequency' });
    }
});
/**
 * GET /api/analytics/complexity-analysis
 * Get performance by complexity level
 */
router.get('/complexity-analysis', (req, res) => {
    try {
        const complexityStats = db_1.db
            .prepare(`
      SELECT
        q.complexity,
        COUNT(DISTINCT c.id) as total_comparisons,
        COUNT(DISTINCT CASE WHEN c.winner_id IS NULL THEN c.id END) as ties,
        CAST(COUNT(DISTINCT CASE WHEN c.winner_id IS NULL THEN c.id END) AS REAL) /
          COUNT(DISTINCT c.id) as tie_rate
      FROM questions q
      JOIN comparisons c ON q.id = c.question_id
      WHERE c.completed_at IS NOT NULL
      GROUP BY q.complexity
      ORDER BY
        CASE q.complexity
          WHEN 'basic' THEN 1
          WHEN 'intermediate' THEN 2
          WHEN 'advanced' THEN 3
          WHEN 'expert' THEN 4
        END
    `)
            .all();
        res.json(complexityStats);
    }
    catch (error) {
        console.error('Error fetching complexity analysis:', error);
        res.status(500).json({ error: 'Failed to fetch complexity analysis' });
    }
});
/**
 * GET /api/analytics/model-comparison
 * Compare two models head-to-head
 */
router.get('/model-comparison', (req, res) => {
    try {
        const { modelAId, modelBId } = req.query;
        if (!modelAId || !modelBId) {
            return res.status(400).json({ error: 'Both modelAId and modelBId are required' });
        }
        const headToHead = db_1.db
            .prepare(`
      SELECT
        COUNT(*) as total_matches,
        SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END) as model_a_wins,
        SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END) as model_b_wins,
        SUM(CASE WHEN winner_id IS NULL THEN 1 ELSE 0 END) as ties
      FROM comparisons
      WHERE
        (model_a_id = ? AND model_b_id = ?)
        OR (model_a_id = ? AND model_b_id = ?)
        AND completed_at IS NOT NULL
    `)
            .get(modelAId, modelBId, modelAId, modelBId, modelBId, modelAId);
        // Get domain breakdown
        const domainBreakdown = db_1.db
            .prepare(`
      SELECT
        q.domain,
        COUNT(*) as matches,
        SUM(CASE WHEN c.winner_id = ? THEN 1 ELSE 0 END) as model_a_wins,
        SUM(CASE WHEN c.winner_id = ? THEN 1 ELSE 0 END) as model_b_wins
      FROM comparisons c
      JOIN questions q ON c.question_id = q.id
      WHERE
        ((c.model_a_id = ? AND c.model_b_id = ?)
         OR (c.model_a_id = ? AND c.model_b_id = ?))
        AND c.completed_at IS NOT NULL
      GROUP BY q.domain
      ORDER BY matches DESC
    `)
            .all(modelAId, modelBId, modelAId, modelBId, modelBId, modelAId);
        res.json({
            headToHead,
            domainBreakdown,
        });
    }
    catch (error) {
        console.error('Error fetching model comparison:', error);
        res.status(500).json({ error: 'Failed to fetch model comparison' });
    }
});
/**
 * GET /api/analytics/challenging-questions
 * Identify questions with highest tie rates or most errors
 */
router.get('/challenging-questions', (req, res) => {
    try {
        const challengingQuestions = db_1.db
            .prepare(`
      SELECT
        q.id,
        q.content,
        q.domain,
        q.complexity,
        COUNT(DISTINCT c.id) as total_comparisons,
        SUM(CASE WHEN c.winner_id IS NULL THEN 1 ELSE 0 END) as ties,
        CAST(SUM(CASE WHEN c.winner_id IS NULL THEN 1 ELSE 0 END) AS REAL) /
          COUNT(DISTINCT c.id) as tie_rate,
        COUNT(DISTINCT e.id) as error_count
      FROM questions q
      LEFT JOIN comparisons c ON q.id = c.question_id AND c.completed_at IS NOT NULL
      LEFT JOIN responses r ON q.id = r.question_id
      LEFT JOIN error_annotations e ON r.id = e.response_id
      GROUP BY q.id
      HAVING total_comparisons >= 3
      ORDER BY tie_rate DESC, error_count DESC
      LIMIT 20
    `)
            .all();
        res.json(challengingQuestions);
    }
    catch (error) {
        console.error('Error fetching challenging questions:', error);
        res.status(500).json({ error: 'Failed to fetch challenging questions' });
    }
});
exports.default = router;
