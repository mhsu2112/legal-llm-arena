"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionRepository = exports.QuestionRepository = void 0;
const db_1 = require("../db");
class QuestionRepository {
    /**
     * Create a new question
     */
    create(question) {
        const id = (0, db_1.generateId)();
        const timestamp = (0, db_1.now)();
        const stmt = db_1.db.prepare(`
      INSERT INTO questions (
        id, content, domain, subdomain, jurisdiction, complexity, task_type,
        fact_pattern, relevant_statutes, relevant_cases,
        required_reasoning_types, required_cognitive_skills,
        tags, expected_response_length, has_ground_truth, ground_truth_answer,
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, question.content, question.domain, question.subdomain || null, question.jurisdiction, question.complexity, question.taskType, question.factPattern || null, (0, db_1.stringifyJsonField)(question.relevantStatutes), (0, db_1.stringifyJsonField)(question.relevantCases), (0, db_1.stringifyJsonField)(question.requiredReasoningTypes), (0, db_1.stringifyJsonField)(question.requiredCognitiveSkills), (0, db_1.stringifyJsonField)(question.tags), question.expectedResponseLength || null, question.hasGroundTruth ? 1 : 0, question.groundTruthAnswer || null, question.createdBy || null, timestamp, timestamp);
        return {
            ...question,
            id,
            createdAt: new Date(timestamp),
            updatedAt: new Date(timestamp),
        };
    }
    /**
     * Get question by ID
     */
    findById(id) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM questions WHERE id = ?
    `);
        const row = stmt.get(id);
        if (!row)
            return null;
        return this.mapRow(row);
    }
    /**
     * Get all questions
     */
    findAll(limit = 100, offset = 0) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM questions
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
        const rows = stmt.all(limit, offset);
        return rows.map(this.mapRow);
    }
    /**
     * Get random question
     */
    findRandom() {
        const stmt = db_1.db.prepare(`
      SELECT * FROM questions
      ORDER BY RANDOM()
      LIMIT 1
    `);
        const row = stmt.get();
        if (!row)
            return null;
        return this.mapRow(row);
    }
    /**
     * Find questions by domain
     */
    findByDomain(domain, limit = 50) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM questions
      WHERE domain = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
        const rows = stmt.all(domain, limit);
        return rows.map(this.mapRow);
    }
    /**
     * Find questions by complexity
     */
    findByComplexity(complexity, limit = 50) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM questions
      WHERE complexity = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
        const rows = stmt.all(complexity, limit);
        return rows.map(this.mapRow);
    }
    /**
     * Map database row to LegalQuestion
     */
    mapRow(row) {
        return {
            id: row.id,
            content: row.content,
            domain: row.domain,
            subdomain: row.subdomain,
            jurisdiction: row.jurisdiction,
            complexity: row.complexity,
            taskType: row.task_type,
            factPattern: row.fact_pattern,
            relevantStatutes: (0, db_1.parseJsonField)(row.relevant_statutes),
            relevantCases: (0, db_1.parseJsonField)(row.relevant_cases),
            requiredReasoningTypes: (0, db_1.parseJsonField)(row.required_reasoning_types),
            requiredCognitiveSkills: (0, db_1.parseJsonField)(row.required_cognitive_skills),
            tags: (0, db_1.parseJsonField)(row.tags),
            expectedResponseLength: row.expected_response_length,
            hasGroundTruth: row.has_ground_truth === 1,
            groundTruthAnswer: row.ground_truth_answer,
            createdBy: row.created_by,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
}
exports.QuestionRepository = QuestionRepository;
exports.questionRepository = new QuestionRepository();
