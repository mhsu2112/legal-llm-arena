import { modelRepository } from './repositories/ModelRepository';
import { questionRepository } from './repositories/QuestionRepository';
import {
  LegalDomain,
  LegalSubdomain,
  Jurisdiction,
  QuestionComplexity,
  TaskType,
  ReasoningType,
  CognitiveSkill,
} from '@legal-llm-arena/shared';

/**
 * Seed database with initial models and sample questions
 */
export function seedDatabase() {
  console.log('Starting database seed...');

  // Seed models
  seedModels();

  // Seed sample questions
  seedQuestions();

  console.log('Database seeding completed!');
}

function seedModels() {
  console.log('Seeding models...');

  const models = [
    {
      name: 'claude-3-5-sonnet-20241022',
      provider: 'anthropic' as const,
      version: '3.5',
      eloRating: 1500,
      totalComparisons: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      isActive: true,
    },
    {
      name: 'claude-3-opus-20240229',
      provider: 'anthropic' as const,
      version: '3',
      eloRating: 1500,
      totalComparisons: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      isActive: true,
    },
    {
      name: 'gpt-4-turbo-preview',
      provider: 'openai' as const,
      version: '4-turbo',
      eloRating: 1500,
      totalComparisons: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      isActive: true,
    },
    {
      name: 'gpt-4',
      provider: 'openai' as const,
      version: '4',
      eloRating: 1500,
      totalComparisons: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      isActive: true,
    },
  ];

  for (const model of models) {
    try {
      modelRepository.create(model);
      console.log(`  ✓ Created model: ${model.name}`);
    } catch (error) {
      console.log(`  - Model ${model.name} may already exist`);
    }
  }
}

