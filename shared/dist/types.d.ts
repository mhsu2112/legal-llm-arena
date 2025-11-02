export declare enum LegalDomain {
    CORPORATE = "corporate",
    LITIGATION = "litigation",
    CRIMINAL = "criminal",
    CONTRACTS = "contracts",
    TORTS = "torts",
    PROPERTY = "property",
    FAMILY = "family",
    EMPLOYMENT = "employment",
    INTELLECTUAL_PROPERTY = "intellectual_property",
    TAX = "tax",
    BANKRUPTCY = "bankruptcy",
    IMMIGRATION = "immigration",
    ENVIRONMENTAL = "environmental",
    SECURITIES = "securities",
    ANTITRUST = "antitrust",
    HEALTHCARE = "healthcare",
    CONSTITUTIONAL = "constitutional",
    ADMINISTRATIVE = "administrative",
    INTERNATIONAL = "international"
}
export declare enum LegalSubdomain {
    MERGERS_ACQUISITIONS = "mergers_acquisitions",
    CORPORATE_GOVERNANCE = "corporate_governance",
    SECURITIES_OFFERINGS = "securities_offerings",
    VENTURE_CAPITAL = "venture_capital",
    CIVIL_PROCEDURE = "civil_procedure",
    DISCOVERY = "discovery",
    APPEALS = "appeals",
    ARBITRATION = "arbitration",
    WHITE_COLLAR = "white_collar",
    CONSTITUTIONAL_CRIMINAL = "constitutional_criminal",
    SENTENCING = "sentencing",
    CONTRACT_FORMATION = "contract_formation",
    CONTRACT_BREACH = "contract_breach",
    REMEDIES = "remedies",
    PATENTS = "patents",
    TRADEMARKS = "trademarks",
    COPYRIGHTS = "copyrights",
    TRADE_SECRETS = "trade_secrets",
    REAL_ESTATE = "real_estate",
    LANDLORD_TENANT = "landlord_tenant",
    ZONING = "zoning",
    GENERAL = "general"
}
export declare enum Jurisdiction {
    US_FEDERAL = "us_federal",
    US_STATE = "us_state",
    CALIFORNIA = "california",
    NEW_YORK = "new_york",
    TEXAS = "texas",
    DELAWARE = "delaware",
    UK = "uk",
    EU = "eu",
    INTERNATIONAL = "international",
    MULTI_JURISDICTION = "multi_jurisdiction"
}
export declare enum QuestionComplexity {
    BASIC = "basic",// Black-letter law
    INTERMEDIATE = "intermediate",// Application of rules
    ADVANCED = "advanced",// Multi-issue analysis
    EXPERT = "expert"
}
export declare enum TaskType {
    LEGAL_RESEARCH = "legal_research",
    CASE_ANALYSIS = "case_analysis",
    CONTRACT_REVIEW = "contract_review",
    STATUTORY_INTERPRETATION = "statutory_interpretation",
    MEMO_WRITING = "memo_writing",
    BRIEF_WRITING = "brief_writing",
    CLIENT_ADVICE = "client_advice",
    REGULATORY_COMPLIANCE = "regulatory_compliance",
    DUE_DILIGENCE = "due_diligence",
    NEGOTIATION_STRATEGY = "negotiation_strategy"
}
export declare enum ReasoningType {
    RULE_APPLICATION = "rule_application",
    ANALOGICAL = "analogical",
    POLICY_BASED = "policy_based",
    MULTI_STEP = "multi_step",
    BALANCING_TEST = "balancing_test",
    STATUTORY_CONSTRUCTION = "statutory_construction",
    PRECEDENT_SYNTHESIS = "precedent_synthesis",
    FACTUAL_DISTINCTION = "factual_distinction"
}
export declare enum CognitiveSkill {
    ISSUE_SPOTTING = "issue_spotting",
    RULE_EXTRACTION = "rule_extraction",
    FACT_ANALYSIS = "fact_analysis",
    LEGAL_SYNTHESIS = "legal_synthesis",
    COUNTERARGUMENT = "counterargument",
    RISK_ASSESSMENT = "risk_assessment",
    STRATEGIC_PLANNING = "strategic_planning"
}
export declare enum ErrorType {
    FACTUAL_HALLUCINATION = "factual_hallucination",
    CASE_MISIDENTIFICATION = "case_misidentification",
    INCORRECT_CITATION = "incorrect_citation",
    STATUTE_MISQUOTE = "statute_misquote",
    WRONG_LEGAL_STANDARD = "wrong_legal_standard",
    INCORRECT_RULE_APPLICATION = "incorrect_rule_application",
    MISSED_EXCEPTION = "missed_exception",
    CIRCULAR_REASONING = "circular_reasoning",
    FALSE_DICHOTOMY = "false_dichotomy",
    INCOMPLETE_ANALYSIS = "incomplete_analysis",
    MISSED_ISSUE = "missed_issue",
    IRRELEVANT_DISCUSSION = "irrelevant_discussion",
    WEAK_COUNTERARGUMENT = "weak_counterargument",
    WRONG_JURISDICTION = "wrong_jurisdiction",
    OUTDATED_LAW = "outdated_law",
    CONFLATED_JURISDICTIONS = "conflated_jurisdictions",
    UNREALISTIC_ADVICE = "unrealistic_advice",
    MISSED_PRACTICAL_ISSUE = "missed_practical_issue",
    POOR_RISK_ASSESSMENT = "poor_risk_assessment",
    OTHER = "other"
}
export declare enum ErrorSeverity {
    CRITICAL = "critical",// Would cause serious harm if followed
    MAJOR = "major",// Significantly incorrect but not dangerous
    MINOR = "minor",// Small inaccuracy, limited impact
    STYLISTIC = "stylistic"
}
export declare enum EvaluationCriterion {
    ACCURACY = "accuracy",
    COMPLETENESS = "completeness",
    REASONING_QUALITY = "reasoning_quality",
    CITATION_QUALITY = "citation_quality",
    PRACTICAL_UTILITY = "practical_utility",
    CLARITY = "clarity",
    ORGANIZATION = "organization",
    RISK_AWARENESS = "risk_awareness"
}
export interface LLMModel {
    id: string;
    name: string;
    provider: 'anthropic' | 'openai' | 'google' | 'meta' | 'other';
    version: string;
    eloRating: number;
    totalComparisons: number;
    wins: number;
    losses: number;
    ties: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface LegalQuestion {
    id: string;
    content: string;
    domain: LegalDomain;
    subdomain?: LegalSubdomain;
    jurisdiction: Jurisdiction;
    complexity: QuestionComplexity;
    taskType: TaskType;
    requiredReasoningTypes: ReasoningType[];
    requiredCognitiveSkills: CognitiveSkill[];
    factPattern?: string;
    relevantStatutes?: string[];
    relevantCases?: string[];
    tags: string[];
    expectedResponseLength?: 'short' | 'medium' | 'long';
    hasGroundTruth: boolean;
    groundTruthAnswer?: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface LLMResponse {
    id: string;
    questionId: string;
    modelId: string;
    content: string;
    generatedAt: Date;
    tokensUsed?: number;
    latencyMs?: number;
}
export interface Comparison {
    id: string;
    questionId: string;
    modelAId: string;
    modelBId: string;
    responseAId: string;
    responseBId: string;
    winnerId?: string;
    evaluatorId?: string;
    evaluations?: DetailedEvaluation[];
    modelAEloChange?: number;
    modelBEloChange?: number;
    createdAt: Date;
    completedAt?: Date;
}
export interface DetailedEvaluation {
    criterion: EvaluationCriterion;
    modelAScore: number;
    modelBScore: number;
    notes?: string;
}
export interface ErrorAnnotation {
    id: string;
    responseId: string;
    errorType: ErrorType;
    severity: ErrorSeverity;
    description: string;
    textSnippet?: string;
    suggestedCorrection?: string;
    annotatorId?: string;
    createdAt: Date;
}
export interface LeaderboardEntry {
    modelId: string;
    modelName: string;
    eloRating: number;
    totalComparisons: number;
    winRate: number;
    avgScoreByDomain: Record<LegalDomain, number>;
    strengthDomains: LegalDomain[];
    weaknessDomains: LegalDomain[];
}
export interface PerformanceMetrics {
    modelId: string;
    byDomain: Record<LegalDomain, {
        comparisons: number;
        winRate: number;
        avgAccuracy: number;
        commonErrors: ErrorType[];
    }>;
    byComplexity: Record<QuestionComplexity, {
        comparisons: number;
        winRate: number;
    }>;
    byTaskType: Record<TaskType, {
        comparisons: number;
        winRate: number;
    }>;
}
export interface ChallengingPattern {
    id: string;
    description: string;
    affectedModels: string[];
    domain: LegalDomain;
    subdomain?: LegalSubdomain;
    commonErrors: ErrorType[];
    exampleQuestionIds: string[];
    frequency: number;
}
export interface CreateQuestionRequest {
    content: string;
    domain: LegalDomain;
    subdomain?: LegalSubdomain;
    jurisdiction: Jurisdiction;
    complexity: QuestionComplexity;
    taskType: TaskType;
    requiredReasoningTypes: ReasoningType[];
    requiredCognitiveSkills: CognitiveSkill[];
    factPattern?: string;
    tags: string[];
}
export interface SubmitComparisonRequest {
    comparisonId: string;
    questionId: string;
    modelAId: string;
    modelBId: string;
    winnerId?: string;
    evaluations?: DetailedEvaluation[];
    errorAnnotations?: Omit<ErrorAnnotation, 'id' | 'createdAt'>[];
}
export interface GetArenaMatchResponse {
    question: LegalQuestion;
    modelAId: string;
    modelBId: string;
    responseA: LLMResponse;
    responseB: LLMResponse;
    comparisonId: string;
}
export interface LeaderboardResponse {
    overall: LeaderboardEntry[];
    byDomain: Record<LegalDomain, LeaderboardEntry[]>;
    lastUpdated: Date;
}
