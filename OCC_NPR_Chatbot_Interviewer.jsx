import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// ─── DATA: Complete NPR Comment Solicitations (All 211 Questions) ────────────
// Source: OCC NR 2026-9a | Docket ID OCC-2025-0372 | RIN 1557-AF41
// Implementing the GENIUS Act for Payment Stablecoins

const ENTITY_TYPES = [
  { id: "national_bank", label: "National Bank or Federal Savings Association", description: "Currently OCC-regulated depository institution" },
  { id: "subsidiary", label: "Subsidiary of an OCC-Regulated Institution", description: "Subsidiary of a national bank or Federal savings association" },
  { id: "nonbank_applicant", label: "Nonbank Applicant (Crypto-native / Fintech)", description: "Seeking Federal qualified payment stablecoin issuer charter" },
  { id: "state_issuer", label: "State Qualified Payment Stablecoin Issuer", description: "Currently State-licensed stablecoin issuer" },
  { id: "custodian", label: "Custodian or Safekeeping Services Provider", description: "Provides custody or safekeeping for stablecoin reserves" },
  { id: "trade_association", label: "Trade Association or Industry Group", description: "Representing member institutions" },
  { id: "consumer_advocate", label: "Consumer or Public Interest Organization", description: "Focused on consumer protection and public interest" },
  { id: "academic", label: "Academic or Researcher", description: "Scholarly or research perspective" },
  { id: "individual", label: "Individual Stablecoin User", description: "Personal experience with stablecoins" },
  { id: "other", label: "Other", description: "Other stakeholder type" },
];

const ECOSYSTEM_ROLES = [
  { id: "issues_stablecoins", label: "Currently issues or plans to issue payment stablecoins" },
  { id: "provides_custody", label: "Provides or plans to provide custody/safekeeping for stablecoin reserves" },
  { id: "holds_uses", label: "Holds or uses stablecoins" },
  { id: "advises_represents", label: "Advises or represents entities in the stablecoin ecosystem" },
  { id: "researches_writes", label: "Researches or writes about stablecoin policy" },
];

const SCALE_OPTIONS = [
  { id: "under_1b", label: "Under $1 billion" },
  { id: "1b_to_10b", label: "$1–$10 billion" },
  { id: "10b_to_25b", label: "$10–$25 billion" },
  { id: "25b_to_50b", label: "$25–$50 billion" },
  { id: "over_50b", label: "Over $50 billion" },
  { id: "na", label: "Not applicable / Not issuing" },
];

const FRAMEWORK_ASSESSMENT = [
  { id: "strongly_support", label: "Strongly support" },
  { id: "support", label: "Support with modifications" },
  { id: "neutral", label: "Neutral" },
  { id: "oppose", label: "Oppose with modifications" },
  { id: "strongly_oppose", label: "Strongly oppose" },
];

const THRESHOLD_CALIBRATIONS = [
  { id: "daily_liquidity_10pct", label: "10% daily liquidity minimum", section: "§ 15.11(c)" },
  { id: "weekly_liquidity_30pct", label: "30% weekly liquidity minimum", section: "§ 15.11(c)" },
  { id: "concentration_40pct", label: "40% single-counterparty concentration cap", section: "§ 15.11(c)" },
  { id: "wam_20day", label: "20-day weighted average maturity limit", section: "§ 15.11(c)" },
  { id: "state_transition_10b", label: "$10 billion State issuer transition threshold", section: "§ 15.15" },
  { id: "min_capital_5m", label: "$5 million minimum capital for de novo issuers", section: "§ 15.40" },
];

// ─── TOPIC MODULES WITH ALL 211 NPR QUESTIONS ──────────────────────────────

