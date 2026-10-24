// ─── Domain Capability & Registry Model ───────────────────────────────

export type DomainSupportStatus = 'supported' | 'partially_supported' | 'unsupported';

export type TaskType = 'sql_query' | 'code_submission' | 'algorithm_problem' | 'math_problem' | 'written_response';

export interface DomainCapability {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: DomainSupportStatus;
  statusLabel: string;
  hasExecutionEngine: boolean;
  hasAdaptiveRoadmap: boolean;
  availableTracks?: string[];
  limitationReason?: string;
  recommendedAlternativeId?: string;
}

export interface DomainCapabilityResult {
  capability: DomainCapability;
  source: 'client_registry' | 'backend_api';
  backendCapabilityApiReady: boolean;
  disclaimer: string;
}

export interface DomainTopic {
  id: string;
  label: string;
  description: string;
  estimatedMinutes: number;
  prerequisites: string[];
}

export interface DomainRegistration extends DomainCapability {
  displayName: string;
  supportStatus: DomainSupportStatus;
  maturity: 'production' | 'beta' | 'planned';
  curriculum: DomainTopic[];
  supportedTaskTypes: TaskType[];
  evaluatorId: string;
  hasRoadmapGeneration: boolean;
  hasExplanationCapability: boolean;
  knownLimitations: string[];
  keywords: string[];
}

// ─── Domain Registry Catalog ─────────────────────────────────────────

