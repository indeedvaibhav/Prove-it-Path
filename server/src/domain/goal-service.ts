import { resolveDomainCapability, DomainCapability, DomainSupportStatus } from './registry.js';

export type ExperienceLevel = 'beginner' | 'some_experience' | 'comfortable';
export type TimeOption = 15 | 30 | 45 | 60;
export type TopicPriority = 'focus' | 'core' | 'advanced' | 'foundation';

export interface TopicPlan {
  nodeId: string;
  label: string;
  reason: string;
  priority: TopicPriority;
  isStartingNode: boolean;
}

export interface InterpretedPlan {
  title: string;
  summary: string;
  recommendedStartingNodeId: string;
  startingLevel: string;
  estimatedMinutes: number;
  topicPlans: TopicPlan[];
  rawGoalText: string;
  experienceLevel: ExperienceLevel;
  timePerSession: TimeOption;
  deadline?: string;
  strugglingTopics?: string[];
}

export interface GoalInterpretationRequest {
  rawGoalText: string;
  experienceLevel?: ExperienceLevel;
  timePerSession?: TimeOption;
  deadline?: string;
  strugglingTopics?: string[];
  explicitDomainId?: string;
}

export interface GoalInterpretationResponse {
  supportStatus: DomainSupportStatus;
  domainId: string;
  domainDisplayName: string;
  plan: InterpretedPlan | null;
  message?: string;
  knownLimitations?: string[];
  supportedAlternative?: string;
}

const TOPIC_METADATA = [
  { id: 'select', label: 'SELECT', defaultRole: 'Foundation' },
  { id: 'where', label: 'WHERE — AND / OR', defaultRole: 'Filtering' },
  { id: 'orderby', label: 'ORDER BY — LIMIT', defaultRole: 'Ordering' },
  { id: 'groupby', label: 'GROUP BY — COUNT', defaultRole: 'Aggregation' },
  { id: 'join', label: 'JOIN', defaultRole: 'Relational' },
];

/**
 * Interpret a user's free-text learning goal and context.
 * Distinguishes between fully supported, partially supported, and unsupported domains.
 */