const TOPIC_MODULES = [
  {
    id: "definitions",
    title: "Definitions",
    subtitle: "Subpart A: §§ 15.1–15.3 — Scope & Key Terms",
    icon: "📋",
    nprQuestions: "Q1–Q24",
    relevantTo: ["all"],
    openingPrompt: "The OCC proposes 24 key definitions that determine who and what falls under the new stablecoin framework. Before we get into specifics, what are your overall views on whether the definitions appropriately capture the scope of entities and activities that should be regulated?",
    questions: [
      {
        id: "q_def_scope",
        nprRef: "Q1",
        context: "The proposed rule defines numerous terms including 'payment stablecoin,' 'permitted payment stablecoin issuer,' 'digital asset,' 'outstanding issuance value,' and others. These definitions determine the regulatory perimeter.",
        question: "Are the definitions in the proposed rule appropriately scoped? How should they be improved?",
        type: "open",
        depth: "general",
        followUps: [
          { trigger: "any", question: "Are there specific terms that you believe are too broad, too narrow, or missing entirely?" }
        ]
      },
      {
        id: "q_def_payment_stablecoin",
        nprRef: "Q14–Q16",
        context: "A 'payment stablecoin' is defined as a digital asset designed to be used as a means of payment or settlement, where the issuer is obligated to redeem for a fixed amount of monetary value. The definition excludes deposits as defined under the FDI Act.",
        question: "Is the term 'payment stablecoin' sufficiently clear? Should the OCC clarify which stablecoins (e.g., algorithmic, multi-currency, commodity-backed) fall inside or outside the definition?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "Should insured shares be excluded from the definition, as they currently are not explicitly excluded in the GENIUS Act?" }
        ]
      },
      {
        id: "q_def_customer",
        nprRef: "Q4",
        context: "The term 'customer' is broadly defined as any person that purchases products or services. This could include only direct purchasers from the issuer or all downstream stablecoin holders who acquired through exchanges or secondary markets.",
        question: "Is the definition of 'customer' too broad? Should it include only persons with direct interactions with the issuer, or all downstream payment stablecoin holders?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "What impact would a broader or narrower 'customer' definition have on notification requirements under § 15.13 and disclosure obligations?" }
        ]
      },
      {
        id: "q_def_control_acting_in_concert",
        nprRef: "Q2–Q3",
        context: "The OCC is considering defining 'acting in concert' and clarifying the definition of 'control,' potentially incorporating presumptions from the Bank Holding Company Act or Change in Bank Control Act.",
        question: "Should the OCC define 'acting in concert' and incorporate control presumptions from existing banking law? How should these concepts apply to stablecoin issuer governance structures?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_def_digital_asset_distributed_ledger",
        nprRef: "Q6, Q9",
        context: "The proposed rule defines 'digital asset' and 'distributed ledger.' The OCC asks whether permissioned or semi-permissioned ledgers should be considered 'public' and whether the term 'public digital ledger' needs clarification.",
        question: "Are the definitions of 'digital asset' and 'distributed ledger' sufficiently clear? Should certain permissioned or semi-permissioned blockchains be considered 'public'?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_def_dasp",
        nprRef: "Q7",
        context: "The GENIUS Act uses the term 'digital asset service provider' but the proposed rule does not define it. The OCC asks whether additional clarity is needed on which activities make an entity a digital asset service provider.",
        question: "Should the OCC define 'digital asset service provider'? Are there specific activities that should be expressly excluded from or included in that definition?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_def_stablecoin_holder",
        nprRef: "Q22",
        context: "The GENIUS Act does not define 'stablecoin holder.' The OCC is considering whether to define it based on beneficial ownership, possession via digital wallets, or control of cryptographic keys.",
        question: "How should the OCC define 'stablecoin holder'? Should it be based on beneficial ownership, wallet possession, or control of cryptographic keys?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "What custody considerations should the OCC bear in mind when defining who is a 'stablecoin holder'?" }
        ]
      },
      {
        id: "q_def_trading_volume",
        nprRef: "Q23",
        context: "The OCC proposes a definition of 'trading volume' but asks whether it should be limited to exchange-traded transactions, include OTC transactions, and whether decentralized exchanges should be included.",
        question: "How should 'trading volume' be defined? Should it include DEX transactions and OTC trades, or only centralized exchange activity?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_def_other_terms",
        nprRef: "Q5, Q8, Q10–Q13, Q17–Q21, Q24",
        context: "The NPR also seeks comment on definitions for: 'depository institution' (Q5), 'director' (Q8), 'eligible financial institution' (Q10), 'money' (Q11), 'nonpublic personal information' (Q12), 'outstanding issuance value' (Q13), 'permitted payment stablecoin issuer' (Q17), 'person' (Q18), 'private key' (Q19), 'principal shareholder' (Q20), 'senior management' (Q21), and 'United States customer' (Q24).",
        question: "Are there other definitions in the proposed rule that you believe need clarification or modification? Please identify specific terms and your recommended changes.",
        type: "open",
        depth: "expert",
        followUps: []
      }
    ]
  },
  {
    id: "permitted_activities",
    title: "Permitted Activities & Prohibitions",
    subtitle: "§ 15.10 — Activities, Interest/Yield Ban, Rehypothecation, Disclosures",
    icon: "⚖️",
    nprQuestions: "Q25–Q43",
    relevantTo: ["all"],
    openingPrompt: "Section 15.10 defines what stablecoin issuers can and cannot do — from permitted activities to prohibitions on interest payments and rehypothecation of reserves. What is your overall view of the proposed activity framework?",
    questions: [
      {
        id: "q_act_permitted",
        nprRef: "Q25–Q27, Q31–Q32",
        context: "Proposed § 15.10 lists permitted activities including issuing/redeeming stablecoins, managing reserves, providing custody, and activities that directly support stablecoin operations. The OCC asks whether additional activities should be permitted and whether an approval process should exist for incidental activities.",
        question: "Are there activities not contemplated in the proposed rule that stablecoin issuers must be able to engage in? Should the OCC create an approval process for incidental activities?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "Should the OCC distinguish between activities that 'directly support' stablecoin operations (§ 15.10(a)(8)) and activities that are merely 'incidental' to them? How?" }
        ]
      },
      {
        id: "q_act_crypto_holdings",
        nprRef: "Q28–Q30, Q33",
        context: "The proposed rule would allow issuers to hold non-payment-stablecoin crypto-assets to pay transaction fees (e.g., gas fees). The OCC asks whether limits should be imposed on such holdings and what methods of payment issuers should accept for fees.",
        question: "Should the OCC limit how much non-stablecoin crypto an issuer can hold for transaction fees? How should these limits be calibrated?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_act_fx_risk",
        nprRef: "Q34",
        context: "For stablecoins not denominated in USD, the OCC asks whether managing foreign exchange risk should be an explicitly permitted activity, and if so, what limitations should apply.",
        question: "Should managing foreign exchange risk be an explicitly permitted activity for non-USD stablecoin issuers? What risk management requirements should apply?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_act_interest_prohibition",
        nprRef: "Q35–Q39",
        context: "Section 15.10(c)(4) prohibits paying interest or yield solely in connection with holding a payment stablecoin. The OCC proposes a presumption that certain arrangements with affiliates or related third parties violate this prohibition, but issuers can rebut with written materials. The OCC asks about de minimis exceptions, the scope of the prohibition, and its economic impact relative to bank deposits.",
        question: "Is the prohibition on interest/yield payments appropriately scoped? Should there be a de minimis exception? How would you address evasion through affiliate arrangements?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "What would be the economic impact of a narrow prohibition (solely in connection with holding) versus a broader prohibition that includes affiliate relationships? What impact would either have on bank deposits?" }
        ]
      },
      {
        id: "q_act_rehypothecation",
        nprRef: "Q40–Q41",
        context: "The proposed rule prohibits pledging, rehypothecating, or reusing reserve assets, with a narrow exception for repurchase agreements to create liquidity for redemptions (subject to OCC approval). The OCC asks whether collateral trustee arrangements should be permitted.",
        question: "Is the prohibition on rehypothecating reserve assets appropriately scoped? Should collateral trustee arrangements be permitted? Under what conditions should repo of reserves be allowed?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_act_disclosures_marketing",
        nprRef: "Q42–Q43",
        context: "The OCC proposes prohibiting deceptive names, marketing, and representations. It asks whether issuers should be required to affirmatively state that stablecoins are not legal tender, not issued by the U.S. government, and not subject to deposit insurance.",
        question: "What disclosures should issuers be required to provide about the nature of stablecoins? Should the OCC specify prohibited branding or marketing practices?",
        type: "open",
        depth: "general",
        followUps: []
      }
    ]
  },
  {
    id: "reserve_assets",
    title: "Reserve Asset Composition & Diversification",
    subtitle: "§ 15.11 — Eligible Assets, Diversification Options A/B, Liquidity, Concentration",
    icon: "🏦",
    nprQuestions: "Q44–Q98",
    relevantTo: ["all"],
    openingPrompt: "Reserve requirements are the backbone of the stablecoin framework — the OCC has proposed 55 questions on this topic alone. The rule requires 1:1 backing with specified asset types, with two alternative approaches for diversification. Before we get into specifics, what is working or not working about this framework as proposed?",
    questions: [
      {
        id: "q_res_eligible_assets",
        nprRef: "Q44–Q55",
        context: "Permissible reserve assets include: (1) U.S. coins and currency, (2) Treasury bills, (3) Treasury notes/bonds with ≤93 days remaining maturity, (4) demand deposits at insured institutions, (5) reverse repurchase agreements with overcollateralization, (6) Government money market fund shares, (7) Federal Reserve balances and similarly liquid Federal Government-issued assets, and (8) tokenized forms of the above. The OCC asks numerous questions about the scope of each category.",
        question: "Is the proposed list of permissible reserve assets appropriately scoped? Should specific asset types be added, removed, or modified?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "Should Treasury Floating Rate Notes, TIPS, and STRIPS be included as permissible reserve assets? Should the OCC develop a formal process to approve additional asset types under § 15.11(b)(7)?" }
        ]
      },
      {
        id: "q_res_option_a_vs_b",
        nprRef: "Q57, Q70–Q71",
        context: "The OCC presents two alternatives for reserve diversification:\n\n• Option A: Principles-based baseline requiring 'sufficiently diverse' reserves to manage credit, liquidity, interest rate, and price risks, PLUS a quantitative safe harbor (e.g., ≤40% at any single counterparty, minimum 10% in demand deposits or Fed balances, etc.).\n\n• Option B: Mandatory quantitative limits for ALL issuers with specific percentage caps.\n\nThe OCC asks which is more appropriate and how the thresholds should be calibrated.",
        question: "Which approach do you prefer — Option A (principles-based with safe harbor) or Option B (mandatory quantitative limits)? How should the thresholds be calibrated?",
        type: "choice",
        choices: ["Option A (principles-based with safe harbor)", "Option B (mandatory quantitative limits)", "Neither — I'd propose an alternative", "No strong preference"],
        depth: "practitioner",
        followUps: [
          { trigger: "Option A", question: "Under Option A, are the proposed safe harbor thresholds appropriate? What would you change?" },
          { trigger: "Option B", question: "Under Option B, what specific quantitative limits would you recommend? Should they vary by issuer size?" },
          { trigger: "Neither", question: "What alternative approach to reserve diversification would you propose?" }
        ]
      },
      {
        id: "q_res_daily_weekly_liquidity",
        nprRef: "Q57, Q62, Q74",
        context: "The safe harbor/requirements include minimum daily liquidity (10% in demand deposits, Fed balances, or amounts receivable within 1 business day) and weekly liquidity (20-30% available within 5 business days). The OCC asks whether these minimums are appropriate and whether issuers should be prohibited from relying on overnight repos to meet daily liquidity needs.",
        question: "Are the proposed daily (10%) and weekly (30%) liquidity minimums appropriate? Should issuers be barred from using short-term repo to meet daily liquidity requirements?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "Should liquidity requirements be tiered by issuer size, with larger issuers facing stricter minimums?" }
        ]
      },
      {
        id: "q_res_concentration",
        nprRef: "Q58–Q59, Q72–Q73",
        context: "The proposal includes a 40% single-counterparty concentration cap. The OCC asks whether Federal Reserve Bank holdings should be exempt (given their low credit risk), whether subsidiaries of OCC-regulated institutions should have exceptions, and whether there should be separate custodian concentration limits.",
        question: "Is the 40% single-counterparty concentration cap appropriate? Should Federal Reserve Bank holdings be exempt? Should there be separate custodian concentration requirements?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "Should a subsidiary of an OCC-regulated depository institution be permitted to hold all its reserves at the parent institution, if the parent is well-capitalized?" }
        ]
      },
      {
        id: "q_res_wam",
        nprRef: "Q57",
        context: "The OCC proposes a 20-day weighted average maturity (WAM) limit for the overall reserve portfolio to limit interest rate risk. The OCC asks whether a shorter or longer WAM would be appropriate and whether larger issuers should have shorter WAM requirements.",
        question: "Is a 20-day weighted average maturity limit appropriate? Should it differ for large vs. small issuers?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_res_insured_deposits",
        nprRef: "Q63–Q69",
        context: "For larger issuers (e.g., those with >$10B outstanding), the OCC proposes requiring a minimum percentage of reserves as insured deposits. The OCC asks how to calibrate the requirement, whether deposit placement services should be used, and whether diffusion of stablecoin deposits could create run risks at banks.",
        question: "Should larger issuers be required to hold a minimum portion of reserves as insured deposits? How should this be calibrated, and at what issuer size threshold?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "Could requirements to spread stablecoin deposits widely across the banking system actually increase systemic risk by creating new run dynamics? How would this affect community banks?" }
        ]
      },
      {
        id: "q_res_buffer_haircuts",
        nprRef: "Q46, Q75–Q77",
        context: "The OCC asks whether a reserve buffer (e.g., 1% above 1:1 backing) should be required to protect against interest rate movements. It also asks about haircuts on certain assets, limits on physical currency, and limits on thinly-traded off-the-run Treasury securities.",
        question: "Should the OCC require a reserve buffer above the 1:1 requirement? Should there be haircuts on specific asset types? Should physical currency holdings be capped?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_res_tokenized_assets",
        nprRef: "Q49, Q70",
        context: "The proposed rule permits reserves in tokenized form under § 15.11(b)(8). The OCC asks whether 'reserve in tokenized form' should be defined more precisely and whether limits should be placed on tokenized reserves (e.g., no more than 20% of total reserves).",
        question: "Should the OCC define 'reserve in tokenized form' more precisely? Should tokenized reserves be capped at a percentage of total reserves?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_res_reverse_repos",
        nprRef: "Q50, Q80",
        context: "Reverse repurchase agreements are permissible reserve assets if 'subject to overcollateralization in line with standard market terms.' The OCC asks whether more express overcollateralization requirements are needed (e.g., minimum 0.5% haircut).",
        question: "Should the OCC specify minimum overcollateralization requirements for reverse repurchase agreements used as reserve assets?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_res_stress_testing",
        nprRef: "Q81–Q82",
        context: "The OCC asks whether issuers should be required to conduct stress tests for liquidity and interest rate risk, and whether they should adopt written contingency and wind-down plans for reserve management.",
        question: "Should issuers be required to conduct stress tests on their reserve portfolios? Should they maintain written contingency and wind-down plans?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_res_discount_window",
        nprRef: "Q79, Q83–Q87",
        context: "The OCC asks whether stablecoin issuers (particularly bank subsidiaries) should be required to make arrangements to borrow from the Federal Reserve discount window or Federal Home Loan Banks as contingent funding sources.",
        question: "Should stablecoin issuers have access to or be required to arrange contingent funding from the discount window or FHLBs? How would this interact with the broader liquidity framework?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_res_valuation_reporting",
        nprRef: "Q56, Q76, Q78, Q88–Q98",
        context: "The OCC proposes fair-value measurement of reserves at all times, monthly public composition reports, and asks about real-time reporting feasibility, reporting timing, audit requirements, and whether reserve reports should name the depository institutions holding reserves.",
        question: "Are the proposed reserve reporting and valuation requirements appropriate? Should reports name specific depository institutions? Is real-time reporting feasible?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "Should the monthly composition report be published before the required audit attestation is complete? Should the report be as of a randomly selected date each month?" }
        ]
      }
    ]
  },
  {
    id: "redemption",
    title: "Redemption Requirements & Consumer Disclosure",
    subtitle: "§ 15.12 — Timelines, Fees, Direct vs. Indirect Redemption, Disclosures",
    icon: "🔄",
    nprQuestions: "Q99–Q108",
    relevantTo: ["all"],
    openingPrompt: "Redemption rights are fundamental to stablecoin holder protection. The OCC proposes specific timelines, fee disclosure requirements, and rules about who can redeem. What are your views on the proposed redemption framework?",
    questions: [
      {
        id: "q_red_timeline",
        nprRef: "Q100–Q102",
        context: "The GENIUS Act requires redemption 'not later than 1 business day.' The OCC asks whether its definition of 'timely' is appropriate, whether there should be a safe harbor for temporary failures to redeem timely, and whether longer periods should be permitted during stress.",
        question: "Has the OCC appropriately defined 'timely' redemption? Should there be a safe harbor for temporary failures? Should longer periods be allowed during market stress?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "What operational challenges would a one-business-day redemption requirement create? Are there technological solutions that could enable faster redemption?" }
        ]
      },
      {
        id: "q_red_definition_fees",
        nprRef: "Q103–Q106",
        context: "The OCC asks whether 'redemption' should be defined (e.g., when payment is initiated vs. when it settles), whether limitations should be imposed on redemption fees, and what fee disclosure requirements should look like.",
        question: "Should the OCC define 'redemption' as initiation of payment or settlement? Should redemption fees be limited? What fee disclosures should be required?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_red_direct_access",
        nprRef: "Q108",
        context: "Many stablecoin issuers currently limit direct interaction with retail holders, often only allowing institutional counterparties to redeem directly. The OCC asks whether issuers should be required to redeem stablecoins presented by any holder who has undergone appropriate onboarding, and what minimum redemption amounts should apply.",
        question: "Should issuers be required to redeem stablecoins from any holder (not just institutional counterparties)? Should there be minimum redemption amounts?",
        type: "open",
        depth: "general",
        followUps: []
      },
      {
        id: "q_red_disclosures",
        nprRef: "Q107",
        context: "The OCC proposes several categories of disclosure (redemption rights, fees, risks, nature of stablecoins). The OCC asks whether these collectively provide appropriate information and whether technical solutions like smart contract-based disclosures should be used.",
        question: "Are the proposed disclosure requirements collectively appropriate? Should disclosures be automated through smart contracts or other technical means?",
        type: "open",
        depth: "general",
        followUps: []
      }
    ]
  },
  {
    id: "risk_management",
    title: "Risk Management & Internal Controls",
    subtitle: "§ 15.13 — Governance, IT Security, Compliance, Third-Party Risk, Insurance",
    icon: "🛡️",
    nprQuestions: "Q109–Q128",
    relevantTo: ["national_bank", "subsidiary", "nonbank_applicant", "state_issuer", "custodian", "trade_association"],
    openingPrompt: "Section 15.13 establishes comprehensive risk management requirements spanning governance, IT security, operational risk, compliance, and third-party relationships. How should these requirements be calibrated for the stablecoin industry?",
    questions: [
      {
        id: "q_risk_principles_vs_detail",
        nprRef: "Q109–Q110",
        context: "The OCC asks how to balance 'principles-based' requirements with providing sufficient clarity, and whether certain risk management requirements should only apply to large issuers (e.g., those with >$10 billion outstanding issuance value).",
        question: "Should risk management requirements be principles-based or more prescriptive? Should certain requirements only apply to large issuers? What threshold defines 'large'?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_risk_governance",
        nprRef: "Q112–Q114",
        context: "The proposed rule requires clear management roles, responsibilities, and accountability. The OCC asks whether issuers should be required to adopt a risk appetite statement and conduct annual reviews of their risk management framework.",
        question: "Are the proposed governance requirements appropriate? Should issuers be required to maintain a formal risk appetite statement and conduct annual framework reviews?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_risk_interest_rate_credit",
        nprRef: "Q115–Q117",
        context: "The OCC proposes interest rate risk management requirements (policies, measurement, stress testing, limits). It also asks about credit risk management needs and whether reserve-specific risk management requirements are redundant with the § 15.11 reserve requirements.",
        question: "Are the proposed interest rate and credit risk management requirements appropriate? Are they redundant with the reserve asset requirements in § 15.11?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_risk_tech_operational",
        nprRef: "Q118–Q119",
        context: "The OCC asks about technology and operational risk management, including whether to address smart contracts, encryption, tokenized assets, cross-chain transfers (locking, minting, burning), and whether to require a Chief Risk Officer and Chief Audit Executive in addition to the IT and Security Officer.",
        question: "What technology and operational risk areas should the OCC address? Should there be specific requirements for smart contracts and cross-chain operations? Should a CRO and CAE be required?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_risk_consumer_privacy_compliance",
        nprRef: "Q120–Q122",
        context: "The OCC asks whether to include consumer protection compliance requirements, additional data privacy standards, and how to address compensation-related risks (e.g., paying employees in the issuer's own stablecoin).",
        question: "Should the OCC include specific consumer protection and data privacy requirements? How should compensation in the issuer's own stablecoin be regulated?",
        type: "open",
        depth: "general",
        followUps: []
      },
      {
        id: "q_risk_insider_affiliate",
        nprRef: "Q125–Q126",
        context: "The OCC proposes requirements for insider and affiliate transactions and asks whether they are appropriately tailored. It also asks about limits on management concentration at unaffiliated issuers.",
        question: "Are the proposed insider and affiliate transaction requirements appropriate? Should there be limits on individuals serving as officers of multiple unaffiliated issuers?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_risk_insurance",
        nprRef: "Q127",
        context: "The OCC asks whether issuers should be required to acquire insurance against certain risks, including cyber insurance and property/casualty insurance. It asks about minimum coverage levels and disclosure requirements.",
        question: "Should issuers be required to carry cyber insurance and/or property and casualty insurance? What minimum coverage levels and disclosure requirements should apply?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_risk_parent_compliance",
        nprRef: "Q128",
        context: "For stablecoin issuers that are subsidiaries of insured depository institutions, the OCC asks whether compliance with the parent's risk management framework should be deemed sufficient compliance with Part 15.",
        question: "If a stablecoin issuer is a subsidiary of an insured bank, should complying with the parent's risk management standards be sufficient for Part 15 compliance?",
        type: "open",
        depth: "expert",
        followUps: []
      }
    ]
  },
  {
    id: "supervision_reporting",
    title: "Supervision, Examinations & Reporting",
    subtitle: "§ 15.14 — Weekly/Quarterly Reports, Exam Cycle, Audits, Change in Control",
    icon: "📊",
    nprQuestions: "Q129–Q137",
    relevantTo: ["national_bank", "subsidiary", "nonbank_applicant", "state_issuer", "trade_association"],
    openingPrompt: "The OCC proposes a supervision framework with weekly data reporting, quarterly financial reports, annual audits, and regular examinations. How should this oversight framework be calibrated?",
    questions: [
      {
        id: "q_sup_weekly_reporting",
        nprRef: "Q131",
        context: "The OCC proposes confidential weekly reports covering: outstanding issuance value, reserve assets, redemptions, minting/issuance, exchanges where the stablecoin trades, the top 100 holders/traders, securities data (CUSIPs, yield, WAM, WAL), and repo/reverse repo details. The OCC asks whether this data should be collected daily or in real-time instead.",
        question: "Has the OCC identified the appropriate data fields for weekly reporting? Should any fields be added or removed? Would daily or real-time reporting be feasible?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "Should the weekly data be made public? If so, on what timeframe? Should the OCC collect secondary market transaction data (trading price and volume)?" }
        ]
      },
      {
        id: "q_sup_quarterly_reports",
        nprRef: "Q132–Q134",
        context: "All issuers must file quarterly reports of financial condition including income, expenses, balance sheet, reserves, equity, investments, capital, outstanding issuance value, and custody assets. The OCC asks about tailoring for smaller issuers, coordination with existing Call Reports, and how to minimize duplication.",
        question: "Should quarterly reporting be tailored for smaller issuers? How should quarterly reports coordinate with existing Call Report requirements to minimize duplication?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_sup_exam_cycle",
        nprRef: "Q130",
        context: "The OCC proposes criteria for extended examination cycles. It asks whether trading volume and outstanding issuance value should both be considered, and whether other factors (redemption rates, asset composition, creditworthiness) should inform exam frequency.",
        question: "Are the proposed criteria for extended examination cycles properly calibrated? What additional factors should inform exam frequency?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_sup_audits",
        nprRef: "Q134–Q136",
        context: "The OCC asks about audit standards, including whether to require the same standards as SEC reporting companies and whether the OCC should be able to request working papers from auditors. It also asks about the $1.00 nominal valuation for private keys in custody reporting.",
        question: "Should audit standards for stablecoin issuers mirror those for SEC-reporting companies? Should the OCC be able to request auditor working papers?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_sup_change_control",
        nprRef: "Q137",
        context: "The OCC proposes change-in-control requirements paralleling 12 CFR 5.50 for national banks. It asks whether these are appropriately calibrated for stablecoin issuers and what consequences should apply for acquisitions made without following the required process.",
        question: "Are the proposed change-in-control requirements appropriately structured for the stablecoin industry? What consequences should apply for non-compliance?",
        type: "open",
        depth: "expert",
        followUps: []
      }
    ]
  },
  {
    id: "state_transition",
    title: "State Issuer Transition & Waivers",
    subtitle: "§ 15.15 — $10B Threshold, Notification, Waiver Criteria, Transition-Back",
    icon: "🏛️",
    nprQuestions: "Q138–Q146",
    relevantTo: ["state_issuer", "trade_association", "consumer_advocate", "academic"],
    openingPrompt: "Under the GENIUS Act, State qualified payment stablecoin issuers exceeding $10 billion must transition to Federal oversight within 360 days. The OCC proposes a detailed transition and waiver framework. What are your views on this framework?",
    questions: [
      {
        id: "q_state_threshold",
        nprRef: "Q138",
        context: "The OCC asks whether the $10 billion threshold should be based on a point in time or a rolling average (e.g., four calendar quarters), and whether non-consolidated affiliates' issuances should count toward the threshold.",
        question: "Should the $10 billion threshold be measured at a point in time or as a rolling average? Should affiliated issuers' stablecoins be aggregated?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_state_transition_back",
        nprRef: "Q139",
        context: "The OCC asks whether there should be a mechanism for issuers that have transitioned to Federal regulation to transition back to State regulation if their outstanding issuance drops below $10 billion, and what anti-evasion protections should apply.",
        question: "Should issuers that transition to Federal regulation be able to transition back to State regulation if they shrink below $10 billion? What anti-evasion safeguards should apply?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_state_notification_timeline",
        nprRef: "Q140–Q141",
        context: "The OCC proposes that State issuers must provide written notification within five calendar days of crossing $10 billion. The OCC asks whether this timeline is appropriate and what information should be included in the notice.",
        question: "Is a five-day notification window appropriate when crossing the $10 billion threshold? Should the timeline be shorter or longer?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_state_waiver_criteria",
        nprRef: "Q142–Q146",
        context: "The OCC is considering waiver criteria including exam history, supervisory ratings, and operational compliance. It asks about waiver renewal periods (1 vs. 5 years), the OCC's right to discontinue waivers (with 100-day notice), capital analysis submission timelines, and the timeframe for initial OCC examination after transition.",
        question: "What criteria should the OCC use for waiver decisions? Should waivers have renewal periods? Is the proposed 100-day notice to discontinue waivers reasonable?",
        type: "open",
        depth: "expert",
        followUps: [
          { trigger: "any", question: "Is the proposed timeframe for the initial OCC examination after transition appropriate? Should it be shorter (3–4 months) or longer (9–12 months)?" }
        ]
      }
    ]
  },
  {
    id: "exigent_circumstances",
    title: "Unusual & Exigent Circumstances",
    subtitle: "§ 15.16 — Emergency Authority, Criteria, Transparency",
    icon: "🚨",
    nprQuestions: "Q147–Q148",
    relevantTo: ["all"],
    openingPrompt: "The OCC proposes criteria for determining when unusual and exigent circumstances exist that would trigger special supervisory authority over State issuers. What factors should the OCC consider?",
    questions: [
      {
        id: "q_exigent_criteria",
        nprRef: "Q147",
        context: "The OCC has limited visibility into State-regulated issuers and asks whether it should consider: requests from State regulators, significant secondary market price fluctuations, inability to timely redeem, significant unanticipated losses, or deployment of nonstandard liquidity management tools when determining whether unusual and exigent circumstances exist.",
        question: "What criteria should the OCC consider when determining unusual and exigent circumstances? Should State regulators or issuers be able to request that the OCC exercise this authority?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_exigent_transparency",
        nprRef: "Q148",
        context: "The OCC asks whether it should make public when it determines that unusual and exigent circumstances exist, and what information should be included or excluded from any public announcement.",
        question: "Should the OCC publicly disclose when it invokes unusual and exigent circumstances authority? What information should be included or withheld?",
        type: "open",
        depth: "practitioner",
        followUps: []
      }
    ]
  },
  {
    id: "custody",
    title: "Custody & Safekeeping",
    subtitle: "Subpart C — Covered Assets, Custodial Standards, Sub-Custodians, Insolvency Priority",
    icon: "🔐",
    nprQuestions: "Q149–Q165",
    relevantTo: ["national_bank", "subsidiary", "custodian", "trade_association"],
    openingPrompt: "Subpart C implements the GENIUS Act's custody requirements for stablecoin reserves, private keys, and related assets. The OCC proposes principles-based custodial management standards. What is your overall assessment of this framework?",
    questions: [
      {
        id: "q_cust_definitions_scope",
        nprRef: "Q149–Q153",
        context: "The OCC defines 'covered assets' to include payment stablecoin reserves, payment stablecoins, private keys, cash, and other property received in connection with custody services. The OCC asks whether to use precise statutory language (which varies slightly across subsections) or its harmonized interpretation.",
        question: "Is the proposed definition of 'covered assets' appropriately scoped? Should the OCC use its harmonized interpretation or the precise statutory language, which varies across GENIUS Act subsections?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_cust_principles_vs_prescriptive",
        nprRef: "Q154–Q155",
        context: "The OCC proposes principles-based custody requirements in line with industry-standard custodial management practices. It asks whether more prescriptive requirements (e.g., specific written policies, procedures, internal controls, sub-custodian due diligence) would be more appropriate.",
        question: "Should custody requirements be principles-based or more prescriptive? What are the costs and benefits of each approach for the stablecoin custody market?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_cust_control_keys",
        nprRef: "Q156–Q158",
        context: "The OCC asks about custodial control of stablecoin assets via private keys, including when custodial requirements apply, how control is maintained through multi-signature or hardware security modules, and what happens when assets are moved for settlement.",
        question: "How should the OCC define custodial 'control' over private keys and digital assets? Should multi-signature and HSM arrangements be specifically addressed?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_cust_insolvency_priority",
        nprRef: "Q160–Q161",
        context: "The GENIUS Act provides a priority regime for covered assets in insolvency. The OCC asks about implementing this priority, particularly for omnibus accounts where multiple customers' assets are commingled, and whether the exclusion for certain custodians creates gaps.",
        question: "How should the insolvency priority regime work in practice, particularly for omnibus custody accounts? Are there gaps in the proposed framework?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_cust_subcustodians_reporting",
        nprRef: "Q159, Q162–Q165",
        context: "The OCC asks about withdrawal procedures for custodial assets, sub-custodian requirements, fiduciary powers in the context of stablecoin custody, and reporting requirements (including the relationship between Schedule RC-T of the Call Report and stablecoin custody reporting).",
        question: "How should withdrawal of custodial assets be governed? What sub-custodian oversight and reporting requirements are appropriate?",
        type: "open",
        depth: "practitioner",
        followUps: []
      }
    ]
  },
  {
    id: "applications",
    title: "Applications, Registration & Licensing",
    subtitle: "Subpart D — §§ 15.30–15.32 — Approval Process, Foreign Issuers, Information Requirements",
    icon: "📝",
    nprQuestions: "Q166–Q176",
    relevantTo: ["nonbank_applicant", "state_issuer", "trade_association"],
    openingPrompt: "Subpart D establishes the application process for entities seeking to become permitted payment stablecoin issuers, including requirements for existing banks, new nonbank charters, and foreign issuers. What are your views on the proposed application framework?",
    questions: [
      {
        id: "q_app_approval_factors",
        nprRef: "Q167–Q169",
        context: "The OCC proposes approval criteria for permitted payment stablecoin issuers. It asks whether additional safety and soundness factors should be established, and specifically requests comment on standards for issuing a Federal charter to a nonbank that seeks to be a Federal qualified payment stablecoin issuer.",
        question: "Are the proposed approval criteria appropriate? Should there be specific standards for chartering nonbank stablecoin issuers? What additional factors should the OCC consider?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_app_foreign_issuers",
        nprRef: "Q170–Q173",
        context: "The OCC asks how to evaluate reserves held by foreign issuers (especially regarding reserves held abroad), what additional reporting should apply, and how foreign payment stablecoin issuers registering or seeking a Federal charter should be handled.",
        question: "How should the OCC evaluate and supervise foreign payment stablecoin issuers? Should reserves held abroad be subject to additional requirements (haircuts, capital charges)?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_app_substantially_complete",
        nprRef: "Q174–Q176",
        context: "The GENIUS Act refers to 'substantially complete' application requirements. The OCC asks whether existing bank capital requirements should apply to bank-subsidiary issuers and whether the implementing regulations should use parallel 'substantially complete' language for all entity types.",
        question: "Should existing bank capital rules apply to bank subsidiaries that issue stablecoins? Should the 'substantially complete' application standard apply uniformly to all entity types?",
        type: "open",
        depth: "expert",
        followUps: []
      }
    ]
  },
  {
    id: "capital",
    title: "Capital Requirements",
    subtitle: "Subpart E — §§ 15.40–15.42 — Minimum Capital, Backstop, Risk-Based Components",
    icon: "💰",
    nprQuestions: "Q177–Q190",
    relevantTo: ["national_bank", "subsidiary", "nonbank_applicant", "state_issuer", "trade_association", "academic"],
    openingPrompt: "Subpart E proposes capital requirements for stablecoin issuers, including minimum capital, backstop requirements, and potential risk-based components. The OCC has considered several approaches and asks 14 questions. What is your assessment of the capital framework?",
    questions: [
      {
        id: "q_cap_elements",
        nprRef: "Q177–Q178",
        context: "The OCC proposes capital elements including retained earnings and stock. It asks whether subordinated debt (tier 2 capital) should be permitted, whether a simpler GAAP equity measure should be used instead, and whether deductions should be required for goodwill, deferred tax assets, or other illiquid/intangible assets.",
        question: "Are the proposed capital elements appropriate? Should the OCC use a simpler equity measure (like tangible equity) instead of importing the bank capital framework?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_cap_minimum_backstop",
        nprRef: "Q179–Q180",
        context: "The OCC proposes a $5 million minimum capital requirement for de novo issuers and a backstop based on total expenses. It asks whether these are appropriately calibrated and whether adjustments should account for newly acquired or divested businesses.",
        question: "Is the $5 million minimum capital requirement appropriate for de novo issuers? Is the expense-based backstop appropriately calibrated?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_cap_risk_based",
        nprRef: "Q181–Q184",
        context: "The OCC asks about several potential risk-based capital components: (1) capital tied to outstanding issuance value, (2) charges for price risk, credit risk (e.g., 2% for uninsured deposits), interest rate risk, and operational risk (1% scaling with size), (3) capital for custody activities, and (4) capital for litigation/legal/insolvency costs.",
        question: "Should the OCC adopt risk-based capital charges for credit risk, operational risk, interest rate risk, and/or custody activities? How should these be calibrated?",
        type: "open",
        depth: "expert",
        followUps: [
          { trigger: "any", question: "Should operational risk capital scale with issuer size (e.g., 1% base with additional marginal charge at thresholds)? Should charges reflect recent loss experience?" }
        ]
      },
      {
        id: "q_cap_timing_international",
        nprRef: "Q185–Q187",
        context: "The OCC asks about capital calculation timing (end of quarter vs. other periods), timing for meeting requirements, and whether U.S. capital requirements should align with approaches adopted by foreign jurisdictions.",
        question: "Should capital requirements be calculated quarterly? Are there advantages to aligning with international approaches, or should the U.S. framework be distinct?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_cap_individual_trust_banks_branches",
        nprRef: "Q188–Q190",
        context: "The OCC asks about individual additional capital requirements for issuers with 'excessive volatility,' alternative capital calculations for uninsured national trust banks, and how Federal branch capital equivalency deposits should account for stablecoin programs.",
        question: "Should the OCC impose individual additional capital requirements for issuers with excessive volatility? How should trust bank and Federal branch capital requirements be adapted?",
        type: "open",
        depth: "expert",
        followUps: []
      }
    ]
  },
  {
    id: "assessments",
    title: "Assessments & Fees",
    subtitle: "12 CFR Part 8 — Assessment Structure, Discounts, Methodology",
    icon: "💵",
    nprQuestions: "Q191–Q197",
    relevantTo: ["national_bank", "subsidiary", "nonbank_applicant", "state_issuer", "trade_association"],
    openingPrompt: "The OCC proposes to fund supervision of stablecoin activities through assessments on regulated entities, with a discount for required stablecoin reserves. What are your views on the assessment structure?",
    questions: [
      {
        id: "q_assess_structure",
        nprRef: "Q191–Q192",
        context: "The OCC asks whether the existing assessment structure (as amended) will adequately fund supervision of GENIUS Act activities, and whether it has the right data from Call Reports and proposed supplementary reports to impose assessments.",
        question: "Will the proposed assessment structure adequately fund OCC supervision? Are the data sources for calculating assessments sufficient?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_assess_overcollateralization",
        nprRef: "Q194–Q195",
        context: "The OCC proposes discounting assessments for required reserves but not for voluntary over-collateralization. It asks whether the discount should extend to over-collateralized reserves (typically 1-5% above requirements) and whether there should be graduated discounts or caps at higher reserve asset levels.",
        question: "Should the assessment discount extend to voluntary over-collateralization? Should there be graduated discounts or caps at higher reserve levels?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_assess_joint_supervision",
        nprRef: "Q193, Q196–Q197",
        context: "The OCC asks about assessment methodology for entities jointly owned by multiple institutions, reporting adequacy for assessment calculation, and whether issuers subject to joint/coordinated supervision (with State or foreign regulators) should receive assessment discounts (e.g., 35-55% for shared jurisdiction).",
        question: "Should issuers under joint supervision with State or foreign regulators receive assessment discounts? Is a 35-55% range appropriate?",
        type: "open",
        depth: "expert",
        followUps: []
      }
    ]
  },
  {
    id: "general_cross_cutting",
    title: "General & Cross-Cutting Issues",
    subtitle: "Financial Stability, Competition, Technology, Interoperability, Fraud, Insolvency",
    icon: "🌐",
    nprQuestions: "Q198–Q211",
    relevantTo: ["all"],
    openingPrompt: "The OCC asks 14 broad questions covering financial stability, credit creation, competition, technology, interoperability, fraud, and insolvency. These cross-cutting issues affect the entire framework. What are your most important concerns?",
    questions: [
      {
        id: "q_gen_financial_stability",
        nprRef: "Q198, Q200",
        context: "The OCC asks whether the proposed rule fulfills the GENIUS Act's financial stability mandate and what impact it would have on credit creation (since stablecoin reserves displace deposits that banks otherwise lend).",
        question: "Does the proposed rule adequately ensure financial stability? What impact would it have on credit creation and bank lending?",
        type: "open",
        depth: "practitioner",
        followUps: [
          { trigger: "any", question: "What additional data should the OCC collect to monitor financial stability impacts of stablecoin growth?" }
        ]
      },
      {
        id: "q_gen_size_tiering",
        nprRef: "Q201",
        context: "The OCC asks whether additional aspects of the rule should be adjusted based on issuer size, and whether 'size' should be measured by outstanding issuance or another metric.",
        question: "Should additional aspects of the proposed rule be tiered by issuer size? How should 'size' be measured — by outstanding issuance, total assets, or another metric?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_gen_competition",
        nprRef: "Q202",
        context: "The OCC asks whether any aspects of the rule should be adjusted to promote fair competition between banks and non-banks.",
        question: "Are there aspects of the proposed rule that would create an unfair competitive advantage for banks over non-banks, or vice versa? How should this be addressed?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_gen_foreign_issuance",
        nprRef: "Q203–Q204",
        context: "The OCC asks about issuers that also issue the same or similar stablecoins in foreign jurisdictions, including how holders should distinguish between GENIUS Act-compliant stablecoins and those issued under other regulatory regimes.",
        question: "How should the OCC address issuers that operate in both U.S. and foreign jurisdictions? How should holders distinguish GENIUS Act-compliant stablecoins from others?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_gen_technology",
        nprRef: "Q205",
        context: "The OCC asks about technical developments in distributed ledger protocols, digital assets, or related technologies that the proposed rule should address — including automated reporting, smart contract compliance, and blockchain-specific risks to liquidity, redemption, and operational stability.",
        question: "Are there technical developments (smart contracts, automated reporting, blockchain-specific risks) that the proposed rule should more explicitly address?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_gen_consortium_ownership",
        nprRef: "Q206",
        context: "The OCC asks about considerations for stablecoin issuers owned or operated by a consortium of entities, including how to determine the primary Federal regulator when the consortium includes both State-chartered and nationally-chartered institutions.",
        question: "What special considerations should apply to consortium-owned stablecoin issuers? How should the primary Federal regulator be determined?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_gen_insolvency",
        nprRef: "Q207",
        context: "The OCC asks whether it should adopt new rules to implement the GENIUS Act's insolvency provisions and whether issuers should be required to establish resolution plans.",
        question: "Should the OCC adopt specific insolvency rules for stablecoin issuers? Should resolution plans be required?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_gen_interoperability",
        nprRef: "Q208–Q209",
        context: "The GENIUS Act requires regulators to assess interoperability standards. The OCC asks what efforts issuers are taking, what considerations should guide standard-setting, and what risks are posed by cross-chain bridges and interoperability solutions (including BSA/AML and sanctions implications).",
        question: "Should the OCC prescribe interoperability standards? What risks do cross-chain bridges pose, particularly for AML/sanctions compliance?",
        type: "open",
        depth: "practitioner",
        followUps: []
      },
      {
        id: "q_gen_fraud",
        nprRef: "Q210",
        context: "The OCC asks about fraud risks, including bad actors creating fraudulent tokens mimicking legitimate payment stablecoins. It asks whether authentic stablecoins should be required to have verifiable electronic signatures.",
        question: "What fraud risks should the OCC address? Should authentic stablecoins be required to have verifiable electronic signatures or other anti-counterfeiting measures?",
        type: "open",
        depth: "general",
        followUps: []
      },
      {
        id: "q_gen_existing_rules",
        nprRef: "Q211",
        context: "The OCC asks what changes to existing rules should be made in recognition of the GENIUS Act — for example, whether 12 CFR parts 44 (Volcker Rule) or 50 (liquidity requirements) should be revised so stablecoin reserves don't count against relevant thresholds.",
        question: "Should existing OCC rules (e.g., Volcker Rule, liquidity rules) be revised to accommodate stablecoin activities? Which specific rule changes are needed?",
        type: "open",
        depth: "expert",
        followUps: []
      },
      {
        id: "q_gen_accounting",
        nprRef: "Q199",
        context: "The OCC asks whether additional guidance is needed on accounting treatment for issued stablecoins and associated reserve assets, and what legal structures are relevant to accounting treatment.",
        question: "Is additional accounting guidance needed for stablecoins and reserve assets? What legal structures affect the accounting treatment?",
        type: "open",
        depth: "expert",
        followUps: []
      }
    ]
  }
];

