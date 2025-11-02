import { db, generateId, now } from '../db';
import { Comparison, DetailedEvaluation } from '@legal-llm-arena/shared';

export class ComparisonRepository {
  /**
   * Create a new comparison
   */
  create(comparison: Omit<Comparison, 'id' | 'createdAt'>): Comparison {
    const id = generateId();
    const timestamp = now();

    const stmt = db.prepare(`
      INSERT INTO comparisons (
        id, question_id, model_a_id, model_b_id,
        response_a_id, response_b_id,
        winner_id, evaluator_id,
        model_a_elo_before, model_b_elo_before,
        model_a_elo_change, model_b_elo_change,
        created_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Get current ELO ratings
    const modelAStmt = db.prepare('SELECT elo_rating FROM models WHERE id = ?');
    const modelBStmt = db.prepare('SELECT elo_rating FROM models WHERE id = ?');

    const modelAElo = (modelAStmt.get(comparison.modelAId) as any)?.elo_rating || 1500;
    const modelBElo = (modelBStmt.get(comparison.modelBId) as any)?.elo_rating || 1500;

    stmt.run(
      id,
      comparison.questionId,
      comparison.modelAId,
      comparison.modelBId,
      comparison.responseAId,
      comparison.responseBId,
      comparison.winnerId || null,
      comparison.evaluatorId || null,
      modelAElo,
      modelBElo,
      comparison.modelAEloChange || null,
      comparison.modelBEloChange || null,
      timestamp,
      comparison.completedAt ? comparison.completedAt.toISOString() : null
    );

    // Insert detailed evaluations if provided
    if (comparison.evaluations && comparison.evaluations.length > 0) {
      const evalStmt = db.prepare(`
        INSERT INTO detailed_evaluations (
          id, comparison_id, criterion, model_a_score, model_b_score, notes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const evaluation of comparison.evaluations) {
        evalStmt.run(
          generateId(),
          id,
          evaluation.criterion,
          evaluation.modelAScore,
          evaluation.modelBScore,
          evaluation.notes || null
        );
      }
    }

    return {
      ...comparison,
      id,
      createdAt: new Date(timestamp),
    };
  }

  /**
   * Update comparison with winner and ELO changes
   */
  complete(
    id: string,
    winnerId: string | null,
    eloChangeA: number,
    eloChangeB: number
  ): void {
    const stmt = db.prepare(`
      UPDATE comparisons
      SET
        winner_id = ?,
        model_a_elo_change = ?,
        model_b_elo_change = ?,
        completed_at = ?
      WHERE id = ?
    `);

    stmt.run(winnerId, eloChangeA, eloChangeB, now(), id);
  }

  /**
   * Get comparison by ID
   */
  findById(id: string): Comparison | null {
    const stmt = db.prepare(`
      SELECT * FROM comparisons WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    // Get detailed evaluations
    const evalStmt = db.prepare(`
      SELECT * FROM detailed_evaluations WHERE comparison_id = ?
    `);
    const evaluations = evalStmt.all(id) as any[];

    return this.mapRow(row, evaluations);
  }

  /**
   * Get comparisons for a question
   */
  findByQuestionId(questionId: string): Comparison[] {
    const stmt = db.prepare(`
      SELECT * FROM comparisons
      WHERE question_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(questionId) as any[];
    return rows.map(row => this.mapRow(row, []));
  }

  /**
   * Get completed comparisons
   */
  findCompleted(limit: number = 100): Comparison[] {
    const stmt = db.prepare(`
      SELECT * FROM comparisons
      WHERE completed_at IS NOT NULL
      ORDER BY completed_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(limit) as any[];
    return rows.map(row => this.mapRow(row, []));
  }

  /**
   * Map database row to Comparison
   */
  private mapRow(row: any, evaluations: any[]): Comparison {
    return {
      id: row.id,
      questionId: row.question_id,
      modelAId: row.model_a_id,
      modelBId: row.model_b_id,
      responseAId: row.response_a_id,
      responseBId: row.response_b_id,
      winnerId: row.winner_id,
      evaluatorId: row.evaluator_id,
      modelAEloChange: row.model_a_elo_change,
      modelBEloChange: row.model_b_elo_change,
      createdAt: new Date(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      evaluations: evaluations.map(e => ({
        criterion: e.criterion,
        modelAScore: e.model_a_score,
        modelBScore: e.model_b_score,
        notes: e.notes,
      })),
    };
  }
}

export const comparisonRepository = new ComparisonRepository();
