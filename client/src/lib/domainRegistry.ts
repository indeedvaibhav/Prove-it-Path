import { DomainCapability, DomainCapabilityResult, DomainSupportStatus } from '../types/domain';

/**
 * Verified domain capabilities for the Prove-It Path platform.
 * 
 * Note: Until the Express backend implements a dynamic `/api/capabilities` registry,
 * this client-side registry provides accurate capability reflection.
 * We never claim universal code execution when only SQL evaluation is wired.
 */
export const KNOWN_DOMAINS: DomainCapability[] = [
  {
    id: 'sql',
    name: 'Relational SQL',
    tagline: 'Database queries, filtering logic, aggregations & joins',
    description: 'Master relational queries with actual query execution (in-browser sql.js and Express backend), precise row/column diffing, and contrast interventions.',
    status: 'supported',
    statusLabel: 'Fully Supported',
    hasExecutionEngine: true,
    hasAdaptiveRoadmap: true,
    availableTracks: [
      'Technical Interview Preparation',
      'Workplace Data Analysis',
      'Backend Database Foundations'
    ]
  },
  {
    id: 'regex',
    name: 'Regular Expressions (Regex)',
    tagline: 'Pattern matching, character classes & capture groups',
    description: 'Learn pattern construction and text parsing rules. Conceptual roadmaps available; interactive test harness is currently in development.',
    status: 'partially_supported',
    statusLabel: 'In Development (Curriculum Preview)',
    hasExecutionEngine: false,
    hasAdaptiveRoadmap: true,
    limitationReason: 'The regex evaluation harness is currently under development. You can preview curriculum topics, but live test verification is not yet available.',
    recommendedAlternativeId: 'sql'
  },
  {
    id: 'git',
    name: 'Git Version Control',
    tagline: 'Branching, rebasing, merge conflicts & commit hygiene',
    description: 'Build mental models for distributed version control. Virtual repository simulation sandbox is planned for a future milestone.',
    status: 'partially_supported',
    statusLabel: 'Planned Track',
    hasExecutionEngine: false,
    hasAdaptiveRoadmap: true,
    limitationReason: 'Virtual Git workspace sandbox is scheduled for a future milestone. Live repository simulation is not yet active on this node.',
    recommendedAlternativeId: 'sql'
  }
];

export const TEMPORARY_STATE_DISCLAIMER =
  'Frontend Catalog Mode: Backend /api/capabilities endpoint is pending. Active execution engine is currently verified for Relational SQL.';

/**
 * Resolves capability for an existing domain ID or user-suggested custom domain.
 */
export function resolveDomainCapability(domainInput: string): DomainCapabilityResult {
  const trimmed = (domainInput || '').trim();
  const lower = trimmed.toLowerCase();

  // 1. Direct ID match
  const directMatch = KNOWN_DOMAINS.find((d) => d.id === lower);
  if (directMatch) {
    return {
      capability: directMatch,
      source: 'client_registry',
      backendCapabilityApiReady: false,
      disclaimer: TEMPORARY_STATE_DISCLAIMER
    };
  }

  // 2. Alias matching for SQL
  const isSqlAlias =
    lower.includes('sql') ||
    lower.includes('database') ||
    lower.includes('postgres') ||
    lower.includes('mysql') ||
    lower.includes('sqlite') ||
    lower.includes('relational') ||
    lower.includes('query');

  if (isSqlAlias) {
    const sqlDomain = KNOWN_DOMAINS.find((d) => d.id === 'sql')!;
    return {
      capability: sqlDomain,
      source: 'client_registry',
      backendCapabilityApiReady: false,
      disclaimer: TEMPORARY_STATE_DISCLAIMER
    };
  }

  // 3. Alias matching for Regex
  const isRegexAlias =
    lower.includes('regex') ||
    lower.includes('regexp') ||
    lower.includes('regular expression');

  if (isRegexAlias) {
    const regexDomain = KNOWN_DOMAINS.find((d) => d.id === 'regex')!;
    return {
      capability: regexDomain,
      source: 'client_registry',
      backendCapabilityApiReady: false,
      disclaimer: TEMPORARY_STATE_DISCLAIMER
    };
  }

  // 4. Alias matching for Git
  const isGitAlias =
    lower.includes('git') ||
    lower.includes('github') ||
    lower.includes('version control');

  if (isGitAlias) {
    const gitDomain = KNOWN_DOMAINS.find((d) => d.id === 'git')!;
    return {
      capability: gitDomain,
      source: 'client_registry',
      backendCapabilityApiReady: false,
      disclaimer: TEMPORARY_STATE_DISCLAIMER
    };
  }

  // 5. Custom / Unsupported Domain
  const customStatus: DomainSupportStatus = 'unsupported';
  const customCapability: DomainCapability = {
    id: `custom-${lower.replace(/[^a-z0-9]+/g, '-').slice(0, 32) || 'topic'}`,
    name: trimmed || 'Custom Field of Interest',
    tagline: 'Custom requested domain',
    description: `User-suggested field: "${trimmed}".`,
    status: customStatus,
    statusLabel: 'Unsupported on Current Instance',
    hasExecutionEngine: false,
    hasAdaptiveRoadmap: false,
    limitationReason: `Prove-It Path does not currently have an active execution environment or verified diagnostic dataset for "${trimmed}". We only run live evaluations for Relational SQL and do not generate fake interactive tasks.`,
    recommendedAlternativeId: 'sql'
  };

  return {
    capability: customCapability,
    source: 'client_registry',
    backendCapabilityApiReady: false,
    disclaimer: TEMPORARY_STATE_DISCLAIMER
  };
}

export function getDefaultDomain(): DomainCapability {
  return KNOWN_DOMAINS[0]; // Relational SQL
}
