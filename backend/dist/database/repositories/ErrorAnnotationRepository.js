"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorAnnotationRepository = exports.ErrorAnnotationRepository = void 0;
const db_1 = require("../db");
class ErrorAnnotationRepository {
    /**
     * Create a new error annotation
     */
    create(annotation) {
        const id = (0, db_1.generateId)();
        const timestamp = (0, db_1.now)();
        const stmt = db_1.db.prepare(`
      INSERT INTO error_annotations (
        id, response_id, error_type, severity, description,
        text_snippet, suggested_correction, annotator_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, annotation.responseId, annotation.errorType, annotation.severity, annotation.description, annotation.textSnippet || null, annotation.suggestedCorrection || null, annotation.annotatorId || null, timestamp);
        return {
            ...annotation,
            id,
            createdAt: new Date(timestamp),
        };
    }
    /**
     * Get annotations for a response
     */
    findByResponseId(responseId) {
        const stmt = db_1.db.prepare(`
      SELECT * FROM error_annotations
      WHERE response_id = ?
      ORDER BY created_at DESC
    `);
        const rows = stmt.all(responseId);
        return rows.map(this.mapRow);
    }
    /**
     * Get error frequency by type
     */
    getErrorFrequency(modelId) {
        let query = `
      SELECT
        e.error_type,
        e.severity,
        COUNT(*) as frequency,
        q.domain
      FROM error_annotations e
      JOIN responses r ON e.response_id = r.id
      JOIN questions q ON r.question_id = q.id
    `;
        if (modelId) {
            query += ` WHERE r.model_id = ?`;
        }
        query += ` GROUP BY e.error_type, e.severity, q.domain ORDER BY frequency DESC`;
        const stmt = db_1.db.prepare(query);
        if (modelId) {
            return stmt.all(modelId);
        }
        else {
            return stmt.all();
        }
    }
    /**
     * Map database row to ErrorAnnotation
     */
    mapRow(row) {
        return {
            id: row.id,
            responseId: row.response_id,
            errorType: row.error_type,
            severity: row.severity,
            description: row.description,
            textSnippet: row.text_snippet,
            suggestedCorrection: row.suggested_correction,
            annotatorId: row.annotator_id,
            createdAt: new Date(row.created_at),
        };
    }
}
exports.ErrorAnnotationRepository = ErrorAnnotationRepository;
exports.errorAnnotationRepository = new ErrorAnnotationRepository();
