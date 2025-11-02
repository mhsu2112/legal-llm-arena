import { db, generateId, now } from '../db';
import { LLMModel } from '@legal-llm-arena/shared';

export class ModelRepository {
  /**
   * Create a new model
   */
  create(model: Omit<LLMModel, 'id' | 'createdAt' | 'updatedAt'>): LLMModel {
    const id = generateId();
    const timestamp = now();

    const stmt = db.prepare(`
      INSERT INTO models (
        id, name, provider, version, elo_rating,
        total_comparisons, wins, losses, ties, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      model.name,
      model.provider,
      model.version,
      model.eloRating,
      model.totalComparisons,
      model.wins,
      model.losses,
      model.ties,
      model.isActive ? 1 : 0,
      timestamp,
      timestamp
    );

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
  findById(id: string): LLMModel | null {
    const stmt = db.prepare(`
      SELECT * FROM models WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return this.mapRow(row);
  }

  /**
   * Get all active models
   */
  findAllActive(): LLMModel[] {
    const stmt = db.prepare(`
      SELECT * FROM models WHERE is_active = 1 ORDER BY elo_rating DESC
    `);

    const rows = stmt.all() as any[];
    return rows.map(this.mapRow);
  }

  /**
   * Update model ELO rating
   */
  updateElo(id: string, eloChange: number, won: boolean, tied: boolean): void {
    const stmt = db.prepare(`
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

    stmt.run(
      eloChange,
      won ? 1 : 0,
      !won && !tied ? 1 : 0,
      tied ? 1 : 0,
      now(),
      id
    );
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit: number = 50): LLMModel[] {
    const stmt = db.prepare(`
      SELECT * FROM models
      WHERE is_active = 1
      ORDER BY elo_rating DESC
      LIMIT ?
    `);

    const rows = stmt.all(limit) as any[];
    return rows.map(this.mapRow);
  }

  /**
   * Get model performance by domain
   */
  getDomainPerformance(modelId: string): any[] {
    const stmt = db.prepare(`
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

    return stmt.all(modelId) as any[];
  }

  /**
   * Map database row to LLMModel
   */
  private mapRow(row: any): LLMModel {
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

export const modelRepository = new ModelRepository();