export const DOMAIN_REGISTRY: Record<string, DomainRegistration> = {
  sql: {
    id: 'sql',
    name: 'Relational SQL',
    displayName: 'Relational SQL',
    tagline: 'Database queries, filtering logic, aggregations & joins',
    description: 'Master relational queries with actual query execution (in-browser sql.js and Express backend), precise row/column diffing, and contrast interventions.',
    status: 'supported',
    supportStatus: 'supported',
    statusLabel: 'Fully Supported',
    hasExecutionEngine: true,
    hasAdaptiveRoadmap: true,
    hasRoadmapGeneration: true,
    maturity: 'production',
    supportedTaskTypes: ['sql_query'],
    evaluatorId: 'sql_wasm_evaluator',
    hasExplanationCapability: true,
    availableTracks: [
      'Technical Interview Preparation',
      'Workplace Data Analysis',
      'Backend Database Foundations',
    ],
    knownLimitations: [
      'Currently executes in-memory SQLite (ANSI SQL compatible). Advanced vendor-specific window extensions are planned.',
    ],
    limitationReason: 'Currently executes in-memory SQLite (ANSI SQL compatible). Advanced vendor-specific window extensions are planned.',
    keywords: [
      'sql', 'database', 'postgres', 'postgresql', 'mysql', 'sqlite',
      'query', 'queries', 'relational', 'table', 'tables', 'select',
      'join', 'group by', 'where', 'aggregate', 'crud', 'backend data',
      'count', 'order by', 'limit', 'filter', 'analytics', 'analytic',
      'analyst', 'data analysis', 'reporting',
    ],
    curriculum: [
      {
        id: 'select',
        label: 'SELECT',
        description: 'Column projection and basic record retrieval.',
        estimatedMinutes: 10,
        prerequisites: [],
      },
      {
        id: 'where',
        label: 'WHERE — AND / OR',
        description: 'Conditional record filtering with logical predicates.',
        estimatedMinutes: 12,
        prerequisites: ['select'],
      },
      {
        id: 'orderby',
        label: 'ORDER BY — LIMIT',
        description: 'Deterministic sorting, top-N analysis, and row limits.',
        estimatedMinutes: 8,
        prerequisites: ['select'],
      },
      {
        id: 'groupby',
        label: 'GROUP BY — COUNT',
        description: 'Multi-dimensional aggregations and metric summaries.',
        estimatedMinutes: 15,
        prerequisites: ['select', 'where'],
      },
      {
        id: 'join',
        label: 'JOIN',
        description: 'Relational multi-table entity joins on foreign keys.',
        estimatedMinutes: 20,
        prerequisites: ['select', 'where'],
      },
    ],
  },

  backend_general: {
    id: 'backend_general',
    name: 'Backend Web Development',
    displayName: 'Backend Web Development',
    tagline: 'REST APIs, server-side logic, and database persistence',
    description: 'Build backend applications and integrate databases. The SQL component is fully supported; full application server runtime evaluation is in progress.',
    status: 'partially_supported',
    supportStatus: 'partially_supported',
    statusLabel: 'Partially Supported',
    hasExecutionEngine: true,
    hasAdaptiveRoadmap: true,
    hasRoadmapGeneration: true,
    maturity: 'beta',
    supportedTaskTypes: ['sql_query'],
    evaluatorId: 'sql_wasm_evaluator',
    hasExplanationCapability: true,
    availableTracks: ['Backend Database Foundations'],
    knownLimitations: [
      'Interactive evaluation currently focuses on the SQL and persistence layers. General API routes are not yet sandbox-evaluated.',
    ],
    limitationReason: 'Interactive evaluation currently focuses on the SQL and persistence layers. General API routes are not yet sandbox-evaluated.',
    keywords: ['backend', 'api', 'server', 'node', 'express', 'django', 'fastapi', 'spring'],
    curriculum: [
      {
        id: 'select',
        label: 'SELECT (Database Foundations)',
        description: 'Data layer retrieval for application backend models.',
        estimatedMinutes: 10,
        prerequisites: [],
      },
      {
        id: 'where',
        label: 'WHERE (Filtered Queries)',
        description: 'Query optimization and user-targeted data endpoints.',
        estimatedMinutes: 12,
        prerequisites: ['select'],
      },
      {
        id: 'join',
        label: 'JOIN (Relational Entities)',
        description: 'Entity relationships across foreign keys in persistence layers.',
        estimatedMinutes: 20,
        prerequisites: ['select', 'where'],
      },
    ],
  },

  regex: {
    id: 'regex',
    name: 'Regular Expressions (Regex)',
    displayName: 'Regular Expressions (Regex)',
    tagline: 'Pattern matching, character classes & capture groups',
    description: 'Learn pattern construction and text parsing rules. Conceptual roadmaps available; interactive test harness is currently in development.',
    status: 'partially_supported',
    supportStatus: 'partially_supported',
    statusLabel: 'In Development (Curriculum Preview)',
    hasExecutionEngine: false,
    hasAdaptiveRoadmap: true,
    hasRoadmapGeneration: true,
    maturity: 'beta',
    supportedTaskTypes: ['code_submission'],
    evaluatorId: '',
    hasExplanationCapability: false,
    limitationReason: 'The regex evaluation harness is currently under development. You can preview curriculum topics, but live test verification is not yet available.',
    knownLimitations: [
      'The regex evaluation harness is currently under development. You can preview curriculum topics, but live test verification is not yet available.',
    ],
    recommendedAlternativeId: 'sql',
    keywords: ['regex', 'regexp', 'regular expression', 'pattern matching', 'text parsing'],
    curriculum: [],
  },

  git: {
    id: 'git',
    name: 'Git Version Control',
    displayName: 'Git Version Control',
    tagline: 'Branching, rebasing, merge conflicts & commit hygiene',
    description: 'Build mental models for distributed version control. Virtual repository simulation sandbox is planned for a future milestone.',
    status: 'partially_supported',
    supportStatus: 'partially_supported',
    statusLabel: 'Planned Track',
    hasExecutionEngine: false,
    hasAdaptiveRoadmap: true,
    hasRoadmapGeneration: true,
    maturity: 'planned',
    supportedTaskTypes: ['code_submission'],
    evaluatorId: '',
    hasExplanationCapability: false,
    limitationReason: 'Virtual Git workspace sandbox is scheduled for a future milestone. Live repository simulation is not yet active on this node.',
    knownLimitations: [
      'Virtual Git workspace sandbox is scheduled for a future milestone. Live repository simulation is not yet active on this node.',
    ],
    recommendedAlternativeId: 'sql',
    keywords: ['git', 'github', 'version control', 'branch', 'rebase', 'merge conflict'],
    curriculum: [],
  },

  dsa: {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    displayName: 'Data Structures & Algorithms',
    tagline: 'Algorithmic problem solving, Big-O complexity, trees & graphs',
    description: 'Algorithmic problem solving and data structures. Interactive coding sandbox evaluator is scheduled for a future milestone.',
    status: 'unsupported',
    supportStatus: 'unsupported',
    statusLabel: 'Planned Track',
    hasExecutionEngine: false,
    hasAdaptiveRoadmap: false,
    hasRoadmapGeneration: false,
    maturity: 'planned',
    supportedTaskTypes: ['algorithm_problem'],
    evaluatorId: '',
    hasExplanationCapability: false,
    limitationReason: 'Interactive DSA sandbox evaluator and test harness are currently in development for a future milestone.',
    knownLimitations: [
      'Interactive DSA sandbox evaluator and test harness are currently in development for a future milestone.',
    ],
    recommendedAlternativeId: 'sql',
    keywords: ['dsa', 'data structures', 'algorithms', 'leetcode', 'binary search', 'tree', 'graph', 'dynamic programming'],
    curriculum: [],
  },
};

