"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ModelRepository_1 = require("../database/repositories/ModelRepository");
const router = (0, express_1.Router)();
/**
 * GET /api/models
 * Get all active models
 */
router.get('/', (req, res) => {
    try {
        const models = ModelRepository_1.modelRepository.findAllActive();
        res.json(models);
    }
    catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch models' });
    }
});
/**
 * GET /api/models/:id
 * Get model by ID
 */
router.get('/:id', (req, res) => {
    try {
        const model = ModelRepository_1.modelRepository.findById(req.params.id);
        if (!model) {
            return res.status(404).json({ error: 'Model not found' });
        }
        res.json(model);
    }
    catch (error) {
        console.error('Error fetching model:', error);
        res.status(500).json({ error: 'Failed to fetch model' });
    }
});
/**
 * GET /api/models/:id/performance
 * Get model performance by domain
 */
router.get('/:id/performance', (req, res) => {
    try {
        const domainPerformance = ModelRepository_1.modelRepository.getDomainPerformance(req.params.id);
        res.json(domainPerformance);
    }
    catch (error) {
        console.error('Error fetching performance:', error);
        res.status(500).json({ error: 'Failed to fetch performance data' });
    }
});
/**
 * GET /api/models/leaderboard
 * Get model leaderboard
 */
router.get('/leaderboard', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const leaderboard = ModelRepository_1.modelRepository.getLeaderboard(limit);
        res.json(leaderboard);
    }
    catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});
exports.default = router;
