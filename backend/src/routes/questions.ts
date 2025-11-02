import { Router } from 'express';
import { questionRepository } from '../database/repositories/QuestionRepository';
import { CreateQuestionRequest } from '@legal-llm-arena/shared';

const router = Router();

/**
 * POST /api/questions
 * Create a new question
 */
router.post('/', (req, res) => {
  try {
    const data: CreateQuestionRequest = req.body;

    const question = questionRepository.create({
      content: data.content,
      domain: data.domain,
      subdomain: data.subdomain,
      jurisdiction: data.jurisdiction,
      complexity: data.complexity,
      taskType: data.taskType,
      requiredReasoningTypes: data.requiredReasoningTypes,
      requiredCognitiveSkills: data.requiredCognitiveSkills,
      factPattern: data.factPattern,
      tags: data.tags,
      hasGroundTruth: false,
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

/**
 * GET /api/questions
 * Get all questions with pagination
 */
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const questions = questionRepository.findAll(limit, offset);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

/**
 * GET /api/questions/random
 * Get a random question
 */
router.get('/random', (req, res) => {
  try {
    const question = questionRepository.findRandom();

    if (!question) {
      return res.status(404).json({ error: 'No questions available' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching random question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

/**
 * GET /api/questions/:id
 * Get question by ID
 */
router.get('/:id', (req, res) => {
  try {
    const question = questionRepository.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

/**
 * GET /api/questions/domain/:domain
 * Get questions by domain
 */
router.get('/domain/:domain', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const questions = questionRepository.findByDomain(req.params.domain, limit);
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions by domain:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

export default router;
