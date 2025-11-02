"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseRepository = exports.ResponseRepository = void 0;
const db_1 = require("../db");
class ResponseRepository {
    /**
     * Create a new response
     */
    create(response) {
        const id = (0, db_1.generateId)();
        const timestamp = (0, db_1.now)();
        const stmt = db_1.db.prepare(`
      INSERT INTO responses (
        id, question_id, model_id, content,
        generated_at, tokens_used, latency_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, response.questionId, response.modelId, response.content, timestamp, response.tokensUsed || null, response.latencyMs || null);
        return {
            ...response,
            id,
            generatedAt: new Date(timestamp),
        };
    }
    /**
     * Get response by ID
     */
    findById(id) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM responses WHERE id = ?
    `);
        const row = stmt.get(id);
        if (!row)
            return null;
        return this.mapRow(row);
    }
    /**
     * Get responses for a question
     */
    findByQuestionId(questionId) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM responses
      WHERE question_id = ?
      ORDER BY generated_at DESC
    `);
        const rows = stmt.all(questionId);
        return rows.map(this.mapRow);
    }
    /**
     * Get responses by model
     */
    findByModelId(modelId, limit = 100) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM responses
      WHERE model_id = ?
      ORDER BY generated_at DESC
      LIMIT ?
    `);
        const rows = stmt.all(modelId, limit);
        return rows.map(this.mapRow);
    }
    /**
     * Check if response exists for question and model
     */
    existsForQuestionAndModel(questionId, modelId) {
        const stmt = db_1.db.prepare(`
      SELECT 1 FROM responses
      WHERE question_id = ? AND model_id = ?
      LIMIT 1
    `);
        return stmt.get(questionId, modelId) !== undefined;
    }
    /**
     * Map database row to LLMResponse
     */
    mapRow(row) {
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
exports.ResponseRepository = ResponseRepository;
exports.responseRepository = new ResponseRepository();