// ─── CROSS-CUTTING PROMPTS ──────────────────────────────────────────────────

const CROSS_CUTTING_TRIGGERS = [
  { keywords: ["redemption", "liquidity", "redeem"], source: "redemption", target: "reserve_assets", prompt: "You've connected redemption requirements to reserve liquidity. Would you like to explain how the redemption timeline (§ 15.12) and reserve liquidity requirements (�� 15.11(c)) interact? This kind of cross-section analysis is particularly useful for the OCC." },
  { keywords: ["capital", "small", "smaller", "community", "burden"], source: "capital", target: "state_transition", prompt: "You're raising a point about competitive effects on smaller issuers. This also relates to the State issuer transition threshold. Would you like to address how the capital framework and the $10 billion transition threshold interact for entities at your scale?" },
  { keywords: ["custody", "concentration", "diversif"], source: "custody", target: "reserve_assets", prompt: "This connects to the diversification requirements for reserve assets. Would you like to explain how the custody and reserve diversification provisions work together or create tension?" },
  { keywords: ["interest", "yield", "deposit", "compete"], source: "permitted_activities", target: "general_cross_cutting", prompt: "The interest/yield prohibition has implications for competition and financial stability. Would you like to address how this prohibition affects the broader competitive landscape between banks, non-banks, and DeFi?" },
  { keywords: ["stress", "run", "crisis", "systemic"], source: "reserve_assets", target: "exigent_circumstances", prompt: "You're raising stress scenarios that connect to the OCC's unusual and exigent circumstances authority. Would you like to address how reserve requirements and emergency powers should work together?" },
  { keywords: ["report", "data", "burden", "compliance cost"], source: "supervision_reporting", target: "assessments", prompt: "Reporting burden and assessment costs are related. Would you like to discuss how the OCC could design reporting requirements that also serve assessment calculation needs, reducing overall compliance burden?" },
  { keywords: ["foreign", "international", "cross-border"], source: "applications", target: "general_cross_cutting", prompt: "Your comments on foreign issuers connect to broader questions about international coordination and competitive parity. Would you like to address cross-border considerations more broadly?" },
  { keywords: ["technology", "smart contract", "blockchain", "DLT"], source: "risk_management", target: "general_cross_cutting", prompt: "Your technology-related comments connect to the OCC's broader questions about distributed ledger technology and automated compliance. Would you like to address the technology framework more broadly?" },
];

