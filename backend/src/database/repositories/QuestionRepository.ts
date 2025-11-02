import { db, generateId, now, parseJsonField, stringifyJsonField } from '../db';
import { LegalQuestion } from '@legal-llm-arena/shared';

export class QuestionRepository {
  /**
   * Create a new question
   */
  create(question: Omit<LegalQuestion, 'id' | 'createdAt' | 'updatedAt'>): LegalQuestion {
    const id = generateId();
    const timestamp = now();

    const stmt = db.prepare(`
      INSERT INTO questions (
        id, content, domain, subdomain, jurisdiction, complexity, task_type,
        fact_pattern, relevant_statutes, relevant_cases,
        required_reasoning_types, required_cognitive_skills,
        tags, expected_response_length, has_ground_truth, ground_truth_answer,
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      question.content,
      question.domain,
      question.subdomain || null,
      question.jurisdiction,
      question.complexity,
      question.taskType,
      question.factPattern || null,
      stringifyJsonField(question.relevantStatutes),
      stringifyJsonField(question.relevantCases),
      stringifyJsonField(question.requiredReasoningTypes),
      stringifyJsonField(question.requiredCognitiveSkills),
      stringifyJsonField(question.tags),
      question.expectedResponseLength || null,
      question.hasGroundTruth ? 1 : 0,
      question.groundTruthAnswer || null,
      question.createdBy || null,
      timestamp,
      timestamp
    );

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
  findById(id: string): LegalQuestion | null {
    const stmt = db.prepare(`
      SELECT * FROM questions WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.mapRow(row);
  }

  /**
   * Get all questions
   */
  findAll(limit: number = 100, offset: number = 0): LegalQuestion[] {
    const stmt = db.prepare(`
      SELECT * FROM questions
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(limit, offset) as any[];
    return rows.map(this.mapRow);
  }

  /**
   * Get random question
   */
  findRandom(): LegalQuestion | null {
    const stmt = db.prepare(`
      SELECT * FROM questions
      ORDER BY RANDOM()
      LIMIT 1
    `);

    const row = stmt.get() as any;
    if (!row) return null;

    return this.mapRow(row);
  }

  /**
   * Find questions by domain
   */
  findByDomain(domain: string, limit: number = 50): LegalQuestion[] {
    const stmt = db.prepare(`
      SELECT * FROM questions
      WHERE domain = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(domain, limit) as any[];
    return rows.map(this.mapRow);
  }

  /**
   * Find questions by complexity
   */
  findByComplexity(complexity: string, limit: number = 50): LegalQuestion[] {
    const stmt = db.prepare(`
      SELECT * FROM questions
      WHERE complexity = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(complexity, limit) as any[];
    return rows.map(this.mapRow);
  }

  /**
   * Map database row to LegalQuestion
   */
  private mapRow(row: any): LegalQuestion {
    return {
      id: row.id,
      content: row.content,
      domain: row.domain,
      subdomain: row.subdomain,
      jurisdiction: row.jurisdiction,
      complexity: row.complexity,
      taskType: row.task_type,
      factPattern: row.fact_pattern,
      relevantStatutes: parseJsonField(row.relevant_statutes),
      relevantCases: parseJsonField(row.relevant_cases),
      requiredReasoningTypes: parseJsonField(row.required_reasoning_types),
      requiredCognitiveSkills: parseJsonField(row.required_cognitive_skills),
      tags: parseJsonField(row.tags),
      expectedResponseLength: row.expected_response_length,
      hasGroundTruth: row.has_ground_truth === 1,
      groundTruthAnswer: row.ground_truth_answer,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export const questionRepository = new QuestionRepository();