export function interpretGoal(req: GoalInterpretationRequest): GoalInterpretationResponse {
  const rawText = req.rawGoalText || '';
  const experience = req.experienceLevel || 'beginner';
  const timePerSession = req.timePerSession || 45;
  const struggles = new Set(req.strugglingTopics || []);

  const resolution = resolveDomainCapability(req.explicitDomainId || rawText);
  const domain = resolution.capability;

  // 1. Case: Unsupported domain
  if (domain.status === 'unsupported') {
    const domainName = domain.name || (rawText.trim() ? `"${rawText.trim()}"` : 'your requested topic');
    return {
      supportStatus: 'unsupported',
      domainId: domain.id,
      domainDisplayName: domainName,
      plan: null,
      message: `The domain ${domainName} is not yet available with a real interactive curriculum and evaluator. We have recorded your interest! In the meantime, would you like to explore our fully supported SQL learning path?`,
      supportedAlternative: 'sql',
      knownLimitations: domain.limitationReason ? [domain.limitationReason] : ['No interactive evaluator currently available for this domain.'],
    };
  }

  // 2. Extract specific mentioned topics from text for SQL curriculum
  const lower = rawText.toLowerCase();
  if (lower.includes('join') || lower.includes('foreign key') || lower.includes('multitable')) struggles.add('join');
  if (lower.includes('group') || lower.includes('count') || lower.includes('aggregate')) struggles.add('groupby');
  if (lower.includes('where') || lower.includes('filter') || lower.includes('condition')) struggles.add('where');
  if (lower.includes('order') || lower.includes('sort') || lower.includes('limit')) struggles.add('orderby');
  if (lower.includes('select') || lower.includes('basics') || lower.includes('syntax')) struggles.add('select');

  // 3. Classify high-level objective
  let title = 'Mastery-Driven SQL Pathway';
  let summary = 'A calibrated sequence through essential SQL query patterns with continuous confidence calibration.';

  if (lower.includes('interview') || lower.includes('screen') || lower.includes('hiring') || lower.includes('leetcode') || lower.includes('prep')) {
    title = 'Technical Interview Preparation';
    summary = 'Targeted query practice under realistic constraints with a focus on projection accuracy, filtering logic, and table joins.';
  } else if (lower.includes('work') || lower.includes('analytic') || lower.includes('dashboard') || lower.includes('metric') || lower.includes('business') || lower.includes('data')) {
    title = 'Workplace Data Analysis';
    summary = 'Master practical filtering, multi-dimensional aggregation with GROUP BY, and joined reporting tables.';
  } else if (lower.includes('backend') || lower.includes('api') || lower.includes('server') || lower.includes('database')) {
    title = 'Backend Database Foundations';
    summary = 'Build solid intuition for relational schema models, indexable predicates, multi-table joins, and reliable record queries.';
  }

  // 4. Determine starting node based on experience and struggles
  let startingNodeId = 'select';
  let startingLevel = 'Beginner Foundations';

  if (experience === 'comfortable') {
    startingLevel = 'Advanced Practice';
    if (struggles.has('join')) startingNodeId = 'join';
    else if (struggles.has('groupby')) startingNodeId = 'groupby';
    else startingNodeId = 'orderby';
  } else if (experience === 'some_experience') {
    startingLevel = 'Intermediate Calibrated';
    if (struggles.has('groupby') && !struggles.has('where') && !struggles.has('select')) {
      startingNodeId = 'groupby';
    } else if (struggles.has('join') && !struggles.has('where') && !struggles.has('select')) {
      startingNodeId = 'where';
    } else if (struggles.has('orderby')) {
      startingNodeId = 'orderby';
    } else {
      startingNodeId = 'where';
    }
  } else {
    startingLevel = 'Foundational Beginner';
    startingNodeId = 'select';
  }

  // 5. Construct topic breakdown
  const topicPlans: TopicPlan[] = TOPIC_METADATA.map((meta) => {
    const isStarting = meta.id === startingNodeId;
    const isStruggle = struggles.has(meta.id);

    let priority: TopicPriority = 'core';
    let reason = '';

    if (isStruggle) {
      priority = 'focus';
      reason = 'Focus Area: Identified as a key struggle point in your stated goal.';
    } else if (isStarting) {
      priority = 'core';
      reason = `Recommended Starting Point: Calibrated for ${startingLevel}.`;
    } else if (meta.id === 'select' && startingNodeId !== 'select') {
      priority = 'foundation';
      reason = 'Verified Foundation: Can be reviewed quickly or revisited if needed.';
    } else if (meta.id === 'join' || meta.id === 'groupby') {
      priority = 'advanced';
      reason = 'Target Competency: Essential relational skill to solidify your objective.';
    } else {
      priority = 'core';
      reason = 'Core Prerequisite: Builds the filtering and ordering habits needed for aggregations.';
    }

    return {
      nodeId: meta.id,
      label: meta.label,
      reason,
      priority,
      isStartingNode: isStarting,
    };
  });

  const plan: InterpretedPlan = {
    title,
    summary,
    recommendedStartingNodeId: startingNodeId,
    startingLevel,
    estimatedMinutes: timePerSession,
    topicPlans,
    rawGoalText: rawText,
    experienceLevel: experience,
    timePerSession,
    deadline: req.deadline,
    strugglingTopics: Array.from(struggles),
  };

  const isPartial = domain.status === 'partially_supported';

  return {
    supportStatus: domain.status,
    domainId: domain.id,
    domainDisplayName: domain.name,
    plan,
    message: isPartial
      ? `We support the relational database and SQL queries required for ${domain.name}. You can begin practicing with our real SQL engine!`
      : undefined,
    knownLimitations: domain.limitationReason ? [domain.limitationReason] : undefined,
  };
}
