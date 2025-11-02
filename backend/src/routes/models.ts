import { Router } from 'express';
import { modelRepository } from '../database/repositories/ModelRepository';

const router = Router();

/**
 * GET /api/models
 * Get all active models
 */
router.get('/', (req, res) => {
  try {
    const models = modelRepository.findAllActive();
    res.json(models);
  } catch (error) {
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
    const model = modelRepository.findById(req.params.id);

    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json(model);
  } catch (error) {
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
    const domainPerformance = modelRepository.getDomainPerformance(req.params.id);
    res.json(domainPerformance);
  } catch (error) {
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
    const limit = parseInt(req.query.limit as string) || 50;
    const leaderboard = modelRepository.getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
