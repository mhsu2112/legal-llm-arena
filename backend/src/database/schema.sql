-- Legal LLM Arena Database Schema

-- ============================================================================
-- MODELS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK(provider IN ('anthropic', 'openai', 'google', 'meta', 'other')),
  version TEXT NOT NULL,
  elo_rating REAL NOT NULL DEFAULT 1500.0,
  total_comparisons INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  ties INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(name, version)
);

CREATE INDEX IF NOT EXISTS idx_models_elo ON models(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_models_active ON models(is_active);

-- ============================================================================
-- QUESTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,

  -- Taxonomy
  domain TEXT NOT NULL,
  subdomain TEXT,
  jurisdiction TEXT NOT NULL,
  complexity TEXT NOT NULL CHECK(complexity IN ('basic', 'intermediate', 'advanced', 'expert')),
  task_type TEXT NOT NULL,

  -- Context (stored as JSON)
  fact_pattern TEXT,
  relevant_statutes TEXT, -- JSON array
  relevant_cases TEXT,    -- JSON array

  -- Requirements (stored as JSON)
  required_reasoning_types TEXT NOT NULL, -- JSON array
  required_cognitive_skills TEXT NOT NULL, -- JSON array

  -- Metadata
  tags TEXT NOT NULL, -- JSON array
  expected_response_length TEXT CHECK(expected_response_length IN ('short', 'medium', 'long')),
  has_ground_truth INTEGER NOT NULL DEFAULT 0,
  ground_truth_answer TEXT,

  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain);
CREATE INDEX IF NOT EXISTS idx_questions_complexity ON questions(complexity);
CREATE INDEX IF NOT EXISTS idx_questions_jurisdiction ON questions(jurisdiction);

-- ============================================================================
-- RESPONSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TEXT NOT NULL DEFAULT (datetime('now')),
  tokens_used INTEGER,
  latency_ms INTEGER,

  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (model_id) REFERENCES models(id)
);

CREATE INDEX IF NOT EXISTS idx_responses_question ON responses(question_id);
CREATE INDEX IF NOT EXISTS idx_responses_model ON responses(model_id);

-- ============================================================================
-- COMPARISONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS comparisons (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  model_a_id TEXT NOT NULL,
  model_b_id TEXT NOT NULL,
  response_a_id TEXT NOT NULL,
  response_b_id TEXT NOT NULL,

  -- Winner selection (NULL for tie)
  winner_id TEXT,
  evaluator_id TEXT,

  -- ELO updates
  model_a_elo_before REAL NOT NULL,
  model_b_elo_before REAL NOT NULL,
  model_a_elo_change REAL,
  model_b_elo_change REAL,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,

  FOREIGN KEY (question_id) REFERENCES questions(id),
  FOREIGN KEY (model_a_id) REFERENCES models(id),
  FOREIGN KEY (model_b_id) REFERENCES models(id),
  FOREIGN KEY (response_a_id) REFERENCES responses(id),
  FOREIGN KEY (response_b_id) REFERENCES responses(id),
  FOREIGN KEY (winner_id) REFERENCES models(id)
);

CREATE INDEX IF NOT EXISTS idx_comparisons_question ON comparisons(question_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_models ON comparisons(model_a_id, model_b_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_completed ON comparisons(completed_at);

-- ============================================================================
-- DETAILED EVALUATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS detailed_evaluations (
  id TEXT PRIMARY KEY,
  comparison_id TEXT NOT NULL,
  criterion TEXT NOT NULL,
  model_a_score INTEGER NOT NULL CHECK(model_a_score >= 1 AND model_a_score <= 5),
  model_b_score INTEGER NOT NULL CHECK(model_b_score >= 1 AND model_b_score <= 5),
  notes TEXT,

  FOREIGN KEY (comparison_id) REFERENCES comparisons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evaluations_comparison ON detailed_evaluations(comparison_id);

-- ============================================================================
-- ERROR ANNOTATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS error_annotations (
  id TEXT PRIMARY KEY,
  response_id TEXT NOT NULL,
  error_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('critical', 'major', 'minor', 'stylistic')),
  description TEXT NOT NULL,
  text_snippet TEXT,
  suggested_correction TEXT,
  annotator_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_errors_response ON error_annotations(response_id);
CREATE INDEX IF NOT EXISTS idx_errors_type ON error_annotations(error_type);
CREATE INDEX IF NOT EXISTS idx_errors_severity ON error_annotations(severity);

-- ============================================================================
-- CHALLENGING PATTERNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenging_patterns (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  domain TEXT NOT NULL,
  subdomain TEXT,
  affected_models TEXT NOT NULL, -- JSON array of model IDs
  common_errors TEXT NOT NULL,   -- JSON array of error types
  example_question_ids TEXT NOT NULL, -- JSON array of question IDs
  frequency INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_patterns_domain ON challenging_patterns(domain);
CREATE INDEX IF NOT EXISTS idx_patterns_frequency ON challenging_patterns(frequency DESC);

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Model performance summary
CREATE VIEW IF NOT EXISTS model_performance AS
SELECT
  m.id,
  m.name,
  m.provider,
  m.version,
  m.elo_rating,
  m.total_comparisons,
  m.wins,
  m.losses,
  m.ties,
  CASE
    WHEN m.total_comparisons > 0
    THEN CAST(m.wins AS REAL) / m.total_comparisons
    ELSE 0
  END as win_rate,
  COUNT(DISTINCT r.question_id) as questions_answered
FROM models m
LEFT JOIN responses r ON m.id = r.model_id
GROUP BY m.id;

-- Domain performance by model
CREATE VIEW IF NOT EXISTS domain_performance AS
SELECT
  m.id as model_id,
  m.name as model_name,
  q.domain,
  COUNT(c.id) as comparisons,
  SUM(CASE WHEN c.winner_id = m.id THEN 1 ELSE 0 END) as wins,
  SUM(CASE WHEN c.winner_id IS NULL THEN 1 ELSE 0 END) as ties,
  CASE
    WHEN COUNT(c.id) > 0
    THEN CAST(SUM(CASE WHEN c.winner_id = m.id THEN 1 ELSE 0 END) AS REAL) / COUNT(c.id)
    ELSE 0
  END as win_rate
FROM models m
JOIN comparisons c ON (c.model_a_id = m.id OR c.model_b_id = m.id)
JOIN questions q ON c.question_id = q.id
WHERE c.completed_at IS NOT NULL
GROUP BY m.id, q.domain;

-- Error frequency by type and model
CREATE VIEW IF NOT EXISTS error_frequency AS
SELECT
  r.model_id,
  m.name as model_name,
  e.error_type,
  e.severity,
  COUNT(*) as frequency,
  q.domain
FROM error_annotations e
JOIN responses r ON e.response_id = r.id
JOIN models m ON r.model_id = m.id
JOIN questions q ON r.question_id = q.id
GROUP BY r.model_id, e.error_type, e.severity, q.domain;
