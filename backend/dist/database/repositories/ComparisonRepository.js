"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparisonRepository = exports.ComparisonRepository = void 0;
const db_1 = require("../db");
class ComparisonRepository {
    /**
     * Create a new comparison
     */
    create(comparison) {
        const id = (0, db_1.generateId)();
        const timestamp = (0, db_1.now)();
        const stmt = db_1.db.prepare(`
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
        const modelAStmt = db_1.db.prepare('SELECT elo_rating FROM models WHERE id = ?');
        const modelBStmt = db_1.db.prepare('SELECT elo_rating FROM models WHERE id = ?');
        const modelAElo = modelAStmt.get(comparison.modelAId)?.elo_rating || 1500;
        const modelBElo = modelBStmt.get(comparison.modelBId)?.elo_rating || 1500;
        stmt.run(id, comparison.questionId, comparison.modelAId, comparison.modelBId, comparison.responseAId, comparison.responseBId, comparison.winnerId || null, comparison.evaluatorId || null, modelAElo, modelBElo, comparison.modelAEloChange || null, comparison.modelBEloChange || null, timestamp, comparison.completedAt ? comparison.completedAt.toISOString() : null);
        // Insert detailed evaluations if provided
        if (comparison.evaluations && comparison.evaluations.length > 0) {
            const evalStmt = db_1.db.prepare(`
        INSERT INTO detailed_evaluations (
          id, comparison_id, criterion, model_a_score, model_b_score, notes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
            for (const evaluation of comparison.evaluations) {
                evalStmt.run((0, db_1.generateId)(), id, evaluation.criterion, evaluation.modelAScore, evaluation.modelBScore, evaluation.notes || null);
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
    complete(id, winnerId, eloChangeA, eloChangeB) {
        const stmt = db_1.db.prepare(`
      UPDATE comparisons
      SET
        winner_id = ?,
        model_a_elo_change = ?,
        model_b_elo_change = ?,
        completed_at = ?
      WHERE id = ?
    `);
        stmt.run(winnerId, eloChangeA, eloChangeB, (0, db_1.now)(), id);
    }
    /**
     * Get comparison by ID
     */
    findById(id) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM comparisons WHERE id = ?
    `);
        const row = stmt.get(id);
        if (!row)
            return null;
        // Get detailed evaluations
        const evalStmt = db_1.db.prepare(`
      SELECT * FROM detailed_evaluations WHERE comparison_id = ?
    `);
        const evaluations = evalStmt.all(id);
        return this.mapRow(row, evaluations);
    }
    /**
     * Get comparisons for a question
     */
    findByQuestionId(questionId) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM comparisons
      WHERE question_id = ?
      ORDER BY created_at DESC
    `);
        const rows = stmt.all(questionId);
        return rows.map(row => this.mapRow(row, []));
    }
    /**
     * Get completed comparisons
     */
    findCompleted(limit = 100) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM comparisons
      WHERE completed_at IS NOT NULL
      ORDER BY completed_at DESC
      LIMIT ?
    `);
        const rows = stmt.all(limit);
        return rows.map(row => this.mapRow(row, []));
    }
    /**
     * Map database row to Comparison
     */
    mapRow(row, evaluations) {
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
exports.ComparisonRepository = ComparisonRepository;
exports.comparisonRepository = new ComparisonRepository();