// ─── COUNTERPOINT DATA ────────────────────────────────────────────────────────

const COUNTERPOINTS = {
  q_res_option_a_vs_b: {
    optionA: "Proponents of Option A argue that principles-based regulation allows issuers to optimize their reserve portfolios for their specific business models, while the safe harbor provides regulatory certainty for those who prefer clear rules.",
    optionB: "Supporters of Option B contend that mandatory quantitative limits create a level playing field, reduce supervisory uncertainty, and prevent a race to the bottom where issuers exploit the flexibility of principles-based standards."
  },
  q_res_daily_weekly_liquidity: {
    higher: "Some argue that historical stablecoin de-pegging events saw redemption demand spike well above 10% within hours, suggesting higher daily liquidity requirements (20-30%) are necessary for peg stability during stress.",
    lower: "Industry participants note that high daily liquidity comes at a direct cost — liquid assets earn lower returns — and argue that 5-7% may suffice given typically low daily redemption rates observed in practice."
  },
  q_act_interest_prohibition: {
    support: "Supporters argue the prohibition maintains a clear boundary between payment instruments and investment products, avoiding complex securities law questions and maintaining utility-focused stablecoins.",
    oppose: "Critics contend the prohibition puts regulated issuers at a competitive disadvantage to DeFi protocols and offshore issuers that offer yield, potentially pushing activity outside the regulated perimeter."
  },
  q_red_timeline: {
    shorter: "Consumer advocates argue that modern payment technology enables near-instantaneous settlement and that a multi-day window is inconsistent with the promise of blockchain-based payments.",
    longer: "Issuers note that converting reserve assets to cash and settling through the banking system involves multiple intermediaries and business-day constraints that make very short windows operationally challenging."
  },
  q_state_threshold: {
    lower: "Some argue that a lower threshold would bring more issuers under Federal oversight sooner, reducing regulatory arbitrage risk and ensuring consistent consumer protection.",
    higher: "Others contend that a higher threshold would allow State innovation to continue while only capturing the most systemically significant issuers for Federal oversight."
  },
  q_cap_risk_based: {
    moreCapital: "Proponents of higher capital argue that stablecoin issuers face novel operational, technology, and reputational risks that justify substantial loss-absorbing capacity, even without credit risk from lending.",
    lessCapital: "Industry argues that stablecoin issuers hold only high-quality liquid assets, don't engage in maturity transformation or lending, and therefore need fundamentally less capital than traditional banks."
  },
  q_gen_financial_stability: {
    concerned: "Financial stability advocates warn that large-scale stablecoin adoption could drain deposits from the banking system, reducing banks' ability to lend and potentially creating new sources of systemic run risk.",
    optimistic: "Proponents argue that stablecoins actually improve financial stability by providing a transparent, fully-reserved alternative to fractional-reserve banking and by making the financial system more efficient."
  }
};

