"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelRepository = exports.ModelRepository = void 0;
const db_1 = require("../db");
class ModelRepository {
    /**
     * Create a new model
     */
    create(model) {
        const id = (0, db_1.generateId)();
        const timestamp = (0, db_1.now)();
        const stmt = db_1.db.prepare(`
      INSERT INTO models (
        id, name, provider, version, elo_rating,
        total_comparisons, wins, losses, ties, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, model.name, model.provider, model.version, model.eloRating, model.totalComparisons, model.wins, model.losses, model.ties, model.isActive ? 1 : 0, timestamp, timestamp);
        return {
            ...model,
            id,
            createdAt: new Date(timestamp),
            updatedAt: new Date(timestamp),
        };
    }
    /**
     * Get model by ID
     */
    findById(id) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM models WHERE id = ?
    `);
        const row = stmt.get(id);
        if (!row)
            return null;
        return this.mapRow(row);
    }
    /**
     * Get all active models
     */
    findAllActive() {
        const stmt = db_1.db.prepare(`
      SELECT * FROM models WHERE is_active = 1 ORDER BY elo_rating DESC
    `);
        const rows = stmt.all();
        return rows.map(this.mapRow);
    }
    /**
     * Update model ELO rating
     */
    updateElo(id, eloChange, won, tied) {
        const stmt = db_1.db.prepare(`
      UPDATE models
      SET
        elo_rating = elo_rating + ?,
        total_comparisons = total_comparisons + 1,
        wins = wins + ?,
        losses = losses + ?,
        ties = ties + ?,
        updated_at = ?
      WHERE id = ?
    `);
        stmt.run(eloChange, won ? 1 : 0, !won && !tied ? 1 : 0, tied ? 1 : 0, (0, db_1.now)(), id);
    }
    /**
     * Get leaderboard
     */
    getLeaderboard(limit = 50) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM models
      WHERE is_active = 1 AND total_comparisons >= 10
      ORDER BY elo_rating DESC
      LIMIT ?
    `);
        const rows = stmt.all(limit);
        return rows.map(this.mapRow);
    }
    /**
     * Get model performance by domain
     */
    getDomainPerformance(modelId) {
        const stmt = db_1.db.prepare(`
      SELECT
        domain,
        comparisons,
        wins,
        ties,
        win_rate
      FROM domain_performance
      WHERE model_id = ?
      ORDER BY comparisons DESC
    `);
        return stmt.all(modelId);
    }
    /**
     * Map database row to LLMModel
     */
    mapRow(row) {
        return {
            id: row.id,
            name: row.name,
            provider: row.provider,
            version: row.version,
            eloRating: row.elo_rating,
            totalComparisons: row.total_comparisons,
            wins: row.wins,
            losses: row.losses,
            ties: row.ties,
            isActive: row.is_active === 1,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
}
exports.ModelRepository = ModelRepository;
exports.modelRepository = new ModelRepository();
