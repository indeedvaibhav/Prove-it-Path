// ─── Domain Capability & Registry Model ───────────────────────────────

export type DomainSupportStatus = 'supported' | 'partially_supported' | 'unsupported';

export type TaskType = 'sql_query' | 'code_submission' | 'algorithm_problem' | 'math_problem' | 'written_response';

export interface DomainTopic {
  id: string;
  label: string;
  description: string;
  estimatedMinutes: number;
  prerequisites: string[];
}

export interface DomainRegistration {
  id: string;
  displayName: string;
  description: string;
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
    displayName: 'SQL (Structured Query Language)',
    description: 'Relational database queries, projection, filtering, grouping, aggregation, and table joins.',
    supportStatus: 'supported',
    maturity: 'production',
    supportedTaskTypes: ['sql_query'],
    evaluatorId: 'sql_wasm_evaluator',
    hasRoadmapGeneration: true,
    hasExplanationCapability: true,
    knownLimitations: [
      'Currently supports in-memory SQLite syntax (ANSI SQL compatible). Complex vendor-specific functions or window functions are planned.',
    ],
    keywords: [
      'sql', 'database', 'postgres', 'postgresql', 'mysql', 'sqlite',
      'query', 'queries', 'relational', 'table', 'tables', 'select',
      'join', 'group by', 'where', 'aggregate', 'crud', 'backend data',
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

  dsa: {
    id: 'dsa',
    displayName: 'Data Structures & Algorithms',
    description: 'Algorithmic problem solving, Big-O complexity, trees, graphs, and dynamic programming.',
    supportStatus: 'unsupported',
    maturity: 'planned',
    supportedTaskTypes: ['algorithm_problem'],
    evaluatorId: '',
    hasRoadmapGeneration: false,
    hasExplanationCapability: false,
    knownLimitations: [
      'Interactive sandbox evaluator and test harness are currently in development for a future milestone.',
    ],
    keywords: ['dsa', 'data structures', 'algorithms', 'leetcode', 'binary search', 'tree', 'graph', 'dynamic programming'],
    curriculum: [],
  },

  backend_general: {
    id: 'backend_general',
    displayName: 'General Backend Development',
    description: 'API design, server architecture, databases, and microservices.',
    supportStatus: 'partially_supported',
    maturity: 'beta',
    supportedTaskTypes: ['sql_query'],
    evaluatorId: 'sql_wasm_evaluator',
    hasRoadmapGeneration: true,
    hasExplanationCapability: true,
    knownLimitations: [
      'Database querying portion (SQL) is fully supported and evaluated. Application logic, HTTP APIs, and server runtimes are planned.',
    ],
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
};

// ─── Domain Resolution Helper ────────────────────────────────────────

export function resolveDomainFromRequest(userGoalText: string, explicitDomainId?: string): {
  domain: DomainRegistration | null;
  matchType: 'explicit' | 'keyword' | 'none';
  detectedKeywords: string[];
} {
  if (explicitDomainId && DOMAIN_REGISTRY[explicitDomainId]) {
    return {
      domain: DOMAIN_REGISTRY[explicitDomainId],
      matchType: 'explicit',
      detectedKeywords: [explicitDomainId],
    };
  }

  const normalized = userGoalText.toLowerCase();
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