// ─── UTILITY: Generate Position Paper ────────────────────────────────────────

function generatePositionPaper(profile, responses) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const entityLabel = ENTITY_TYPES.find(e => e.id === profile.entityType)?.label || profile.entityType;

  let paper = `COMMENT LETTER\n`;
  paper += `${"═".repeat(70)}\n\n`;
  paper += `Date: ${today}\n\n`;
  paper += `Office of the Comptroller of the Currency\n`;
  paper += `400 7th Street SW, Suite 3E-218\n`;
  paper += `Washington, DC 20219\n\n`;
  paper += `Re: Docket ID OCC-2025-0372; RIN 1557-AF41\n`;
  paper += `Implementing the GENIUS Act for Payment Stablecoins\n`;
  paper += `NR 2026-9a\n\n`;
  paper += `${"─".repeat(70)}\n\n`;

  // Introduction
  if (profile.orgName) {
    paper += `On behalf of ${profile.orgName}, `;
  } else {
    paper += `As `;
  }
  paper += `a ${entityLabel.toLowerCase()}, we appreciate the opportunity to comment on the Office of the Comptroller of the Currency's Notice of Proposed Rulemaking implementing the Guiding and Establishing National Innovation for U.S. Stablecoins Act (GENIUS Act) for payment stablecoins.\n\n`;

  if (profile.scale && profile.scale !== "na") {
    const scaleLabel = SCALE_OPTIONS.find(s => s.id === profile.scale)?.label || "";
    paper += `Our perspective is informed by our position as an entity with approximately ${scaleLabel.toLowerCase()} in outstanding stablecoin issuance or related operations.\n\n`;
  }

  if (profile.frameworkAssessment) {
    const assessLabel = FRAMEWORK_ASSESSMENT.find(a => a.id === profile.frameworkAssessment)?.label || "";
    paper += `Overall, we ${assessLabel.toLowerCase()} the OCC's proposed regulatory framework for payment stablecoins.\n\n`;
  }

  // Table of contents
  const answeredModules = TOPIC_MODULES.filter(mod =>
    mod.questions.some(q => responses[q.id]?.answer?.trim())
  );

  if (answeredModules.length > 0) {
    paper += `We address the following topics in this comment letter:\n\n`;
    answeredModules.forEach((mod, i) => {
      paper += `  ${i + 1}. ${mod.title} (${mod.subtitle})\n`;
    });
    paper += `\n${"─".repeat(70)}\n`;
  }

  // Body — organized by respondent's themes
  answeredModules.forEach(mod => {
    paper += `\n${"═".repeat(70)}\n`;
    paper += `${mod.title.toUpperCase()}\n`;
    paper += `${mod.subtitle}\n`;
    paper += `NPR Questions: ${mod.nprQuestions}\n`;
    paper += `${"═".repeat(70)}\n\n`;

    mod.questions.forEach(q => {
      const resp = responses[q.id];
      if (!resp?.answer?.trim()) return;

      paper += `[NPR Ref: ${q.nprRef}]\n`;
      paper += `--- ${q.question} ---\n\n`;

      if (resp.choice) {
        paper += `Position: ${resp.choice}\n\n`;
      }
      if (resp.numericValue) {
        paper += `Recommended value: ${resp.numericValue}${q.unit || ""}\n`;
        if (q.currentProposal) paper += `(Current OCC proposal: ${q.currentProposal})\n`;
        paper += `\n`;
      }

      paper += `${resp.answer}\n\n`;

      if (resp.followUpAnswer?.trim()) {
        paper += `${resp.followUpAnswer}\n\n`;
      }

      if (resp.crossCuttingAnswer?.trim()) {
        paper += `[Cross-cutting analysis]\n${resp.crossCuttingAnswer}\n\n`;
      }
    });
  });

  // General comments
  paper += `${"═".repeat(70)}\n`;
  paper += `ADDITIONAL COMMENTS\n`;
  paper += `${"═".repeat(70)}\n\n`;

  if (responses._general?.trim()) {
    paper += `${responses._general}\n\n`;
  } else {
    paper += `[No additional general comments provided.]\n\n`;
  }

  // Threshold calibrations
  if (profile.thresholdCalibrations && Object.keys(profile.thresholdCalibrations).length > 0) {
    paper += `${"═".repeat(70)}\n`;
    paper += `THRESHOLD CALIBRATION RESPONSES\n`;
    paper += `${"═".repeat(70)}\n\n`;
    THRESHOLD_CALIBRATIONS.forEach(t => {
      const val = profile.thresholdCalibrations?.[t.id];
      if (val) {
        paper += `• ${t.label} (${t.section}): ${val}\n`;
      }
    });
    paper += `\n`;
  }

  // Attachments
  if (responses._attachments?.trim()) {
    paper += `${"═".repeat(70)}\n`;
    paper += `SUPPORTING MATERIALS\n`;
    paper += `${"═".repeat(70)}\n\n`;
    paper += `${responses._attachments}\n\n`;
  }

  // Closing
  paper += `${"─".repeat(70)}\n\n`;
  paper += `Respectfully submitted,\n\n`;
  if (profile.orgName) paper += `${profile.orgName}\n`;
  if (profile.contactName) paper += `${profile.contactName}\n`;
  if (profile.contactEmail) paper += `${profile.contactEmail}\n`;
  paper += `\n[This comment letter was drafted with the assistance of the OCC NPR Hybrid Comment Interviewer tool. All positions and analysis reflect the views of the respondent.]\n`;

  return paper;
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function ProgressBar({ current, total, label }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 h-2" style={{ borderRadius: 2 }}>
        <div
          className="bg-blue-700 h-2 transition-all duration-300"
          style={{ width: `${pct}%`, borderRadius: 2 }}
        />
      </div>
    </div>
  );
}

