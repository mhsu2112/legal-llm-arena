"use strict";
// Legal Taxonomy and Evaluation Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationCriterion = exports.ErrorSeverity = exports.ErrorType = exports.CognitiveSkill = exports.ReasoningType = exports.TaskType = exports.QuestionComplexity = exports.Jurisdiction = exports.LegalSubdomain = exports.LegalDomain = void 0;
// ============================================================================
// LEGAL DOMAIN TAXONOMY
// ============================================================================
var LegalDomain;
(function (LegalDomain) {
    // Core Practice Areas
    LegalDomain["CORPORATE"] = "corporate";
    LegalDomain["LITIGATION"] = "litigation";
    LegalDomain["CRIMINAL"] = "criminal";
    LegalDomain["CONTRACTS"] = "contracts";
    LegalDomain["TORTS"] = "torts";
    LegalDomain["PROPERTY"] = "property";
    LegalDomain["FAMILY"] = "family";
    LegalDomain["EMPLOYMENT"] = "employment";
    LegalDomain["INTELLECTUAL_PROPERTY"] = "intellectual_property";
    LegalDomain["TAX"] = "tax";
    LegalDomain["BANKRUPTCY"] = "bankruptcy";
    LegalDomain["IMMIGRATION"] = "immigration";
    LegalDomain["ENVIRONMENTAL"] = "environmental";
    LegalDomain["SECURITIES"] = "securities";
    LegalDomain["ANTITRUST"] = "antitrust";
    LegalDomain["HEALTHCARE"] = "healthcare";
    LegalDomain["CONSTITUTIONAL"] = "constitutional";
    LegalDomain["ADMINISTRATIVE"] = "administrative";
    LegalDomain["INTERNATIONAL"] = "international";
})(LegalDomain || (exports.LegalDomain = LegalDomain = {}));
var LegalSubdomain;
(function (LegalSubdomain) {
    // Corporate
    LegalSubdomain["MERGERS_ACQUISITIONS"] = "mergers_acquisitions";
    LegalSubdomain["CORPORATE_GOVERNANCE"] = "corporate_governance";
    LegalSubdomain["SECURITIES_OFFERINGS"] = "securities_offerings";
    LegalSubdomain["VENTURE_CAPITAL"] = "venture_capital";
    // Litigation
    LegalSubdomain["CIVIL_PROCEDURE"] = "civil_procedure";
    LegalSubdomain["DISCOVERY"] = "discovery";
    LegalSubdomain["APPEALS"] = "appeals";
    LegalSubdomain["ARBITRATION"] = "arbitration";
    // Criminal
    LegalSubdomain["WHITE_COLLAR"] = "white_collar";
    LegalSubdomain["CONSTITUTIONAL_CRIMINAL"] = "constitutional_criminal";
    LegalSubdomain["SENTENCING"] = "sentencing";
    // Contracts
    LegalSubdomain["CONTRACT_FORMATION"] = "contract_formation";
    LegalSubdomain["CONTRACT_BREACH"] = "contract_breach";
    LegalSubdomain["REMEDIES"] = "remedies";
    // IP
    LegalSubdomain["PATENTS"] = "patents";
    LegalSubdomain["TRADEMARKS"] = "trademarks";
    LegalSubdomain["COPYRIGHTS"] = "copyrights";
    LegalSubdomain["TRADE_SECRETS"] = "trade_secrets";
    // Property
    LegalSubdomain["REAL_ESTATE"] = "real_estate";
    LegalSubdomain["LANDLORD_TENANT"] = "landlord_tenant";
    LegalSubdomain["ZONING"] = "zoning";
    // Other
    LegalSubdomain["GENERAL"] = "general";
})(LegalSubdomain || (exports.LegalSubdomain = LegalSubdomain = {}));
// ============================================================================
// JURISDICTION AND COMPLEXITY
// ============================================================================
var Jurisdiction;
(function (Jurisdiction) {
    Jurisdiction["US_FEDERAL"] = "us_federal";
    Jurisdiction["US_STATE"] = "us_state";
    Jurisdiction["CALIFORNIA"] = "california";
    Jurisdiction["NEW_YORK"] = "new_york";
    Jurisdiction["TEXAS"] = "texas";
    Jurisdiction["DELAWARE"] = "delaware";
    Jurisdiction["UK"] = "uk";
    Jurisdiction["EU"] = "eu";
    Jurisdiction["INTERNATIONAL"] = "international";
    Jurisdiction["MULTI_JURISDICTION"] = "multi_jurisdiction";
})(Jurisdiction || (exports.Jurisdiction = Jurisdiction = {}));
var QuestionComplexity;
(function (QuestionComplexity) {
    QuestionComplexity["BASIC"] = "basic";
    QuestionComplexity["INTERMEDIATE"] = "intermediate";
    QuestionComplexity["ADVANCED"] = "advanced";
    QuestionComplexity["EXPERT"] = "expert";
})(QuestionComplexity || (exports.QuestionComplexity = QuestionComplexity = {}));
var TaskType;
(function (TaskType) {
    TaskType["LEGAL_RESEARCH"] = "legal_research";
    TaskType["CASE_ANALYSIS"] = "case_analysis";
    TaskType["CONTRACT_REVIEW"] = "contract_review";
    TaskType["STATUTORY_INTERPRETATION"] = "statutory_interpretation";
    TaskType["MEMO_WRITING"] = "memo_writing";
    TaskType["BRIEF_WRITING"] = "brief_writing";
    TaskType["CLIENT_ADVICE"] = "client_advice";
    TaskType["REGULATORY_COMPLIANCE"] = "regulatory_compliance";
    TaskType["DUE_DILIGENCE"] = "due_diligence";
    TaskType["NEGOTIATION_STRATEGY"] = "negotiation_strategy";
})(TaskType || (exports.TaskType = TaskType = {}));
// ============================================================================
// REASONING REQUIREMENTS
// ============================================================================
var ReasoningType;
(function (ReasoningType) {
    ReasoningType["RULE_APPLICATION"] = "rule_application";
    ReasoningType["ANALOGICAL"] = "analogical";
    ReasoningType["POLICY_BASED"] = "policy_based";
    ReasoningType["MULTI_STEP"] = "multi_step";
    ReasoningType["BALANCING_TEST"] = "balancing_test";
    ReasoningType["STATUTORY_CONSTRUCTION"] = "statutory_construction";
    ReasoningType["PRECEDENT_SYNTHESIS"] = "precedent_synthesis";
    ReasoningType["FACTUAL_DISTINCTION"] = "factual_distinction";
})(ReasoningType || (exports.ReasoningType = ReasoningType = {}));
var CognitiveSkill;
(function (CognitiveSkill) {
    CognitiveSkill["ISSUE_SPOTTING"] = "issue_spotting";
    CognitiveSkill["RULE_EXTRACTION"] = "rule_extraction";
    CognitiveSkill["FACT_ANALYSIS"] = "fact_analysis";
    CognitiveSkill["LEGAL_SYNTHESIS"] = "legal_synthesis";
    CognitiveSkill["COUNTERARGUMENT"] = "counterargument";
    CognitiveSkill["RISK_ASSESSMENT"] = "risk_assessment";
    CognitiveSkill["STRATEGIC_PLANNING"] = "strategic_planning";
})(CognitiveSkill || (exports.CognitiveSkill = CognitiveSkill = {}));
// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================
var ErrorType;
(function (ErrorType) {
    // Factual Errors
    ErrorType["FACTUAL_HALLUCINATION"] = "factual_hallucination";
    ErrorType["CASE_MISIDENTIFICATION"] = "case_misidentification";
    ErrorType["INCORRECT_CITATION"] = "incorrect_citation";
    ErrorType["STATUTE_MISQUOTE"] = "statute_misquote";
    // Legal Reasoning Errors
    ErrorType["WRONG_LEGAL_STANDARD"] = "wrong_legal_standard";
    ErrorType["INCORRECT_RULE_APPLICATION"] = "incorrect_rule_application";
    ErrorType["MISSED_EXCEPTION"] = "missed_exception";
    ErrorType["CIRCULAR_REASONING"] = "circular_reasoning";
    ErrorType["FALSE_DICHOTOMY"] = "false_dichotomy";
    // Analytical Errors
    ErrorType["INCOMPLETE_ANALYSIS"] = "incomplete_analysis";
    ErrorType["MISSED_ISSUE"] = "missed_issue";
    ErrorType["IRRELEVANT_DISCUSSION"] = "irrelevant_discussion";
    ErrorType["WEAK_COUNTERARGUMENT"] = "weak_counterargument";
    // Jurisdictional Errors
    ErrorType["WRONG_JURISDICTION"] = "wrong_jurisdiction";
    ErrorType["OUTDATED_LAW"] = "outdated_law";
    ErrorType["CONFLATED_JURISDICTIONS"] = "conflated_jurisdictions";
    // Practical Errors
    ErrorType["UNREALISTIC_ADVICE"] = "unrealistic_advice";
    ErrorType["MISSED_PRACTICAL_ISSUE"] = "missed_practical_issue";
    ErrorType["POOR_RISK_ASSESSMENT"] = "poor_risk_assessment";
    // Other
    ErrorType["OTHER"] = "other";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["CRITICAL"] = "critical";
    ErrorSeverity["MAJOR"] = "major";
    ErrorSeverity["MINOR"] = "minor";
    ErrorSeverity["STYLISTIC"] = "stylistic";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
// ============================================================================
// EVALUATION CRITERIA
// ============================================================================
var EvaluationCriterion;
(function (EvaluationCriterion) {
    EvaluationCriterion["ACCURACY"] = "accuracy";
    EvaluationCriterion["COMPLETENESS"] = "completeness";
    EvaluationCriterion["REASONING_QUALITY"] = "reasoning_quality";
    EvaluationCriterion["CITATION_QUALITY"] = "citation_quality";
    EvaluationCriterion["PRACTICAL_UTILITY"] = "practical_utility";
    EvaluationCriterion["CLARITY"] = "clarity";
    EvaluationCriterion["ORGANIZATION"] = "organization";
    EvaluationCriterion["RISK_AWARENESS"] = "risk_awareness";
})(EvaluationCriterion || (exports.EvaluationCriterion = EvaluationCriterion = {}));
