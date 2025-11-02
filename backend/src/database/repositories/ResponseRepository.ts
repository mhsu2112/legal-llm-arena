import { db, generateId, now } from '../db';
import { LLMResponse } from '@legal-llm-arena/shared';

export class ResponseRepository {
  /**
   * Create a new response
   */
  create(response: Omit<LLMResponse, 'id' | 'generatedAt'>): LLMResponse {
    const id = generateId();
    const timestamp = now();

    const stmt = db.prepare(`
      INSERT INTO responses (
        id, question_id, model_id, content,
        generated_at, tokens_used, latency_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      response.questionId,
      response.modelId,
      response.content,
      timestamp,
      response.tokensUsed || null,
      response.latencyMs || null
    );

    return {
      ...response,
      id,
      generatedAt: new Date(timestamp),
    };
  }

  /**
   * Get response by ID
   */
  findById(id: string): LLMResponse | null {
    const stmt = db.prepare(`
      SELECT * FROM responses WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.mapRow(row);
  }

  /**
   * Get responses for a question
   */
  findByQuestionId(questionId: string): LLMResponse[] {
    const stmt = db.prepare(`
      SELECT * FROM responses
      WHERE question_id = ?
      ORDER BY generated_at DESC
    `);

    const rows = stmt.all(questionId) as any[];
    return rows.map(this.mapRow);
  }

  /**
   * Get responses by model
   */
  findByModelId(modelId: string, limit: number = 100): LLMResponse[] {
    const stmt = db.prepare(`
      SELECT * FROM responses
      WHERE model_id = ?
      ORDER BY generated_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(modelId, limit) as any[];
    return rows.map(this.mapRow);
  }

  /**
   * Check if response exists for question and model
   */
  existsForQuestionAndModel(questionId: string, modelId: string): boolean {
    const stmt = db.prepare(`
      SELECT 1 FROM responses
      WHERE question_id = ? AND model_id = ?
      LIMIT 1
    `);

    return stmt.get(questionId, modelId) !== undefined;
  }

  /**
   * Map database row to LLMResponse
   */
  private mapRow(row: any): LLMResponse {
    return {
      id: row.id,
      questionId: row.question_id,
      modelId: row.model_id,
      content: row.content,
      generatedAt: new Date(row.generated_at),
      tokensUsed: row.tokens_used,
      latencyMs: row.latency_ms,
    };
  }
}

export const responseRepository = new ResponseRepository();