function DepthDial({ depth, onChange }) {
  const levels = [
    { id: "general", label: "General Public", desc: "Plain language, essential questions only" },
    { id: "practitioner", label: "Practitioner", desc: "Industry context, moderate detail" },
    { id: "expert", label: "Expert / Legal", desc: "Full regulatory detail, all sub-questions" },
  ];
  return (
    <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
      <div className="text-sm font-medium text-gray-700 mb-3">Response Depth</div>
      <div className="flex gap-2">
        {levels.map(l => (
          <button
            key={l.id}
            onClick={() => onChange(l.id)}
            className={`flex-1 p-3 text-left border transition-colors ${
              depth === l.id
                ? "border-blue-700 bg-blue-50 text-blue-900"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            <div className="text-sm font-medium">{l.label}</div>
            <div className="text-xs mt-1 opacity-75">{l.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ question, response, onUpdate, depth, showCounterpoint }) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showCounter, setShowCounter] = useState(false);

  // Filter by depth
  if (depth === "general" && question.depth === "expert") return null;
  if (depth === "general" && question.depth === "practitioner" && question.type !== "choice") return null;

  const counterData = COUNTERPOINTS[question.id];

  const handleMainAnswer = (val) => {
    onUpdate({ ...response, answer: val });
  };

  const handleChoice = (val) => {
    onUpdate({ ...response, choice: val });
    const fu = question.followUps?.find(f =>
      f.trigger === "any" || f.trigger === val || val?.includes(f.trigger)
    );
    if (fu) setShowFollowUp(true);
  };

  const handleNumeric = (val) => {
    onUpdate({ ...response, numericValue: val });
  };

  return (
    <div className="mb-8 border border-gray-200 bg-white">
      {/* NPR Reference */}
      <div className="px-5 pt-4 flex items-center gap-2">
        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{question.nprRef}</span>
        {question.depth === "expert" && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Expert</span>}
      </div>

      {/* Context */}
      <div className="p-5 pb-3">
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Background</div>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{question.context}</div>
      </div>

      {/* Question */}
      <div className="p-5 pt-2">
        <div className="text-base font-medium text-gray-900 mb-4">{question.question}</div>

        {/* Choice type */}
        {question.type === "choice" && question.choices && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {question.choices.map(c => (
                <button
                  key={c}
                  onClick={() => handleChoice(c)}
                  className={`px-4 py-2 text-sm border transition-colors ${
                    response?.choice === c
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-gray-300 text-gray-700 hover:border-blue-500"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Numeric type */}
        {question.type === "numeric" && (
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-gray-500">Your recommendation:</span>
            <input
              type="number"
              value={response?.numericValue || ""}
              onChange={e => handleNumeric(e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-blue-700"
              placeholder="e.g., 10"
            />
            <span className="text-sm text-gray-500">{question.unit}</span>
            {question.currentProposal && (
              <span className="text-xs text-gray-400 ml-2">(OCC proposes: {question.currentProposal})</span>
            )}
          </div>
        )}

        {/* Main text area */}
        <textarea
          value={response?.answer || ""}
          onChange={e => handleMainAnswer(e.target.value)}
          placeholder="Share your views, reasoning, and any supporting evidence..."
          className="w-full h-32 px-4 py-3 border border-gray-300 text-sm leading-relaxed focus:outline-none focus:border-blue-700 resize-y"
        />

        {/* Counterpoint prompt */}
        {counterData && showCounterpoint && (
          <div className="mt-3">
            <button
              onClick={() => setShowCounter(!showCounter)}
              className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              {showCounter ? "▾" : "▸"} Consider alternative perspectives
            </button>
            {showCounter && (
              <div className="mt-2 p-4 bg-amber-50 border border-amber-200 text-sm">
                <div className="font-medium text-amber-900 mb-2">Perspectives to consider:</div>
                {Object.entries(counterData).map(([key, text]) => (
                  <div key={key} className="mb-2 text-amber-800 text-sm leading-relaxed">• {text}</div>
                ))}
                <div className="text-xs text-amber-600 mt-2 italic">
                  These perspectives are provided to help strengthen your response, not to suggest a "correct" answer.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Follow-up */}
        {showFollowUp && question.followUps?.length > 0 && (
          <div className="mt-4 p-4 border-l-4 border-blue-200 bg-blue-50">
            <div className="text-sm font-medium text-blue-900 mb-2">
              Follow-up: {question.followUps.find(f =>
                f.trigger === "any" || f.trigger === response?.choice || response?.answer?.includes(f.trigger)
              )?.question}
            </div>
            <textarea
              value={response?.followUpAnswer || ""}
              onChange={e => onUpdate({ ...response, followUpAnswer: e.target.value })}
              placeholder="Elaborate on your reasoning..."
              className="w-full h-24 px-3 py-2 border border-blue-200 text-sm focus:outline-none focus:border-blue-700 resize-y"
            />
          </div>
        )}

        {/* Show follow-up trigger */}
        {!showFollowUp && question.followUps?.length > 0 && response?.answer?.trim() && (
          <button
            onClick={() => setShowFollowUp(true)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            + Answer a follow-up question on this topic
          </button>
        )}

        {/* Attachment flag */}
        <div className="mt-3">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={response?.hasAttachment || false}
              onChange={e => onUpdate({ ...response, hasAttachment: e.target.checked })}
              className="rounded border-gray-300"
            />
            I have supporting data, analysis, or legal authority to attach for this point
          </label>
        </div>
      </div>
    </div>
  );
}

function CrossCuttingPrompt({ prompt, onRespond }) {
  const [show, setShow] = useState(false);
  const [answer, setAnswer] = useState("");

  return (
    <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200">
      <div className="text-sm text-indigo-800 mb-2">{prompt}</div>
      {!show ? (
        <div className="flex gap-2">
          <button onClick={() => setShow(true)} className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-300">
            Yes, I'd like to address this
          </button>
          <button onClick={() => {}} className="text-xs px-3 py-1 text-gray-500 hover:text-gray-700">
            Skip
          </button>
        </div>
      ) : (
        <div className="mt-2">
          <textarea
            value={answer}
            onChange={e => { setAnswer(e.target.value); onRespond(e.target.value); }}
            placeholder="Explain the cross-cutting connection..."
            className="w-full h-24 px-3 py-2 border border-indigo-200 text-sm focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>
      )}
    </div>
  );
}

function TopicModule({ module, responses, onUpdate, depth, allResponses }) {
  const [expanded, setExpanded] = useState(true);

  const visibleQuestions = module.questions.filter(q => {
    if (depth === "general" && q.depth === "expert") return false;
    if (depth === "general" && q.depth === "practitioner" && q.type !== "choice") return false;
    return true;
  });

  const answered = visibleQuestions.filter(q => responses[q.id]?.answer?.trim()).length;

  // Detect cross-cutting prompts based on all current responses in this module
  const crossCuttingPrompts = useMemo(() => {
    const prompts = [];
    module.questions.forEach(q => {
      const resp = responses[q.id]?.answer || "";
      if (!resp.trim()) return;
      CROSS_CUTTING_TRIGGERS.forEach(trigger => {
        if (trigger.source === module.id &&
            trigger.keywords.some(kw => resp.toLowerCase().includes(kw)) &&
            !prompts.find(p => p.target === trigger.target)) {
          prompts.push(trigger);
        }
      });
    });
    return prompts;
  }, [module.id, module.questions, responses]);

  return (
    <div className="mb-6 border border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{module.icon}</span>
          <div>
            <div className="text-lg font-medium text-gray-900">{module.title}</div>
            <div className="text-sm text-gray-500">{module.subtitle}</div>
            <div className="text-xs text-gray-400 mt-1">NPR {module.nprQuestions}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{answered}/{visibleQuestions.length} answered</span>
          <span className="text-gray-400">{expanded ? "▾" : "▸"}</span>
        </div>
      </button>
      {expanded && (
        <div className="p-5 pt-0">
          {/* Opening prompt */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200">
            <div className="text-sm text-blue-800 italic">{module.openingPrompt}</div>
          </div>

          {visibleQuestions.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              response={responses[q.id] || {}}
              onUpdate={val => onUpdate(q.id, val)}
              depth={depth}
              showCounterpoint={depth === "expert" || depth === "practitioner"}
            />
          ))}

          {/* Cross-cutting prompts */}
          {crossCuttingPrompts.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-indigo-900 mb-2">Cross-cutting connections detected:</div>
              {crossCuttingPrompts.map((cp, i) => (
                <CrossCuttingPrompt
                  key={i}
                  prompt={cp.prompt}
                  onRespond={(val) => {
                    onUpdate(`_crosscut_${module.id}_${cp.target}`, { answer: val, crossCuttingAnswer: val });
                  }}
                />
              ))}
            </div>
          )}

          {/* Module-level open-ended capture */}
          <div className="mt-4 p-4 border border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Is there anything else about {module.title.toLowerCase()} you'd like the OCC to consider that we haven't covered?
            </div>
            <textarea
              value={responses[`_additional_${module.id}`]?.answer || ""}
              onChange={e => onUpdate(`_additional_${module.id}`, { answer: e.target.value })}
              placeholder="Additional comments on this topic..."
              className="w-full h-20 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-blue-700 resize-y"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LAYER 1: STRUCTURED INTAKE ──────────────────────────────────────────────

function Layer1_Intake({ profile, setProfile, onComplete }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "About You",
      content: (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organization name (optional)</label>
          <input
            value={profile.orgName || ""}
            onChange={e => setProfile(p => ({ ...p, orgName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 mb-4 text-sm focus:outline-none focus:border-blue-700"
            placeholder="e.g., First National Bank of..."
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact name (optional)</label>
          <input
            value={profile.contactName || ""}
            onChange={e => setProfile(p => ({ ...p, contactName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 mb-4 text-sm focus:outline-none focus:border-blue-700"
            placeholder="Your name"
          />
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact email (optional)</label>
          <input
            value={profile.contactEmail || ""}
            onChange={e => setProfile(p => ({ ...p, contactEmail: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 mb-4 text-sm focus:outline-none focus:border-blue-700"
            placeholder="email@example.com"
          />
        </div>
      )
    },
    {
      title: "What type of entity are you?",
      content: (
        <div className="space-y-2">
          {ENTITY_TYPES.map(e => (
            <button
              key={e.id}
              onClick={() => setProfile(p => ({ ...p, entityType: e.id }))}
              className={`w-full text-left p-4 border transition-colors ${
                profile.entityType === e.id
                  ? "border-blue-700 bg-blue-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="font-medium text-sm text-gray-900">{e.label}</div>
              <div className="text-xs text-gray-500 mt-1">{e.description}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "What is your relationship to the stablecoin ecosystem?",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">Select all that apply.</p>
          {ECOSYSTEM_ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => {
                setProfile(p => {
                  const roles = p.ecosystemRoles || [];
                  return {
                    ...p,
                    ecosystemRoles: roles.includes(r.id)
                      ? roles.filter(x => x !== r.id)
                      : [...roles, r.id]
                  };
                });
              }}
              className={`w-full text-left p-4 border transition-colors ${
                (profile.ecosystemRoles || []).includes(r.id)
                  ? "border-blue-700 bg-blue-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm text-gray-900">{r.label}</div>
                {(profile.ecosystemRoles || []).includes(r.id) && (
                  <span className="text-blue-700 text-lg">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "What is your scale of stablecoin operations?",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">Approximate outstanding issuance value or anticipated issuance.</p>
          {SCALE_OPTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setProfile(p => ({ ...p, scale: s.id }))}
              className={`w-full text-left p-4 border transition-colors ${
                profile.scale === s.id
                  ? "border-blue-700 bg-blue-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="font-medium text-sm text-gray-900">{s.label}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Overall framework assessment",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">How do you view the OCC's proposed regulatory framework for payment stablecoins?</p>
          {FRAMEWORK_ASSESSMENT.map(a => (
            <button
              key={a.id}
              onClick={() => setProfile(p => ({ ...p, frameworkAssessment: a.id }))}
              className={`w-full text-left p-4 border transition-colors ${
                profile.frameworkAssessment === a.id
                  ? "border-blue-700 bg-blue-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="font-medium text-sm text-gray-900">{a.label}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Threshold calibration",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-3">For each key numeric threshold, indicate whether you believe it is too high, about right, or too low.</p>
          {THRESHOLD_CALIBRATIONS.map(t => (
            <div key={t.id} className="border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-900 mb-2">{t.label}</div>
              <div className="text-xs text-gray-500 mb-2">{t.section}</div>
              <div className="flex gap-2">
                {["Too high", "About right", "Too low", "No opinion"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setProfile(p => ({
                      ...p,
                      thresholdCalibrations: { ...(p.thresholdCalibrations || {}), [t.id]: opt }
                    }))}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      profile.thresholdCalibrations?.[t.id] === opt
                        ? "border-blue-700 bg-blue-700 text-white"
                        : "border-gray-300 text-gray-600 hover:border-blue-500"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Diversification approach preference",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">For reserve asset diversification under § 15.11(c), do you prefer:</p>
          {[
            { id: "option_a", label: "Option A: Principles-based with quantitative safe harbor", desc: "Flexible baseline requirements with an optional safe harbor providing presumptive compliance" },
            { id: "option_b", label: "Option B: Mandatory quantitative thresholds", desc: "Specific numeric limits applicable to all permitted payment stablecoin issuers" },
            { id: "neither", label: "Neither — I'd propose an alternative", desc: "" },
            { id: "no_preference", label: "No strong preference", desc: "" },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setProfile(p => ({ ...p, diversificationPreference: opt.id }))}
              className={`w-full text-left p-4 border transition-colors ${
                profile.diversificationPreference === opt.id
                  ? "border-blue-700 bg-blue-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="font-medium text-sm text-gray-900">{opt.label}</div>
              {opt.desc && <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Which topics are your top priorities?",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">Select your top 2-3 priority areas (or select all for comprehensive engagement). You'll be able to address additional topics during the interview.</p>
          <button
            onClick={() => setProfile(p => ({
              ...p,
              selectedTopics: (p.selectedTopics || []).length === TOPIC_MODULES.length
                ? []
                : TOPIC_MODULES.map(m => m.id)
            }))}
            className={`w-full text-left p-3 border transition-colors mb-2 ${
              (profile.selectedTopics || []).length === TOPIC_MODULES.length
                ? "border-blue-700 bg-blue-50"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <div className="font-medium text-sm text-gray-900">Select all topics</div>
          </button>
          {TOPIC_MODULES.map(m => (
            <button
              key={m.id}
              onClick={() => {
                setProfile(p => {
                  const topics = p.selectedTopics || [];
                  return {
                    ...p,
                    selectedTopics: topics.includes(m.id)
                      ? topics.filter(t => t !== m.id)
                      : [...topics, m.id]
                  };
                });
              }}
              className={`w-full text-left p-4 border transition-colors ${
                (profile.selectedTopics || []).includes(m.id)
                  ? "border-blue-700 bg-blue-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{m.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{m.title}</div>
                  <div className="text-xs text-gray-500">{m.subtitle}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{m.nprQuestions} ({m.questions.length} questions)</div>
                </div>
                {(profile.selectedTopics || []).includes(m.id) && (
                  <span className="ml-auto text-blue-700 text-lg">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )
    }
  ];

  const canAdvance = () => {
    if (step === 1 && !profile.entityType) return false;
    if (step === 3 && !profile.scale) return false;
    if (step === 7 && (!profile.selectedTopics || profile.selectedTopics.length === 0)) return false;
    return true;
  };

  return (
    <div>
      <ProgressBar current={step + 1} total={steps.length} label={`Step ${step + 1} of ${steps.length}`} />

      <h2 className="text-xl font-semibold text-gray-900 mb-6">{steps[step].title}</h2>
      {steps[step].content}

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="px-6 py-2 border border-gray-300 text-gray-700 text-sm disabled:opacity-30 hover:border-gray-500 transition-colors"
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canAdvance()}
            className="px-6 py-2 bg-blue-700 text-white text-sm disabled:opacity-30 hover:bg-blue-800 transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={!canAdvance()}
            className="px-6 py-2 bg-blue-700 text-white text-sm disabled:opacity-30 hover:bg-blue-800 transition-colors"
          >
            Begin Interview →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── LAYER 2: ADAPTIVE INTERVIEWER ───────────────────────────────────────────

function Layer2_Interviewer({ profile, responses, setResponses, onComplete, onBack }) {
  const [depth, setDepth] = useState(() => {
    // Auto-set depth based on entity type
    if (["academic", "national_bank", "subsidiary"].includes(profile.entityType)) return "expert";
    if (["consumer_advocate", "individual"].includes(profile.entityType)) return "general";
    return "practitioner";
  });
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0);

  const relevantModules = useMemo(() => {
    const selected = profile.selectedTopics || [];
    return TOPIC_MODULES.filter(m => selected.includes(m.id));
  }, [profile.selectedTopics]);

  const totalQuestions = relevantModules.reduce((sum, m) => {
    return sum + m.questions.filter(q => {
      if (depth === "general" && q.depth === "expert") return false;
      if (depth === "general" && q.depth === "practitioner" && q.type !== "choice") return false;
      return true;
    }).length;
  }, 0);

  const answeredQuestions = relevantModules.reduce(
    (sum, m) => sum + m.questions.filter(q => responses[q.id]?.answer?.trim()).length,
    0
  );

  const handleUpdate = (qId, val) => {
    setResponses(r => ({ ...r, [qId]: val }));
  };

  return (
    <div>
      <ProgressBar current={answeredQuestions} total={totalQuestions} label={`${answeredQuestions} of ${totalQuestions} questions answered across ${relevantModules.length} topics`} />

      <DepthDial depth={depth} onChange={setDepth} />

      {/* Module navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {relevantModules.map((m, i) => {
          const answered = m.questions.filter(q => responses[q.id]?.answer?.trim()).length;
          return (
            <button
              key={m.id}
              onClick={() => setCurrentModuleIdx(i)}
              className={`flex-shrink-0 px-3 py-2 text-xs border transition-colors ${
                i === currentModuleIdx
                  ? "border-blue-700 bg-blue-700 text-white"
                  : answered > 0
                    ? "border-green-300 bg-green-50 text-green-800"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {m.icon} {m.title.length > 15 ? m.title.slice(0, 15) + "…" : m.title}
              {answered > 0 && i !== currentModuleIdx && ` (${answered})`}
            </button>
          );
        })}
      </div>

      {/* Current module */}
      {relevantModules[currentModuleIdx] && (
        <TopicModule
          module={relevantModules[currentModuleIdx]}
          responses={responses}
          onUpdate={handleUpdate}
          depth={depth}
          allResponses={responses}
        />
      )}

      {/* General comments */}
      <div className="border border-gray-200 p-5 mb-4">
        <h3 className="text-base font-medium text-gray-900 mb-2">Additional General Comments</h3>
        <p className="text-sm text-gray-500 mb-3">
          Is there anything else you'd like the OCC to consider that wasn't covered by the questions above? This is your opportunity to raise cross-cutting concerns, propose alternative frameworks, or highlight issues the NPR may have overlooked.
        </p>
        <textarea
          value={responses._general || ""}
          onChange={e => setResponses(r => ({ ...r, _general: e.target.value }))}
          placeholder="Share any additional comments, cross-cutting concerns, or alternative proposals..."
          className="w-full h-40 px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-blue-700 resize-y"
        />
      </div>

      {/* Supporting materials */}
      <div className="border border-gray-200 p-5 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-2">Supporting Materials</h3>
        <p className="text-sm text-gray-500 mb-3">
          List any supporting data, empirical analysis, or legal authority you would like to reference. These will be noted as attachment placeholders in your comment letter.
        </p>
        <textarea
          value={responses._attachments || ""}
          onChange={e => setResponses(r => ({ ...r, _attachments: e.target.value }))}
          placeholder="Describe supporting materials you plan to attach (e.g., 'Economic analysis of concentration limit impact on community banks')..."
          className="w-full h-24 px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-blue-700 resize-y"
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 text-sm hover:border-gray-500 transition-colors"
        >
          ← Back to Profile
        </button>
        <div className="flex gap-3">
          {currentModuleIdx < relevantModules.length - 1 && (
            <button
              onClick={() => { setCurrentModuleIdx(i => i + 1); window.scrollTo(0, 0); }}
              className="px-6 py-2 border border-blue-700 text-blue-700 text-sm hover:bg-blue-50 transition-colors"
            >
              Next Topic →
            </button>
          )}
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-blue-700 text-white text-sm hover:bg-blue-800 transition-colors"
          >
            Generate Comment Letter →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LAYER 3: POSITION PAPER SYNTHESIZER ─────────────────────────────────────

function Layer3_Synthesizer({ profile, responses, onBack }) {
  const [paper, setPaper] = useState("");
  const [editing, setEditing] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    setPaper(generatePositionPaper(profile, responses));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(paper).then(() => {
      alert("Comment letter copied to clipboard!");
    });
  };

  const handleDownload = () => {
    const blob = new Blob([paper], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OCC_NPR_Comment_${profile.orgName || "Response"}_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const answeredCount = Object.keys(responses).filter(
    k => !k.startsWith("_") && responses[k]?.answer?.trim()
  ).length;

  const totalQuestionCount = TOPIC_MODULES.reduce((sum, m) => sum + m.questions.length, 0);

  const nprQuestionsAddressed = new Set();
  TOPIC_MODULES.forEach(mod => {
    mod.questions.forEach(q => {
      if (responses[q.id]?.answer?.trim()) {
        // Parse nprRef like "Q1–Q24" or "Q14–Q16" or "Q57"
        const refs = q.nprRef.match(/Q(\d+)/g);
        if (refs) refs.forEach(r => nprQuestionsAddressed.add(r));
      }
    });
  });

  return (
    <div>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 text-center">
          <div className="text-2xl font-bold text-blue-700">{answeredCount}</div>
          <div className="text-xs text-blue-600">Questions answered</div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-700">{nprQuestionsAddressed.size}</div>
          <div className="text-xs text-green-600">NPR questions addressed</div>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 text-center">
          <div className="text-2xl font-bold text-purple-700">{(profile.selectedTopics || []).length}</div>
          <div className="text-xs text-purple-600">Topic areas covered</div>
        </div>
      </div>

      {/* Paper */}
      <div className="border border-gray-200 mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-900">Draft Comment Letter</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 hover:border-gray-500"
            >
              {editing ? "Preview" : "Edit"}
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs border border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Copy
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs bg-blue-700 text-white hover:bg-blue-800"
            >
              Download .txt
            </button>
          </div>
        </div>
        {editing ? (
          <textarea
            ref={textRef}
            value={paper}
            onChange={e => setPaper(e.target.value)}
            className="w-full p-6 text-sm font-mono leading-relaxed focus:outline-none resize-y"
            style={{ minHeight: "60vh" }}
          />
        ) : (
          <pre className="p-6 text-sm font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {paper}
          </pre>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-amber-50 border border-amber-200 mb-6">
        <div className="text-sm font-medium text-amber-900 mb-2">Before submitting:</div>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Review and edit the draft to ensure it accurately represents your views</li>
          <li>• Attach any supporting materials referenced in the letter</li>
          <li>• Submit through <span className="font-medium">regulations.gov</span> using Docket ID <span className="font-mono">OCC-2025-0372</span></li>
          <li>• This is a drafting assistant — the final letter should reflect your own analysis</li>
        </ul>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 text-sm hover:border-gray-500 transition-colors"
        >
          ← Back to Interview
        </button>
        <button
          onClick={() => setPaper(generatePositionPaper(profile, responses))}
          className="px-6 py-2 border border-blue-300 text-blue-700 text-sm hover:bg-blue-50 transition-colors"
        >
          Regenerate from responses
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function OCCStablecoinNPRInterviewer() {
  const [layer, setLayer] = useState(1);
  const [profile, setProfile] = useState({
    selectedTopics: [],
    ecosystemRoles: [],
    thresholdCalibrations: {},
  });
  const [responses, setResponses] = useState({});

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-blue-700 mb-1">NR 2026-9a | Docket ID OCC-2025-0372 | RIN 1557-AF41</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            OCC Stablecoin NPR — Comment Letter Drafting Assistant
          </h1>
          <div className="text-sm text-gray-500">
            Implementing the GENIUS Act for Payment Stablecoins — All 211 NPR Questions
          </div>

          {/* Layer indicator */}
          <div className="flex gap-1 mt-4">
            {[
              { n: 1, label: "Intake" },
              { n: 2, label: "Interview" },
              { n: 3, label: "Comment Letter" },
            ].map(l => (
              <div
                key={l.n}
                className={`px-4 py-2 text-xs font-medium ${
                  layer === l.n
                    ? "bg-blue-700 text-white"
                    : layer > l.n
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {l.n}. {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Layers */}
        {layer === 1 && (
          <Layer1_Intake
            profile={profile}
            setProfile={setProfile}
            onComplete={() => { setLayer(2); window.scrollTo(0, 0); }}
          />
        )}

        {layer === 2 && (
          <Layer2_Interviewer
            profile={profile}
            responses={responses}
            setResponses={setResponses}
            onComplete={() => { setLayer(3); window.scrollTo(0, 0); }}
            onBack={() => setLayer(1)}
          />
        )}

        {layer === 3 && (
          <Layer3_Synthesizer
            profile={profile}
            responses={responses}
            onBack={() => setLayer(2)}
          />
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <div className="text-xs text-gray-400">
            OCC NPR Hybrid Comment Interviewer — Covers all 211 questions from the full 357-page NPR
          </div>
          <div className="text-xs text-gray-400 mt-1">
            This tool is a comment letter drafting assistant. It does not replace the standard comment letter process.
          </div>
        </div>
      </div>
    </div>
  );
}
