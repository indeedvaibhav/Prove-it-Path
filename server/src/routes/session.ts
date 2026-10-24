import { Router } from 'express';
import type { Request, Response } from 'express';
import { DOMAIN_REGISTRY } from '../domain/registry.js';
import { interpretGoal } from '../domain/goal-service.js';
import { SERVER_TASKS } from '../engine/sql-engine.js';

export const sessionRouter = Router();

// ─── GET /api/domains ────────────────────────────────────────────────

sessionRouter.get('/domains', (_req: Request, res: Response) => {
  const domains = Object.values(DOMAIN_REGISTRY).map((d) => ({
    id: d.id,
    displayName: d.displayName,
    description: d.description,
    supportStatus: d.supportStatus,
    maturity: d.maturity,
    hasRoadmapGeneration: d.hasRoadmapGeneration,
    knownLimitations: d.knownLimitations,
  }));

  res.json({ domains });
});

// ─── POST /api/goal/interpret ────────────────────────────────────────

sessionRouter.post('/goal/interpret', (req: Request, res: Response) => {
  const { rawGoalText, experienceLevel, timePerSession, deadline, strugglingTopics, explicitDomainId } = req.body;

  const result = interpretGoal({
    rawGoalText: rawGoalText ?? '',
    experienceLevel,
    timePerSession,
    deadline,
    strugglingTopics,
    explicitDomainId,
  });

  res.json(result);
});

// ─── POST /api/session ───────────────────────────────────────────────

sessionRouter.post('/session', (req: Request, res: Response) => {
  const { plan, goalId } = req.body;

  const defaultRoadmap = [
    { id: 'select', label: 'SELECT', status: 'not_started' as const },
    { id: 'where', label: 'WHERE — AND / OR', status: 'not_started' as const },
    { id: 'orderby', label: 'ORDER BY — LIMIT', status: 'not_started' as const },
    { id: 'groupby', label: 'GROUP BY — COUNT', status: 'not_started' as const },
    { id: 'join', label: 'JOIN', status: 'not_started' as const },
  ];

  let startingTaskId = 'task-select-01';
  if (plan?.recommendedStartingNodeId === 'where') startingTaskId = 'task-where-01';
  else if (plan?.recommendedStartingNodeId === 'orderby') startingTaskId = 'task-orderby-01';
  else if (plan?.recommendedStartingNodeId === 'groupby') startingTaskId = 'task-groupby-01';
  else if (plan?.recommendedStartingNodeId === 'join') startingTaskId = 'task-join-01';

  res.json({
    sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    domainId: 'sql',
    goalId: goalId ?? 'custom',
    confirmedPlan: plan ?? null,
    roadmap: defaultRoadmap,
    currentTask: SERVER_TASKS[startingTaskId] || SERVER_TASKS['task-select-01'],
    startedAt: new Date().toISOString(),
  });
});
