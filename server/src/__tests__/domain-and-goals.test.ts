import { describe, it, expect } from 'vitest';
import { DOMAIN_REGISTRY, resolveDomainFromRequest } from '../domain/registry.js';
import { interpretGoal } from '../domain/goal-service.js';

describe('Domain Registry & Capability Model', () => {
  it('registers SQL as production-ready and fully supported', () => {
    const sql = DOMAIN_REGISTRY.sql;
    expect(sql).toBeDefined();
    expect(sql.supportStatus).toBe('supported');
    expect(sql.maturity).toBe('production');
    expect(sql.hasRoadmapGeneration).toBe(true);
    expect(sql.curriculum.length).toBe(5);
  });

  it('registers DSA as unsupported planned domain', () => {
    const dsa = DOMAIN_REGISTRY.dsa;
    expect(dsa).toBeDefined();
    expect(dsa.supportStatus).toBe('unsupported');
    expect(dsa.maturity).toBe('planned');
    expect(dsa.hasRoadmapGeneration).toBe(false);
  });

  it('registers general backend as partially supported', () => {
    const backend = DOMAIN_REGISTRY.backend_general;
    expect(backend).toBeDefined();
    expect(backend.supportStatus).toBe('partially_supported');
    expect(backend.knownLimitations.length).toBeGreaterThan(0);
  });
});

describe('Goal Interpretation & Personalization', () => {
  it('resolves explicit SQL goal to supported path', () => {
    const res = interpretGoal({
      rawGoalText: 'I want to master SQL queries for my job as a data analyst',
      experienceLevel: 'beginner',
      timePerSession: 30,
    });

    expect(res.supportStatus).toBe('supported');
    expect(res.domainId).toBe('sql');
    expect(res.plan).not.toBeNull();
    expect(res.plan?.title).toContain('Data Analysis');
    expect(res.plan?.recommendedStartingNodeId).toBe('select');
    expect(res.plan?.estimatedMinutes).toBe(30);
  });

  it('advances starting node for comfortable experience level', () => {
    const res = interpretGoal({
      rawGoalText: 'Prepare for database interview focusing on joins',
      experienceLevel: 'comfortable',
      strugglingTopics: ['join'],
    });

    expect(res.supportStatus).toBe('supported');
    expect(res.plan?.recommendedStartingNodeId).toBe('join');
    const joinTopic = res.plan?.topicPlans.find((t) => t.nodeId === 'join');
    expect(joinTopic?.priority).toBe('focus');
  });

  it('calibrates intermediate starting node for some_experience', () => {
    const res = interpretGoal({
      rawGoalText: 'Need to get better at aggregating with group by and count',
      experienceLevel: 'some_experience',
      strugglingTopics: ['groupby'],
    });

    expect(res.supportStatus).toBe('supported');
    expect(res.plan?.recommendedStartingNodeId).toBe('groupby');
  });

  it('honestly reports unsupported domain without fake tasks', () => {
    const res = interpretGoal({
      rawGoalText: 'Master machine learning and neural networks in PyTorch',
      experienceLevel: 'beginner',
    });

    expect(res.supportStatus).toBe('unsupported');
    expect(res.plan).toBeNull();
    expect(res.message).toContain('not yet available');
    expect(res.supportedAlternative).toBe('sql');
  });

  it('identifies partially supported backend goals', () => {
    const res = interpretGoal({
      rawGoalText: 'Build full backend APIs with Node.js and SQL database',
      experienceLevel: 'beginner',
    });

    expect(res.supportStatus).toBe('partially_supported');
    expect(res.plan).not.toBeNull();
    expect(res.message).toContain('relational database and SQL');
  });
});