function seedQuestions() {
  console.log('Seeding sample questions...');

  const questions = [
    // Contract Law - Basic
    {
      content:
        'What are the essential elements required to form a valid contract under common law?',
      domain: LegalDomain.CONTRACTS,
      subdomain: LegalSubdomain.CONTRACT_FORMATION,
      jurisdiction: Jurisdiction.US_FEDERAL,
      complexity: QuestionComplexity.BASIC,
      taskType: TaskType.LEGAL_RESEARCH,
      requiredReasoningTypes: [ReasoningType.RULE_APPLICATION],
      requiredCognitiveSkills: [CognitiveSkill.RULE_EXTRACTION],
      tags: ['contracts', 'formation', 'elements'],
    },

    // Contract Law - Intermediate
    {
      content:
        'A contractor agrees to build a house for $500,000, to be completed by June 1. The contractor completes the house on June 15, and the work is otherwise perfect. The homeowner refuses to pay, citing the late completion. Under the substantial performance doctrine, is the homeowner required to pay? Explain.',
      domain: LegalDomain.CONTRACTS,
      subdomain: LegalSubdomain.CONTRACT_BREACH,
      jurisdiction: Jurisdiction.US_FEDERAL,
      complexity: QuestionComplexity.INTERMEDIATE,
      taskType: TaskType.CASE_ANALYSIS,
      requiredReasoningTypes: [
        ReasoningType.RULE_APPLICATION,
        ReasoningType.FACTUAL_DISTINCTION,
      ],
      requiredCognitiveSkills: [
        CognitiveSkill.FACT_ANALYSIS,
        CognitiveSkill.RULE_EXTRACTION,
      ],
      factPattern:
        'Contractor completes house 14 days late but work is otherwise perfect. Contract price: $500,000.',
      tags: ['contracts', 'breach', 'substantial-performance', 'remedies'],
    },

    // Torts - Intermediate
    {
      content:
        'A grocery store customer slips on a banana peel that had been on the floor for 15 minutes. Three employees walked past it during that time but did not clean it up. Analyze the store\'s liability under negligence principles.',
      domain: LegalDomain.TORTS,
      subdomain: LegalSubdomain.GENERAL,
      jurisdiction: Jurisdiction.US_FEDERAL,
      complexity: QuestionComplexity.INTERMEDIATE,
      taskType: TaskType.CASE_ANALYSIS,
      requiredReasoningTypes: [
        ReasoningType.RULE_APPLICATION,
        ReasoningType.MULTI_STEP,
      ],
      requiredCognitiveSkills: [
        CognitiveSkill.ISSUE_SPOTTING,
        CognitiveSkill.FACT_ANALYSIS,
      ],
      factPattern:
        'Banana peel on floor for 15 minutes. Three employees passed by without cleaning.',
      tags: ['torts', 'negligence', 'premises-liability', 'duty-of-care'],
    },

    // Constitutional Law - Advanced
    {
      content:
        'A state legislature passes a law requiring all political campaign advertisements to disclose their top five donors. A political action committee challenges this law as a violation of the First Amendment. Apply strict scrutiny analysis to evaluate the constitutionality of this law.',
      domain: LegalDomain.CONSTITUTIONAL,
      subdomain: LegalSubdomain.GENERAL,
      jurisdiction: Jurisdiction.US_FEDERAL,
      complexity: QuestionComplexity.ADVANCED,
      taskType: TaskType.MEMO_WRITING,
      requiredReasoningTypes: [
        ReasoningType.BALANCING_TEST,
        ReasoningType.MULTI_STEP,
        ReasoningType.POLICY_BASED,
      ],
      requiredCognitiveSkills: [
        CognitiveSkill.ISSUE_SPOTTING,
        CognitiveSkill.COUNTERARGUMENT,
        CognitiveSkill.LEGAL_SYNTHESIS,
      ],
      factPattern:
        'State law requires campaign ads to disclose top 5 donors. PAC claims First Amendment violation.',
      tags: ['constitutional-law', 'first-amendment', 'strict-scrutiny', 'campaign-finance'],
    },

    // Criminal Law - Advanced
    {
      content:
        'Defendant is charged with felony murder. The prosecution alleges that Defendant and an accomplice planned to rob a convenience store. During the robbery, the accomplice shot and killed the clerk. Defendant was waiting in the car outside and did not know the accomplice had a gun. Analyze Defendant\'s criminal liability under the felony murder rule and any available defenses.',
      domain: LegalDomain.CRIMINAL,
      subdomain: LegalSubdomain.CONSTITUTIONAL_CRIMINAL,
      jurisdiction: Jurisdiction.US_FEDERAL,
      complexity: QuestionComplexity.ADVANCED,
      taskType: TaskType.CASE_ANALYSIS,
      requiredReasoningTypes: [
        ReasoningType.RULE_APPLICATION,
        ReasoningType.ANALOGICAL,
        ReasoningType.MULTI_STEP,
      ],
      requiredCognitiveSkills: [
        CognitiveSkill.ISSUE_SPOTTING,
        CognitiveSkill.FACT_ANALYSIS,
        CognitiveSkill.COUNTERARGUMENT,
      ],
      factPattern:
        'Defendant planned robbery with accomplice. Accomplice killed clerk during robbery. Defendant in car outside, unaware of gun.',
      tags: ['criminal-law', 'felony-murder', 'accomplice-liability', 'mens-rea'],
    },

    // Property Law - Intermediate
    {
      content:
        'A property owner grants "to A for life, then to B and her heirs." What interests do A and B have in the property? What happens if A dies before B? What if B dies before A?',
      domain: LegalDomain.PROPERTY,
      subdomain: LegalSubdomain.REAL_ESTATE,
      jurisdiction: Jurisdiction.US_FEDERAL,
      complexity: QuestionComplexity.INTERMEDIATE,
      taskType: TaskType.LEGAL_RESEARCH,
      requiredReasoningTypes: [
        ReasoningType.RULE_APPLICATION,
        ReasoningType.STATUTORY_CONSTRUCTION,
      ],
      requiredCognitiveSkills: [
        CognitiveSkill.RULE_EXTRACTION,
        CognitiveSkill.FACT_ANALYSIS,
      ],
      tags: ['property', 'future-interests', 'life-estate', 'remainder'],
    },

    // Corporate Law - Advanced
    {
      content:
        'A CEO learns that the company is about to announce disappointing earnings. Before the announcement, the CEO sells 10,000 shares of company stock. Analyze potential liability under Section 10(b) of the Securities Exchange Act and Rule 10b-5. What elements must be proven? What defenses might be available?',
      domain: LegalDomain.CORPORATE,
      subdomain: LegalSubdomain.SECURITIES_OFFERINGS,
      jurisdiction: Jurisdiction.US_FEDERAL,
      complexity: QuestionComplexity.ADVANCED,
      taskType: TaskType.MEMO_WRITING,
      requiredReasoningTypes: [
        ReasoningType.RULE_APPLICATION,
        ReasoningType.MULTI_STEP,
        ReasoningType.STATUTORY_CONSTRUCTION,
      ],
      requiredCognitiveSkills: [
        CognitiveSkill.ISSUE_SPOTTING,
        CognitiveSkill.RULE_EXTRACTION,
        CognitiveSkill.COUNTERARGUMENT,
        CognitiveSkill.RISK_ASSESSMENT,
      ],
      factPattern:
        'CEO sells 10,000 shares before disappointing earnings announcement.',
      tags: ['corporate-law', 'securities', 'insider-trading', '10b-5'],
    },

    // Employment Law - Intermediate
    {
      content:
        'An employee is fired after reporting safety violations to OSHA. The employee was an at-will employee with no employment contract. Does the employee have any legal recourse against the employer?',
      domain: LegalDomain.EMPLOYMENT,
      subdomain: LegalSubdomain.GENERAL,
      jurisdiction: Jurisdiction.US_FEDERAL,
      complexity: QuestionComplexity.INTERMEDIATE,
      taskType: TaskType.CLIENT_ADVICE,
      requiredReasoningTypes: [
        ReasoningType.RULE_APPLICATION,
        ReasoningType.POLICY_BASED,
      ],
      requiredCognitiveSkills: [
        CognitiveSkill.ISSUE_SPOTTING,
        CognitiveSkill.RISK_ASSESSMENT,
      ],
      factPattern:
        'At-will employee fired after reporting safety violations to OSHA.',
      tags: ['employment-law', 'whistleblower', 'wrongful-termination', 'at-will'],
    },

    // IP Law - Expert
    {
      content:
        'A software company develops an AI model trained on publicly available code from GitHub. Another company claims this violates their copyright in code they had posted on GitHub under an MIT license. The first company argues their use is transformative and constitutes fair use. Analyze both sides\' arguments under the four-factor fair use test, considering recent case law on AI training data.',
      domain: LegalDomain.INTELLECTUAL_PROPERTY,
      subdomain: LegalSubdomain.COPYRIGHTS,
      jurisdiction: Jurisdiction.US_FEDERAL,
      complexity: QuestionComplexity.EXPERT,
      taskType: TaskType.MEMO_WRITING,
      requiredReasoningTypes: [
        ReasoningType.BALANCING_TEST,
        ReasoningType.MULTI_STEP,
        ReasoningType.ANALOGICAL,
        ReasoningType.POLICY_BASED,
      ],
      requiredCognitiveSkills: [
        CognitiveSkill.ISSUE_SPOTTING,
        CognitiveSkill.COUNTERARGUMENT,
        CognitiveSkill.LEGAL_SYNTHESIS,
        CognitiveSkill.STRATEGIC_PLANNING,
      ],
      factPattern:
        'AI model trained on GitHub code with MIT license. Copyright claim vs. fair use defense.',
      tags: ['intellectual-property', 'copyright', 'fair-use', 'ai', 'transformative-use'],
    },

    // Civil Procedure - Advanced
    {
      content:
        'A plaintiff files a lawsuit in federal court based on diversity jurisdiction. The complaint alleges damages of $60,000. After discovery, it becomes clear that damages will likely exceed $100,000. Defendant moves to dismiss for lack of subject matter jurisdiction. How should the court rule?',
      domain: LegalDomain.LITIGATION,
      subdomain: LegalSubdomain.CIVIL_PROCEDURE,
      jurisdiction: Jurisdiction.US_FEDERAL,
      complexity: QuestionComplexity.ADVANCED,
      taskType: TaskType.CASE_ANALYSIS,
      requiredReasoningTypes: [
        ReasoningType.RULE_APPLICATION,
        ReasoningType.STATUTORY_CONSTRUCTION,
      ],
      requiredCognitiveSkills: [
        CognitiveSkill.ISSUE_SPOTTING,
        CognitiveSkill.RULE_EXTRACTION,
        CognitiveSkill.FACT_ANALYSIS,
      ],
      factPattern:
        'Federal diversity case. Complaint alleged $60K damages, now likely exceeds $100K.',
      tags: ['civil-procedure', 'jurisdiction', 'diversity', 'amount-in-controversy'],
    },
  ];

  for (const question of questions) {
    try {
      questionRepository.create({
        ...question,
        hasGroundTruth: false,
      });
      console.log(`  ✓ Created question: ${question.content.substring(0, 60)}...`);
    } catch (error) {
      console.log(`  - Question may already exist`);
    }
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}