export const BACKEND_CAPABILITY_DISCLAIMER =
  'Verified Backend API Capability: Active execution engine is running for Relational SQL.';

// ─── Domain Resolution Helper ────────────────────────────────────────

export function resolveDomainFromRequest(userGoalText: string, explicitDomainId?: string): {
  domain: DomainRegistration | null;
  matchType: 'explicit' | 'keyword' | 'none';
  detectedKeywords: string[];
} {
  const normId = (explicitDomainId || '').toLowerCase().trim();
  if (normId && DOMAIN_REGISTRY[normId]) {
    return {
      domain: DOMAIN_REGISTRY[normId],
      matchType: 'explicit',
      detectedKeywords: [normId],
    };
  }

  const normalized = (userGoalText || '').toLowerCase();
  const matchedKeywords: string[] = [];

  // Check SQL first (primary supported domain)
  for (const kw of DOMAIN_REGISTRY.sql.keywords) {
    if (normalized.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  if (matchedKeywords.length > 0) {
    // Check if it's a mixed/broader backend request
    const backendKeywords = DOMAIN_REGISTRY.backend_general.keywords.filter((kw) => normalized.includes(kw));
    if (backendKeywords.length > 0 && !normalized.includes('pure sql')) {
      return {
        domain: DOMAIN_REGISTRY.backend_general,
        matchType: 'keyword',
        detectedKeywords: [...matchedKeywords, ...backendKeywords],
      };
    }

    return {
      domain: DOMAIN_REGISTRY.sql,
      matchType: 'keyword',
      detectedKeywords: matchedKeywords,
    };
  }

  // Check for other domains in registry
  for (const domain of Object.values(DOMAIN_REGISTRY)) {
    if (domain.id === 'sql') continue;
    const hits = domain.keywords.filter((kw) => normalized.includes(kw));
    if (hits.length > 0) {
      return {
        domain,
        matchType: 'keyword',
        detectedKeywords: hits,
      };
    }
  }

  return { domain: null, matchType: 'none', detectedKeywords: [] };
}

// ─── Dynamic Capability Resolution ───────────────────────────────────

export function resolveDomainCapability(domainInput: string): DomainCapabilityResult {
  const trimmed = (domainInput || '').trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct ID match
  const directMatch = DOMAIN_REGISTRY[lower];
  if (directMatch) {
    return {
      capability: directMatch,
      source: 'backend_api',
      backendCapabilityApiReady: true,
      disclaimer: BACKEND_CAPABILITY_DISCLAIMER,
    };
  }

  // 2. Keyword & semantic resolution
  const resolved = resolveDomainFromRequest(trimmed);
  if (resolved.domain) {
    return {
      capability: resolved.domain,
      source: 'backend_api',
      backendCapabilityApiReady: true,
      disclaimer: BACKEND_CAPABILITY_DISCLAIMER,
    };
  }

  // 3. Custom / Unsupported Domain
  const customCapability: DomainCapability = {
    id: `custom-${lower.replace(/[^a-z0-9]+/g, '-').slice(0, 32) || 'topic'}`,
    name: trimmed || 'Custom Field of Interest',
    tagline: 'Custom requested domain',
    description: `User-suggested field: "${trimmed}".`,
    status: 'unsupported',
    statusLabel: 'Unsupported on Current Instance',
    hasExecutionEngine: false,
    hasAdaptiveRoadmap: false,
    limitationReason: `Prove-It Path does not currently have an active execution environment or verified diagnostic dataset for "${trimmed}". We only run live evaluations for Relational SQL and do not generate fake interactive tasks.`,
    recommendedAlternativeId: 'sql',
  };

  return {
    capability: customCapability,
    source: 'backend_api',
    backendCapabilityApiReady: true,
    disclaimer: BACKEND_CAPABILITY_DISCLAIMER,
  };
}
